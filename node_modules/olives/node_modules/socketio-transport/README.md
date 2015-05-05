#Socketio-transport

socketio-transport will allow you to define request handlers (file, DB, ...) on the server side and to access them from the client side.

#Installation

```bash
npm install socketio-transport
```

#How to use

socketio-transport has a client-side and a server-side part, just like socket.io which it's based upon. It'll just wrap socket.io to provide a nice abstraction to make requests and open channels from the client side.

## Wrap the server side and define handlers

Require the server part of socketio-transport:

```js
var transport = require("socketio-transport").Server;
```

And define you request handlers:

```js
var handlers = {
    /**
     * payload is a JSON sent by the client
     * onData is the callback that will receive each update
     * onEnd will be called with the last update
     */
    test: function (payload, onEnd, onData) {
        setInterval(function () {
            onData((new Date));
        }, 200);
    }
}
```

Then register the socket.io that you want to use and add the handlers too. The handlers need to be wrapped in an observable-store, because they can be shared between several `transports` and they will know when handlers are added/removed/updated if needed.

```js
// the socket.io
var io = require("socket.io").listen(8000);

// The observable-store to wrap the handlers
var Store = require("observable-store");

// register socket.io and the handlers:
socketioTransport(io, new Store(handlers));
```

## Wrap the client side and query the handlers

Require the client part of socketio-transport

```js
var SocketioTransport = require("socketio-transport").Client;
```

Initialize it with the socket.io that you want to use:

```js
var transport = new SocketioTransport(io.connect("http://localhost:8000"));
```

And you're now free to query your request handlers:

```js
transport.listen("test", { ...}, function onData(data) {
    // do something with data
    console.log(data); // Date, triggered every 200ms
});
```

LICENSE
=======

MIT
