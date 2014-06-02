#Transport

A hub for centralizing all your request handlers within your application. Implements the disposable pattern.

#Installation

```bash
npm install transport
```

#How to use

Require and initialize transport:

```js
var Transport = require("transport"),
  transport = new Transport();
```

## Requests

Define a `simpleHandler` to handle a request and send the result back:

```js
// Object with all the request handlers
var handlers = {
    simpleHandler: function (payload, callback) {
        // do something with the payload
        var result = doSomethingWithPayload(payload);

        // send the result back
        callback(result);
    }
};
```

Add the handler to `Transport`. The handlers have to be stored in an `observable-store`. This allows for sharing the same handlers between several implementations of `Transport` and react accordingly when handlers are added and removed.

```js
var Store = require("observable-store");

transport.setReqHandlers(new Store(handlers));
```

Make the request to `simpleHandler`:

```js
transport.request("simpleHandler", "payload", function callback(result) {
    // do something with result
});
```

## Open a channel

Let's define a handler that will publish several updates.

```js
var handlers = {
    simpleChannel: function (payload, onEnd, onData) {
        var stream = getStream(payload);

        stream.on('data', onData);
        stream.on('end', onEnd);
    }
};
```

Now we can open the channel and receive updates:

```js
transport.listen("simpleChannel", "filename", function onEnd(data) {
    // Will be called when stream closes
    console.log("END OF FILE", data);
}, function onData(data) {
    // Will be called everytime some data is pushed
    console.log("MORE DATA", data);
});
```

## Close/dispose an open channel

`transport.listen` returns a function. When the `handler` also returns a function, it will be called by executing the one returned by `transport.listen`. It can be used to stop whatever the `handler` started and do some cleanup too.

```js
var handlers = {
    closableChannel: function (payload, onEnd, onData) {
        var stream = getStream(payload);

        stream.on("data", onData);
        stream.on("end", onEnd);

        return function stop() {
            stream.removeListener("data", onData);
            stream.removeListener("end", onEnd);
        }
    }
};
```

Now, when calling `transport.listen`, we can call the `stop()` function returned by the `handler`.

```js
var stop = transport.listen("closableChannel", "filename", function onEnd() { ... }, function onData() { ... });

// When calling stop, the stop() function returned by the handler will be executed.
stop();
```

## Managing errors

A convenient way to bubble up errors is to follow the error first convention:

```js
var handlers = {
    closableChannel: function (payload, onEnd, onData) {
        var stream = getStream(payload);

        stream.on("data", onData);
        stream.on("end", function (data) {
            onEnd(null, data);
        });
        stream.on("error", function (error) {
            onEnd(error);
        });
    }
};
````

And now we can handle the errors in the onEnd callback.

```js
transport.listen("closableChannel", "filename", function onEnd(error, data) {
    if (error) {
        throw new Error(error);
    }

    // do something with data
}, function onData() {
        // ...
});
```


LICENSE
=======

MIT
