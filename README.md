# html5-websocket

This module is a thin facade of [ws](https://www.npmjs.com/package/ws) which implements the standard [HTML5 WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) interface.

The motivation behind this module is to be able to write WebSocket based libraries that will run without changes in Node.js, Browsers or React Native apps.

## Usage

The API is the same as the standard HTML5 Socket API so nothing new here...

```javascript
const ws = new WebSocket('ws://html5rocks.websocket.org/echo');

ws.onopen = function () {
    ws.send('Hello!');
};

ws.onmessage = function (e) {
    console.log(e.data);
};

ws.onerror = function (error) {
    console.log('Fail:', error);
};
```

You can also use the DOM Level 2 Event Model

```javascript
const handleMessage = function (e) {
    console.log(e.data);
};

// add listener
ws.addEventListener('message', handleMessage);

// remove listener
ws.removeEventListener('message', handleMessage);
```

## License

MIT
