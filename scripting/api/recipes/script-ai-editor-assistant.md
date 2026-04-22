---
title: Recipe: Mini-App With Custom AI Chat Interface
description: Short recommendation recipe for adding a custom AI chat interface to a script editor or mini-app.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipe, blazor
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Mini-App With Custom AI Chat Interface

| Field | Value |
| --- | --- |
| Complexity | Medium to High |
| Example | Script editor or EyePad-style mini-app with an embedded AI chat. |
| End Goal | Add a chat panel that can answer questions, inspect editor context, and call approved tools. |
| Key Technologies | AI runtime, AI chat UI, AI tools/plugins, Blazor |

## Use When

- You are building a mini-app or editor and want an AI chat inside it.
- The chat should know what script, tab, error, or selection the user is looking
  at.
- The chat may call tools such as docs search, diagnostics, or safe editor
  actions.

## Shape

- Put a chat panel next to the editor or in a tool window.
- Build the AI session from the editor context the user can actually see.
- Add tools one by one: read selected text, read diagnostics, search docs, then
  propose or apply edits if needed.
- Ask for approval before tools change files, scripts, or app state.

## Choices

- Is this chat tied to one editor tab, one workspace, or the whole mini-app?
- Which context is included automatically?
- Which tools are read-only?
- Which tools need explicit approval?
- Does this assistant need docs search, or only local editor context?

## APIs To Look Up

- `AiEngine`
- `IAiChatSession`
- `IAiChatSessionHandle`
- `AiSessionOptions`
- `AiChatViewModel`
- `AiChatComponent`
- `AiKernelPlugin`
- `IAiPluginHost`
- `AiFunctionInvocationPolicy`
- `AiDocsKnowledgeBasePlugin`
- `IBm25KnowledgeBase`

## Avoid

- Making documentation search mandatory for every AI chat.
- Tools that change files or app data without clear names and approval behavior.
- Letting the assistant guess hidden editor data.
- Assuming script-only globals exist in normal helper/plugin classes.
- Persisting active session ids or transient request data.

## Related Maps

- `ml/ai-runtime.md`
- `ml/ai-kernel-plugins.md`
- `scripting/runtime.md`
- `windows-subsystems/blazor-windows.md`
