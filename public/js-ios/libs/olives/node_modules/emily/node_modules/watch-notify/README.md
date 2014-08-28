Watch notify
=============

The omnipresent publish subscribe design pattern. The observers are called in the same order that they are added. If an observer throws an error when executed, the exception is caught and the execution continue to the next one.

Installation
============

```bash
npm install watch-notify
```

How to use
==========

Require and initialize watch-notify:

```js
var watchNotify = require("watch-notify");

var watchNotify = new WatchNotify();
```

Watch on a specific topic:

```js
var handle = watchNotify.watch("topic", function handler(message) {
  // this === scope
}, scope /* optional */);
```

The topic can also be a number:

```js
var handle = watchNotify.watch(1337, function handler() { ... });
```

Notify on a specific topic:

```js
watchNotify.notify("topic", "hi!");
```

Several types can be given to notify:

```js
watchNotify.notify("topic", "message1", "message2", anObject, ...);
```

Remove an observer:

```js
watchNotify.unwatch(handle);
```

Observe only once. The handler will be called once and then removed, so any new message on `topic` won't trigger it.

```js
var handle = watchNotify.once("topic", function handler() { ... });
```

Remove the handler before it's even called for the first time:

```js
watchNotify.unwatch(handle);
```



LICENSE
=======

MIT
