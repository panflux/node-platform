/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Joi = require('joi');

const {classRegex} = require('./regularExpressions');
const Schema = require('./schema');

module.exports = class EntityTypeSchema extends Schema {
    /**
     * @param {object} definition
     */
    constructor(definition) {
        const attributeSchema = Schema.createObjectSchema(definition.attributes);
        const configSchema = Schema.createObjectSchema(definition.config);
        const propertySchema = Schema.createObjectSchema(definition.properties);

        const parent = (definition.parent !== undefined ? Joi.string().min(1).required() : Joi.forbidden());

        super(Joi.object({
            id: Joi.string().min(1).required(),
            name: Joi.string().min(1).default((ctx) => `${ctx.type}-${ctx.id}`),
            type: Joi.string().regex(classRegex).required(),
            parent,
            config: configSchema,
            attributes: attributeSchema,
            properties: propertySchema,
        }).default());

        this._deltaSchema = Joi.object({
            entityId: Joi.string().min(1).required(),
            attributes: attributeSchema,
            properties: propertySchema,
        }).default();
    }

    /**
     * @param {object} delta
     * @return {object}
     */
    validateDelta(delta) {
        const {error, value} = this._deltaSchema.validate(delta);

        if (error) {
            throw error.annotate();
        }
        return value;
    }
};
