/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const Joi = require('joi');
const Schema = require('../src/schema/schema');

const {PlatformSchema} = require('../src/schema');
const validate = PlatformSchema.validate.bind(PlatformSchema);

describe('Basic schema functionality', () => {
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

describe('Fixture schema validation', () => {
    testValidConfig('defaults.yml', (config) => {
        expect(config.name).toBe('test-platform');
        expect(config.friendly_name).toBe('Test platform');
        expect(config.main_file).toBe('test-platform.js');
        expect(config.authors).toHaveLength(0);
    });

    testValidConfig('valid-platform-1.yaml', (config) => {
        expect(config.name).toBe('test-platform');
        expect(config.friendly_name).toBe('Test Platform');
        expect(config.main_file).toBe('test-platform.js');
        expect(config.authors).toHaveLength(1);
        expect(config.version).toBe('1.2.3-beta.1');
        expect(config.keywords).toHaveLength(3);
        expect(config.keywords).toContain('aap');
    });

    testValidConfig('kitchen-sink.yaml', (config) => {
        expect(config.name).toBe('test-platform');
        expect(config.friendly_name).toBe('Test Platform');
        expect(config.main_file).toBe('test-platform.js');
        expect(config.authors).toHaveLength(1);
        expect(config.version).toBe('1.2.3-beta.1');
        expect(config.keywords).toHaveLength(3);
        expect(config.keywords).toContain('aap');

        expect(config.types.bar.extends).toStrictEqual(['baz']);
    });

    testValidConfig('expand-authors.yml', (config) => {
        expect(config.authors).toHaveLength(1);
        expect(config.authors[0].name).toBe('John Doe');
    });

    testValidConfig('arbitrary-entities.yaml', (config) => {
        expect(config.types.class_name.config.host).toBe('string');
    });
});

describe('Required exceptions', () => {
    test('Undefined config', () => {
        expect(() => validate(undefined)).toThrow('is required');
    });
    test('Empty config', () => {
        expect(() => validate({})).toThrow('is required');
    });
    test('Invalid config', () => {
        expect(() => validate(loadConfig('invalid.yaml'))).toThrow('is required');
    });
    test('Invalid SemVer version', () => {
        expect(() => validate({name: 'foo', version: '1-2-3'})).toThrow('SemVer compliant version string');
    });
    test('Invalid schema data type', () => {
        expect(() => validate(loadConfig('invalid-schema-data-type.yaml'))).toThrow('to match the primitive type pattern');
    });
    test('Duplicate keys', () => {
        expect(() => validate(loadConfig('duplicate-names-1.yaml'))).toThrow('item "foo" cannot be present in both "properties" and "attributes"');
        expect(() => validate(loadConfig('duplicate-names-2.yaml'))).toThrow('item "foo" cannot be present in both "services" and "events"');
    });
});

test.skip('Object based schemas', () => {
    expect(() => validate(loadConfig('object-configs.yaml'))).validateEntity({
        config: {
            host: 'example.org',
            port: 9898,
        },
        attributes: {
            voltage: 12.34,
        },
    }).toThrow('derp');
});

/**
 * Helper functions.
 */

/**
 * @param {string} name
 * @return {object}
 */
function loadConfig(name) {
    return yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', name)));
}

/**
 * @param {string} name
 * @param {function} cb
 */
function testValidConfig(name, cb) {
    // eslint-disable-next-line jest/expect-expect
    test(`Valid configuration for file ${name}`, () => {
        cb(validate(loadConfig(name)));
    });
}
