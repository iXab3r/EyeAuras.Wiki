---
title: AI Auras — Actions
description: AI-first map of aura actions and action-related infrastructure.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, actions, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Aura Actions Discovery Map

Reference map for aura actions: executable units invoked from lifecycle lists,
scripts, behavior-tree nodes, macros, and user workflows.

## Concept Model

- Actions perform work.
- Actions are aura entities registered through `IAuraRegistrator`.
- Actions are backed by persisted properties and optional editors/metadata.
- Runtime behavior is usually near `ExecuteInternal`.
- Aura lifecycle lists commonly run actions on enter, while active, and on exit.

## Trace a configured action

Start with an action already configured in `OnEnter`, `WhileActive` or `OnExit`.
Find its module registration, properties and `ExecuteInternal(CancellationToken)`;
for an input sequence, the Roxy module registers `SendSequenceAction`.

`AuraActionBase<TProperties>` serializes one instance through a semaphore,
sets `IsBusy` and supplies a linked parent/instance cancellation token. The
implementation must observe that token. Execution errors enter the error provider
and are wrapped in `InvalidStateException`; cancellation inside execution is
caught, while waiting for the semaphore can itself be cancelled.

The base `Execute` and `ExecuteAsync` reject the UI thread; returning a `Task`
does not move work to another thread. To execute an aura's action lists use
[IAuraAccessor](../IAuraAccessor); for simple scripted input use
[SendInput](../ISendInputScriptingApi).

## Execute an action class

Create a local Boolean variable `busy` on the current aura, then add
`PreparePanel.cs` to the C# Action project:

```csharp
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.CsScriptAuras.Actions.CsharpScript;

public sealed class PreparePanel : CsharpScriptActionExecutor
{
    protected override async Task Execute(CancellationToken cancellationToken)
    {
        var busy = Variables.Get<bool>("busy");
        var previous = busy.Value;
        busy.Value = true;
        try
        {
            await Task.Delay(250, cancellationToken);
            Log.Info("Preparation completed");
        }
        finally
        {
            busy.Value = previous;
        }
    }
}
```

Keep the entry point explicit in `Script.csx`:

```csharp
{
    using var action = GetService<PreparePanel>();
    await action.Run(cancellationToken);
}
```

`Run` calls `Execute` with linked caller/executor cancellation. The container
injects `Variables`, `Context`, `AuraTree` and `Log`; `new PreparePanel()` does
not supply this host context. Dispose this operation's executor after awaiting it,
not borrowed host singletons. The `finally` restores the pre-existing local value;
it does not preserve an absent record or inherited origin, and is not a lock.

## API Details

- `AuraActionBase<TProperties>` - common action base.
- `ExecuteInternal` - usual action behavior method.
- `CsharpScriptAction` - script action entity.
- `CsharpScriptActionExecutor` - object-style script action base.
- `IAuraAccessor.Execute` / `ExecuteAsync` - script-side aura execution.
- `IPlaySoundScriptingApi` - script-facing play-sound service contract.
- `AudioNotificationType` - neutral notification sound enum shared by
  script-facing play-sound APIs and native audio playback.

## Assembly / Package Hints

- Default action properties and script-facing contracts live in
  `EyeAuras.DefaultAuras.Metadata`.
- Default action runtime/editor implementations live in the protected
  `EyeAuras.DefaultAuras` module and should not be referenced directly from
  standalone app code.

## Common Flows

- Find built-in action:
  - find module registration with `Register<SomeAction>`.
  - inspect action properties/metadata if UI settings matter.
  - inspect action runtime class and `ExecuteInternal`.

- Add action:
  - define properties.
  - define runtime model.
  - optionally define editor/metadata.
  - register through `IAuraRegistrator`.

## Prefer

- Prefer `ExecuteInternal` for runtime behavior.
- Prefer module registrations for user-facing discovery.
- Prefer `IAuraAccessor` for script-driven aura execution.

## Avoid

- Avoid treating actions as state watchers; use triggers for activation state.
- Avoid directly constructing action models from persisted metadata.

## Research Anchors

- `AuraActionBase`, `ExecuteInternal`, `CsharpScriptAction`,
  `CsharpScriptActionExecutor`, `IAuraAccessor`, `IAuraRegistrator`,
  `SendInputAction`, `DelayAction`, `PlaySoundAction`.

## Search Synonyms

- action
- aura action
- execute action
- lifecycle action
- on enter
- while active
- on exit
- script action

## Related Maps

- [auras/entities.md](/en/scripting/api/auras/entities)
- [auras/triggers.md](/en/scripting/api/auras/triggers)
- [auras/overlays.md](/en/scripting/api/auras/overlays)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
