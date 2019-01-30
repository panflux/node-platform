/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @module @panflux/platform
 *
 * @property {panflux.Platform} platform
 * @property {winston.Logger} logger
 */
module.exports = {
    Platform: require('./src/platform'),
    ProcessTransport: require('./src/processTransport'),

    /** @type {panflux.Platform} */
    platform: null,

    /** @type {winston.Logger} */
    logger: null,
};
