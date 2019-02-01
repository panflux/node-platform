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
 * @param {panflux.Sandbox} key
 * @return {panflux.Platform}
 */
function platform(key) {
    return map.get(key);
}

module.exports = class Sandbox extends EventEmitter {
    /**
     * Construct sandbox.
     *
     * @param {panflux.Platform} platform
     * @param {winston.Logger} logger
     */
    constructor(platform, logger) {
        super();

        this._logger = logger;
        this._discoveries = {};
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
        if (this._discoveries[object.id]) {
            this._logger.silly(`Ignoring repeated discovery of ${JSON.stringify(object)}`);
        } else {
            this._logger.verbose(`Processing new discovery ${JSON.stringify(object)}`);
            this._discoveries[object.id] = object;
            process.send({name: 'discovery', args: object});
        }
    }
};
