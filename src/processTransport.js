/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Transport = require('winston-transport');

module.exports = class ProcessTransport extends Transport {
    /**
     * Initialize transport.
     *
     * @param {object?} opts
     */
    constructor(opts) {
        super(opts);
    }

    /**
     * Log information via child process events.
     *
     * @param {*} info
     * @param {Function?} callback
     */
    log(info, callback) {
        setImmediate(() => this.emit('logged', info));

        if (process.connected) {
            process.send({name: 'log', args: info});
        }
        if (callback) {
            callback();
        }
    }
};
