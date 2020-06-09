/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @param {panflux.Platform} platform
 * @param {winston.Logger} logger
 */
module.exports = (platform, logger) => {
    platform.on('adopt', (entity) => {
        logger.info(`Adopting "${entity.type.name}" entity "${entity.name}" (${entity.id})`);

        switch (entity.type.name) {
        case 'full.foo':
            entity.registerChildEntity({
                id: '42',
                type: 'full.bar',
            });
            break;
        default:
            logger.error(`Unsupported entity type ${entity.type.name}`);
            break;
        }

        entity.registerServices({
            foo: (args) => {
                console.log(args);
            },
        });
    });
};
