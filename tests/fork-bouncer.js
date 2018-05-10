/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Sandbox = require('../src/sandbox');

const platform = new Sandbox({name: 'foo'});

platform.on('discover', () => {
    platform.reportDiscovery({foo: 'bar'});
    process.exit();
});
