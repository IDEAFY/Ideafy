Ideafy
======

> Ideafy is a web-based idea management and idea generation application.

## Getting Started

This application requires nodejs `~0.8.0` and:
 * connect `~2.5.0`
 * connect-redirection `~0.0.1`
 * connect-redis `~1.4.1`
 * cookie `~0.0.4`
 * couchdb-emily-tools `~1.0.4`
 * nodemailer `~0.3.21`
 * olives `~1.3.2`
 * socket.io `~0.9.10`
 * requirejs `~2.1.1`
 * ws `~0.4.21`


If you haven't used [Nodejs](http://nodejs.org/) before, be sure to check out the [Getting Started](http://nodejs.org/) guide, as it explains how to install and use Nodejs as well as npm. Once you're familiar with that process, you may install all the plugin needed with the following shell command:

```shell
npm install
```

## Documentation


Introduction
----------------

Ideafy can be run on a client or deployed within an organization for internal use.

The application itself is multi-user but can also be run offline in single-user mode.

It contains four main interfaces:
- the public wall of ideas
- the library
- the brainstorming interface
- the communication center

Ideafy's library
----------------

It is used to store content such as ideas, brainstorming documents or sessions.

It also allows to quickly enter or edit and idea and share it.

Brainstorming documents come in the form of card decks of four different types: people, contexts, problems and technologies

Sessions offer an overview of past brainstorming sessions and allows to replay them step-by-step.

Ideafy's brainstorming
----------------------

In the future multiple brainstorming exercises can be implemented.

As it stands now the application offers the possibility to "brainstorm" new use cases and solutions based on a user-centic approach.

User can choose between:
- quick, single user sessions with default parameters
- multi-user sessions
- custom sessions where user can alter many of the brainstorming parameters

At the end of the session, a wrap-up document is created and all ideas generated are automatically archived in the library.

Ideafy's communication center
-----------------------------

In this interface user can add "acquaintances", read/send private messages (session invites, content sharing or plain messages) or send/request "two cents" (or comments) on some specific ideas.


REQUIREMENTS
------------

To run the ideafy client:
A recent version of Safari or Chrome

To deploy ideafy:
node.js, couchdb database, couchdb-lucene and postfix
+ socket.io, require.js, connect.js, nodemailer, emily.js, olives.js and amy.js