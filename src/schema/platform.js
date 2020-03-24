/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const humanize = require('humanize-string');
const Joi = require('@hapi/joi');

const {nameRegex, classRegex, memberRegex, semverRegex} = require('./regularExpressions');
const Schema = require('./schema');
const {objectSchema} = require('./types');

module.exports = new class PlatformSchema extends Schema {
    /**
     * Construct platform schema wrapper.
     */
    constructor() {
        super(Joi.object({
            // Metadata
            name: Joi.string().lowercase().min(3).max(32).regex(nameRegex).required(),
            friendly_name: Joi.string().min(3).max(64).default((ctx) => humanize(ctx.name)),
            version: Joi.string().regex(semverRegex, 'SemVer compliant version string').default('0.0.1').example('1.2.3-beta.1').description('SemVer compliant version string'),
            license: Joi.string().max(32).example('MIT'),
            authors: Joi.array().items(Joi.object({
                name: Joi.string().max(64).required(),
                email: Joi.string().email(),
                web: Joi.string().uri(),
            })).default([]).single(),
            keywords: Joi.array().items(Joi.string().min(1).max(32)).default([]).single(),

            // Run properties
            main_file: Joi.string().default((ctx) => ctx.name + '.js'),
            dependencies: Joi.object({
                native: Joi.array().items(Joi.string().min(1)).default([]),
                external: Joi.array().items(Joi.string().min(1)).default([]),
            }).default(),

            types: Joi.object().pattern(nameRegex, Joi.object({
                parent: Joi.string(),
                implements: Joi.array().items(Joi.string().regex(classRegex).required()).default([]),
                extends: Joi.string().regex(nameRegex),
                parent: Joi.string().regex(nameRegex),
                config: objectSchema,
                attributes: objectSchema,
                properties: objectSchema,
                services: Joi.object().pattern(memberRegex, objectSchema).default(),
                events: Joi.object().pattern(memberRegex, objectSchema).default(),
            })).default({}),
        }).required());
    }
};
