---
title: AI Assistant
description: Built-in AI chat in EyeAuras with OpenAI and OpenAI-compatible profiles, EyeAuras Gateway, Agent Guidance, MCP, and help with documentation and scripts
published: true
date: 2026-04-21T22:30:00.000Z
tags: ai, assistant, gateway, ai-translated, mcp, guidance
editor: markdown
dateCreated: 2026-03-29T00:00:00.000Z
---

# Ask AI Assistant about an EyeAuras task

AI Assistant is the chat in the **AI** tab. Use it to find a setting, locate documentation or discuss a script. A connection profile selects the model, server and credentials. Start with a documentation question and check the cited article before using proposed code.

You need a build with the AI tab and an available model connection. The feature is evolving; an answer can be wrong even when it sounds confident. For project-editing conversations and separate coding threads, see [AI Codex Coding Assistant](/en/features/ai-codex-coding-assistant).

## Ask a question without requesting changes

1. Open **AI**, select **Chat**, and choose an available profile. Use **Manage Profiles** to inspect its endpoint, model and key reference.
2. For your own OpenAI connection, enter your configured key or its environment-variable reference in **API Key**. Do not paste a secret into a chat question. A resolved key or `Ready`/`Key Available` status does not test the server, model access or account limits.
3. Keep **Docs Knowledge Base** enabled in **Show Settings**. For this first documentation question, leave **IDE Context** off; it is a separate opt-in to workspace context, not a switch that disables every connected tool.
4. Click **Start Session**. Ask: “Which trigger and overlay show my own text only while a chosen window is active? Find the wiki articles and explain the fields. Do not change settings or files.” Include your build number for version-specific questions.
5. Open the cited articles and compare their labels with your configuration. Expect an explanation and relevant links, not evidence that a workflow ran on your computer. For a later script question, provide a small non-secret snippet and the complete error text, then review any proposed change before applying it.

For that window-state question, compare [Window Is Active](/en/triggers/window-is-active) with [Enabling Conditions](/en/features/enabling-conditions). An ordinary trigger checks the aura’s condition; an enabling condition decides whether its work may run at all. Use a [Text overlay](/en/overlays/text) for a visible result while checking the answer, before adding input.

