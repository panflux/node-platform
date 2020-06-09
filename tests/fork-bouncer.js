/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const path = require('path');
const winston = require('winston');

const Platform = require('../src/platform');
const Sandbox = require('../src/sandbox');

const logger = winston.createLogger({transports: [new winston.transports.Console]});
const platform = new Sandbox(Platform.load(path.join(__dirname, 'fixtures', 'platforms', 'fake')), logger);

platform.on('discover', () => {
    platform.reportDiscovery({
        id: '684',
        type: 'fake.fake',
    });
    process.exit();
});
