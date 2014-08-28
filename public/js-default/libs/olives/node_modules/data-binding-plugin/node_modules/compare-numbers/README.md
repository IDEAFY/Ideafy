Compare numbers
=============

Compare numbers:

With the `asc` function: compare A and B, returns 1 if A is greater, -1 if lower, 0 if both are equal. Can be used with array.sort().
With the `desc` function: compare A and B, returns -1 if A is greater, 1 if lower, 0 if both are equal. Can be used with array.sort().

Installation
============

```bash
npm install compare-numbers
```

How to use
==========

Require compare-numbers:

```js
var compareNumbers = require("compare-numbers");
```

```js
compareNumbers.asc(10, 1); // 1
compareNumbers.asc(1, 10); // -1
compareNumbers.asc(10, 10); // 0
```

```js
compareNumbers.desc(10, 1); // -1
compareNumbers.desc(1, 10); // 1
compareNumbers.desc(10, 10); // 0
```

To be used with array.sort to sort arrays:

```js
[10, 2, 30, 45, 60].sort(compareNumbers.asc); // [2, 10, 30, 45, 60];
```

```js
[10, 2, 30, 45, 60].sort(compareNumbers.desc); // [60, 45, 30, 10, 2];
```

LICENSE
=======

MIT
