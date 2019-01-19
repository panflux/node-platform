/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const humanize = require('humanize-string');
const Joi = require('joi');

const {nameRegex, classRegex, semverRegex} = require('./regularExpressions');
const Schema = require('./schema');

module.exports = new class PlatformSchema extends Schema {
    /**
     * Construct platform schema wrapper.
     */
    constructor() {
        super(Joi.object({
            // Metadata
            name: Joi.string().lowercase().min(3).regex(nameRegex).required(),
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

            entities: Joi.object().pattern(nameRegex, Joi.object({
                implements: Joi.array().items(Joi.string().regex(classRegex).required()).default([]),
                config: Joi.object().pattern(nameRegex, Joi.string().regex(nameRegex).required()).default(),
            }).unknown()).default({}),
        }).required());
    }
};