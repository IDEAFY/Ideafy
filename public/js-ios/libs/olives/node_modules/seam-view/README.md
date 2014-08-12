#seam-view


Seam-view is the perfect companion to Seam, the tool to add behavior to your HTML via plugins. Seam view will wrap your template (HTML template or DOM elements) and bind it to seam in an easy to use wrapper that you can attach to the DOM and place wherever you want.

##Installation

```bash
npm install seam-view
```

##How to use

###Require seam-view:

```js
var SeamView = require("seam-view");
```

###Initialize SeamView:

```js
var seamView = new SeamView();
```

###Defining the template:

The template can come from a template string:

```js
var template = '<ul data-binding="foreach">' +
    '<li data-binding="bind: innerHTML, value"></li>' +
'</ul>';
```

###Adding the Seam plugins

And we can add our plugins to Seam.

```js
seamView.seam.addAll({
    binding: new DataBinding(collection)
});
```

###Assigning the template:

Then we can add it to our SeamView:

```js
seamView.template = template;
```

###Rendering the seamView

When we're ready to render the view, seamView will transform our text HTML into some DOM elements and also bind the JS behavior to the HTML, if we've added the plugins to Seam.

```js
seamView.render();
```

###Placing the seamView in the dom

We now have rendered the view and the plugins have been applied to the DOM. We can place our view whenever we're ready:

```js
seamView.place(document.querySelector("main"));
```

_Note :_ if place is called before render(), then seamView will do the render for us.

###Now, if the template is already a DOM element present in the DOM

Then we can directly make the DOM 'alive', i.e. attaching the JS behavior to the DOM via seam, by calling seamView.alive().

```html
<ul data-binding="foreach">
    <li data-binding="bind: innerHTML, value"></li>
</ul>
```

```js
seamView.alive(document.querySelector("ul"));
```

###Moving seamView around:

SeamView is now a rendered view, and moving it around is as easy as calling place() again. The behavior will remain attached to the dom.

```js
seamView.place(document.querySelector(".anotherPlace"));
```


LICENSE
=======

MIT
