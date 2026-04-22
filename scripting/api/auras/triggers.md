---
title: AI Auras: Triggers
description: AI-first map of aura triggers and trigger-related infrastructure.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, triggers
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Aura Triggers Discovery Map

Reference map for aura triggers: entities that watch state or events and drive
aura activation.

## Concept Model

- Triggers observe state and produce activation events.
- Triggers are aura entities registered through `IAuraRegistrator`.
- Trigger behavior is usually near `CreateTriggerEventSource`.
- Trigger editors/metadata describe user-facing configuration.
- Actions perform work after trigger state changes.

## API Details

- `AuraTriggerBase<TProperties>` - common trigger base.
- `CreateTriggerEventSource` - usual trigger event source method.
- `CsharpScriptTrigger` - script trigger entity.
- `CsharpScriptTriggerExecutor` - object-style script trigger base.
- `ILifecycleEventsProvider` - lifecycle event source for lifecycle triggers.

## Common Flows

- Find built-in trigger:
  - find module registration with `Register<SomeTrigger>`.
  - inspect properties/metadata for UI settings.
  - inspect runtime class and `CreateTriggerEventSource`.

- Add trigger:
  - define properties.
  - define runtime trigger model.
  - optionally define editor/metadata.
  - register through `IAuraRegistrator`.

## Prefer

- Prefer `CreateTriggerEventSource` for activation semantics.
- Prefer subsystem maps for underlying input/window/CV details.
- Prefer `CsharpScriptTriggerExecutor` for object-style script triggers.

## Avoid

- Avoid putting action side effects into trigger research.
- Avoid low-level polling before checking existing triggers and services.

## Research Anchors

- `AuraTriggerBase`, `CreateTriggerEventSource`, `CsharpScriptTrigger`,
  `CsharpScriptTriggerExecutor`, `TimerTrigger`, `HotkeyIsActiveTrigger`,
  `WinActiveTrigger`, `WinExistsTrigger`, `ImageSearchTrigger`,
  `TextSearchTrigger`, `ColorSearchTrigger`, `MLSearchTrigger`.

## Search Synonyms

- trigger
- aura trigger
- activation
- active state
- event source
- script trigger
- hotkey trigger
- window trigger
- image trigger

## Related Maps

- `auras/entities.md`
- `auras/actions.md`
- `windows-subsystems/input-hooks-hotkeys.md`
- `windows-subsystems/window-handles.md`
- `computer-vision/images.md`
