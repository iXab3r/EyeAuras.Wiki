---
title: AI Assistant
description: Built-in AI chat in EyeAuras with OpenAI/OpenAI-compatible profiles, EyeAuras Gateway, and help with documentation and scripts
published: true
date: 2026-04-04T00:00:00.000Z
tags: ai, assistant, gateway, ai-translated
editor: markdown
dateCreated: 2026-03-29T00:00:00.000Z
---
> Early alpha feature. It is already usable, but the interface, gateway flows, and some AI capabilities are still changing actively.
{.is-warning}

# What this is
EyeAuras has a built-in **AI Assistant** — a separate `AI` tab right inside the app.

At this point, it is no longer just “a chat with a model.” The assistant can use the wiki as context, understands EyeAuras itself much better, and is increasingly useful for questions about scripts, the API, and configuration.

The better the wiki gets, the smarter the built-in AI becomes. In other words, the documentation and the AI are evolving together.

![AI Tab](https://s3.eyeauras.net/media/2026/04/EyeAuras_vuJB3YPFza.png)

## What is already especially useful
- ask questions about EyeAuras itself and quickly figure out where a specific setting lives
- find the right wiki article or section for a specific topic
- get more practical help with EyeAuras scripts and API usage
- switch between different AI profiles for different scenarios
- use either your own key or `EyeAuras Gateway`

If you want to try it on something practical right away, these are good starter questions:

- `How do I get the coordinates of a detected image?`
- `What is the best way to send keys from a script?`
- `How should I store an API key for an AI profile in EyeAuras?`
- `Where can I read about best practices for Script.csx?`

I also strongly recommend this newer article:
- [FAQ and best practices for EyeAuras scripts](/scripting/best-practices)

# Getting started
## 1. Open the `AI` tab
In the new EyeAuras UI, there is a dedicated tab for it.

## 2. Choose a profile
A profile defines how EyeAuras will talk to the model:

- which provider to use
- which endpoint to use
- which model to use
- where to get the key or token from

In newer builds, there is usually already a regular `OpenAI` profile and an EyeAuras gateway profile.

## 3. Check the `Key Available` status
If the profile is configured correctly, you will see a green `Key Available` status on the right.

If it says `Unavailable`, EyeAuras could not get a key or token yet, or the profile is not filled out completely.

## 4. Click `Start Session`
This opens the AI chat, and you can start asking questions.

## 5. If needed, open `Show Settings`
This is where the more technical options live: docs knowledge base, local docs cache, MCP, browser automation, and so on.

# AI profiles
All connection settings are grouped in the `Manage Profiles` window.

This is the best place to:

- create a new profile
- switch between `OpenAI`, `EyeAuras Gateway`, `Ollama`, and other OpenAI-compatible endpoints
- change the model, endpoint, and key storage method

## The simplest setup options
### 1. Direct API key
The most straightforward option is to paste the key directly into `API Key`.

Pros:

- everything is fully transparent
- you stay in full control of your budget
- it does not depend on EyeAuras infrastructure

Cons:

- the secret is stored directly in the profile
- for long-term use, an environment variable is usually more convenient

### 2. Key via environment variable
This is usually the best option if you already have your own OpenAI key.

Example:

```text
%OPENAI_API_KEY%
```

Pros:

- the key is not stored in plain form inside the profile
- it is easier to reuse the same key
- it is easier to maintain multiple profiles

### 3. `EyeAuras Gateway`
This is a separate option for users who want to try AI through EyeAuras infrastructure without setting up their own OpenAI account directly.

Right now, this is the closest thing to “free AI” inside EyeAuras, and the current testing phase is already open to anyone interested.

To join the current alpha, just message **Xab3r** in Discord DMs.

If you want to configure the profile manually, the basic setup is:

- set `API Key` to `%EYEAURAS_TOKEN%`
- set `Endpoint` to `https://eu.openai.eyeauras.net`

In newer builds, the gateway profile is usually created by default, so in most cases you do not need to configure anything manually.

![EyeAuras Gateway Profile](https://s3.eyeauras.net/media/2026/04/EyeAuras_eSthNpc63A.png)

A few things are important to understand right away:

- the gateway is still evolving
- work is in progress to provide free limits to all EyeAuras users
- later, if you want more limits, you will be able to top them up through the website
- at the same time, the option to use a normal OpenAI endpoint with **your own key** is not going anywhere

That is an important part of the overall idea.

`EyeAuras Gateway` is not meant to replace your own OpenAI key, and it is not a way to force everyone into a single setup. Its main purpose is convenience, an easier starting point, and solving OpenAI access issues for users in Russia.

Here is what chat through the gateway looks like inside EyeAuras:

![EyeAuras Gateway Chat](https://s3.eyeauras.net/media/2026/04/EyeAuras_SD8w4Ut06Q.png)

## OpenAI-compatible APIs and local Ollama
In addition to OpenAI, EyeAuras can also work with OpenAI-compatible APIs.

The clearest example is local `Ollama`.

A typical setup looks like this:

- `Endpoint`: `http://localhost:11434/v1`
- `Model Id`: for example `llama3`
- `API Key`: usually not required

This is convenient if you want to:

- run a model locally on your own machine
- avoid depending on an external API
- experiment freely

# What the profile settings mean
Below is a quick explanation of the main fields in `Manage Profiles`.

## `Name`
The profile name shown in the list.

It is best to use clear names, for example:

- `OpenAI gpt-5.4`
- `Gateway`
- `Ollama local`

## `API Key`
The source of the secret or token.

This can be:

- the key itself
- an environment variable, for example `%OPENAI_API_KEY%`
- `%EYEAURAS_TOKEN%` for the `EyeAuras Gateway` scenario

## `Endpoint`
The API address.

For standard OpenAI, it is usually best not to change it. But it is required for:

- EyeAuras Gateway
- Ollama
- self-hosted proxy
- any other OpenAI-compatible endpoint

## `Model Id`
The model identifier, for example `gpt-5.4`, `gpt-5.4-mini`, or `llama3`.

If you are not sure, it is best to keep the recommended value from the template.

## `API Type`
Defines which API EyeAuras will use to send requests.

The simplest way to think about it is:

- `Responses` — the more modern option
- `ChatCompletions` — compatibility mode

## `Reasoning Effort`
Controls how deeply the model will “think” before answering.

If you do not want to dig into it, just keep the default template value.

## `Max Context Tokens`
A technical field for local control over context size.

Most users can leave this alone.

## `Function Calling`
Allows the model to use EyeAuras built-in tools.

In most cases, it is best to leave this enabled, because this is how the AI gets access to docs, session memory, and other useful capabilities.

## `Key Available`
A quick indicator that the profile is ready to use.

If the status is red, the cause is usually one of these:

- the environment variable name is incorrect
- there is no available token yet for `%EYEAURAS_TOKEN%`
- the endpoint for `Ollama` or the gateway was not set

# The `Show Settings` window
This is what the AI settings window currently looks like:

![AI Settings](https://s3.eyeauras.net/media/2026/04/EyeAuras_rFFX1fryIO.png)

This is where the more technical options live:

- `Docs Knowledge Base` — enables the local wiki knowledge base
- `Artifact Store` — allows the AI to save artifacts if the backend supports it
- `Docs Repository` — the git repository used to pull the wiki
- `Docs Path` — local path for the docs cache
- `MCP Port` — port for the local MCP server
- `Enable MCP On Startup` — automatically start MCP after the app launches
- `Enable Browser Automation` — enables the browser automation layer for AI tools
- `Browser Debug Port` — browser debug port for automation scenarios

For the usual “ask a question about EyeAuras” use case, you normally do not need to configure any of this.

The most practical things to know:

- `Docs Knowledge Base` is best left enabled
- `Browser Automation` requires an app restart after saving
- `Docs Path` only matters if you intentionally want to move the local docs cache

# What already works well
## 1. Questions about the documentation
This is still the most useful mode.

If the question can be grounded in the wiki, the built-in AI usually answers better and with more confidence.

## 2. Scripting help has become much more useful
The assistant now understands EyeAuras-specific context much better instead of only giving generic “C# advice.”

That is why these are especially helpful right now:

- EyeAuras API articles
- examples from the scripting section
- [FAQ and best practices](/scripting/best-practices)

## 3. There is already a proper in-app chat
There is now a full working layer inside the program:

- `AI` tab
- profiles
- endpoint switching
- session start
- tools / function calling
- docs knowledge base

## 4. `EyeAuras Bot` in Discord is developing in parallel
If you want similar help not inside the app but directly in Discord, there is now a separate public alpha:

- [EyeAuras Bot in Discord](/features/discord-bot)

# What to keep in mind for now
- this is still alpha
- answer quality depends directly on the quality of the wiki
- the AI can suggest direction and provide examples, but it does not “verify on your machine” that the code actually ran
- if your question is too broad, it is better to immediately specify the build, the feature name, and the exact result you want

# FAQ
## Do I need an OpenAI account?
Not necessarily.

The basic options are:

- use your own OpenAI key
- use local `Ollama`
- use `EyeAuras Gateway` if you have access to the current alpha

## Do I have to use `EyeAuras Gateway`?
No.

It is an additional convenience option, not a required workflow.

If you want to control costs yourself, use your own key and a regular OpenAI endpoint.

## Where should a normal user start?
The simplest path is:

- open `Manage Profiles`
- choose the regular `OpenAI` profile or the EyeAuras gateway profile
- check `Key Available`
- click `Start Session`

## Why does it say `Unavailable`?
Usually the reason is one of these:

- EyeAuras could not find the key in the specified environment variable
- `%EYEAURAS_TOKEN%` is not available yet
- the endpoint is incorrect
- for `Ollama`, the local server is not running

## What to read next
- [EyeAuras Bot in Discord](/features/discord-bot)
- [FAQ and best practices for EyeAuras scripts](/scripting/best-practices)
- [Getting started with scripting](/scripting/getting-started)
- [Contacts](/contacts)