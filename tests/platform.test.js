/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const path = require('path');
const {Platform, ProcessTransport} = require('..');

test('Load fake platform', () => {
    const rootdir = path.join(__dirname, 'fixtures', 'platforms', 'fake');
    const platform = Platform.load(rootdir);
    const cb = jest.fn();

    process.send = cb;

    expect(platform.name).toBe('fake');
    expect(platform.friendlyName).toBe('Fake');
    expect(platform.version).toBe('0.0.1');
    expect(platform.versionURL).toBeUndefined();
    expect(platform.rootdir).toBe(rootdir);
    expect(platform.getEntityType('fake')).not.toBeUndefined();
    expect(platform.types.has('foo')).toBeFalsy();

    platform.run(new ProcessTransport);

    expect(cb).toHaveBeenCalled();

    platform.run([new ProcessTransport]);

    expect(cb).toHaveBeenCalledTimes(2);
});

test('Load fake platform with console logger', () => {
    const cb = jest.fn();

    global.console = {log: cb};
    loadPlatform().run();

    expect(cb).toHaveBeenCalled();
});

describe('Invalid platform definition', () => {
    test('No platform present', () => {
        expect(() => Platform.load(__dirname)).toThrow('does not have a platform.yaml file');
    });

    test('Invalid export', () => {
        expect(() => loadPlatform('invalid-export').run()).toThrow('must export a function or class');
    });

    test.skip('Circular extension', () => {
        expect(() => loadPlatform('circular-direct')).toThrow('item "foo" cannot be present in both "properties" and "attributes"');
        expect(() => loadPlatform('circular-indirect')).toThrow('item "foo" cannot be present in both "services" and "events"');
    });
});

describe('Entity validation', () => {
    test('Must fail on missing type', () => {
        expect(() => loadPlatform().validateEntity({
            foo: 'bar',
        })).toThrow('an object including a type');
    });

    test('Must fail on invalid type', () => {
        expect(() => loadPlatform().validateEntity({
            type: 'foo.bar',
        })).toThrow('is not declared');
    });

    test('Must fail on invalid entity schema', () => {
        expect(() => loadPlatform('invalid-schema')).toThrow('primitive type');
    });
});

/**
 * @param {string?} name
 * @return {module.Platform}
 */
function loadPlatform(name) {
    return Platform.load(path.join(__dirname, 'fixtures', 'platforms', name || 'fake'));
}
