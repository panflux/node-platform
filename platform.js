/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

module.exports = {
    Platform: require('./src/platform'),
    ProcessTransport: require('./src/process-transport'),

    /** @type {Sandbox} */
    platform: null,

    /** @type {Logger} */
    logger: null,
}
