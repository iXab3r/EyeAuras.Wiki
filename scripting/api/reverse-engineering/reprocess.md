---
title: AI Reverse Engineering: ReProcess
description: AI-first map of ReProcess UI and reverse-engineering workflows.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, reverse-engineering
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Reverse Engineering / ReProcess Discovery Map

Reference map for `ReProcess`, RE workspace builder, tabs, actions, inspectors,
knowledge store, and process-focused RE UI.

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
- `ReTabRegistry`, `ReActionRegistry`, `ReAddressInspectorRegistry` -
  extension registries.
- `ReKnowledgeStore` - RE knowledge persistence.
- `ReToolsPlugin` - contributes RE tools.
- `ICanBeDisplayedInImGui` - ImGui hosting contract.

## Prefer

- Validate `IProcess.IsValid` and expected PID before building RE UI.
- Prefer `nuget/imgui-sdk.md` for ImGui hosting.
- Prefer `memory/processes.md` or `nuget/frida-sdk.md` for process readers.

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

- `memory/processes.md`
- `nuget/frida-sdk.md`
- `nuget/imgui-sdk.md`
- `osd/selection.md`
