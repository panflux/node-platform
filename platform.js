/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Platform = require('./src/platform');

module.exports = {
    Platform: Platform,

    /** @type {Sandbox} */
    platform: null,

    /** @type {Logger} */
    logger: null,
}
