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
    test('Primitives', () => {
        const integerValidator = Schema.createValueSchema('int');
        const stringValidator = Schema.createValueSchema('string');

        expect(integerValidator.validate(684)).resolves.toBe(684);
        expect(integerValidator.validate('test')).rejects.toThrow('must be a number');
        expect(stringValidator.validate('test')).resolves.toBe('test');
        expect(stringValidator.validate(684)).rejects.toThrow('must be a string');
    });
});

