---
title: 🤖 AI Assistant
description: Built-in AI chat in EyeAuras, OpenAI and OpenAI-compatible profiles, docs search, and EyeAuras Gateway
published: true
date: 2026-03-29T00:00:00.000Z
tags: 
editor: markdown
dateCreated: 2026-03-29T00:00:00.000Z
---

> Early alpha feature. It is already usable, but the UI, EyeAuras Gateway access, and the plugin set will continue to evolve.
{.is-warning}

# What is it
EyeAuras now includes a built-in **AI Assistant**.

It is a dedicated tab inside the app where you can:

- ask questions about EyeAuras itself
- search through the documentation
- later get help with scripts, auras, and automation directly inside the app

The core idea is simple: AI should not live in some separate browser tab. It should live inside EyeAuras itself.

![AI Chat Panel](https://s3.eyeauras.net/media/2026/03/EyeAuras_DzRWqPXjls.png)

# What it can already do
Right now the most useful and practical scenario is **asking questions about EyeAuras documentation**.

For example, you can ask:

- how to do something in EyeAuras
- where a certain setting is located
- how a specific feature works
- which approach makes more sense for your task: auras, macros, behavior trees, or scripts

If the docs knowledge base is enabled, the AI will try to answer using the wiki and show where the information came from.

![AI Chat Example](https://s3.eyeauras.net/media/2026/03/EyeAuras_xKafNwKD2V.png)

## Good first questions
If you just want to try it, these are good first prompts:

- `How do I make an aura that searches for an image on screen?`
- `How do I get the coordinates of the found image?`
- `How do I package my project into a pack?`
- `What is EyePad and how is it different from the normal mode?`
- `How do I use sublicenses for my mini-app?`

The more specific the question is, the more useful the answer usually becomes.

# How to start
## 1. Open the `AI` tab
In the new EyeAuras interface there is now a dedicated `AI` tab.

## 2. Select a profile
A profile is just a set of settings that tells EyeAuras:

- which AI provider to use
- which model to use
- which endpoint to call
- where the key should come from

## 3. Make sure it says `Key Available`
If the profile is configured correctly, you should see a green `Key Available` status on the right.

If it says `Unavailable`, EyeAuras could not resolve the key yet or the profile is not fully configured.

## 4. Click `Start Session`
That starts the AI chat and you can begin asking questions.

# AI profiles
All connection settings are grouped under `Manage Profiles`.

You can create multiple profiles for different use cases. For example:

- one for OpenAI
- one for local Ollama
- one for EyeAuras Gateway

That makes it easy to switch between them directly from the AI tab.

![AI Profiles - OpenAI](https://s3.eyeauras.net/media/2026/03/EyeAuras_ZwkvBDfsZA.png)

## The simplest setup options
These are the three main setups that are worth knowing for normal users right now.

### 1. Direct API key
This is the most straightforward option.

You paste the key directly into the `API Key` field and EyeAuras uses it as-is.

Pros:

- fully transparent
- you are in direct control of your budget
- nothing extra is required on the EyeAuras side

Cons:

- the key lives directly in the profile
- in most cases, using an environment variable is cleaner

### 2. API key through an environment variable
This is the recommended option if you already have your own OpenAI key.

Instead of putting the raw key into the profile, you reference an environment variable such as:

```text
%OPENAI_API_KEY%
```

EyeAuras will resolve the key from there.

Pros:

- the raw key is not stored directly in the profile
- one key can be reused across multiple profiles
- it is usually the cleanest setup

### 3. EyeAuras Token through EyeAuras Gateway
This is a separate option for people who do not want to deal with a direct OpenAI key or who want to use the EyeAuras-side infrastructure.

At the moment the setup looks like this:

- put `%EYEAURAS_TOKEN%` into `API Key`
- set `Endpoint` to `https://eu.openai.eyeauras.net`

Example:

![AI Profiles - EyeAuras Gateway](https://s3.eyeauras.net/media/2026/03/EyeAuras_ZvwDEL4jNj.png)

Important:

- this access is currently available only **selectively**
- to get it enabled, you need to contact **Xab3r**
- after alpha, this route will become available to everyone
- that is also when free limits will appear
- the exact limit values still need to be tuned over time

One more important point: this is an **option**, not the main or required setup.

If you prefer to fully control costs yourself, you can always use **your own API key** and keep the budget in your own hands.

Also note that the current gateway endpoint is temporary. The address will change later and the setup is expected to become simpler.

## OpenAI-compatible endpoints and local Ollama
Besides OpenAI, EyeAuras can also work with OpenAI-compatible APIs.

The most obvious example is local `Ollama`.

A typical setup looks like this:

- `Endpoint`: `http://localhost:11434/v1`
- `Model Id`: for example `llama3`
- `API Key`: not required

This is useful if you want to:

- run a model locally on your own machine
- avoid depending on an external API
- experiment without separate cloud costs

If a profile is configured for `Ollama`, EyeAuras does not require an API key and simply talks to the configured endpoint.

# Why EyeAuras Gateway exists
At first glance it might seem easier to always use your own OpenAI key. In many cases, that is absolutely true.

But EyeAuras Gateway exists for a few reasons:

- to provide a simpler entry point for people who only use AI occasionally and do not want to deal with a separate OpenAI account right away
- to make AI access easier in places where direct OpenAI usage may be inconvenient because of network restrictions
- in the future, to allow topping up an EyeAuras balance instead of setting up separate billing on the OpenAI side

This part is still under construction, but that is the overall idea: make AI inside EyeAuras easier and closer to normal users.

# What the profile settings mean
Here is the short version of the profile fields in `Manage Profiles`.

## `Name`
This is just the label shown in the profile list.

It is best to use short, clear names such as:

- `OpenAI gpt-5.4`
- `OpenAI cheap`
- `Gateway`
- `Ollama local`

## `API Key`
This is the secret source the profile should use.

It can be:

- a raw key
- an environment-variable reference such as `%OPENAI_API_KEY%`
- `%EYEAURAS_TOKEN%` for the EyeAuras Gateway scenario

## `Endpoint`
This is the API address.

You usually do **not** need to touch it for standard OpenAI usage.

But it matters for setups such as:

- EyeAuras Gateway
- Ollama
- your own proxy
- any other OpenAI-compatible endpoint

## `Model Id`
This is the actual model id, for example `gpt-5.4`, `gpt-5.4-nano`, or `llama3`.

If you are not sure, leave the recommended template value.

## `API Type`
This defines which API shape EyeAuras will use for requests.

For most users, the best move is to keep the template default.

The simple mental model is:

- `Responses` - the newer option
- `ChatCompletions` - the compatibility mode

## `Reasoning Effort`
This controls how much deliberate reasoning the model should spend before answering.

Very roughly:

- less reasoning = faster and cheaper
- more reasoning = potentially smarter, but slower and more expensive

If you do not want to think about it, just keep the template default.

## `Max Context Tokens`
This is a technical field used for local context-size monitoring.

Most users can safely ignore it.

## `Function Calling`
This allows the model to use built-in EyeAuras tools and plugins.

In most cases it should stay enabled, because that is how the AI gets access to the docs and other future capabilities.

## `Key Available`
This is the quick status that tells you whether the profile is ready.

If it is green, EyeAuras was able to resolve the key or confirm that the endpoint-based profile is usable.

If it is red, check:

- whether the environment variable name is correct
- whether an EyeAuras account token is currently available
- whether the endpoint is set correctly for Ollama or Gateway

# What is already working today
## 1. Docs search
Right now this is the main practical mode.

EyeAuras can download and index the documentation, then use it as a local knowledge base for answers.

That makes the AI especially useful when you want to quickly understand:

- how a feature works
- where to find the right article
- which approach fits your task better

## 2. Basic in-app AI chat
The AI already runs directly inside EyeAuras, not just as some separate experiment.

That means the in-app AI foundation is already there:

- the tab
- the profiles
- session startup
- the chat itself
- the plugin surface

The next steps build on top of that.

## 3. Scripting plugin - coming soon
The plugin that will help with **writing scripts** directly from inside EyeAuras is currently in **closed testing**.

Timeline:

- `Coming Soon`
- planned for **early April 2026**

That is expected to be the next major step after the current docs-focused mode.

## 4. Other plugins already exist, but are not finished yet
The system is already moving toward deeper plugins, including automating EyeAuras itself.

In other words, the direction is gradually shifting from:

- `answer my question from the docs`

toward:

- `help me actually do this inside EyeAuras`

And this is not only about the main app. The same layer will also be available to **mini-app authors**, which means it will become possible to build products where AI is already included by default with relatively little extra work.

# Advanced note
If you are a normal user, you can safely skip this section.

This is what the advanced AI settings currently look like:

![AI Settings](https://s3.eyeauras.net/media/2026/03/EyeAuras_XRmnapQKHp.png)

These extra options are available there:

- `Docs Knowledge Base` - enables local documentation search
- `Docs Repository` - where the wiki repository should be pulled from
- `Docs Path` - where the local docs copy should live
- `Artifact Store` - technical storage used by some AI flows
- `Enable Browser Automation` - enables the browser automation layer for AI tools
- `MCP Port` and `Browser Debug Port` - technical ports for integrations and tool surfaces

For the normal "ask EyeAuras something" scenario, you usually do **not** need to touch any of this.

There will be separate detailed documentation for these features later.

# FAQ
## Do I need an OpenAI account
Not necessarily.

There are three basic options:

- use your own OpenAI key
- use local Ollama
- use EyeAuras Gateway through Xab3r if you have alpha access to it

## Do I have to use EyeAuras Gateway
No.

It is an extra option, not a required one.

If you want to keep the budget fully under your own control, use your own key.

## Why does it say `Unavailable`
Usually it is one of these:

- EyeAuras could not resolve the key from the referenced environment variable
- there is no active EyeAuras account token available for `%EYEAURAS_TOKEN%`
- the `Ollama` endpoint is missing or not reachable

## What is the easiest way to start
The simplest path is:

- open `Manage Profiles`
- create an OpenAI profile
- set `%OPENAI_API_KEY%`
- pick one of the template models
- click `Start Session`

If you do not have your own key but want to try the EyeAuras Gateway route, you can contact [Xab3r](/contacts).

