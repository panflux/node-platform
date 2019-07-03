/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {EventEmitter} = require('events');

const Entity = require('./entity');

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
        if (this._discoveries[object.id]) {
            this._logger.silly(`Ignoring repeated discovery of ${JSON.stringify(object)}`);
            return false;
        } else {
            this._logger.verbose(`Processing new discovery ${JSON.stringify(object)}`);
            this._discoveries[object.id] = object;
            process.send({name: 'discovery', args: object});
            return true;
        }
    }

    /**
     * @param {string} name
     * @param {*} value
     */
    setProperty(name, value) {
        const args = {
            properties: {
                [name]: value,
            },
        };
        process.send({name: 'data', args});
    }
};
