---
title: AI Codex Coding Assistant
description: What the built-in Codex mode in EyeAuras is, how it differs from the regular AI Assistant, what threads are, and what it can do right now
published: true
date: 2026-04-21T22:30:00.000Z
tags: scripting, ai, ai-translated, assistant, codex, mcp, guidance
editor: markdown
dateCreated: 2026-04-11T13:45:45.683Z
---
> Early alpha feature. It is already quite practical, but the runtime, auth flows, and part of the tooling are still under active development. Right now, the most reliable setup for `Codex` is an `OpenAI` profile in `API Key` mode. This can be either direct `OpenAI` or an `EyeAuras Gateway / AiGateway` profile.
{.is-warning}

# What Codex is
`Codex` in EyeAuras is a separate mode inside the `AI` tab for **more complex technical tasks**.

If the regular [AI Assistant](/features/ai-assistant) is better thought of as a fast built-in chat and reference tool, `Codex` is closer to “give it a task, give it context, and let the assistant work through it.”

That makes `Codex` a better fit for things like:

- figuring out why your current script does not compile
- helping edit code in `EyePad`
- breaking down a more complex automation task step by step
- helping structure a behavior tree, macro, or mini-app

For simple wiki and settings questions, the regular `AI Assistant` is often easier, faster, and cheaper.

