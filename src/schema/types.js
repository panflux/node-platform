/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Joi = require('joi');

const {memberRegex, scalarTypeRegex} = require('./regularExpressions');

const typeSchema = Joi.string().regex(scalarTypeRegex).required();

const objectSchema = Joi.object().pattern(memberRegex, typeSchema).allow(null).default();

module.exports = {objectSchema, typeSchema};
