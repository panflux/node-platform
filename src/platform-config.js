/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const humanize = require('humanize-string');
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().lowercase().min(3).regex(/^[a-z][a-z0-9\-_]+[a-z0-9]$/).required(),
    friendly_name: Joi.string().min(3).default(ctx => humanize(ctx.name), 'Human-friendly name of the platform'),
    main_file: Joi.string().default(ctx => ctx.name + '.js', 'Entry point for the platform'),
    authors: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email(),
        web: Joi.string().uri(),
    })),
    discovery: Joi.bool().default(false),
    dependencies: Joi.object({
        native: Joi.array().items(Joi.string().min(1)).default([]),
        external: Joi.array().items(Joi.string().min(1)).default([]),
    }).default(),
});

module.exports = {
    validate: function(config) {
        const {error, value} = Joi.validate(config, schema);

        if (error) {
            throw Error(error.annotate());
        }
        return value;
    }
}