![Start Codex Session](https://s3.eyeauras.net/media/2026/04/EyeAuras_TyMJnKr1Rb.png =x200)

## How it differs from the regular AI Assistant
- the regular `AI Assistant` is better for quick questions, wiki lookup, and general in-app chat
- `Codex` is stronger at programming, troubleshooting, and more involved tasks
- `Codex` works through separate `threads`, not one continuous chat
- `Codex` relies more deeply on the current `EyePad` working context and EyeAuras tools
- `Codex` currently has a stricter connection setup: the best option is an `OpenAI` profile in `API Key` mode, whether that points to direct `OpenAI` or `EyeAuras Gateway`

# When to use Codex
Use `Codex` when your task looks more like one of these:

- `why does this Script.csx not work`
- `help me rewrite the current code more cleanly`
- `analyze this error and suggest the smallest fix`
- `help me design the logic for an aura, tree, or macro`
- `compare a few solution options and recommend the best one`

If you just need a reference answer like “where is this setting” or “what does this function do,” it is usually better to start with [AI Assistant](/features/ai-assistant).

# Getting started
`Codex` lives in the same `AI` tab as the regular `AI Assistant`.

Basic flow:

1. Open the `AI` tab.
2. Switch mode from `Chat` to `Codex`.
3. Select a suitable `OpenAI` profile.
4. Leave authentication mode set to `API Key`.
5. Make sure the readiness status on the right is green.
6. Click `Start Codex`.
7. After startup, click `New Thread`.

A suitable `OpenAI` profile here can mean:

- regular direct `OpenAI`
- `EyeAuras Gateway / AiGateway`

If you have not configured profiles, `Endpoint`, `API Key`, or `Show Settings` yet, start with the general article first:

- [AI Assistant inside EyeAuras](/features/ai-assistant)

Important: the current `Codex` integration is stricter than the regular `AI Assistant`, but not so strict that it only means “direct OpenAI only.” In practice, that means:

- `Codex` works fine through regular `OpenAI`
- `Codex` can work through `EyeAuras Gateway / AiGateway`
- `Ollama` and other separate connection schemes are not the universal path here
- `ChatGPT Login` should currently be treated as a direct `OpenAI` scenario, not a gateway-endpoint scenario

# Agent Guidance and MCP
There is a separate [Agent Guidance](/features/ai-assistant#agent-guidance) section in the AI settings.

This is especially useful if you work not only with built-in `Codex`, but also with external AI coding tools such as Codex, Claude Code, Cursor, and similar tools.

ELI5:

- `Agent Guidance` is a set of rules plus a pointer to current EyeAuras context
- `guidance-pack` is a portable folder with instructions, a wiki snapshot, and metadata
- `AGENTS.md` is the entry point inside that folder, not a file that EyeAuras injects into your project
- `MCP` is a local bridge that lets the agent ask EyeAuras for specific information about the current program state, windows, or available objects and symbols

Built-in `Codex` inside EyeAuras already receives docs context through its own integration. `Agent Guidance` is mainly for external agents and projects you open outside EyeAuras: an exported workspace, a C# project next to a `.csproj`, a separate scripts folder, and so on.

In practice, it looks like this:

1. In EyeAuras, open `AI` -> `Show Settings` -> `Agent Guidance`.
2. Click `Rebuild` if you want to refresh the guidance pack.
3. Click `Add to C# Project` or `Add to Solution` to copy the pack into `generated/ai` next to the selected `.csproj` or C# project from the `.sln`.
4. Open the project in the external agent.
5. Give the agent the `generated/ai` folder or tell it to start from `generated/ai/AGENTS.md`.

You do not need this for simple questions. But for tasks like “fix the script,” “figure out the API,” “build a mini-app,” or “review the project,” guidance greatly improves the chances that the agent will read the right EyeAuras docs instead of inventing generic C# answers.

# What a thread is
The simplest way to think about it:

A `Thread` is a **separate working task** with its own history, context, and state.

For example:

- one `thread` can be about diagnosing the current script
- a second `thread` can be about a new behavior tree idea
- a third `thread` can be about refactoring part of the code

Each `thread` has its own conversation memory. That is useful because different tasks do not get mixed into one giant mess.

Threads also have some service data:

- name or preview
- message history
- current status
- selected model
- `reasoning` level
- the ability to reopen the thread later or send it to the archive

![Codex Threads](https://s3.eyeauras.net/media/2026/04/EyeAuras_PcLPt8SCFy.png =x200)

## Can you keep multiple threads at the same time
Yes.

That is one of the strengths of the current integration: you can start one `thread`, return to the list, open another, and continue working there.

Going back to the list does **not** automatically stop the first `thread`. It only fully stops if you explicitly click `Stop Codex` or fully restart the runtime.

# How it works inside EyeAuras
In ELI5 form, the flow looks like this:

1. `Start Codex` launches a separate runtime inside EyeAuras.
2. `New Thread` creates a new working branch for a specific task.
3. Before each new request, EyeAuras refreshes the context: profile, docs knowledge base, current working environment, and available tools.
4. If you are working through `EyePad`, `Codex` sees the current active workspace, not some abstract “piece of text.”
5. Each `thread` lives independently, with its own history, status, and model settings.

Because of that, `Codex` feels less like “just another ChatGPT window” and more like a technical assistant working inside the app itself.

# What it can already do
At this point, the integration can honestly be described like this:

- there is a separate `Codex` mode inside the `AI` tab
- you can start and stop the runtime through `Start Codex` / `Stop Codex`
- there is a `threads` list, plus reopening and archiving
- you can keep multiple `threads` in parallel and switch between them
- you can change the model and `reasoning` level for the active `thread`
- if `Docs Knowledge Base` is enabled, `Codex` can also use the wiki and local docs database
- in `EyePad` scenarios, it sees the current workspace and better understands what the user is actually working on
- in the current integration, it can already help with live scripting scenarios, not just answer with “generic C# advice”
- for external AI coding tools, you can prepare a portable `Agent Guidance` pack

The most practical part is this: `Codex` is already useful not just as a reference tool, but as an assistant for the script you currently have open.

# How to give better tasks
To get better results from `Codex`, a few simple rules help:

- one task = one `thread`
- say what result you want right away, not just what is broken
- if it is about code, explicitly say that it should work with the current `EyePad` tab
- if you want a minimal fix, say so directly: `find the cause and suggest the smallest fix`
- if the task is large, ask for a plan first and implementation second

Good starting prompts:

- `Figure out why the current Script.csx does not compile`
- `Look at the current EyePad tab and suggest a minimal refactor`
- `Explain what is wrong here and suggest the simplest working version`
- `Help me design the logic for this aura step by step`

# Important limitations for now
- this is still alpha, and the integration is changing quickly
- right now, the main real-world path for `Codex` is an `OpenAI` profile through `API Key`, including both direct `OpenAI` and `EyeAuras Gateway`
- if `ChatGPT Login` is visible in the UI, that does not automatically mean it is fully wired up in your build yet
- regular `Chat` context and `Codex` context are not automatically shared between each other
- for simple FAQ-style questions, `Codex` is often overkill; the regular [AI Assistant](/features/ai-assistant) is usually the better choice

# FAQ
## Do I need a separate AI profile for Codex
Not necessarily a separate one, but it does need to be **compatible**.

The easiest way to think about it is this: `Codex` uses the same shared profile system as the regular `AI Assistant`, but in practice it is best to stick to an `OpenAI` profile in `API Key` mode for now.

That can be:

- direct `OpenAI`
- `EyeAuras Gateway / AiGateway`

## Does Codex work through EyeAuras Gateway
Yes, that is a normal scenario.

The more accurate way to phrase it is:

- `Codex` works with `OpenAI` profiles
- that profile can point either to direct `OpenAI` or to `EyeAuras Gateway / AiGateway`
- the main working mode here is still `API Key`
- `ChatGPT Login` should currently be treated as a separate direct-OpenAI scenario

## Can it see the current script in EyePad
Yes. In current `EyePad` scenarios, `Codex` can already work with the current active workspace.

That is exactly why it is much more useful for live scripting tasks than an external chat with no context.

## Can I leave one thread running and open another
Yes.

That is a normal user flow: one `thread` can keep running in the background while you switch to another one.

## When should I use the regular AI Assistant instead of Codex
When you need:

- a quick documentation answer
- a simple settings question
- wiki help
- lightweight assistance without deeper technical work

For those cases, start with [AI Assistant](/features/ai-assistant), and keep `Codex` for heavier tasks.

# What to read next
- [AI Assistant inside EyeAuras](/features/ai-assistant)
- [FAQ and best practices for EyeAuras scripts](/scripting/best-practices)
- [EyeAuras IDE integration](/scripting/ide-integration)
- [EyeAuras Bot in Discord](/features/discord-bot)