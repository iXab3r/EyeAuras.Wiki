---
title: AI Codex Coding Assistant
description: What the built-in Codex mode in EyeAuras is, how it differs from the regular AI Assistant, what threads are, and what it can already do
published: true
date: 2026-04-11T14:39:09.378Z
tags: scripting, ai, ai-translated, assistant, codex
editor: markdown
dateCreated: 2026-04-11T13:45:45.683Z
---
> Early alpha functionality. It is already quite practical, but the runtime, auth flows, and some of the tooling are still being actively refined. Right now, the most reliable setup for `Codex` is an `OpenAI` profile using `API Key` mode. This can be either direct `OpenAI` or an `EyeAuras Gateway / AiGateway` profile.
{.is-warning}

# What is it

`Codex` in EyeAuras is a separate mode inside the `AI` tab, designed for **more complex technical tasks**.

If the regular [AI Assistant](/features/ai-assistant) is best thought of as a fast built-in chat and reference tool, `Codex` is closer to: "give it a task, give it context, and let the assistant work through it properly."

That makes `Codex` a better fit for scenarios like:

- figuring out why the current script does not compile
- helping edit code in `EyePad`
- breaking down a complex automation task step by step
- helping design the structure of a tree, macro, or mini-app

For simple wiki or settings questions, the regular `AI Assistant` is often easier, faster, and cheaper.

