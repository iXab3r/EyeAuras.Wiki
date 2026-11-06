---
title: Recipe: Mini-App With Custom AI Chat Interface
description: Short recommendation recipe for adding a custom AI chat interface to a script editor or mini-app.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipe, blazor, ai-translated
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

## Attach chat to one editor tab

This is an integration inside a working EyeAuras Blazor host, not a standalone runtime bootstrap. Supply a configured `AiEngine`, a model profile with key resolution, `IAiSpeechToTextService` for the view model, AI UI static assets, and the tab owner. Pass editor context explicitly; the current document, selection and diagnostics do not become model context automatically.

The owner calls `AiEngine.CreateSession(context, options)`, creates `new AiChatViewModel(session, speechToTextService)`, and passes it as `DataContext` to `AiChatComponent`. `CreateSession` selects the first configured profile, if one exists; show missing-profile state before sending. The component loads CSS/JS through `_content/EyeAuras.AI`, so a view model alone is not a configured UI host.

Before sending, update the permitted editor context. Add tools to the session plugin host, separating inspection, edit proposals and application of changes. Invocation policy and the tool enforce changes; model response text does not grant access. Documentation retrieval is optional for displaying the panel.

The expected result is a conversation and tool surface scoped to the selected tab. On close, cancel current work, dispose the UI/view model and call `AiEngine.RemoveSession(session.SessionId)` to remove and dispose the registered session. Component disposal does not unregister the session. Provider requests and keys are external inputs, not validated by this integration outline.

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

- [ml/ai-runtime.md](/en/scripting/api/ml/ai-runtime)
- [ml/ai-kernel-plugins.md](/en/scripting/api/ml/ai-kernel-plugins)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)

## Ownership in the editor factory

At `c8b2304`, `IScriptAiChatSessionFactory.CreateSession(scriptRunner, context)` loads profiles and applies its registered configurators to the new session. The workspace configurator receives `scriptRunner.Script`; it does not automatically read every visible selection. The returned `IAiChatSessionHandle` removes the session from its engine on disposal, falling back to direct session disposal if it is no longer registered.

`AiChatViewModel` owns its event queue, timeline, subscriptions and request cancellation source. Disposal requests cancellation and clears the session event sink; it does not dispose the borrowed session or speech service. Use one active event-sink owner per session: replacing the sink or disposing another attached view model can disconnect the UI. `AiChatComponent.DisposeAsync` stops its heartbeat and releases JavaScript listeners/module; the tab owner still owns its view model and session handle.

[Source contracts](https://github.com/iXab3r/EyeAuras/tree/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.AI/UI)
