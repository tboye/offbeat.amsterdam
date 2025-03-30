---
layout: default
title: CLI
permalink: /usage/cli
nav_order: 2
parent: Usage
has_toc: true
---

# CLI - Command Line Interface
{: .no_toc }

1. TOC
{:toc}

## Using CLI
Gancio is distributed with an embedded CLI.
To use the CLI you need to specify the `config.json` configuration file via `--config <your_config.json>` flag; by default the CLI will look for one in the current directory, so if your current directory is /opt/gancio (having followed the [installation instructions](/install/debian)) there is no need to specify it.

### Using CLI with Docker installation
To use the CLI in a docker installation you can execute a shell inside the container with:
`docker exec --workdir /home/node/data -it gancio  sh` and following the normal CLI usage or running commands with:

`docker exec --workdir /home/node/data gancio gancio <your command>`

(the first "gancio" is the container name)


## Users <span class='label label-yellow'>since 1.6.14</span>
All users related sub-commands starts with `gancio users`.
Note that most of this actions could be done from administration panel (Admin > Users).


### List all users
To list all users use
`gancio users list`


### Create a new user

`gancio users create <username|email> [password] [role]`

`role` value could be `user` (default), `admin` or `editor`, you can also specify it using `--role` flag.  
To create an user with administrator privileges use the `--role` flag, e.g.  
`gancio users create admin@example.com --role admin`


### Remove a user
`gancio users remove <username|email>`


### Reset password
`gancio users reset-password <username|email>`


### Change role

To add administrator privileges to an user:
`gancio users set_role <username|email> admin`  

To remove administrator privileges from an user:
`gancio users set_role <username|email> user`

### Enable / disable users

To enable an user: `gancio users enable <email>`

To disable an user: `gancio users disable <email>`

## Settings <span class='label label-yellow'>since 1.24.0</span>
All settings related sub-commands starts with `gancio settings`.
Note that most of this actions could be done from administration panel.


### List all settings
To list all settings use
`gancio settings list`


### Get a specific setting value

`gancio settings get <setting>`



### Set a specific setting value
`gancio settings set <setting> <value>`

```bash
# change federated actor's name
➜ gancio settings set instance_name '"gancio"'
📅 gancio - v1.24.0 - A shared agenda for local communities (nodejs: v20.15.0)
> Reading configuration from: /home/les/dev/hacklab/gancio/config.json

instance_name
Old value: "relay"
New value: "gancio"

Note that this will likely break current federation (all your follower / following connections will be destroyed)!
Note that a restart is needed to get the new setting
```


> warning "JSON"
> Note that settings are stored in JSON, so your value will be parsed.

> warning "Restart needed"
> A restart is needed after a setting is changed

> info "References"
> [#365](https://framagit.org/les/gancio/-/issues/365)