![Earlier AI tab in EyeAuras](https://s3.eyeauras.net/media/2026/04/EyeAuras_vuJB3YPFza.png =x600)

## Choose the connection you actually have

| Profile | Prerequisites and scope |
| --- | --- |
| OpenAI | Your authorized API connection and an available model. Start with a suitable installed template; model names in templates are not current access guarantees. |
| EyeAuras Gateway | EyeAuras-hosted endpoint `https://eu.openai.eyeauras.net` with **API Key** `%EYEAURAS_TOKEN%`. It uses an available authenticated EyeAuras account token; service access and limits still apply. |
| Ollama | Your already running local server, **Endpoint** `http://localhost:11434/v1`, **API Type** `ChatCompletions`, and an installed **Model Id**. The earlier `llama3` example only works when that model is present. This adapter does not normally require a provider key. |
| Another compatible server | Its supported protocol, endpoint, model and credentials. An OpenAI-compatible name does not establish every feature or API family. |

Gateway is optional. The earlier alpha announcement offered access through the community and discussed future limits/refills; do not treat that announcement as a current free allowance or commercial entitlement. Check the service response and [support contacts](/en/contacts) for access questions. Your own direct provider connection remains a separate choice.

![Earlier Gateway profile example](https://s3.eyeauras.net/media/2026/04/EyeAuras_eSthNpc63A.png =x600)

![Earlier Gateway chat example](https://s3.eyeauras.net/media/2026/04/EyeAuras_SD8w4Ut06Q.png =x600)

| Manage Profiles field | What it controls |
| --- | --- |
| `Name` | Profile name shown in the list, such as OpenAI, Gateway or Ollama local. |
| `API Key` | Literal credential or key reference. A literal is stored in the profile; an environment reference leaves the secret in that environment. |
| `Endpoint` | Provider API base address. Use the relevant template or your compatible server's documented address. |
| `Model Id` | Identifier understood by that server. Historical examples such as `gpt-5.4`, `gpt-5.4-mini` or `llama3` are not interchangeable model capabilities or availability promises. |
| `API Type` | `Responses` or `ChatCompletions`, selecting a corresponding installed adapter. The server must implement that family. |
| `Reasoning Effort` | A request hint supported only by the selected adapter/model. Keep a compatible template value rather than assuming all levels map identically. |
| `Max Context Tokens` | Advertised context size used for local tracking; it does not enlarge the model's actual limit. |
| `Function Calling` | Exposes registered tools when the model and connection support them, including documentation lookup. It does not register every EyeAuras service or grant unlimited access. |

An environment reference can be entered as in the original example:

```text
%OPENAI_API_KEY%
```

The local `ChatCompletions` connector supports OpenAI, Azure OpenAI, Ollama and compatible endpoints. The Anthropic-labelled route needs an OpenAI-compatible proxy here; it is not native Anthropic protocol support. The installed Responses transport does not wire Azure OpenAI Responses. Check that specific adapter before copying a working profile between modes. [OpenAI's API reference](https://developers.openai.com/api/reference/responses/overview) describes the external protocol, not all features implemented by an installed EyeAuras build.

Streamed replies, image content and tool rounds also depend on the adapter and model. They are not enabled merely by selecting a provider label. For the initial question, text and documentation are sufficient; do not attach sensitive images or files.

## Understand context and tools

The active chat session holds its conversation and profile context. **IDE Context** connects the current EyePad workspace through the host's available tools; it does not make every window, aura or file an implicit global. Read-only intent in a prompt is not a security boundary. Connected tools can have side effects under their configured policy; review their scope and resulting changes rather than assuming every invocation requests approval or every model can edit or compile.

Use the chat's cancellation control for an unwanted response; switching views is not evidence that work stopped. A suggested script still needs its actual host, imports, registered services and resource lifetime. Top-level `Log`, `AuraTree` and `Variables` do not become ordinary C# or Razor globals because an AI answer used them. [Scripting practices](/en/scripting/best-practices) explains those distinctions.

Codex is a separate runtime/thread mode. Ordinary Chat history is not automatically its thread history. In this integration, Codex browser login remains `Unavailable` outside the test path and the adapter declines escalation requests; independent Codex documentation does not enable those features inside EyeAuras.

<details>
<summary>Show Settings</summary>

![Earlier AI settings window](https://s3.eyeauras.net/media/2026/04/EyeAuras_rFFX1fryIO.png =x600)

| Setting | Purpose |
| --- | --- |
| `Docs Knowledge Base` | Makes the configured documentation available to chat and MCP retrieval. Answers still need source checking. |
| `Docs Repository` / `Docs Path` | Documentation repository and its local cache directory. They are not the canonical API implementation. |
| `Artifact Store` | Allows artifact storage where supported by the backend and host. |
| `MCP Port` / `Enable MCP On Startup` | Local helper endpoint and automatic startup setting. |
| `Enable Browser Automation` / `Browser Debug Port` | Enables the host's browser tools and selects a debug port. Restart EyeAuras after changing browser automation. This does not grant access to arbitrary browsers. |

For an ordinary documentation question, leave the cache and browser settings alone. A knowledge base supplies information, not automatic verification that code compiled or ran.

</details>

## Prepare Agent Guidance for an external agent

Agent Guidance packages EyeAuras documentation, examples, SDK notes and MCP status for an external coding tool such as Codex, Claude Code or Cursor. It does not install that tool or replace your project rules.

1. Open **AI → Show Settings → Agent Guidance** and click **Rebuild**.
2. Use **Open Guidance Pack** to inspect the folder, or **Export Guidance Pack** to save an archive.
3. Use **Add to C# Project** or **Add to Solution** to copy it beside the selected project. For a solution, EyeAuras attempts to find a C# project with the solution's name.
4. Direct the external agent to the generated folder and its `AGENTS.md` entry point. Configure any supported MCP connection separately.

![Agent Guidance page](https://s3.eyeauras.net/media/2026/04/EyeAuras_y9R4GuIA9N.png =x600)

The pack contains its own `AGENTS.md`, `README.md`, `manifest.json`, `mcp-status.json` and `docs/`. The managed destination is:

```text
generated/ai
```

![Guidance Pack actions](https://s3.eyeauras.net/media/2026/04/EyeAuras_R4JvFSFixc.png =x600)

Repeated **Add to C# Project / Add to Solution** replaces that directory completely. Keep your own files elsewhere. Your project's existing `AGENTS.md` remains separate and is not overwritten. Rebuild after changing MCP state so the pack contains current connection metadata.

![Earlier guidance folder layout](https://s3.eyeauras.net/media/2026/04/EyeAuras_pW0O4jRT9q.png =x600)

The optional local MCP helper gives a connected client registered context tools; it is not automatic access to all application objects. A portable guidance archive supplies documents, while a live endpoint requires its own running host and permissions.

## If the session does not start

| Symptom | Next check |
| --- | --- |
| `Unavailable` or missing key | Check the reference and environment value. Gateway requires an available authenticated EyeAuras token; key readiness is not a successful model request. |
| Connection error | Check endpoint and network access. For Ollama, check your own local server. |
| Model or API error | Compare Model Id, API Type and supported features. Keep the full non-secret error text. |
| A plausible but incorrect answer | Ask for its source, specify build and task, and compare the actual article/API contract before using the suggestion. |

You do not need Gateway specifically or necessarily an OpenAI account: an available compatible local/server connection is another route. Access, model availability and costs belong to the chosen service. For help outside the app, use [Discord Bot](/en/features/discord-bot). For a project, continue with [Codex](/en/features/ai-codex-coding-assistant), [scripting basics](/en/scripting/getting-started) and [best practices](/en/scripting/best-practices).
