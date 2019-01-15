/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const fork = require('child_process').fork;
const path = require('path');

const Platform = require('../src/platform');
const Sandbox = require('../src/sandbox');

const testPlatform = new Platform({
    name: 'foo-bar',
    entities: {
        'foo-bar': {},
    },
});

test('Sandbox messages', () => {
    const sandbox = new Sandbox({name: 'foo'});
    const ev = jest.fn();

    sandbox.on('bar', ev);
    process.emit('message', {name: 'bar', args: {bar: 'foo'}});
    expect(ev).toHaveBeenCalledWith({bar: 'foo'});
});

test('Sandbox functions', () => {
    const sandbox = new Sandbox(testPlatform);
    const ps = jest.fn();

    process.send = ps;

    sandbox.reportDiscovery({type: 'foo-bar', id: '684'});
    expect(ps).toHaveBeenCalledWith({name: 'discovery', args: {type: 'foo-bar', id: '684', name: 'foo-bar-684'}});
});

// Set up fork for IPC tests
const child = fork(path.join(__dirname, 'fork-bouncer.js'));

test('Sandbox IPC', async () => {
    const promise = new Promise((resolve) => {
        child.on('message', (msg) => resolve(msg));
    });
    child.send({name: 'discover'});

    await expect(promise).resolves.toEqual({
        name: 'discovery',
        args: {
            id: '684',
            name: 'fake-684',
            type: 'fake',
        },
    });
});

