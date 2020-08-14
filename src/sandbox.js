/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {EventEmitter} = require('events');
const merge = require('deepmerge');

// VM-protecting global scope map
const map = new WeakMap();

/**
 * Return the actual platform.
 *
 * @param {panflux.Sandbox} key
 * @return {panflux.Platform}
 */
function platform(key) {
    return map.get(key);
}

module.exports = class Sandbox extends EventEmitter {
    /**
     * Construct sandbox.
     *
     * @param {panflux.Platform} platform
     * @param {winston.Logger} logger
     */
    constructor(platform, logger) {
        super();

        this._logger = logger;
        this._discoveries = {};
        this._entities = {};
        this._changes = {};
        this._types = {};

        map.set(this, platform);

        process.on('message', ({name, args}) => this.processMessage(name, args));
    }

    /**
     * Processes a single upstream control message.
     *
     * @param {string} name
     * @param {*} args
     */
    processMessage(name, args) {
        args = args || {};
        try {
            switch (name) {
            case 'start':
            case 'stop':
            case 'discover':
                this.emit(name, args);
                break;
            case 'adopt':
                this.adopt(args);
                break;
            case 'call':
                this.call(args.id, args.service, args.parameters);
                break;
            case 'processChangeQueue':
                this.processChangeQueue();
                break;
            case 'setLogLevel':
                this._logger.transports.forEach((val) => {
                    val.level = args;
                });
                break;
            default:
                throw new Error(`Received unknown message of type "${name}"`);
            }
        } catch (err) {
            this._logger.error(typeof err === 'string' ? err : err.message);
        }
    }

    /**
     * @param {object} definition
     * @param {Entity|null} parent
     */
    adopt(definition, parent) {
        if (typeof definition !== 'object' || typeof definition.type !== 'string') {
            throw new Error('Entity to be adopted must be described as an object with a type property');
        }
        const entity = platform(this).getEntityType(definition.type).createEntity(definition, this, this._logger);
        if (parent) {
            entity.parentId = parent.id;
        }

        this._logger.verbose(`Adopting new entity "${entity.name}" (${entity.id}) of type "${entity.type.name}"`);
        this._entities[entity.id] = entity;
        this.emit('adopt', entity);
    }

    /**
     * Call a service on a specific entity.
     *
     * @param {string} entityId
     * @param {string} service
     * @param {object|null} parameters
     */
    call(entityId, service, parameters) {
        const entity = this._entities[entityId];
        if (undefined === entity) {
            throw new Error(`Invalid entity ID "${entityId}"`);
        }
        entity.call(service, parameters || {});
    }

    /**
     * Report a discovery upstream.
     *
     * @param {object} object The entity description of the new discovery
     * @return {boolean} Whether it was a new discovery
     */
    reportDiscovery(object) {
        // if a parentId is defined temporary remove it before validation
        let parentId;
        if (undefined !== object.parentId) {
            parentId = object.parentId;
            delete object['parentId'];
        }
        object = platform(this).validateEntity(object);
        // validation passed, re-add the parentId for the backend services
        if (undefined !== parentId) {
            object.parentId = parentId;
        }
        if (this._discoveries[object.id] || this._entities[object.id]) {
            this._logger.silly(`Ignoring repeated discovery of ${JSON.stringify(object)}`);

            // TODO: We should actually still process attributes and properties here so the platform can be generically lazy
            return false;
        } else {
            this._logger.verbose(`Processing new discovery ${JSON.stringify(object)}`);
            if (!(object.type in this._types)) {
                this._types[object.type] = [];
            }
            this._types[object.type].push(object);

            // TODO introduce some way of validating all not-extending entities have passed
            if (undefined !== object.extends) {
                if (Object.getOwnPropertyNames(this._types).indexOf(object.extends) === -1) {
                    return false;
                }
                const candidates = this._types[object.extends];
                if (candidates.length === 0) {
                    return false;
                }
                object.extends = candidates[0].id;
            }

            this._discoveries[object.id] = object;
            process.send({name: 'discovery', args: object});
            return true;
        }
    }

    /**
     * @param {string} entityId
     * @param {string} event
     * @param {*} parameters
     */
    emitEvent(entityId, event, parameters) {
        const args = {
            name: event,
            entityId,
            parameters,
        };
        // TODO: Why isn't this queued as well?
        process.send({name: 'event', args});
    }

    /**
     * @param {string} entityId
     * @param {string} name
     * @param {*} value
     */
    setAttribute(entityId, name, value) {
        this.queueStateChange(entityId, {attributes: {[name]: value}});
    }

    /**
     * @param {string} entityId
     * @param {string} name
     * @param {*} value
     */
    setProperty(entityId, name, value) {
        this.queueStateChange(entityId, {properties: {[name]: value}});
    }

    /**
     * @param {string} entityId
     * @param {object} change
     */
    queueStateChange(entityId, change) {
        if (!this._entities[entityId]) {
            throw new Error(`Invalid entity ID "${entityId}"`);
        }
        this._changes[entityId] = merge(this._changes[entityId] || {}, change);

        // send message to notify upstream processes this platform has pending changes
        process.send({name: 'pendingChanges', args: {entityIds: Object.keys(this._changes)}});
    }

    /**
     * This function will process any pending changes and send them upstream.
     */
    processChangeQueue() {
        if (Object.keys(this._changes).length === 0) {
            return;
        }

        // buffer changes so new changes can be still reported in the background
        const changes = this._changes;
        this._changes = {};

        Object.keys(changes).forEach((key) => {
            // retrieve changes and assign the entity ID to them
            const delta = Object.assign(changes[key], {'entityId': key});

            try {
                process.send({name: 'data', args: this._entities[key].type.validateDelta(delta)});
            } catch (err) {
                this._logger.error(`Dropping invalid change set for entity ${key}\n${err}`);
            }
        });
    }
};
