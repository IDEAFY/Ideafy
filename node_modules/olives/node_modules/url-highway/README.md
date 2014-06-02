url-highway
=============

A url based router. It's based on [Highway](https://github.com/cosmosio/highway), which is a simple and extensible router, and adds it url support. The router can listen to hash changes to navigate to a route, or update the hash when navigating to a new route.

Installation
============

```bash
npm install url-highway
```

How to use
==========

Require and initialize A url based router:

```js
var Highway = require("url-highway"),
  highway = new Highway();
```
Let's define routes:

```js
highway.set("route", function onRouteCalled(param1) {
    // Do something when navigating to "route".
}, /* scope, optional */);

highway.set("anotherRoute", function onAnotherRouteCalled(param1, param2, param3) {
    // Do something when navigating to anotherRoute
}, /* optional scope*/);
```

By default, when navigating to a route, url highway will update the hash:

```js
// Navigating to "route", giving 66 as a parameter. As many parameters as necessary can be given to navigate.
highway.navigate("route", 66);

//Then url highway updates the hash:
window.location.hash; // #route/66
```

When navigating to a route with several parameters:

```js
highway.navigate("anotherRoute", "interstate", 66, "D.C.");

// Then the hash will be:
window.location.hash; // #anotherRoute/interstate/66/D.C.
````

Also, when the hash is updated (programmatically or from the address bar), to #route/127/MI

```js
window.location.hash = "#route/127/MI";

// Will call navigate:
highway.navigate("route", "127", "MI");
```

Highway's other features are available too:
====================

Removing a route:

```js
var handle = highway.set("route", ...);

highway.unset(handle);
```

Navigating in the history:

```js
highway.back();
highway.forward();

highway.go(-2);
```

LICENSE
=======

MIT
