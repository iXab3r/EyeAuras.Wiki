---
title: AI Scripting: Logging
description: AI-first map for script logging, IFluentLog, helper-class logging, and diagnostic breadcrumbs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, logging, diagnostics
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Script Logging Discovery Map

Reference map for adding useful diagnostic logging to scripts and mini-apps.

## User Intents

- Understand why a script did or did not do something.
- Show selected windows, processes, regions, readers, and config decisions.
- Diagnose missing optional SDK setup, unavailable services, and failed
  validation.
- Make helper classes log without assuming top-level script globals.
- Avoid noisy per-frame or per-entity log spam.

## Concept Model

- Top-level script code has a host-provided `Log` member.
- `Log` is not a global C# API. Ordinary classes do not get it automatically.
- Helper classes should receive `IFluentLog` through a constructor, method
  parameter, property injection, or a DI registration.
- App/library code can create an independent logger with
  `typeof(MyType).PrepareLogger()`.
- For script-owned helpers, passing the script `Log` keeps diagnostics tied to
  the script/runtime context.
- Good logs are breadcrumbs for decisions and failures, not a transcript of
  every loop iteration.

## API Details

- `IFluentLog` - logging interface used across EyeAuras/PoeShared code.
- `FluentLogLevel` - `Trace`, `Debug`, `Info`, `Warn`, `Error`.
- `Log.Debug(...)` - verbose details useful while diagnosing.
- `Log.Info(...)` - normal lifecycle and important state transitions.
- `Log.Warn(...)` - recoverable problems, missing optional data, fallback path.
- `Log.Error(...)` - failed operation or exception that prevents expected work.
- `Log.Error(message, exception)` - keep exception details attached to the log.
- `Log.IsDebugEnabled`, `IsInfoEnabled`, `IsWarnEnabled`, `IsErrorEnabled` -
  guard expensive message construction.
- `Log.Debug(() => expensiveText)` and similar `Func<string>` overloads - lazy
  message construction.
- `Log.Write(level, () => message)` - write when the level is dynamic.
- `Log.IsEnabled(level)` - check dynamic level.
- `Log.WithPrefix(...)` / `Log.WithSuffix(...)` - create scoped loggers for
  helpers, windows, process readers, or selected targets.
- `Log.WithMaxLineLength(...)` / `WithoutMaxLineLength()` - control long output.
- `Log.WithMinLogLevelOverride(...)` - override minimum level for a derived
  logger.
- `Log.WithAction(...)` / `WithLogAction(...)` - mirror log entries into UI,
  in-memory lists, or custom sinks.
- `Log.CreateProfiler(...)` - create an `IDisposable` benchmark timer for a
  named operation.
- `TypeExtensions.PrepareLogger()` - create a logger from a normal C# type.

## Common Flows

### Log From Top-Level Script

```csharp
Log.Info("Starting window selection");

try
{
    var selectedWindow = await osd.PickWindow();
    Log.Info($"Selected window: {selectedWindow.Title} ({selectedWindow.ProcessId})");
}
catch (Exception ex)
{
    Log.Error("Failed to select a window", ex);
}
```

### Pass Log Into A Helper Class

```csharp
var reader = new EntityReader(Log.WithPrefix("EntityReader"));
reader.Refresh();

public sealed class EntityReader
{
    private readonly IFluentLog log;

    public EntityReader(IFluentLog log)
    {
        this.log = log;
    }

    public void Refresh()
    {
        log.Debug("Refreshing entity list");
    }
}
```

### Create A Logger In App Or Library Code

```csharp
public sealed class MyService
{
    private static readonly IFluentLog Log = typeof(MyService).PrepareLogger();

    public void Start()
    {
        Log.Info("Service started");
    }
}
```

### Avoid Expensive Debug Messages

```csharp
Log.Debug(() => entities.DumpToNamedTable("Entities"));

if (Log.IsDebugEnabled)
{
    Log.Debug(BuildLargeDiagnosticsReport());
}
```

## What To Log

- Script start/stop and long-running service start/stop.
- Optional SDK package setup and container extension registration.
- User selections: window title/process id, region, point, color, file path.
- Process/memory reader choice and validation result.
- External resources: loaded DLLs, models, fonts, scripts, embedded resources.
- Configuration values that change behavior.
- Recoverable fallbacks and skipped actions.
- Exceptions with context about what operation failed.
- Cancellation and cleanup paths.

## Prefer

- Prefer `Info` for user-visible lifecycle checkpoints.
- Prefer `Warn` when the script can continue but the result is degraded.
- Prefer `Error(message, ex)` when catching exceptions.
- Prefer prefixes for repeated helpers or multiple attached windows/processes.
- Prefer lazy log messages for tables, dumps, screenshots, or memory scans.
- Prefer passing `IFluentLog` into ordinary helper classes.
- Prefer a few high-signal logs around branches and failures in small scripts.

## Avoid

- Avoid assuming `Log` exists outside the top-level script body.
- Avoid silent catches; log at least the operation and exception message.
- Avoid logging inside tight frame loops, memory scans, or entity loops unless
  the level is guarded or sampling is intentional.
- Avoid logging secrets, auth tokens, license keys, or private user data.
- Avoid turning every state change into an `Info` message.
- Avoid using `PrepareLogger()` inside script helpers when passing the script
  logger would preserve better script context.

## Research Anchors

- `IFluentLog`
- `FluentLogLevel`
- `FluentLogExtensions`
- `PrepareLogger`
- `WithPrefix`
- `WithSuffix`
- `WithAction`
- `WithLogAction`
- `CreateProfiler`
- `AuraScriptSandbox.Log`
- `IAuraScriptSandbox.Log`

## Search Synonyms

- logging
- diagnostics
- debug log
- script log
- event log
- fluent log
- logger injection
- helper class logging
- log prefix
- log level
- exception logging
- diagnostic breadcrumbs

## Related Maps

- `scripting/runtime.md`
- `scripting/container-extensions.md`
- `scripting/project-workflow.md`
- `computer-vision/profiling.md`
- `auras/entities.md`
