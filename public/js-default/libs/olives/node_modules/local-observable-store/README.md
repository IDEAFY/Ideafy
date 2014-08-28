Local Observable Store
=============

An observable data-store that persists in local storage. It's a subtype of [observable-store](https://github.com/flams/observable-store), which means that it can be used just like the `observable-store` but also adds persistance in `localStorage`.

Installation
============

```bash
npm install local-observable-store
```

How to use
==========

Require and initialize local-observable-store:

```js
var LocalStore = require("local-observable-store"),
  localStore = new LocalStore();
```

Synchronize the local-observable-store with an already saved store in localStorage:

```js
localStore.sync("persistedStore");
```

If there's anything currently in localStorage, it will be loaded in the store:

```js
localStorage.setItem("persistedStore", JSON.stringify({ property: "value" }));

localStore = new LocalStore();
localStore.sync("peristedStore");

localStore.get("property"); // value
```

Then, everytime something changes in the local-observable-store, it's automatically persisted in localStorage.

```js
localStore.set("newProperty", "hello!");

JSON.parse(localStorage.getItem("persistedStore")).newProperty; // "hello!";
```



LICENSE
=======

MIT
