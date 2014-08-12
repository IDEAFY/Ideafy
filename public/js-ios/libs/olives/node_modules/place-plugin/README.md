#Place plugin

A Seam plugin for declaratively appending seam views to the DOM.

##Installation

```bash
npm install place-plugin
```

##How to use

Require place-plugin:

```js
var PlacePlugin = require("place-plugin");
```

##Initialize PlacePlugin

```js
var placePlugin = new PlacePlugin();
```

##Add it SeamViews

```js
placePlugin.addAll({
    "view1": new SeamView(),
    "view2": new Seamview()
});
```

##Declaratively add views to the dom:

```html
<div data-place="place: view1"></div>
<div data-place="place: view2"></div>
```

##Add place plugin to your Seam or SeamView

```js
// Most likely if you are using bare seam:
seam.add("place", placePlugin);

//Most likely if you are using SeamView:
seamView.seam.add("place", placePlugin);
```

And then, when you apply seam or render your seamView, your views will be automatically appended.


LICENSE
=======

MIT
