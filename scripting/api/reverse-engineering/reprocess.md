---
title: AI Reverse Engineering — ReProcess
description: AI-first map of ReProcess UI and reverse-engineering workflows.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, reverse-engineering, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Reverse Engineering / ReProcess Discovery Map

Reference map for `ReProcess`, RE workspace builder, tabs, actions, inspectors,
knowledge store, and process-focused RE UI.

## Display a workspace for an existing process

Supply an open `IProcess`, configured `AiEngine`, the host's
`IAiSpeechToTextSessionFactory` and an active ImGui frame. A metadata reference
alone does not supply them. In ordinary C# code, construct
`new ReProcess(process, aiEngine, speechToTextSessionFactory)` from
`EyeAuras.AI.Desktop.RE`, retain it, and call `ToImGui()` inside a window's render
callback. Check the expected PID; `IsValid` does not prove all addresses readable.

This constructor assembles default tabs, scanner and AI. The result is the
selected process's tabs in your existing UI; it neither selects a backend nor
opens a process. On shutdown remove the renderer, dispose `ReProcess`, then
dispose the reader if you own it. Workspace disposal releases its tab/inspector
renderers, but not the supplied `IProcess` or `AiEngine`.

## Compose a different set of tabs

`ReProcessBuilder.UseDefaults()` chooses the normal set; `UseMinimalDefaults()`
keeps a minimal composition with a memory tab. Add public providers through
`AddTab`, `AddAction` and `AddAddressInspector`; generic overloads use the supplied
`IServiceProvider`. Implement `IReProcessBuilderContext` for `Build(context)`;
it supplies the process, engine, speech factory, registries and knowledge store.
The concrete `ReProcessBuilderContext` is internal.

`Build` copies registries and creates a separate workspace knowledge store.
Its return type `IReProcess` does not itself declare `ToImGui` or `Dispose`:
use the actual object's additional `ICanBeDisplayedInImGui` and `IDisposable`
contracts. `ReKnowledgeStore` is internal; public access is `IReKnowledgeStore`.
The implementation stores knowledge in memory, without promising persistence.
The UI host controls scheduling. These source contracts do not prove installed
native or external AI compatibility.

## User Intents

- Build RE UI around an `IProcess`.
- Host `ReProcess` in ImGui.
- Add RE tabs/actions/inspectors.
- Attach RE workspace after selecting a window and process reader.
- Use AI-assisted RE tooling.

## Concept Model

- `ReProcess` is a process-focused reverse-engineering workspace.
- It expects a validated `IProcess`.
- Tabs/actions/inspectors are extension points.
- ImGui SDK is the typical UI host.
- Process reader selection belongs to memory/package maps.

## API Details

- `ReProcess` / `IReProcess` - RE workspace object.
- `ReProcessBuilder` - builds workspace and plugins.
- `IReTabRegistry`, `IReActionRegistry`, `IReAddressInspectorRegistry` -
  extension registries.
- `IReKnowledgeStore` - RE knowledge persistence.
- `ReToolsPlugin` - contributes RE tools.
- `ICanBeDisplayedInImGui` - ImGui hosting contract.

## Prefer

- Validate `IProcess.IsValid` and expected PID before building RE UI.
- Prefer [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk) for ImGui hosting.
- Prefer [memory/processes.md](/en/scripting/api/memory/processes) or [nuget/frida-sdk.md](/en/scripting/api/nuget/frida-sdk) for process readers.

## Avoid

- Avoid creating `ReProcess` before process identity is validated.
- Avoid mixing process reader selection UI into RE internals.

## Research Anchors

- `ReProcess`, `IReProcess`, `ReProcessBuilder`, `ReTabRegistry`,
  `ReActionRegistry`, `ReAddressInspectorRegistry`, `ReKnowledgeStore`,
  `ReToolsPlugin`, `ICanBeDisplayedInImGui`.

## Search Synonyms

- ReProcess
- reverse engineering
- RE workspace
- memory browser
- address inspector
- RE tab
- RE action
- process inspector

## Related Maps

- [memory/processes.md](/en/scripting/api/memory/processes)
- [nuget/frida-sdk.md](/en/scripting/api/nuget/frida-sdk)
- [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk)
- [osd/selection.md](/en/scripting/api/osd/selection)
