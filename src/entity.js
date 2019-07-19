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
     * @param {panflux.Platform} platform
     * @param {winston.Logger} logger
     */
    constructor(definition, platform, logger) {
        this._definition = definition;
        this._platform = platform;
        this._logger = logger;
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
     * @param {string} name
     * @param {*} value
     */
    setProperty(name, value) {
        this._logger.verbose(`Setting property ${name} to ${value}`);
        this._platform.setProperty(this.id, name, value);
    }

    /** @return {string} */
    get id() {
        return this._definition.id;
    }

    /** @return {string} */
    get name() {
        return this._definition.name;
    }

    /** @return {string} */
    get type() {
        return this._definition.type;
    }

    /** @return {object?} */
    get config() {
        return this._definition.config;
    }
};
