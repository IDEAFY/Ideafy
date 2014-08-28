get dataset
=============

Get a DOM element's or an SVG Element's dataset. Works where .dataset isn't present such as in < IE11.

Installation
============

```bash
npm install get-dataset
```

How to use
==========

Require get-dataset:

```js
var getDataset = require("get-dataset");
```

Given this element:

```html
<div class="myDiv" data-prop1="value1" data-prop2="value2"></div>
```

To retrieve the dataset:

```js
getDataset(document.querySelector("myDiv"));
//{
//    prop1: "value1",
//    prop2: "value2"
//};
```


LICENSE
=======

MIT
