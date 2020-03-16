/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

module.exports = {
    EntityTypeSchema: require('./entityType'),
    PlatformSchema: require('./platform'),

    createValueSchema: require('./schema').createValueSchema,
    types: require('./types'),
};
