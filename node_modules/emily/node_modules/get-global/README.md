Get global
=============

get-global is a simple tool for getting the global object.
If it's running in the browser, it will return window, if it's running in node.js it will return GLOBAL,
or whatever the global object is in the current runtime.

It will work in 'strict mode' too.

Installation
============

```bash
npm install get-global
```

How to use
==========

Require get-global:

```js
var getGlobal = require("get-global");
```

```js
var globalObject = getGlobal();

globalObject === window; // in the browser
globalObject === GLOBAL; // in node.js
```

LICENSE
=======

MIT
