/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const winston = require('winston');

const Platform = require('../../src/platform');
const ProcessTransport = require('../../src/processTransport');
const Sandbox = require('../../src/sandbox');

winston.add(new ProcessTransport());

module.exports = {
    createSandbox: function() {
        return new Sandbox(this.createPlatform(), winston);
    },
    createPlatform: function() {
        return new Platform({
            name: 'foo-bar',
            types: {
                'foo-bar': {},
            },
        });
    },
    winston,
};
