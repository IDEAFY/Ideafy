get nodes
=============

Returns an array of all the elements within a dom element, including the dom element itself.

Installation
============

```bash
npm install get-nodes
```

How to use
==========

Require get-nodes:

```js
var getNodes = require("get-nodes");
```

Given this DOM structure:

```html
<header></header>
<section>
    <div></div>
    <div></div>
    <div></div>
</section>
<footer></footer>
```

To retrieve all the elements in section:

```js
getNodes(document.querySelector("section"));
// [
//    <section>,
//    <div>,
//    <div>,
//    <div>
// ]
```

LICENSE
=======

MIT
