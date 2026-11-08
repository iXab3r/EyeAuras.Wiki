---
title: AI Scripting Async
description: AI-first map for async/await, background work, cancellation, and coroutine-style flows in EyeAuras scripts.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, async, coroutine, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Scripting Async Discovery Map

Reference map for async work in script mini-apps: top-level `await`,
fire-and-forget hazards, cancellation, and coroutine-style alternatives.

## User Intents

- Await file, network, AI, OSD, or service APIs from `Script.csx`.
- Run long-lived script work without blocking UI/render threads.
- Start background work safely.
- Cancel async work when the script stops.
- Avoid unobserved exceptions that can destabilize the host app.

## Concept Model

- Top-level scripts support `async`/`await`; a `Script.csx` body can directly
  use `await`.
- EyeAuras awaits the script run from the outside.
- `cancellationToken` represents the current script run cancellation.
- `ExecutionAnchors` owns resources that must be disposed when the current run
  ends.
- Ordinary helper classes use normal C# async patterns; host-only globals are
  not automatically available there.
- Fire-and-forget tasks are dangerous unless they catch/log all exceptions and
  observe cancellation.
- For loops, timers, and step-based workflows, the `Coroutine` NuGet package is
  an alternative to ad-hoc background `Task` code; configure its lifetime separately.

- In a Behavior Tree `ExecuteScriptNode` under `TimeoutNode`, the current tick's
  deadline is linked into the top-level `cancellationToken`. Await token-aware
  operations so expiry can finish child cleanup before the parent returns Failure.
  The parent awaits the child even if it ignores cancellation; this cannot prevent
  that child's late effects. A retained `IEnumerator<NodeStatus>` is a separate
  stateful lifecycle, not an actively awaited script run.

- In an actively awaited Behavior Tree action under `InterrupterNode`, an
  observed successful condition cancels the current top-level `cancellationToken`
  and the parent waits for cooperative completion. Conditions are sampled serially
  with a 100ms delay; work ignoring cancellation cannot be forcibly stopped.
- `EyeAuras.BehaviorTree.Nodes.IBTNode.Reset()` resets quiescent structurally owned
  state after active ticks have fully finished; it is not an await/drain API.
  `InterrupterNode` awaits Action/monitor drain and captured SubTree owner release
  before resetting quiescent Action state, disposing retained `IEnumerator<NodeStatus>`
  through finally and clearing routing/timers. Reset itself does not drain an alias target.
  Graph/project/blackboard/session remain during owned Action cleanup; cleanup faults
  propagate; a captured-release fault keeps target admission closed. A terminal yield alone is not exhaustion.

## Safety Rules

- Use `await` directly when the current script run should wait for the result.
- Pass `cancellationToken` into async APIs whenever the API accepts it.
- Avoid `async void` except for framework-required event handlers.
- Do not start `_ = Task.Run(...)` without a top-level `try/catch`.
- Do not let exceptions escape render callbacks, background tasks, timer
  callbacks, event handlers, or script-owned worker loops.
- Log failures with `Log` in top-level script code or `IFluentLog` in helper
  classes.
- Dispose cancellation sources, subscriptions, windows, renderers, and worker
  owners through `ExecutionAnchors`, `Anchors`, or explicit `using` scopes.
- Do not block ImGui, Blazor, OSD, or hook callbacks with `.Wait()`, `.Result`,
  `Thread.Sleep`, or long synchronous work.

## Keep a subscription or window alive

Registering cleanup and waiting are different operations. `.AddTo(ExecutionAnchors)`
schedules disposal at the end of this Run; it does not keep Run open. If the script
returns after creating a subscription, renderer or window, those anchors dispose
it immediately, even without Stop.

Own the subscription and explicitly await cancellation:

```csharp
using System;
using System.Reactive.Linq;
using System.Threading;
using System.Threading.Tasks;

{
    var runToken = cancellationToken;
    var status = Variables.Get<string>("status");
    using var subscription = status.Listen()
        .Subscribe(value => Log.Info($"Status = {value}"));
    try
    {
        await Task.Delay(Timeout.Infinite, runToken);
    }
    catch (OperationCanceledException) when (runToken.IsCancellationRequested)
    {
        Log.Info("Observation stopped");
    }
}
```

