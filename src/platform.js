/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {NodeVM} = require('vm2');

const fs = require('fs');
const merge = require('deepmerge');
const path = require('path');
const yaml = require('js-yaml');
const winston = require('winston');

const EntityType = require('./entityType');
const {PlatformSchema} = require('./schema');
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
        this.buildEntityTypes(this._config.types);
    }

    /**
     * Run the platform in a semi-secure VM.
     *
     * @param {Transport|Transport[]} logTransport
     */
    run(logTransport) {
        const filename = path.resolve(this.rootdir, this.config.main_file);
        const transports = Array.isArray(logTransport) ? logTransport : [logTransport || new winston.transports.Console];
        const logger = winston.createLogger({transports});
        const options = {
            console: 'inherit',
            require: {
                root: this._rootdir,
            },
            sandbox: {},
        };

        const deps = this._config.dependencies;
        options.require.builtin = deps.native;
        options.require.external = deps.external;

        // Load the platform in the configured sandbox
        const sandbox = NodeVM.file(filename, options);
        if (typeof sandbox !== 'function') {
            throw new Error('Platform main file must export a function or class as default');
        }
        sandbox(new Sandbox(this, logger), logger);
    }

    /**
     * Rebuild entity type map from original definition, resolving inheritance and child types.
     *
     * @param {object} types
     */
    buildEntityTypes(types) {
        this._entityTypes = new Map();

        const childTypes = [];
        Object.entries(types).forEach(([name, definition]) => {
            // let ancestors = definition.extends;

            definition.type = name;
            definition.extends = [];
            while (definition.extends.length > 0) {
                const baseType = types[definition.extends];
                if (!baseType) {
                    throw new Error(`Type ${name} extends from unknown type ${definition.extends}`);
                }
                if (baseType.implements.indexOf(`${this.name}.${name}`) !== -1) {
                    throw new Error(`Circular dependency detected on ${name} extending ${definition.extends}`);
                }
                definition.implements.push(`${this.name}.${definition.extends}`);
                delete definition.extends;
                definition = merge(baseType, definition);
            }
            if (definition.parent) {
                const parentType = types[definition.parent];
                if (!parentType) {
                    throw new Error(`Type ${name} has unknown parent type ${definition.parent}`);
                } else if (parentType.parent) {
                    throw new Error(`Type ${name} has parent type ${definition.parent} which is a child type of ${parentType.parent}`);
                }
                childTypes.push([name, definition]);
            } else {
                this._entityTypes.set(name, new EntityType(name, definition));
            }
        });
        childTypes.forEach(([name, definition]) =>
            this._entityTypes.get(definition.parent).registerChildEntityType(name, definition),
        );
    }

    /**
     * Return a specific entity type.
     *
     * @param {string} type
     * @return {EntityType}
     */
    getEntityType(type) {
        if (this._entityTypes.has(type)) {
            return this._entityTypes.get(type);
        }
        let entityType;
        this._entityTypes.forEach((v) => {
            if (v.hasChildEntityType(type)) {
                entityType = v.getChildEntityType(type);
            }
        });
        if (entityType) {
            return entityType;
        }
        throw new Error(`Entity type "${type}" is not declared in the platform configuration`);
    }

    /**
     * @param {object} definition
     * @return {ValidationResult<Object>}
     */
    validateEntity(definition) {
        if (!definition || !definition.type || typeof(definition.type) !== 'string') {
            throw new Error('Entity definition must be an object including a type property');
        }
        return this.getEntityType(definition.type).validateEntity(definition);
    }

    /** @return {object} */
    get config() {
        return this._config;
    }

    /** @return {Map<string, EntityType>} */
    get types() {
        return this._entityTypes;
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

    /** @return {string} */
    get versionURL() {
        return this._config.versionURL;
    }

    /**
     * Load a platform residing in the specified directory.
     *
     * @param {string} rootdir
     * @return {panflux.Platform}
     */
    static load(rootdir) {
        const configPath = path.join(rootdir, 'platform.yaml');

        if (!fs.existsSync(configPath)) {
            throw new Error(`Cannot load platform from ${rootdir} as it does not have a platform.yaml file`);
        }
        const config = yaml.safeLoad(fs.readFileSync(configPath));

        return new Platform(config, rootdir);
    }
};
