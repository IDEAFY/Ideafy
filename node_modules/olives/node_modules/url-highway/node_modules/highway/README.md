highway
=============

A simple and multi-purpose router with history management.

Installation
============

```bash
npm install highway
```

How to use
==========

Require and initialize highway:

```js
var Highway = require("highway"),
  highway = new Highway();
```

Add a route:

```js
var handle = highway.set("route", function routeHandler() {
    // Do something when navigating to route
    // this === scope;
}, scope /* optional */);
```

Remove a route :

```js
highway.unset(handle);
```

Navigate to a route:

```js
// this will call the handler that's defined for route with all of the following params
highway.navigate("route", "param1", "param2", {}, ...);
```

Watch for route changes:

```js
var handle = highway.watch(function routeChangeHandler(newRoute, param1, param2, ...) {
    // newRoute is the route that we navigated to
    // scope === this;
}, scope /* optional */);
```

Stop watching for route changes:

```js
highway.unwatch(handle);
```

Navigate in the history:

```
// Go back in the history, we reload the previous route with the same params.
highway.back();

// Go forward
highway.forward();

// Go back 3 times
highway.go(-3);

// Go forward 2 times
highway.get(-2);
```

Increase the saved history (10 by default):

```js
// Save the last 100 routes
highway.setMaxHistory(100);
```

clear history

```js
highway.clearHistory();
```

How to extend?
==============

This a very simple router. You can build on top it if you want it to be URL based for instance:

```js
function URLRouter() {
  var highway = new Highway();

  function getRouteFromUrl(url) { return ... }
  function getParamsFromUrl(url) { return ... }

  this.navigate = function (url) {
      var route = getRouteFromUrl(url),
        params = getParamsFromUrl(url);

      highway.navigate.apply(highway, route, params);
  };

  ...
}
```

You could also bind it to hashchange:

```js
function HashRouter() {
  var highway = new Highway();

  function getRouteFromHash(hash) { return ... }
  function getParamsFromHash(hash) { return ... }

  window.addEventListener("hashchange", function () {
      var route = getRouteFromHash(window.location.hash),
        params = getParamsFromHash(window.location.hash);

      highway.navigate.apply(highway, route, params);
  }, true);

  ...
}
```


LICENSE
=======

MIT
