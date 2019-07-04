/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {EventEmitter} = require('events');
const merge = require('deepmerge');

const Entity = require('./entity');

const map = new WeakMap();

const DEFAULT_QUEUE_TICK_TIME = 1000;

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
        this._queueTicker = setInterval(
            this._processChangeQueue.bind(this), platform.queueProcessingTime || DEFAULT_QUEUE_TICK_TIME);

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
        switch (name) {
        case 'start':
        case 'stop':
        case 'discover':
            this.emit(name, args);
            break;
        case 'adopt':
            this.adopt(args);
            break;
        default:
            this._logger.error(`Received unknown message of type "${name}"`);
            break;
        }
    }

    /**
     * @param {object} definition
     */
    adopt(definition) {
        const entity = new Entity(platform(this).validateEntity(definition), this, this._logger);

        this._logger.verbose(`Adopting new entity "${entity.name}" (${entity.id}) of type "${entity.type}"`);
        this._entities[entity.id] = entity;
        this.emit('adopt', entity);
    }

    /**
     * Report a discovery upstream.
     *
     * @param {object} object The entity description of the new discovery
     * @return {boolean} Whether it was a new discovery
     */
    reportDiscovery(object) {
        object = platform(this).validateEntity(object);
        if (this._discoveries[object.id] || this._entities[object.id]) {
            this._logger.silly(`Ignoring repeated discovery of ${JSON.stringify(object)}`);

            // TODO: We should actually still process attributes and properties here so the platform can be generically lazy
            return false;
        } else {
            this._logger.verbose(`Processing new discovery ${JSON.stringify(object)}`);
            this._discoveries[object.id] = object;
            process.send({name: 'discovery', args: object});
            return true;
        }
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
            throw new Error(`There is no ${platform.name} entity "${platform.id}"`);
        }
        this._changes[entityId] = merge(this._changes[entityId] || {}, change);
    }

    /**
     * This function will process any pending changes and send them upstream.
     */
    async _processChangeQueue() {
        if (Object.keys(this._changes).length === 0) {
            return;
        }

        // buffer changes so new changes can be still reported in the background
        const changes = this._changes;
        this._changes = {};

        Object.keys(changes).forEach((key) => {
            // retrieve changes and assign the entity ID to them
            const args = Object.assign(changes[key], {'entityId': key});
            process.send({name: 'data', args});
        });
    }
};
