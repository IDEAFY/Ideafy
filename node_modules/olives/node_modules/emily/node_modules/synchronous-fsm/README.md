Synchronous finite state machine
=============

A synchronous FSM that also triggers events when entering or leaving a state.

Installation
============

```bash
npm install synchronous-fsm
```

How to use
==========

Require synchronous-fsm:

```js
var FSM = require("synchronous-fsm");
```

To initialize the statemachine we need to define states and transitions first:

```js
var states = {
  // It has an 'opened' state
  "opened": [
      // That accepts a 'pass' event that will execute the 'pass' action
      ["pass", function onPass(event) {
          passCalled = event;
      // And when done, it will transit to the 'closed' state
      }, "closed"],

      // It also has a 'action' event that doesn't trigger a transition
      ["coin", function onCoin(event) {
          console.log("thanks");
      }]
  ],

  // It also has a 'closed' state
  "closed": [
      // That accepts a 'coin' event that will execute the 'coin' action
      ["coin", function coin(event) {
          coinCalled = event;
      // And when done, it will transit back to the 'opened' state
      }, "opened"]
  ]
};
```

Then we can initialize the state machine in the desired state:

```js
// Initialize in the "opened" state
var fsm = new FSM("opened", states);
```

Trigger a transition:

```js
// Will transit to "closed", executing the onPass handler
fsm.event("pass");

// Could also transit with some data that will be received by the handler
fsm.event("pass", "6km/h", "8:30pm");
```

Get the current state:

```js
fsm.getCurrent(); // opened
```

Can also be directly advanced to a given state:

```js
fsm.advance("closed"); // will move the state machine to this state
```

The stateMachine also triggers an "entry" and an "exit" event when entering and leaving a state. Simply add the handlers like for any other event:

```js
var states = {
  // It has an 'opened' state
  "opened": [
      ...

      // This handler will be called when entering the state
      ["entry", function onEntry(event) {
          console.log("entering state...");
      }],

      // This handler will be called when leaving the state
      ["exit", function onExit(event) {
          console.log("leaving state...");
      }],
  ],

  // It also has a 'closed' state
  "closed": [
      ...
  ]
};
```





LICENSE
=======

MIT