![Start Codex Session](https://s3.eyeauras.net/media/2026/04/EyeAuras_TyMJnKr1Rb.png =x200)

## How it differs from the regular `AI Assistant`

- the regular `AI Assistant` is better for quick questions, wiki lookup, and general in-app chat
- `Codex` is stronger at programming, troubleshooting, and more involved tasks
- `Codex` works through separate `threads`, not one continuous chat
- `Codex` relies more deeply on the current `EyePad` working context and EyeAuras tools
- right now, `Codex` also has stricter connection requirements: the best option is an `OpenAI` profile in `API Key` mode, whether that points to direct `OpenAI` or `EyeAuras Gateway`

# When to use `Codex`

Use `Codex` if your task looks like one of these:

- `why does this Script.csx not work`
- `help me rewrite the current code more cleanly`
- `analyze this error and suggest the smallest possible fix`
- `help me design the logic for an aura, tree, or macro`
- `compare several approaches and suggest the best one`

If you just need a reference-style answer like "where is this setting" or "what does this function do", it is usually better to start with [AI Assistant](/features/ai-assistant).

# Getting started

`Codex` lives in the same `AI` tab as the regular `AI Assistant`.

The basic flow is:

1. Open the `AI` tab.
2. Switch the mode from `Chat` to `Codex`.
3. Select a suitable `OpenAI` profile.
4. Leave the authentication mode set to `API Key`.
5. Make sure the readiness status on the right is green.
6. Click `Start Codex`.
7. After it starts, click `New Thread`.

A suitable `OpenAI` profile here can mean:

- standard direct `OpenAI`
- `EyeAuras Gateway / AiGateway`

If you have not configured profiles, `Endpoint`, `API Key`, or `Show Settings` yet, start with the general article first:

- [AI Assistant inside EyeAuras](/features/ai-assistant)

Important: the current `Codex` integration is stricter than the regular `AI Assistant`, but not to the point of "direct OpenAI only." In practice, that means:

- `Codex` works normally with standard `OpenAI`
- `Codex` can also work through `EyeAuras Gateway / AiGateway`
- `Ollama` and other separate connection schemes are not a universal option here
- `ChatGPT Login` should currently be treated as a direct `OpenAI` scenario, not something intended for gateway endpoints

# What is a `thread`

The simplest way to think about it:

A `Thread` is a **separate work task** with its own history, context, and state.

For example:

- one `thread` might be about diagnosing the current script
- a second `thread` might be about a new behavior tree idea
- a third `thread` might be about refactoring part of your code

Each `thread` has its own conversation memory. That is useful because different tasks do not get mixed into one big mess.

There is also some thread-specific service data:

- name or preview
- message history
- current status
- selected model
- `reasoning` level
- the ability to reopen the thread later or archive it

![Codex Threads](https://s3.eyeauras.net/media/2026/04/EyeAuras_PcLPt8SCFy.png =x200)

## Can I keep multiple `threads` open at once

Yes.

That is one of the strong points of the current integration: you can start one `thread`, go back to the list, open another one, and continue working there.

Going back to the list does **not** automatically stop the first `thread`. A full stop only happens if you explicitly click `Stop Codex` or fully restart the runtime.

# How it works inside EyeAuras

In ELI5 form, the flow looks like this:

1. `Start Codex` launches a separate runtime inside EyeAuras.
2. `New Thread` creates a new working branch for a specific task.
3. Before each new request, EyeAuras refreshes the context: profile, docs knowledge base, current working environment, and available tools.
4. If you are working through `EyePad`, `Codex` sees the current active workspace rather than some abstract "piece of text."
5. Each `thread` lives independently: it has its own history, status, and model settings.

Because of that, `Codex` feels less like "just another ChatGPT window" and more like a technical assistant working inside the app itself.

# What it can already do

At this point, the integration can honestly be described like this:

- there is a dedicated `Codex` mode inside the `AI` tab
- you can start and stop the runtime with `Start Codex` / `Stop Codex`
- there is a `threads` list, with reopen and archive support
- you can keep multiple `threads` in parallel and switch between them
- for the active `thread`, you can change the model and `reasoning` level
- if `Docs Knowledge Base` is enabled, `Codex` can also use the wiki and local docs database
- in `EyePad` scenarios, it can see the current workspace and better understand what the user is actually working on
- in the current integration, it can already help with real scripting workflows, not just answer with "generic C# advice"

The most practical point is this: `Codex` is already useful not just as a reference tool, but as an assistant for the script you currently have open.

# How to give better tasks

If you want `Codex` to be more useful, a few simple rules help a lot:

- one task = one `thread`
- state the desired result right away, not just the problem
- if the task is about code, say explicitly that it should work with the current `EyePad` tab
- if you want a careful fix, say so directly: `find the cause and suggest the minimal fix`
- if the task is large, ask for a plan first and implementation second

Good examples to start with:

- `Figure out why the current Script.csx does not compile`
- `Look at the current EyePad tab and suggest a minimal refactor`
- `Explain what is wrong here and suggest the simplest working version`
- `Help me design the logic for this aura step by step`

# Important limitations for now

- this is still alpha, and the integration is changing quickly
- right now, the main real-world setup for `Codex` is an `OpenAI` profile through `API Key`, including both direct `OpenAI` and `EyeAuras Gateway`
- if you see `ChatGPT Login` in the interface, that does not automatically mean it is fully wired up in your build yet
- regular `Chat` context and `Codex` context are not automatically shared between each other
- for simple FAQ-style questions, `Codex` is often overkill, and the regular [AI Assistant](/features/ai-assistant) is usually the better choice

# FAQ

## Does `Codex` need a separate AI profile

Not necessarily a separate one, but it does need a **compatible** one.

The easiest way to think about it is this: `Codex` uses the same general profile system as the regular `AI Assistant`, but in practice it is best to stick to an `OpenAI` profile in `API Key` mode for now.

That can be:

- direct `OpenAI`
- `EyeAuras Gateway / AiGateway`

## Does `Codex` work through `EyeAuras Gateway`

Yes, that is a normal supported scenario.

The more precise way to put it is:

- `Codex` works with `OpenAI` profiles
- that profile can point either to direct `OpenAI` or to `EyeAuras Gateway / AiGateway`
- the main working mode here is still `API Key`
- `ChatGPT Login`, on the other hand, should currently be treated as a separate direct-OpenAI scenario

## Can it see the current script in `EyePad`

Yes. In current `EyePad` scenarios, `Codex` can already work with the active workspace.

That is exactly why it is much more useful for real scripting tasks than an external chat with no context.

## Can I leave one `thread` running and open another

Yes.

That is a normal usage pattern: one `thread` can keep running in the background while you switch to another one.

## When should I use the regular `AI Assistant` instead of `Codex`

When you need:

- a quick documentation answer
- a simple settings question
- wiki help
- lightweight assistance without deeper technical work

For those cases, start with [AI Assistant](/features/ai-assistant), and keep `Codex` for heavier tasks.

# Read next

- [AI Assistant inside EyeAuras](/features/ai-assistant)
- [FAQ and best practices for EyeAuras scripts](/scripting/best-practices)
- [EyeAuras IDE integration](/scripting/ide-integration)
- [EyeAuras Bot in Discord](/features/discord-bot)