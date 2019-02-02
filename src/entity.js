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
     * @param {panflux.Sandbox} platform
     * @param {winston.Logger} logger
     */
    constructor(definition, platform, logger) {
        this._definition = definition;
        this._platform = platform;
        this._logger = logger;
    }

    /**
     * @param {string} name
     * @param {string|number|bool|null} value
     */
    setProperty(name, value) {
        this._logger.verbose(`Setting property ${name} to ${value}`);
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
};
