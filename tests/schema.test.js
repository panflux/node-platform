/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Joi = require('@hapi/joi');
const Schema = require('../src/schema/schema');

describe('Test schema creation', () => {
    test('Invalid object throws', () => {
        expect(() => Schema.createValueSchema({foo: 'bar'})).toThrow('Unsupported value type');
    });
    test('Invalid type throws', () => {
        expect(() => Schema.createValueSchema('foo')).toThrow('Unknown primitive type foo');
    });
    test('Empty object is forbidden', async () => {
        await expect(Schema.createObjectSchema(null).validateAsync('foo')).rejects.toThrow('is not allowed');
    });
    test('Primitives', async () => {
        const boolValidator = Schema.createValueSchema('bool');
        const integerValidator = Schema.createValueSchema('int');
        const numberValidator = Schema.createValueSchema('number');
        const stringValidator = Schema.createValueSchema('string');

        await expect(boolValidator.validateAsync(true)).resolves.toBe(true);
        await expect(boolValidator.validateAsync(null)).resolves.toBe(null);
        await expect(boolValidator.validateAsync('test')).rejects.toThrow('must be a boolean');
        await expect(integerValidator.validateAsync(684)).resolves.toBe(684);
        await expect(integerValidator.validateAsync(68.4)).rejects.toThrow('must be an integer');
        await expect(integerValidator.validateAsync('test')).rejects.toThrow('must be a number');
        await expect(numberValidator.validateAsync(684)).resolves.toBe(684);
        await expect(numberValidator.validateAsync(68.4)).resolves.toBe(68.4);
        await expect(numberValidator.validateAsync('test')).rejects.toThrow('must be a number');
        await expect(stringValidator.validateAsync('test')).resolves.toBe('test');
        await expect(stringValidator.validateAsync(684)).rejects.toThrow('must be a string');
    });
    test('Required primitives', async () => {
        const boolValidator = Schema.createValueSchema('bool!');

        await expect(boolValidator.validateAsync(false)).resolves.toBe(false);
        await expect(boolValidator.validateAsync(undefined)).rejects.toThrow('is required');
        await expect(boolValidator.validateAsync(null)).rejects.toThrow('must be a boolean');
    });
    test('Constrained integers', async () => {
        const integerValidator = Schema.createValueSchemaFromObject({
            type: 'int',
            min: 42,
            max: 684,
            default: 100,
        });

        await expect(integerValidator.validateAsync(42)).resolves.toBe(42);
        await expect(integerValidator.validateAsync(50)).resolves.toBe(50);
        await expect(integerValidator.validateAsync(684)).resolves.toBe(684);
        await expect(integerValidator.validateAsync()).resolves.toBe(100);
        await expect(integerValidator.validateAsync(41)).rejects.toThrow('larger than or equal to 42');
        await expect(integerValidator.validateAsync(685)).rejects.toThrow('less than or equal to 684');
        await expect(integerValidator.validateAsync('foo')).rejects.toThrow('must be a number');

        await expect(Schema.createValueSchemaFromObject({type: 'int', required: true}).validateAsync()).rejects.toThrow('is required');
    });
    test('Raw schema methods', async () => {
        const validator = new Schema(Joi.string());

        const {error, value} = validator.schema.validate('foo');
        expect(error).toBeUndefined();
        expect(value).toBe('foo');
    });
});

