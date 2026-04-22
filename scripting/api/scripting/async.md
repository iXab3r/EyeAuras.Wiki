---
title: AI Scripting Async
description: AI-first map for async/await, background work, cancellation, and coroutine-style flows in EyeAuras scripts.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, async, coroutine
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
  often a safer and simpler alternative to ad-hoc background `Task` code.

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

## Common Flows

Await a single operation:

```csharp
var window = await osdSelectionService.PickWindow();
Log.Info($"Selected PID {window.ProcessId}");
```

Start background work safely:

```csharp
_ = Task.Run(async () =>
{
    try
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            await Task.Delay(250, cancellationToken);
            Log.Debug("Tick");
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
        // Normal script stop.
    }
    catch (Exception ex)
    {
        Log.Error("Background worker failed", ex);
    }
}, cancellationToken);
```

Use Coroutines for step-based loops:

```csharp
#r "nuget: Coroutine, 2.1.5"
```

Use coroutine-style code when the workflow is a repeating state machine, bot
loop, retry flow, or animation/timing sequence. Prefer it over a loose pile of
background tasks when the script needs predictable stepping, cancellation, and
error boundaries.

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

- `scripting/runtime.md`
- `scripting/logging.md`
- `scripting/references-and-resources.md`
- `nuget/imgui-sdk.md`
- `recipes/recipe.md`
