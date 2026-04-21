---
title: AI Assistant
description: Built-in AI chat in EyeAuras with OpenAI and OpenAI-compatible profiles, EyeAuras Gateway, Agent Guidance, MCP, and help with documentation and scripts
published: true
date: 2026-04-21T22:30:00.000Z
tags: ai, assistant, gateway, ai-translated, mcp, guidance
editor: markdown
dateCreated: 2026-03-29T00:00:00.000Z
---
> Early alpha feature. It is already usable, but the interface, gateway flows, and some AI capabilities are still changing активно.
{.is-warning}

# AI Assistant

EyeAuras has a built-in **AI Assistant** as a separate `AI` tab right inside the app.

At this point, it is no longer just “a chat with a model.” The assistant can use the wiki as context, understands EyeAuras much better, and is increasingly useful for questions about scripting, the API, and configuration.

As the wiki improves, the built-in AI gets better too. In EyeAuras, documentation and AI are evolving together.

![AI Tab](https://s3.eyeauras.net/media/2026/04/EyeAuras_vuJB3YPFza.png =x600)

If you need more than a quick chat and want a heavier mode specifically for coding tasks, see this separate article:

- [AI Codex Coding Assistant](/features/ai-codex-coding-assistant)

## What is already especially useful

- ask questions about EyeAuras itself and quickly figure out where a setting lives
- find a wiki article or section for a specific topic
- get more concrete help with EyeAuras scripts and API usage
- switch between different AI profiles for different use cases
- use either your own key or `EyeAuras Gateway`
- prepare `Agent Guidance` for external AI coding tools
- run a local `MCP helper` when you need more precise context

If you want to try it on something practical right away, these are good starter questions:

- `How do I get the coordinates of a found image?`
- `What is the best way to send keys from a script?`
- `How should I store an API key for an AI profile in EyeAuras?`
- `Where can I read best practices for Script.csx?`

Also highly recommended:

- [FAQ and best practices for EyeAuras scripts](/scripting/best-practices)

## Getting started

### 1. Open the `AI` tab

In the new EyeAuras UI, there is a dedicated tab for it.

### 2. Choose a profile

A profile defines how EyeAuras talks to the model:

- which provider to use
- which endpoint to use
- which model to use
- where to get the key or token from

In newer builds, you will usually already have a regular `OpenAI` profile and an EyeAuras gateway profile.

### 3. Check the `Key Available` status

If the profile is configured correctly, you will see a green `Key Available` status on the right.

If it shows `Unavailable`, EyeAuras could not get the key or token yet, or the profile is not fully configured.

### 4. Click `Start Session`

This opens the AI chat, and you can start asking questions.

### 5. If needed, open `Show Settings`

This is where the more technical options live: docs knowledge base, local docs cache, MCP, browser automation, and so on.

## AI profiles

All connection settings are managed in the `Manage Profiles` window.

This is the best place to:

- create a new profile
- switch between `OpenAI`, `EyeAuras Gateway`, `Ollama`, and other OpenAI-compatible endpoints
- change the model, endpoint, and key storage method

### The simplest setup options

#### 1. Direct API key

The most straightforward option is to paste the key directly into `API Key`.

Pros:

- everything is simple and transparent
- you fully control your own budget
- it does not depend on EyeAuras infrastructure

Cons:

- the secret is stored directly in the profile
- for long-term use, an environment variable is usually more convenient

#### 2. Key via environment variable

This is usually the best option if you already have your own OpenAI key.

Example:

```text
%OPENAI_API_KEY%
```

Pros:

- the key is not stored in plain form inside the profile
- it is easier to reuse the same key
- it is easier to maintain multiple profiles

#### 3. `EyeAuras Gateway`

This is a separate option for users who want to try AI through EyeAuras infrastructure without setting up their own OpenAI account directly.

Right now, this is the closest thing to “free AI” inside EyeAuras, and anyone interested can already join the testing.

To get into the current alpha, just message **Xab3r** in Discord DM.

If you configure the profile manually, the basic setup looks like this:

- set `API Key` to `%EYEAURAS_TOKEN%`
- set `Endpoint` to `https://eu.openai.eyeauras.net`

In newer builds, the gateway profile is usually created by default, so in most cases you do not need to configure anything manually.

![EyeAuras Gateway Profile](https://s3.eyeauras.net/media/2026/04/EyeAuras_eSthNpc63A.png =x600)

A few important things to understand right away:

- the gateway is still evolving
- work is in progress to provide free limits to all app users
- later, if you want more limits, that will be refillable through the website
- at the same time, the option to use a normal OpenAI endpoint with **your own key** is not going away

This is an important part of the overall idea.

`EyeAuras Gateway` is not meant to replace your own OpenAI key, and not a way to lock everyone into one setup. It is primarily about convenience, easier onboarding, and solving OpenAI access issues for users in Russia.

Here is what the chat looks like through the gateway inside EyeAuras:

![EyeAuras Gateway Chat](https://s3.eyeauras.net/media/2026/04/EyeAuras_SD8w4Ut06Q.png =x600)

### OpenAI-compatible endpoints and local Ollama

In addition to OpenAI, EyeAuras also works with OpenAI-compatible APIs.

The clearest example is local `Ollama`.

A typical setup looks like this:

- `Endpoint`: `http://localhost:11434/v1`
- `Model Id`: for example `llama3`
- `API Key`: usually not needed

This is useful if you want to:

- run the model locally on your own computer
- avoid depending on an external API
- experiment freely

## What the profile settings mean

Below is a quick explanation of the main fields in `Manage Profiles`.

### `Name`

The profile name shown in the list.

It is best to use clear names, for example:

- `OpenAI gpt-5.4`
- `Gateway`
- `Ollama local`

### `API Key`

The source of the secret or token.

This can be:

- the key itself
- an environment variable, for example `%OPENAI_API_KEY%`
- `%EYEAURAS_TOKEN%` for the `EyeAuras Gateway` flow

### `Endpoint`

The API address.

For regular OpenAI, it is usually best not to change it. But it is needed for:

- EyeAuras Gateway
- Ollama
- self-hosted proxy
- any other OpenAI-compatible endpoint

### `Model Id`

The model identifier, for example `gpt-5.4`, `gpt-5.4-mini`, or `llama3`.

If you are not sure, it is best to keep the recommended value from the template.

### `API Type`

This defines which API EyeAuras will use to send requests.

The simple way to think about it:

- `Responses` — the more modern option
- `ChatCompletions` — compatibility mode

### `Reasoning Effort`

Controls how deeply the model will “think” before answering.

If you do not want to tune it, just keep the default template value.

### `Max Context Tokens`

A service field for local control over context size.

Most users can leave it alone.

### `Function Calling`

Allows the model to use EyeAuras built-in tools.

In most cases, it is best to keep this enabled, because this is how the AI gets access to docs, session memory, and other useful capabilities.

### `Key Available`

A quick indicator that the profile is ready to use.

If the status is red, the cause is usually one of these:

- the environment variable name is wrong
- there is no available token yet for `%EYEAURAS_TOKEN%`
- the endpoint for `Ollama` or the gateway is missing

## `Show Settings` window

This is what the AI settings window currently looks like:

![AI Settings](https://s3.eyeauras.net/media/2026/04/EyeAuras_rFFX1fryIO.png =x600)

This is where the more technical settings live:

- `Docs Knowledge Base` — enables the local wiki knowledge base
- `Artifact Store` — allows the AI to save artifacts if the backend supports it
- `Docs Repository` — the git repository used to pull the wiki
- `Docs Path` — the local path for the docs cache
- `MCP Port` — the local MCP server port
- `Enable MCP On Startup` — automatically start MCP after the app launches
- `Enable Browser Automation` — enables the browser automation layer for AI tools
- `Browser Debug Port` — browser debugging port for automation flows

For the usual “ask something about EyeAuras” scenario, you normally do not need to change anything here.

The most practical points:

- `Docs Knowledge Base` is best kept enabled
- `Browser Automation` requires an app restart after saving
- `Docs Path` only matters if you deliberately want to move the local docs cache

## Agent Guidance

`Agent Guidance` is a page inside `Show Settings` that helps external AI coding tools understand EyeAuras better.

In simple terms, instead of re-explaining every time what EyeAuras is, where the wiki is, which APIs to use, and how to connect to MCP, EyeAuras builds a ready-to-use `guidance-pack` folder.

You can open this folder, save it as an archive, or place it next to a C# project or `.sln`. Your project-level `AGENTS.md` is **not touched** — all instructions live inside the guidance pack itself.

![Agent Guidance](https://s3.eyeauras.net/media/2026/04/EyeAuras_y9R4GuIA9N.png =x600)

This is useful if you work with:

- Codex
- Claude Code
- Cursor
- another AI agent that can read `AGENTS.md`
- a C# project or exported workspace that uses `EyeAuras.SDK` / ref assemblies

What EyeAuras does:

- builds a local guidance pack with wiki content, examples, SDK notes, metadata, and MCP status
- places an `AGENTS.md` inside as the entry point for the AI agent
- includes `README.md`, `manifest.json`, `mcp-status.json`, and a `docs/` folder
- can save the entire pack as a zip archive
- can copy the entire pack into a C# project or solution under `generated/ai`
- does not modify your project `AGENTS.md` and does not overwrite your own rules

A practical workflow:

1. Open `AI` -> `Show Settings` -> `Agent Guidance`.
2. Click `Rebuild` to create or update the guidance pack.
3. Click `Open Guidance Pack` if you want to inspect the folder manually.
4. Click `Export Guidance Pack` if you want to save the pack as a zip archive.
5. Click `Add to C# Project` or `Add to Solution` if you want to copy the pack next to the selected `.csproj` or `.sln`.
6. Open `generated/ai` or the exported folder in your external AI coding tool.

![Guidance Pack Actions](https://s3.eyeauras.net/media/2026/04/EyeAuras_R4JvFSFixc.png =x600)

When adding it to a C# project, EyeAuras copies the pack into:

```text
generated/ai
```

If you select a `.sln`, EyeAuras will try to find a C# project with the same name as the solution and place the guidance pack next to it.

Inside this folder, there is its own `AGENTS.md`, so the agent can start there and then continue through `docs/`.

![Guidance Pack Folder](https://s3.eyeauras.net/media/2026/04/EyeAuras_pW0O4jRT9q.png =x600)

The `generated/ai` folder is considered EyeAuras-managed and is fully replaced on each repeated `Add to C# Project` / `Add to Solution`. Do not store your own files there.

If you turned MCP on or off, click `Rebuild` so the fresh MCP status is written into the guidance pack.

Important: `Agent Guidance` does not replace your project rules. It is better thought of as a portable folder with EyeAuras context. If your project already has its own rules, they remain yours, and EyeAuras does not edit them.

### MCP helper

You can think of `MCP` as a small local bridge between EyeAuras and the AI agent.

A regular guidance pack gives the agent documentation and rules. `MCP helper` adds a live endpoint that lets the agent ask more precise questions to EyeAuras itself — for example, about the current app state, windows, or available objects/symbols.

For simple tasks like “explain this setting” or “find an article,” MCP is usually not needed. It becomes useful when the external agent needs not only to read docs, but also carefully query EyeAuras about the current state.

## What already works well today

### 1. Documentation questions

This is still the most useful mode.

If the question can be grounded in the wiki, the built-in AI usually answers better and with more confidence.

### 2. Scripting help is noticeably better

The assistant is getting much better at understanding EyeAuras-specific context instead of only giving generic “C# advice.”

That is why these are especially useful now:

- EyeAuras API articles
- examples from the scripting section
- [FAQ and best practices](/scripting/best-practices)

### 3. A proper in-app chat already exists

There is already a full working layer inside the app:

- `AI` tab
- profiles
- endpoint switching
- session start
- tools / function calling
- docs knowledge base

### 4. `EyeAuras Bot` on Discord is developing in parallel

If you want similar help outside the app, directly in Discord, there is now a separate public alpha:

- [EyeAuras Bot on Discord](/features/discord-bot)

### 5. There is now a separate `Codex` mode for more technical coding tasks

If the regular AI chat is more of a reference tool and quick helper, `Codex` is aimed more at complex tasks, separate `threads`, and deeper work with technical context.

- [AI Codex Coding Assistant](/features/ai-codex-coding-assistant)

## Things to keep in mind

- this is still alpha
- answer quality depends directly on the quality of the wiki
- the AI can suggest a direction and provide an example, but it does not “verify on your machine” that the code really ran
- if the question is too broad, it helps to specify the build, the feature name, and what result you want

## FAQ

### Do I need an OpenAI account

Not necessarily.

The main options are:

- use your own OpenAI key
- use local `Ollama`
- use `EyeAuras Gateway` if you have access to the current alpha

### Do I have to use `EyeAuras Gateway`

No.

It is an extra convenience option, not a required setup.

If you want full control over costs, use your own key and a normal OpenAI endpoint.

### Where should a normal user start

The simplest path is:

- open `Manage Profiles`
- choose the regular `OpenAI` profile or the EyeAuras gateway profile
- check `Key Available`
- click `Start Session`

### Why does it show `Unavailable`

Usually the cause is one of these:

- EyeAuras could not find the key from the specified environment variable
- `%EYEAURAS_TOKEN%` is not available yet
- the endpoint is incorrect
- for `Ollama`, the local server is not running

### What to read next

- [AI Codex Coding Assistant](/features/ai-codex-coding-assistant)
- [EyeAuras Bot on Discord](/features/discord-bot)
- [FAQ and best practices for EyeAuras scripts](/scripting/best-practices)
- [Getting started with scripting](/scripting/getting-started)
- [Contacts](/contacts)