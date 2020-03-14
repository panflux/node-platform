/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Joi = require('@hapi/joi');

const {memberRegex} = require('./regularExpressions');

const basePrimitiveSchema = Joi.object({
    type: Joi.string().required(),
    description: Joi.string().max(128),
    default: Joi.any().description('A default value for the property if not set'),
    required: Joi.boolean().default(false),
});

const stringPrimitive = {
    schema: basePrimitiveSchema.concat(Joi.object({
        type: Joi.allow('string', 'text'),
        default: Joi.string(),
        min: Joi.number().integer().min(0).default(0).description('Minimum length of the string value'),
        max: Joi.number().integer().min(0).description('Maximum length of the string value'),
    }).assert('.max', Joi.number().min(Joi.ref('.min')))),
    compile: (schema) => Joi.string(),
};

const integerPrimitive = {
    schema: basePrimitiveSchema.concat(Joi.object({
        type: Joi.allow('integer', 'int'),
        default: Joi.number().integer(),
        min: Joi.number().integer().description('Minimum value of the integer'),
        max: Joi.number().integer().when('min', {is: Joi.required(), then: Joi.number().integer().min(Joi.ref('min'))}).description('Maximum value of the integer'),
    })),
    compile: (schema) => Joi.number().integer(),
};

const numberPrimitive = {
    schema: basePrimitiveSchema.concat(Joi.object({
        type: Joi.allow('number', 'float', 'double'),
        default: Joi.number(),
        min: Joi.number().description('Minimum value of the number'),
        max: Joi.number().when('min', {is: Joi.required(), then: Joi.number().min(Joi.ref('min'))}).description('Maximum value of the number'),
    })),
    compile: (schema) => Joi.number(),
};

const booleanPrimitive = {
    schema: basePrimitiveSchema.concat(Joi.object({
        type: Joi.allow('boolean', 'bool'),
        default: Joi.boolean(),
    })),
    compile: (schema) => Joi.boolean(),
};

const primitives = {
    string: stringPrimitive,
    integer: integerPrimitive,
    number: numberPrimitive,
    boolean: booleanPrimitive,

    // Aliases
    text: stringPrimitive,
    int: integerPrimitive,
    float: numberPrimitive,
    double: numberPrimitive,
    bool: booleanPrimitive,
};

const primitiveNames = Object.keys(primitives);
const primitiveCompilers = primitiveNames.reduce((prev, type) => {
    prev[type] = primitives[type].compile;
    return prev;
}, {});

// Construct a nested schema that maps all the primitive types sequentially
const combinedSchema = primitiveNames.reduce((prev, type) => {
    return prev.when(Joi.object({type}).unknown(), {
        then: primitives[type].schema,
    });
}, Joi.object({
    type: Joi.string().valid(...primitiveNames).required(),
}));

const typeSchema = Joi.alternatives(
    combinedSchema,
    Joi.string().regex(new RegExp(`^(${primitiveNames.join('|')})!?$`), 'primitive type').required(),
);

const objectSchema = Joi.object().pattern(memberRegex, typeSchema).allow(null).default();

module.exports = {primitives: primitiveCompilers, objectSchema, typeSchema};
