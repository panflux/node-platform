/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const dummies = require('./fixtures/dummies');
const Schema = require('../src/schema/schema');

describe('Test schema creation', () => {
    test('From object throws', () => {
        expect(() => Schema.createValueSchema({foo: 'bar'})).toThrow('not yet supported');
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
        const stringValidator = Schema.createValueSchema('string');

        await expect(boolValidator.validateAsync(true)).resolves.toBe(true);
        await expect(boolValidator.validateAsync(null)).resolves.toBe(null);
        await expect(boolValidator.validateAsync('test')).rejects.toThrow('must be a boolean');
        await expect(integerValidator.validateAsync(684)).resolves.toBe(684);
        await expect(integerValidator.validateAsync('test')).rejects.toThrow('must be a number');
        await expect(stringValidator.validateAsync('test')).resolves.toBe('test');
        await expect(stringValidator.validateAsync(684)).rejects.toThrow('must be a string');
    });
    test('Required primitives', async () => {
        const boolValidator = Schema.createValueSchema('bool!');

        await expect(boolValidator.validateAsync(false)).resolves.toBe(false);
        await expect(boolValidator.validateAsync(undefined)).rejects.toThrow('is required');
        await expect(boolValidator.validateAsync(null)).rejects.toThrow('must be a boolean');
    });
    test.skip('Object based schemas', () => {
        const platform = dummies.createPlatform('object-configs.yaml');
        platform.validateEntity({
            config: {
                host: 'example.org',
                port: 9898,
            },
            attributes: {
                voltage: 12.34,
            },
        });
    });
});

