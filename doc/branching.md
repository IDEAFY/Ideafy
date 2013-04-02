Branching architecture
======

> This repository uses the architecture describe at this [link](http://nvie.com/posts/a-successful-git-branching-model/)

The repository has two main branches with an infinite lifetime:
 * master (production-ready state)
 * develop (latest delivered development changes)

In parallel, we could support branches for team members, features or bugs. Unlike the main branches, these branches always have a limited life time, since they will be removed eventually.

The different types of branches we may use are:
 * Feature branches
 * Release branches
 * Hotfix branches


## Develop

When the source code in the develop branch reaches a stable point and is ready to be released, all of the changes should be merged back into master somehow and then tagged with a release number.


## Master

Each time when changes are merged back into master, this is a new production release by definition. We should be very strict at this, so that theoretically, we could use a Git hook script to automatically build and roll-out our software to our production servers everytime there was a commit on master.

## Features

## Hotfixes

## Users