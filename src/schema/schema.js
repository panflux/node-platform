/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Joi = require('joi');

module.exports = class Schema {
    /**
     * @param {Joi.Any} schema
     */
    constructor(schema) {
        this._schema = schema;
    }

    /**
     * @param {object} obj
     * @return {object} The normalized object.
     */
    validate(obj) {
        const {error, value} = Joi.validate(obj, this._schema);

        if (error) {
            throw Error(error.annotate());
        }
        return value;
    }

    /**
     * @param {object} obj
     * @return {Joi.object}
     */
    static createObjectSchema(obj) {
        const keys = {};
        Object.keys(obj).forEach((key) => {
            keys[key] = Schema.createValueSchema(obj[key]);
        });
        return Joi.object(keys);
    }

    /**
     *
     * @param {object|string} val
     * @return {Joi.any}
     */
    static createValueSchema(val) {
        return (typeof (val) === 'string') ? Schema.createValueSchemaFromString(val) : Schema.createValueSchemaFromObject(val);
    }

    /**
     * @param {string} val
     * @return {Joi.any}
     */
    static createValueSchemaFromString(val) {
        switch (val) {
        case 'string':
            return Joi.string().required();
        case 'int':
        case 'integer':
            return Joi.number().integer().required();
        default:
            throw new Error(`Unknown schema type ${val}`);
        }
    }
};
