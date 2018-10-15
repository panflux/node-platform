/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const humanize = require('humanize-string');
const Joi = require('joi');

// Ref https://github.com/semver/semver/issues/232, npm package semver-regex had weird flags
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;

const schema = Joi.object({
    // Metadata
    name: Joi.string().lowercase().min(3).regex(/^[a-z][a-z0-9\-_]+[a-z0-9]$/).required(),
    friendly_name: Joi.string().min(3).default((ctx) => humanize(ctx.name), 'Human-friendly name of the platform'),
    version: Joi.string().regex(semverRegex).default('0.0.1').example('1.2.3-beta.1').description('SemVer compliant version string'),
    license: Joi.string().example('MIT'),
    authors: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email(),
        web: Joi.string().uri(),
    })).default([]).single(),
    keywords: Joi.array().items(Joi.string().min(1)).default([]).single(),

    // Run properties
    main_file: Joi.string().default((ctx) => ctx.name + '.js', 'Entry point for the platform'),
    discovery: Joi.bool().default(false),
    dependencies: Joi.object({
        native: Joi.array().items(Joi.string().min(1)).default([]),
        external: Joi.array().items(Joi.string().min(1)).default([]),
    }).default(),
}).required();

module.exports = {
    validate: function(config) {
        const {error, value} = Joi.validate(config, schema);

        if (error) {
            throw Error(error.annotate());
        }
        return value;
    },
};