Changes to `status` appear in the log while the script runs. Stop ends the delay,
then `using` releases the subscription. When an operation has its own completion
event, await that instead: the [modeless window example](../IDialogWindowUnstableScriptingApi)
ends on either window close or Stop. Anchoring an owner does not make arbitrary
background Tasks awaited.

## Await an operation in the current run

The host supplies the token in top-level `Script.csx`:

```csharp
var runToken = cancellationToken;
Log.Info("Waiting");
await Task.Delay(1000, runToken);
Log.Info("Completed");
```

Without cancellation, `Completed` appears after the delay. Cancellation raises
`OperationCanceledException`, skipping the code after `await`. Pass the captured
token explicitly to helpers. `await` does not automatically move synchronous work
to another thread.

## Start and await a worker

Capture this run's token before creating the task. The runner clears the global
token when the run finishes and does not automatically await unrelated Tasks:

```csharp
var runToken = cancellationToken;
var worker = Task.Run(async () =>
{
    await Task.Delay(250, runToken);
    Log.Info("Worker completed");
}, runToken);
await worker;
```

The script completes after its worker; cancellation and errors reach the awaiting
code. Await a long-lived loop until Stop instead of leaving it running after the
script returns.

## Handle loop cancellation and errors

If the loop owns diagnostics, handle errors at its outer boundary and still await it:

```csharp
var runToken = cancellationToken;
var worker = Task.Run(async () =>
{
    try
    {
        while (true)
        {
            await Task.Delay(250, runToken);
            Log.Debug("Tick");
        }
    }
    catch (OperationCanceledException) when (runToken.IsCancellationRequested)
    {
        Log.Info("Worker stopped");
    }
    catch (Exception ex)
    {
        Log.Error("Background worker failed", ex);
    }
});
await worker;
```

`Tick` appears while Debug logging is enabled. Stop cancels the delay and produces
`Worker stopped`. If a UI handler requires fire-and-forget, retain the Task in its
owner, handle errors and await it during shutdown. `_ = Task.Run(...)` alone does
not establish that ownership.

## Add Coroutine for a step-based scenario

The package is separate from EyeAuras cancellation:

```csharp
#r "nuget: Coroutine, 2.1.5"
```

Use it for a repeating state machine, retry or timing sequence when appropriate.
Check the API and shutdown rules of `Coroutine 2.1.5`; the directive alone creates
no loop and does not connect it to `cancellationToken`.

## Prefer

- Prefer direct `await` for one-shot operations.
- Prefer cancellation-token-aware APIs.
- Prefer Coroutines for long-running loops, retry sequences, and state-machine
  style workflows.
- Prefer explicit `try/catch` around every fire-and-forget boundary.
- Prefer logging enough context to understand which target, action, window,
  profile, or request failed.

## Avoid

- Avoid unobserved tasks.
- Avoid `async void`.
- Avoid background work that outlives the script owner.
- Avoid blocking UI/render/hook callbacks.
- Avoid assuming exceptions in script background work are isolated from the
  host process.

## Research Anchors

- `async`, `await`, `Task`, `Task.Run`, `OperationCanceledException`,
  `CancellationToken`, `cancellationToken`, `ExecutionAnchors`, `Anchors`,
  `CompositeDisposable`, `IFluentLog`, `Coroutine`.

## Search Synonyms

- async script
- await Script.csx
- fire and forget
- unobserved task exception
- background task
- cancellation token
- script cancellation
- coroutine
- bot loop
- retry loop
- long running script

## Related Maps

- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [scripting/logging.md](/en/scripting/api/scripting/logging)
- [scripting/references-and-resources.md](/en/scripting/api/scripting/references-and-resources)
- [nuget/imgui-sdk.md](/en/scripting/api/nuget/imgui-sdk)
- [recipes/recipe.md](/en/scripting/api/recipes/recipe)
