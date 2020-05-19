/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Entity = require('./entity');

const {EntityTypeSchema} = require('./schema');

module.exports = class EntityType {
    /**
     * @param {string} name
     * @param {object} definition
     */
    constructor(name, definition) {
        this._name = name;
        this._definition = definition;
        this._childTypes = new Map();
        this._typeSchema = new EntityTypeSchema(definition);
    }

    /**
     * @param {object} definition
     * @param {panflux.Platform} platform
     * @param {winston.Logger} logger
     * @return {Entity}
     */
    createEntity(definition, platform, logger) {
        return new Entity(this._typeSchema.validate(definition), this, platform, logger);
    }

    /**
     * @param {string} name
     * @param {object} definition
     */
    registerChildEntityType(name, definition) {
        this._childTypes.set(name, new EntityType(name, definition));
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    hasChildEntityType(name) {
        return this._childTypes.has(name);
    }

    /**
     * @param {string} name
     * @return {EntityTypeSchema|V}
     */
    getChildEntityType(name) {
        if (!this.hasChildEntityType(name)) {
            throw new Error(`Child type with name ${name} not found`);
        }
        return this._childTypes.get(name);
    }

    /**
     * @param {object} delta
     * @return {object}
     */
    validateDelta(delta) {
        return this._typeSchema.validateDelta(delta);
    }

    /**
     * @param {object} entity
     * @return {object}
     */
    validateEntity(entity) {
        return this._typeSchema.validate(entity);
    }

    /** @return {string} */
    get name() {
        return this._name;
    }

    /** @return {object} */
    get definition() {
        return this._definition;
    }
};
