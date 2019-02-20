/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Schema = require('../src/schema/schema');

describe('Test schema creation', () => {
    test('From object throws', () => {
        expect(() => Schema.createValueSchema({foo: 'bar'})).toThrow('not yet supported');
    });
    test('Invalid type throws', () => {
        expect(() => Schema.createValueSchema('foo')).toThrow('Unknown schema type foo');
    });
    test('Empty object is forbidden', () => {
        expect(Schema.createObjectSchema(null).validate('foo')).rejects.toThrow('is not allowed');
    });
    test('Primitives', () => {
        const boolValidator = Schema.createValueSchema('bool');
        const integerValidator = Schema.createValueSchema('int');
        const stringValidator = Schema.createValueSchema('string');

        expect(boolValidator.validate(true)).resolves.toBe(true);
        expect(boolValidator.validate(null)).resolves.toBe(null);
        expect(boolValidator.validate('test')).rejects.toThrow('must be a boolean');
        expect(integerValidator.validate(684)).resolves.toBe(684);
        expect(integerValidator.validate('test')).rejects.toThrow('must be a number');
        expect(stringValidator.validate('test')).resolves.toBe('test');
        expect(stringValidator.validate(684)).rejects.toThrow('must be a string');
    });
    test('Required primitives', () => {
        const boolValidator = Schema.createValueSchema('bool!');

        expect(boolValidator.validate(false)).resolves.toBe(false);
        expect(boolValidator.validate(undefined)).rejects.toThrow('is required');
        expect(boolValidator.validate(null)).rejects.toThrow('must be a boolean');
    });
});

