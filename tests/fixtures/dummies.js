/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const yaml = require('js-yaml');

const Platform = require('../../src/platform');
const ProcessTransport = require('../../src/processTransport');
const Sandbox = require('../../src/sandbox');

winston.add(new ProcessTransport());

module.exports = {
    createSandbox: function(config) {
        return new Sandbox(this.createPlatform(config), winston);
    },
    createPlatform: function(config) {
        config = config ? yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'configs', config))) : {
            name: 'foo',
            types: {
                'bar': {
                    config: {
                        foo: 'string',
                    },
                    attributes: {
                        bar: 'string',
                    },
                    properties: {
                        baz: 'string',
                    },
                    children: {
                        child_baz: null,
                    },
                },
                'child_baz': {
                    properties: {
                        foobar: 'string',
                    },
                },
            },
        };
        return new Platform(config);
    },
    winston,
};
