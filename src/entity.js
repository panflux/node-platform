/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

module.exports = class Entity {
    /**
     * @param {object} definition
     * @param {EntityType} type
     * @param {panflux.Platform} platform
     * @param {winston.Logger} logger
     */
    constructor(definition, type, platform, logger) {
        this._definition = definition;
        this._parentId = null;
        this._type = type;
        this._platform = platform;
        this._logger = logger;
        this._services = {};
    }

    /**
     * Register a child entity.
     *
     * @param {definition} definition The entity description of the new child
     * @return {boolean} Whether the child was already known
     */
    registerChildEntity(definition) {
        if (!this._type.hasChildEntityType((definition.type))) {
            this._logger.error(`Entity ${this._definition.type} has no child entity named ${definition.type}`);
            return false;
        }
        this._platform.reportDiscovery(definition);
        return false;
    }

    /**
     * Register callback to be invoked for a defined service.
     *
     * @param {string} name
     * @param {function} cb
     */
    registerService(name, cb) {
        if (!(name in this._type.definition.services)) {
            throw new Error(`Entity type "${this._type.name}" does not define a service named "${name}"`);
        }
        this._services[name] = cb;
    }

    /**
     * Register multiple services at once.
     *
     * @param {object} services
     */
    registerServices(services) {
        for (const [name, cb] of Object.entries(services)) {
            this.registerService(name, cb);
        }
    }

    /**
     * Call a service on this entity.
     *
     * @param {string} service
     * @param {object|null} parameters
     */
    call(service, parameters) {
        const handler = this._services[service];
        if (undefined === handler) {
            throw new Error(`Tried to call unknown service "${service}" on "${this.name}"`);
        }
        handler(parameters || {});
    }

    /**
     * @param {string} event
     * @param {object|null} parameters
     */
    emit(event, parameters) {
        this._logger.verbose(`Emitting event ${event}`);
        this._platform.emitEvent(this.id, event, parameters);
    }

    /**
     * @param {string} name
     * @param {*} value
     */
    setAttribute(name, value) {
        this._logger.verbose(`Setting attribute ${name} to ${value}`);
        this._platform.setAttribute(this.id, name, value);
    }

    /**
     * @param {object} object
     */
    setAttributes(object) {
        Object.keys(object).forEach((key) => this.setAttribute(key, object[key]));
    }

    /**
     * @param {string} name
     * @param {*} value
     */
    setProperty(name, value) {
        this._logger.verbose(`Setting property ${name} to ${value}`);
        this._platform.setProperty(this.id, name, value);
    }

    /**
     * @param {object} object
     */
    setProperties(object) {
        Object.keys(object).forEach((key) => this.setProperty(key, object[key]));
    }

    /** @return {string} */
    get id() {
        return this._definition.id;
    }

    /** @return {string} */
    get name() {
        return this._definition.name;
    }

    /** @return {EntityType} */
    get type() {
        return this._type;
    }

    /** @return {object|null} */
    get config() {
        return this._definition.config;
    }

    /** @return {string|null} */
    get parentId() {
        return this._parentId;
    }

    /** @param {string|null} id */
    set parentId(id) {
        this._parentId = id;
    }
};
