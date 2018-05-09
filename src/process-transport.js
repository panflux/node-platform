/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Transport = require('winston-transport');
const util = require('util');

module.exports = class ProcessTransport extends Transport {
    constructor(opts, proc) {
        super(opts);
    }

    log(info, callback) {
        setImmediate(() => this.emit('logged', info));

        process.send({name:'log', args: info});

        if (callback) { callback(); }
    }
};