Simple object mixin
=============

Simple mixin is the simplest implementation for a mixin, copying an object's properties onto another. It has an option for specifying if duplicated properties can be replaced or not in the target object.
Use `https://github.com/WebReflection/object-mixin` instead of this module if you can, it's better to use built-in features or their polyfills.
It will not copy the properties from the prototype chain.

Installation
============

```bash
npm install simple-object-mixin
```

How to use
==========

Require simple-mixin:


```js
var mixin = require("simple-object-mixin");
```

Use it with an array:

```js
var objectSource = {
  "b": 30,
  "c": 40
};

var objectDestination = {
  "a": 10,
  "b": 20
};

var returnedObject = mixin(objectSource, objectDestination);

returnedObject === objectDestination;
JSON.stringify(objectDestination); //{"a":10,"b":"30", "c":40}
```

By default, the properties from source are copied onto destination. If there's a duplicated property, it will be replaced. If you don't want the new value to override the existing value, you can use the dontOverride option:

```js
var returnedObject = mixin(objectSource, objectDestination, true /* don't override */);

returnedObject === objectDestination;
JSON.stringify(objectDestination); //{"a":10,"b":"20", "c":40} the value for "b" will be preserved
```

LICENSE
=======

MIT
