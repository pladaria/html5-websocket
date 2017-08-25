const test = require('ava');
const Server = require('ws').Server;
const WebSocket = require('..');

const ANY_PORT = 63242;
const ANY_MESSAGE = 'hello, world!';

test.serial.cb('connect', t => {
    const wss = new Server({port: ANY_PORT});

    wss.on('connection', () => {
        t.pass('client connected');
        wss.close();
        t.end();
    });

    const ws = new WebSocket(`ws://localhost:${ANY_PORT}`)
});

test.serial.cb('send and receive', t => {
    const wss = new Server({port: ANY_PORT});

    wss.on('connection', (client) => {
        client.on('message', (msg) => {
            t.is(msg, ANY_MESSAGE);
            client.send(`ACK ${ANY_MESSAGE}`);
        })
    });

    const ws = new WebSocket(`ws://localhost:${ANY_PORT}`)

    ws.onopen = () => {
        ws.send(ANY_MESSAGE);
    };

    ws.onmessage = (msg) => {
        t.is(msg.data, `ACK ${ANY_MESSAGE}`);
        t.end();
    }
});
