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
const validate = require('../src/platform-config').validate;

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
});

test('Undefined config throws', () => { expect(() => validate(undefined)).toThrow(); });
test('Empty config throws', () => { expect(() => validate({})).toThrow(); });
test('Invalid config throws', () => { expect(() => validate(loadConfig('invalid.yaml'))).toThrow(); });

/**
 * Helper functions.
 */
function loadConfig(name) {
    return yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'fixtures', 'configs', name)));
}

function testValidConfig(name, cb) {
    test(`Valid configuration for file ${name}`, () => {
        cb(validate(loadConfig(name)));
    });
}
