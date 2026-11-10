---
title: AI Codex Coding Assistant
description: What the built-in Codex mode in EyeAuras is, how it differs from the regular AI Assistant, what threads are, and what it can do right now
published: true
date: 2026-04-21T22:30:00.000Z
tags: scripting, ai, ai-translated, assistant, codex, mcp, guidance
editor: markdown
dateCreated: 2026-04-11T13:45:45.683Z
---

# Explain your EyePad project with Codex

Open your own project in EyePad and ask Codex to explain its entry point before requesting a small change. Codex works with project context and connected EyeAuras tools. For a question about a setting or documentation, ordinary [AI Assistant](/en/features/ai-assistant) is usually the more direct starting point.

You need a build with the `AI` tab and `Codex` mode, a compatible **OpenAI** profile using **API Key**, and a model available through that connection. Direct OpenAI and compatible `EyeAuras Gateway / AiGateway` connections use the Responses API here. The endpoint must not contain query parameters after `?`. An arbitrary Chat Completions endpoint, or an Azure, Anthropic or Ollama profile that works in ordinary Chat, is not automatically compatible.

## Start with a read-only question

1. Open a small `Script.csx` project in [EyePad](/en/features/eyepad). Use a copy you are comfortable editing for the first exercise.
2. Open `AI`, switch `Chat` to `Codex`, and select the profile and `API Key`. Use `Show Settings` for the endpoint and key configuration described in [AI Assistant](/en/features/ai-assistant).
3. Check for `Ready`, then click `Start Codex`. This starts the separate Codex runtime; wait for the available models and conversations to load.
4. Click `New Thread` and choose an available model. Ask: “Explain what Script.csx does in the current EyePad project. Name the files and dependencies you use. Do not edit code yet.”
5. Compare the answer with the open files. In the same thread, you can then request one minimal change and review the resulting code. A completed agent response does not establish that the program compiled or ran.
6. Click `Stop Codex` when finished. Returning to the thread list alone does not stop work.

![Starting Codex with a selected profile and ready status](https://s3.eyeauras.net/media/2026/04/EyeAuras_TyMJnKr1Rb.png =x200)

| Setting | Purpose |
| --- | --- |
| OpenAI profile and `API Key` | Select the endpoint and API access. A profile key is not ChatGPT browser sign-in. |
| Model | Choose from the connection's available models; access depends on the service and account. |
| `reasoning` | Select an effort supported by the chosen model. |
| `Docs Knowledge Base` | Supplies EyeAuras documentation for contract lookup. |
| IDE / EyePad context | Supplies the working project and connected inspection or editing tools. |
| `Start Codex` / `Stop Codex` | Start and stop the assistant's runtime. |

In the current integration, `ChatGPT Login` reports `Unavailable` outside the test-only path. Use `API Key`. Browser login in standalone Codex does not make it available inside an installed EyeAuras build. It is also separate from [external-provider login](/en/features/external-providers) to your EyeAuras account. With an API key, usage follows [API billing](https://learn.chatgpt.com/docs/agent-configuration/speed), rather than assuming that a ChatGPT sign-in pays for this connection.

## Keep tasks and file access clear

A `Thread` has its own history, state, model and reasoning effort. Reopen or archive threads in the list, and show additional or archived entries when needed. Use separate threads for an error investigation and a new feature.

![Codex threads with separate task histories](https://s3.eyeauras.net/media/2026/04/EyeAuras_PcLPt8SCFy.png =x200)

Switching threads does not cancel a task running in another one. Stop it explicitly. Ordinary Chat history is not automatically transferred to Codex.

In EyePad, the integration refreshes the working context and tools before the next request. A connected project directory can be writable. Attaching a file for reading is a different operation and does not automatically grant writes to its entire directory. Do not expect confirmation before every edit within permitted working roots. Review changes and save the project through its usual workflow.

The current adapter declines Codex requests that require additional command-execution or file-change approval; it does not provide a universal interactive approval dialog. Writes follow configured working roots, while reads should not be treated as isolated to those roots. Use a prepared workspace when sensitive files are nearby.

<details>
<summary>Choose a useful task and context</summary>

Codex can help explain a compilation error, inspect an EyePad or multi-file script project, plan a refactor, or work on code used by a behavior tree, macro or mini-app. State the expected result and relevant files. Ask for a plan first when the change spans several responsibilities. This does not give every project access to every EyeAuras service or make arbitrary code safe to run.

The available model list and installed runtime determine supported features; selecting a model name is not a promise of every option in a newer Codex release. Ordinary Chat remains useful for reference questions; there is no general speed, price or correctness guarantee from the mode name.

</details>

<details>
<summary>Agent Guidance and external editors</summary>

`Show Settings` contains [Agent Guidance](/en/features/ai-assistant#agent-guidance). For an external agent, use `Rebuild`, then `Add to C# Project` or `Add to Solution`. The prepared `generated/ai/` directory contains instructions, a documentation snapshot and metadata. Its `AGENTS.md` is the package entry point, not a replacement for the project's root instructions.

Built-in Codex receives documentation through its integration. External clients such as Codex, Claude Code or Cursor need their own supported connection and configuration; guidance files alone do not connect tools. See [IDE integration](/en/scripting/ide-integration) and [scripting practices](/en/scripting/best-practices). MCP exposes connected EyeAuras context tools, not automatic access to every object or a way around tool restrictions.

The integration communicates with a Codex process through [App Server](https://developers.openai.com/codex/app-server). New protocol features do not appear automatically in an installed EyeAuras runtime. For documentation help away from a local project, see [Discord Bot](/en/features/discord-bot).

</details>
