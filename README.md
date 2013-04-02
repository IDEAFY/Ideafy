Ideafy
======

> Ideafy is a web-based idea management and idea generation application.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install all the plugin needed by this grunt file:

```shell
npm install
```

Once the plugins has been installed, type the following command to start developing:

```shell
grunt
```
and to build your project:

```shell
grunt build
```


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