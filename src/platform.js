/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {EventEmitter} = require('events');
const {NodeVM} = require('vm2');

const fork = require('child_process').fork;
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const winston = require('winston');

const ProcessTransport = require('./process-transport');
const Sandbox = require('./sandbox');

module.exports = class Platform extends EventEmitter {
    constructor(config, rootdir) {
        super();

        this._config = require('./platform-config').validate(config);
        this._rootdir = rootdir;
    }

    run() {
        const filename = path.resolve(this.config.main_file);
        const options = {
            console: 'inherit',
            require: {
                root: this._rootdir,
                mock: {
                    "@panflux/platform": {
                        platform: new Sandbox(this),
                        logger: winston.createLogger({transports: [new ProcessTransport()]}),
                    }
                }
            },
            sandbox: {},
            wrapper: 'none',
        };

        const deps = this._config.dependencies;
        options.require.builtin = deps.native;
        options.require.external = deps.external;

        // Alias node_modules so the sandboxing works properly
        // const moduleDir = path.join(this._config.base_dir, 'node_modules');
        // if (fs.existsSync(moduleDir)) {
        //     fs.unlinkSync(moduleDir);
        // }
        // fs.symlinkSync('../../../node_modules', moduleDir);

        // Load the platform in the configured sandbox
        NodeVM.file(filename, options);
    }

    /**
     *
     * @returns {*}
     */
    get config() { return this._config; }

    /**
     * @returns {string}
     */
    get rootdir() { return this._rootdir; }

    /**
     * Loads a platform residing in the specified directory.
     *
     * @param rootdir
     */
    static load(rootdir) {
        const configPath = path.join(rootdir, 'platform.yaml');

        if (!fs.existsSync(configPath)) {
            throw Error(`Cannot load platform from ${rootdir} as it does not have a platform.yaml file`);
        }
        const config = yaml.safeLoad(fs.readFileSync(configPath));

        return new Platform(config, rootdir);
    }
}
