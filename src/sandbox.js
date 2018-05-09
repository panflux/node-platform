/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {EventEmitter} = require('events');

const map = new WeakMap();

module.exports = class Sandbox extends EventEmitter {
    constructor(platform) {
        super();

        map.set(this, platform);

        process.on('message', (msg) => {
            this.emit(msg.name, msg.args);
        });
    }

    reportDiscovery(object) {
        process.send({name: 'discovery', args: object});
    }
};
