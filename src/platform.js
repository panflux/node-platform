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
const {PlatformSchema, regularExpressions} = require('./schema');
const Sandbox = require('./sandbox');

module.exports = class Platform {
    /**
     * Initialize platform.
     *
     * @param {*} config
     * @param {string} rootdir
     */
    constructor(config, rootdir) {
        // if (config && config.types) {
        //     Object.keys(config.types).forEach((key) => {
        //         console.log(config.types[key].properties);
        //     });
        // }
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
            if (undefined !== definition.children) {
                Object.entries(definition.children).forEach(([childName]) => {
                    const childType = types[childName];
                    if (!childType) {
                        throw new Error(`Type ${name} has unknown child type ${childName}`);
                    } else if (undefined !== childType.children && Object.keys(childType.children).indexOf(name) >= 0) {
                        throw new Error(`Type ${childName} has child type ${name} which is a child type of ${name}`);
                    }
                    childTypes.push([name, childName, childType]);
                });
            }
        });
        Object.entries(types).forEach(([name, definition]) => {
            definition.type = name = this.canonicalize(name);
            if (definition.public === undefined) {
                definition.public = Object.entries(definition.config).length > 0;
            }

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
            this._entityTypes.set(name, new EntityType(name, definition));
        });
        childTypes.forEach(([parent, name, definition]) => {
            const type = this._entityTypes.get(`${this.name}.${parent}`);
            if (type) {
                type.registerChildEntityType(`${this.name}.${name}`, definition);
            } else {
                console.error(`${this.name}.${parent} not loaded`);
            }
        });
    }

    /**
     * Expand the name to be in dot separated platform.type notation.
     *
     * @param {string} name
     * @return {string} Canonicalized form of the class name.
     */
    canonicalize(name) {
        return name.match(regularExpressions.nameRegex) ? `${this.name}.${name}` : name;
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
