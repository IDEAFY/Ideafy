Event plugin
===========

Declaratively add event listeners to your views. It can also delegate events to a parent element. It's a plugin for [Seam](https://github.com/flams/seam).

Installation
============

```bash
npm install event-plugin
```

How to use
==========

Require event-plugin:

```js
var EventPlugin = require("event-plugin");
```

Init event plugin and define event handlers:

```js
var eventPlugin = new EventPlugin({
    toggle: function (event, node) {
        // do something with...
        // event is the original event
        // node is the dom node that was clicked
    }
});
```

```html
<!-- The toggle function will be called on click, on the propagation phase -->
<button data-event="listen: click, toggle, true">Change route</button>
```

When ready, attach the behavior to the dom via Seam:

```js
var Seam = require("seam");

var seam = new Seam({
    event: eventPlugin
});

seam.apply(document.querySelector("button"));
```

You can also use the delegation method from event to delegate events to a parent DOM element.
This improves performance are less event listeners are bound to the DOM. This is especially
relevant to lists.

```html
<!-- The ul will listen to click event and call the toggle handler if an element matching 'a' is targeted.
     The bubbling phase will be listened to in this case -->
<ul data-event="delegate: a, click, toggle, false">
    <li><a href="#link1">link1</a></li>
    <li><a href="#link2">link2</a></li>
    <li><a href="#link3">link3</a></li>
</ul>
```


LICENSE
=======

MIT
