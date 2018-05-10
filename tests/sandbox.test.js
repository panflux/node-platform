/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const fork = require('child_process').fork;
const path = require('path');
const Sandbox = require('../src/sandbox');

test('Sandbox messages', () => {
    const sandbox = new Sandbox({name: 'foo'});
    const ev = jest.fn();

    sandbox.on('bar', ev);
    process.emit('message', {name: 'bar', args: {bar: 'foo'}});
    expect(ev).toHaveBeenCalledWith({bar: 'foo'});
});

test('Sandbox functions', () => {
    const sandbox = new Sandbox({name: 'foo'});
    const ps = jest.fn();

    process.send = ps;

    sandbox.reportDiscovery({foo: 'bar'});
    expect(ps).toHaveBeenCalledWith({name: 'discovery', args: {foo: 'bar'}});
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
        args: { foo: 'bar'},
    });
});

