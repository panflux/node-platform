/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {EventEmitter} = require('events');

const map = new WeakMap();

/**
 * Return the actual platform.
 *
 * @param {module.Sandbox} key
 * @return {module.Platform}
 */
function platform(key) {
    return map.get(key);
}

module.exports = class Sandbox extends EventEmitter {
    /**
     * Construct sandbox.
     *
     * @param {module.Platform} platform
     */
    constructor(platform) {
        super();

        map.set(this, platform);

        process.on('message', (msg) => {
            this.emit(msg.name, msg.args);
        });
    }

    /**
     * Report a discovery upstream.
     *
     * @param {object} object
     */
    reportDiscovery(object) {
        object = platform(this).validateEntity(object);
        process.send({name: 'discovery', args: object});
    }
};
