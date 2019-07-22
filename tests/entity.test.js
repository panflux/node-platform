/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Entity = require('../src/entity');

const dummies = require('./fixtures/dummies');

/**
 * Return default entity definition to be used in tests
 * @return {object}
 */
function createEntityDefinition() {
    return {
        id: '684',
        name: 'foo',
        type: 'foo-bar',
        config: {
            foo: 'bar',
        },
    };
}

/**
 * Return an entity to be used in tests
 * @param {*} sandbox
 * @return {Entity}
 */
function createEntity(sandbox) {
    return new Entity(createEntityDefinition(), sandbox, dummies.winston);
}

test('Expose basic properties', () => {
    const entity = createEntity(dummies.createSandbox());

    expect(entity.id).toBe('684');
    expect(entity.name).toBe('foo');
    expect(entity.type).toBe('foo-bar');
    expect(entity.config.foo).toBe('bar');
});

test('Call sandbox functions', () => {
    const sandbox = dummies.createSandbox();
    const entityDefinition = createEntityDefinition();
    delete entityDefinition['config'];

    const ps = jest.fn();
    process.send = ps;

    sandbox.on('adopt', (entity) => {
        entity.setProperty('foo', 'bar');
        expect(ps).toHaveBeenCalledWith({name: 'pendingChanges', args: {entityIds: ['684']}});
        ps.mockReset();

        entity.setAttribute('foo', 'bar');
        expect(ps).toHaveBeenCalledWith({name: 'pendingChanges', args: {entityIds: ['684']}});
        ps.mockReset();

        sandbox.processChangeQueue();
        expect(ps).toHaveBeenCalledWith({name: 'data', args: {attributes: {foo: 'bar'}, entityId: '684', properties: {foo: 'bar'}}});
        ps.mockReset();

        entity.emit('foo-bar', {foo: 'bar'});
        expect(ps).toHaveBeenCalledWith({name: 'event', args: {name: 'foo-bar', entityId: '684', parameters: {foo: 'bar'}}});
        ps.mockReset();
    });
    sandbox.adopt(entityDefinition);
});
