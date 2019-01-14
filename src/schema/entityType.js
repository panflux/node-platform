/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Joi = require('joi');

const {nameRegex} = require('./regularExpressions');
const Schema = require('./schema');

module.exports = class EntityTypeSchema extends Schema {
    /**
     * @param {object} definition
     */
    constructor(definition) {
        super(Joi.object({
            id: Joi.string().min(1).required(),
            name: Joi.string().min(1).default((ctx) => `${ctx.type}-${ctx.id}`, 'Generated default name'),
            type: Joi.string().regex(nameRegex).required(),
            config: Schema.createObjectSchema(definition.config).unknown(false),
        }).default());
    }
};
