/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const path = require('path');
const Platform = require('../src/platform');

test('Load fake platform', () => {
    const rootdir = path.join(__dirname, 'fixtures', 'platforms', 'fake');
    const platform = Platform.load(rootdir);
    const config = platform.config;

    expect(platform.name).toBe('fake');
    expect(platform.friendlyName).toBe('Fake');
    expect(platform.version).toBe('0.0.1');
    expect(platform.rootdir).toBe(rootdir);

    platform.run();
});

test('Invalid platform throws', () => {
    expect(() => Platform.load(__dirname)).toThrow();
});

