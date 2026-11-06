---
title: AI Auras — Triggers
description: AI-first map of aura triggers and trigger-related infrastructure.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, triggers, ai-translated
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

## Trace trigger state

For a configured `HotkeyIsActiveTrigger`, inspect its registration, properties and
`CreateTriggerEventSource`, then the shared `AuraTriggerBase<TProperties>` pipeline.
The base switches subscriptions on `TriggerScheduler` and applies disabling,
`IsInverted`, `ActivationTimeout` and `DeactivationTimeout`. An incoming event
therefore does not imply immediate aura activation. `IsActive` is `bool?` and can
be unknown when disabled. The trigger owns its subscriptions. Put side effects
in actions; for a simple C# Action key handler, start with [Keybind](../../keybinds).

## Return a condition from a class

Prepare current-context variables `ready` (`bool`) and `pending` (`int`), then
add `ReadyTrigger.cs` to the C# Trigger project:

```csharp
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.CsScriptAuras.Triggers.CsharpScript;

public sealed class ReadyTrigger : CsharpScriptTriggerExecutor
{
    protected override Task<bool?> Execute(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var ready = Variables.Get<bool>("ready").Value;
        var pending = Variables.Get<int>("pending").Value;
        return Task.FromResult<bool?>(ready && pending == 0);
    }
}
```

Call it explicitly from `Script.csx`:

```csharp
{
    using var trigger = GetService<ReadyTrigger>();
    return await trigger.Run(cancellationToken);
}
```

`ready = true` and `pending = 0` return `true`; default-reading an absent `ready`
returns `false`. Check presence and type separately for mandatory configuration.
The container supplies the executor's host context. `true`, `false` and `null`
represent satisfied, unsatisfied and unknown conditions before trigger inversion
and delays. Return one evaluation to the host; configure the C# Trigger period
for repeated evaluation. A disabled period need not produce regular evaluations.
Long work delays the result and remains subject to cancellation and the trigger's
execution timeout.

## API Details

- `AuraTriggerBase<TProperties>` - common trigger base.
- `CreateTriggerEventSource` - usual trigger event source method.
- `CsharpScriptTrigger` - script trigger entity.
- `CsharpScriptTriggerExecutor` - object-style script trigger base.
- `ILifecycleEventsProvider` - lifecycle event source for lifecycle triggers.
- `IMessageService`, `IMessageChannel` - NetworkAuras message-channel service
  contracts used by message subscription style integrations.

## Assembly / Package Hints

- NetworkAuras trigger/action properties and message service contracts live in
  `EyeAuras.NetworkAuras.Metadata`.
- NetworkAuras runtime transport implementations live in the protected
  `EyeAuras.NetworkAuras` module and should be loaded through module/capability
  startup rather than referenced directly.

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

- [auras/entities.md](/en/scripting/api/auras/entities)
- [auras/actions.md](/en/scripting/api/auras/actions)
- [windows-subsystems/input-hooks-hotkeys.md](/en/scripting/api/windows-subsystems/input-hooks-hotkeys)
- [windows-subsystems/window-handles.md](/en/scripting/api/windows-subsystems/window-handles)
- [computer-vision/images.md](/en/scripting/api/computer-vision/images)
