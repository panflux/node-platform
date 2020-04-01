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
        this._type = type;
        this._platform = platform;
        this._logger = logger;
    }

    /**
     * Register a child entity.
     *
     * @param {definition} definition The entity description of the new child
     * @return {boolean} Whether the child was already known
     */
    registerChildEntity(definition) {
        if (!this._type.hasChildEntityType((definition.name))) {
            this._logger.error(`Entity ${this._definition.name} has no child entity named ${definition.name}`);
            return false;
        }
        // TODO Check if child entity exists and/or create new one
        this._type.createEntity(definition, this._platform, this._logger);
        this._logger.error(`Registering child entities is not yet implemented: ${JSON.stringify(definition)}`);
        return false;
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

    /** @return {object?} */
    get config() {
        return this._definition.config;
    }
};
