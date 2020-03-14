/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Joi = require('@hapi/joi');

const {scalarTypeRegex} = require('./regularExpressions');
const {primitives} = require('./types');

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
        const {error, value} = this._schema.validate(obj);

        if (error) {
            throw error.annotate();
        }
        return value;
    }

    /**
     * @param {object} obj
     * @return {Joi.object}
     */
    static createObjectSchema(obj) {
        if (!obj) {
            return Joi.any().forbidden();
        }
        const keys = {};
        Object.keys(obj).forEach((key) => {
            keys[key] = Schema.createValueSchema(obj[key]);
        });
        return Joi.object(keys).unknown(false);
    }

    /**
     *
     * @param {object|string} val
     * @return {Joi.any}
     */
    static createValueSchema(val) {
        return (typeof (val) === 'string') ? Schema.createScalarSchemaFromString(val) : Schema.createValueSchemaFromObject(val);
    }

    /**
     * @param {string} val
     * @return {Joi.any}
     */
    static createScalarSchemaFromString(val) {
        const parsed = val.match(scalarTypeRegex);
        const schema = Schema.createSchemaFromTypeString(parsed[1]);
        return parsed[2] === '!' ? schema.required() : schema.allow(null);
    }

    /**
     * @param {string} val
     * @return {Joi.any}
     */
    static createSchemaFromTypeString(val) {
        if (!primitives[val]) {
            throw new Error(`Unknown primitive type ${val}`);
        }
        return primitives[val]();
    }

    /**
     * @param {object} val
     */
    static createValueSchemaFromObject(val) {
        throw new Error('Schema creation from objects is not yet supported');
    }
};
