/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const path = require('path');
const {Platform, ProcessTransport} = require('../platform');

test('Load fake platform', () => {
    const rootdir = path.join(__dirname, 'fixtures', 'platforms', 'fake');
    const platform = Platform.load(rootdir);
    // const config = platform.config;
    const cb = jest.fn();

    process.send = cb;

    expect(platform.name).toBe('fake');
    expect(platform.friendlyName).toBe('Fake');
    expect(platform.version).toBe('0.0.1');
    expect(platform.rootdir).toBe(rootdir);

    platform.run(new ProcessTransport);

    expect(cb).toHaveBeenCalled();

    platform.run([new ProcessTransport]);

    expect(cb).toHaveBeenCalledTimes(2);
});

test('Load fake platform with console logger', () => {
    const rootdir = path.join(__dirname, 'fixtures', 'platforms', 'fake');
    const platform = Platform.load(rootdir);
    const cb = jest.fn();

    global.console = {log: cb};
    platform.run();

    expect(cb).toHaveBeenCalled();
});

test('Invalid platform throws', () => {
    expect(() => Platform.load(__dirname)).toThrow();
});

