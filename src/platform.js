/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {NodeVM} = require('vm2');

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const winston = require('winston');

const {PlatformSchema, EntityTypeSchema} = require('./schema');
const Sandbox = require('./sandbox');

module.exports = class Platform {
    /**
     * Initialize platform.
     *
     * @param {*} config
     * @param {string} rootdir
     */
    constructor(config, rootdir) {
        this._config = PlatformSchema.validate(config);
        this._rootdir = rootdir;
        this._entityTypes = {};

        Object.keys(this._config.entities).map((key) => {
            this._entityTypes[key] = new EntityTypeSchema(this._config.entities[key]);
        });
    }

    /**
     * Run the platform in a semi-secure VM.
     *
     * @param {Transport|Transport[]} logTransport
     */
    run(logTransport) {
        const filename = path.resolve(this.rootdir, this.config.main_file);
        const transports = Array.isArray(logTransport) ? logTransport : [logTransport || new winston.transports.Console];
        const options = {
            console: 'inherit',
            require: {
                root: this._rootdir,
                mock: {
                    '@panflux/platform': {
                        platform: new Sandbox(this),
                        logger: winston.createLogger({transports: transports}),
                    },
                },
            },
            sandbox: {},
            wrapper: 'none',
        };

        const deps = this._config.dependencies;
        options.require.builtin = deps.native;
        options.require.external = deps.external;

        // Load the platform in the configured sandbox
        NodeVM.file(filename, options);
    }

    /**
     * @param {object} entity
     * @return {object}
     */
    validateEntity(entity) {
        if (!entity.type || typeof entity.type !== 'string') {
            throw new Error('The "type" field must be a valid string referencing a defined type');
        } else if (!this._entityTypes[entity.type]) {
            throw new Error(`Entity type "${entity.type}" is not declared in the platform configuration`);
        }
        return this._entityTypes[entity.type].validate(entity);
    }

    /** @return {string} */
    get config() {
        return this._config;
    }

    /** @return {string} */
    get name() {
        return this._config.name;
    }

    /** @return {string} */
    get friendlyName() {
        return this._config.friendly_name;
    }

    /** @return {string} */
    get rootdir() {
        return this._rootdir;
    }

    /** @return {string} */
    get version() {
        return this._config.version;
    }

    /**
     * Loads a platform residing in the specified directory.
     *
     * @param {string} rootdir
     * @return {Platform}
     */
    static load(rootdir) {
        const configPath = path.join(rootdir, 'platform.yaml');

        if (!fs.existsSync(configPath)) {
            throw Error(`Cannot load platform from ${rootdir} as it does not have a platform.yaml file`);
        }
        const config = yaml.safeLoad(fs.readFileSync(configPath));

        return new Platform(config, rootdir);
    }
};
