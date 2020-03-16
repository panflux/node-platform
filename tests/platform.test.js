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
    // const config = platform.config;
    const cb = jest.fn();

    process.send = cb;

    expect(platform.name).toBe('fake');
    expect(platform.friendlyName).toBe('Fake');
    expect(platform.version).toBe('0.0.1');
    expect(platform.versionURL).toBeUndefined();
    expect(platform.rootdir).toBe(rootdir);
    expect(platform.types['fake'].schema).not.toBeNull();
    expect(platform.types['foo']).toBeNull();

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
    test('no platform present', () => {
        expect(() => Platform.load(__dirname)).toThrow();
    });

    test('invalid export', () => {
        expect(() => loadPlatform('invalid-export').run()).toThrow('must export a function or class');
    });
});

describe('Entity validation', () => {
    test('must fail on missing type', () => {
        expect(() => loadPlatform().validateEntity({
            foo: 'bar',
        })).toThrow('defined type');
    });

    test('must fail on invalid type', () => {
        expect(() => loadPlatform().validateEntity({
            type: 'foo.bar',
        })).toThrow('is not declared');
    });

    test('must fail on invalid entity schema', () => {
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
