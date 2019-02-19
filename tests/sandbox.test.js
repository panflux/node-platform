/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const fork = require('child_process').fork;
const path = require('path');
const winston = require('winston');

const Platform = require('../src/platform');
const ProcessTransport = require('../src/processTransport');
const Sandbox = require('../src/sandbox');

const testPlatform = new Platform({
    name: 'foo-bar',
    types: {
        'foo-bar': {},
    },
});
winston.add(new ProcessTransport());

describe('Sandbox messages', () => {
    test('start/stop', () => {
        const sandbox = new Sandbox(testPlatform, winston);
        const ev = jest.fn();

        sandbox.on('start', ev);
        process.emit('message', {name: 'start', args: {bar: 'foo'}});
        expect(ev).toHaveBeenCalledWith({bar: 'foo'});
    });

    test('entity adoption', (done) => {
        const sandbox = new Sandbox(testPlatform, winston);

        sandbox.on('adopt', (entity) => {
            expect(typeof entity).toBe('object');
            expect(entity.id).toBe('684');
            done();
        });
        process.emit('message', {name: 'adopt', args: {id: '684', name: 'foo', type: 'foo-bar'}});
    });

    test('unknown message', (done) => {
        process.send = (msg) => {
            expect(msg.name).toBe('log');
            expect(msg.args.level).toBe('error');
            expect(msg.args.message).toMatch(/unknown message/i);
            done();
        };
        process.emit('message', {name: 'foo', args: 'bar'});
    });
});

test('Sandbox functions', () => {
    const sandbox = new Sandbox(testPlatform, winston);
    const ps = jest.fn();

    process.send = ps;

    sandbox.reportDiscovery({type: 'foo-bar', id: '684'});
    expect(ps).toHaveBeenCalledWith({name: 'discovery', args: {type: 'foo-bar', id: '684', name: 'foo-bar-684'}});

    // Test repeated discovery does not trigger new messages
    sandbox.reportDiscovery({type: 'foo-bar', id: '684'});
    expect(ps).toHaveBeenCalledTimes(1);
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

