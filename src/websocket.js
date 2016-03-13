'use strict';

const NodeWebSocket = require('ws');

const WebSocket = function (address) {

    if (!this instanceof WebSocket) {
        throw new TypeError(
            "Failed to construct 'WebSocket': Please use the 'new' operator, " +
            "this DOM object constructor cannot be called as a function."
        );
    }

    this.url = address;
    this.protocol = '';
    this.readyState = 0;
    this.bufferedAmount = 0;

    // DOM Level 0
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;

    // DOM Level 2
    const eventListeners = {
        open: [],
        close: [],
        message: [],
        error: [],
    };

    /**
     * @param  {String} type
     * @param  {Function} listener
     */
    this.addEventListener = (type, listener) => {
        const listeners = eventListeners[type];
        if (!Array.isArray(listeners)) {
            return;
        }
        if (listeners.some(fn => fn === listener)) {
            return;
        }
        listeners.push(listener);
    };

    /**
     * @param  {String} type
     * @param  {Function} listener
     */
    this.removeEventListener = (type, listener) => {
        const listeners = eventListeners[type];
        if (!Array.isArray(listeners)) {
            return;
        }
        listeners.some((fn, index) => {
            if (fn === listener) {
                listeners.splice(index, 1);
                return true;
            }
            return false;
        });
    };

    const ws = new NodeWebSocket(address);

    this.send = data => {
        ws.send(data, function ack (error) {
            if (!error) {
                return;
            }
            eventListeners.error.forEach(fn =>
                process.nextTick(() => fn(error)));

            if (this.onerror) {
                process.nextTick(() => this.onerror(error));
            }
        });
    };

    ws.on('open', err => {
        eventListeners.open.forEach(fn => process.nextTick(fn));

        if (this.onopen) {
            process.nextTick(this.onopen);
        }
    });

    ws.on('close', err => {
        eventListeners.close.forEach(fn => process.nextTick(fn));

        if (this.onclose) {
            process.nextTick(this.onclose);
        }
    });

    ws.on('message', (data, flags) => {
        // https://developer.mozilla.org/en-US/docs/Web/Events/message
        const messageEvent = {
            data,
            target: this,
            type: 'message',
            bubbles: false,
            cancelable: false,
            eventPhase: 2,
            timeStamp: Date.now(),
        };
        eventListeners.message.forEach(fn =>
            process.nextTick(() => fn(messageEvent)));

        if (this.onmessage) {
            process.nextTick(() => this.onmessage(messageEvent));
        }
    });
};

module.exports = WebSocket;

