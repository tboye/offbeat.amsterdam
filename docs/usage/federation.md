---
layout: default
title: Federation
permalink: /usage/federation
nav_order: 2
parent: Usage
---

# Federation

Gancio is a federated application. This means that it can interact with other federated applications, such as Mastodon, Pleroma, Friendica, WordPress, Mobilizon, etc.

Each platform instance (server) can interact with others, enabling users to follow content accross different services without needing an account on each one.

This interaction is possible thanks to the [ActivityPub](https://www.w3.org/TR/activitypub/) protocol.

Each user, page, or website in the Fediverse has a unique ActivityPub handler, which is similar to an email address. This handler usually looks like @user@website.com. For example, an event website running Gancio might have an ActivityPub handler like @events@gancio.cisti.org. This identifier lets people from other Fediverse platforms follow it.

> info "Note"
> This document describes the operations you are able to do interacting with a gancio instance in the federation, if you are looking for technical details there is a [specific section](/federation)


## Following a Gancio website from the Fediverse

Each federated Gancio instance exposes a single ActivityPub handler, which is the identifier people will use to follow it. This handler consists of the domain where the instance is hosted, with the default prefix being `events` (starting from version 1.24, was `relay` before). The prefix can be customized during the setup but cannot be changed afterward.

To find this handler you can:

- look in the website footer, if the federation is enabled a `Followe me` link will be displayed, it will show the current handler.
- search for the website on your platform

Once followed, new events from that specific Gancio instance will appear in your timeline or event feed (no manual approval is required).


<video src='follow_from_mastodon.webm' controls></video>

> info "Remove or update and events"
> Note that removed and modified events are updated on federation but some platform could not support it (e.g. mastodon does not support the `Update` actions, see [this issue](https://github.com/mastodon/mastodon/issues/31114) )

## Interacting with Events

Gancio supports federated interaction with events.

Anyone could respond to events with comments, images, or audio. These will appear on the event page (if the option is enabled in **Admin > Federation > Turn on resources**).

Anyone from the fediverse could "Likes" and "Boosts" events, the admin could decide to show them or not in **Admin > Federation > Hide boost/bookmarks**


## Moderation in federation

Gancio provides tools for managing unwanted content coming from the Fediverse in **Admin > Moderation**

- You can moderate comments and content from specific users or federated nodes.
- If necessary, you can block entire instances or fediverse actors.


## Following a trusted source from Gancio

Gancio allows you to follow other federated platforms, such as another Gancio node, Mobilizon, or WordPress.

Following a fediverse actor lets you receive events from that source, which will appear on your home feed by default unless configured otherwise.
(**Admin > Federation > Show federated events on the home page**)


To show only some events incoming from the fediverse you can organize them into collections (**Admin > Collections**) based on tags, federated nodes or specific locations.

As you can also add the local instance into one of these collections (and filter its events by Tag or Place), you could, for example, build a collection that consists of some (or all) local events, plus some (or all) events from other (federated) instances.
Collections can be displayed directly on the homepage or on dedicated pages.

## Disable federation
Federation is enabled by default but you can disable it in **Admin > Federation > Turn on federation**.
