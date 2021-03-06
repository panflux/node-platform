/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Joi = require('joi');

const {memberRegex} = require('./regularExpressions');

const baseSchema = Joi.object({
    type: Joi.string().required(),
    description: Joi.string().max(128),
    default: Joi.any().description('A default value for the property if not set'),
    required: Joi.boolean().default(false),
});

const stringPrimitive = {
    schema: baseSchema.concat(Joi.object({
        type: Joi.allow('string', 'text'),
        default: Joi.string(),
        min: Joi.number().integer().min(0).default(0).description('Minimum length of the string value'),
        max: Joi.number().integer().min(0).when('min', {is: Joi.required(), then: Joi.number().integer().min(Joi.ref('min'))}).description('Maximum length of the string value'),
    })),
    compile: (definition) => {
        return applyCommonConstraints(Joi.string(), definition);
    },
};

const integerPrimitive = {
    schema: baseSchema.concat(Joi.object({
        type: Joi.allow('integer', 'int'),
        default: Joi.number().integer(),
        min: Joi.number().integer().description('Minimum value of the integer'),
        max: Joi.number().integer().greater(Joi.ref('min')).description('Maximum value of the integer'),
    })),
    compile: (definition) => {
        return applyCommonConstraints(Joi.number().integer(), definition);
    },
};

const numberPrimitive = {
    schema: baseSchema.concat(Joi.object({
        type: Joi.allow('number', 'float', 'double'),
        default: Joi.number(),
        min: Joi.number().description('Minimum value of the number'),
        max: Joi.number().when('min', {is: Joi.required(), then: Joi.number().min(Joi.ref('min'))}).description('Maximum value of the number'),
    })),
    compile: (definition) => {
        return applyCommonConstraints(Joi.number(), definition);
    },
};

const booleanPrimitive = {
    schema: baseSchema.concat(Joi.object({
        type: Joi.allow('boolean', 'bool'),
        default: Joi.boolean(),
    })),
    compile: (definition) => {
        return applyCommonConstraints(Joi.boolean(), definition);
    },
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
const compilers = primitiveNames.reduce((prev, type) => {
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

const objectSchema = Joi.object().pattern(memberRegex, typeSchema).allow(null).default({});

const mappedObjectSchema = {
    schema: baseSchema.concat(Joi.object({
        type: Joi.allow('object'),
        default: Joi.object(),
        fields: objectSchema,
    })),
    compile: (definition) => {
        return applyCommonConstraints(Joi.object(), definition);
    },
};

const mappedArraySchema = {
    schema: baseSchema.concat(Joi.object({
        type: Joi.allow('array'),
        default: Joi.array(),
        fields: objectSchema,
        // TODO: Add min/max
    })),
    compile: (definition) => {
        return applyCommonConstraints(Joi.array(), definition);
    },
};

compilers['array'] = mappedArraySchema.compile;
compilers['object'] = mappedObjectSchema.compile;

// const nestedSchema = Joi.alternatives(
//     mappedObjectSchema.schema,
//     mappedArraySchema.schema,
//     objectSchema,
//     typeSchema,
// ).default({});

const nestedSchema = Joi.any().default({});
// TODO: Fix that...

/**
 * Applies generic Joi constraints.
 *
 * @param {Joi.any} schema
 * @param {object} definition
 * @return {Joi.any}
 */
function applyCommonConstraints(schema, definition) {
    if (!definition) {
        return schema;
    }
    if (definition.required) {
        schema = schema.required();
    }
    return ['default', 'description', 'min', 'max'].reduce((prev, key) => {
        return ((definition[key] !== undefined) ? prev[key](definition[key]) : prev);
    }, schema);
}

module.exports = {compilers: compilers, objectSchema, typeSchema, nestedSchema};
