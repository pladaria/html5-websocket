'use strict';

const NodeWebSocket = require('ws');

/**
 * Creates something similar to a WebApi MessageEvent
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
 *
 * @param {Object} target
 * @param {String|Blob|ArrayBuffer} data
 */
const MessageEvent = function (target, data) {
    this.bubbles = false;
    this.cancelable = false;
    this.cancelBubble = false;
    this.currentTarget = this;
    this.data = data;
    this.eventPhase = 0;
    this.srcElement = this;
    this.target = this;
    this.timeStamp = Date.now();
    this.type = 'message';
};

/**
 * Creates something similar to a HTML5 WebSocket
 *
 * @param {String} address
 */
const WebSocket = function (address) {

    if (!this instanceof WebSocket) {
        throw new TypeError("Constructor WebSocket requires 'new'.");
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
        if (listeners.some((fn) => fn === listener)) {
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

    this.send = (data) => {
        ws.send(data, (error) => {
            if (!error) {
                return;
            }
            eventListeners.error.forEach((fn) =>
                process.nextTick(() => fn(error)));

            if (this.onerror) {
                process.nextTick(() => this.onerror(error));
            }
        });
    };

    ws.on('open', (err) => {
        eventListeners.open.forEach((fn) => process.nextTick(fn));

        if (this.onopen) {
            process.nextTick(this.onopen);
        }
    });

    ws.on('close', (err) => {
        eventListeners.close.forEach((fn) => process.nextTick(fn));

        if (this.onclose) {
            process.nextTick(this.onclose);
        }
    });

    ws.on('message', (data, flags) => {
        // https://developer.mozilla.org/en-US/docs/Web/Events/message
        const messageEvent = new MessageEvent(this, data);
        eventListeners.message.forEach((fn) =>
            process.nextTick(() => fn(messageEvent)));

        if (this.onmessage) {
            process.nextTick(() => this.onmessage(messageEvent));
        }
    });
};

module.exports = WebSocket;

