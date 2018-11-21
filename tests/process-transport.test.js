/*
 * Panflux Node Platform
 * (c) Omines Internetbureau B.V. - https://omines.nl/
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const ProcessTransport = require('../src/process-transport');

test('Transport stream', async () => {
    const transport = new ProcessTransport({});
    const ps = jest.fn();
    const cb = jest.fn();

    const promise = new Promise((resolve) => {
        transport.on('logged', resolve);
    });

    process.send = ps;
    transport.log({message: 'info'}, cb);

    expect(ps).toHaveBeenCalledWith({name: 'log', args: {message: 'info'}});
    expect(cb).toHaveBeenCalled();
    await expect(promise).resolves.toEqual({message: 'info'});

    transport.log({message: 'info'});

    expect(ps).toHaveBeenCalledTimes(2);
});
