/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Entity = require('../src/entity');

const dummies = require('./fixtures/dummies');

test('Expose basic properties', () => {
    const entity = new Entity({
        id: 684,
        name: 'foo',
        type: 'bar',
        config: {
            foo: 'bar',
        },
    }, dummies.createSandbox(), dummies.winston);

    expect(entity.id).toBe(684);
    expect(entity.name).toBe('foo');
    expect(entity.type).toBe('bar');
    expect(entity.config.foo).toBe('bar');

    entity.setProperty('foo', 'bar');
});
