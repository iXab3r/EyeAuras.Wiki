---
title: AI Core Logging
description: AI-first map of EyeAuras and PoeShared logging APIs, fluent logs, log4net bridges, and script log routing.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, logging, diagnostics
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Logging Discovery Map

Reference map for EyeAuras/PoeShared logging, fluent log helpers, log4net
integration, Microsoft logging bridges, script event logging, and lightweight
timing logs.

## User Intents

- Add useful diagnostics to app services, modules, scripts, and helper classes.
- Decide whether a message should go to normal app logs or script event logs.
- Attach prefixes/suffixes for multi-window, multi-session, or helper-specific
  logging.
- Log exceptions without losing stack traces or operation context.
- Avoid expensive diagnostic string construction when a level is disabled.
- Add simple elapsed-time breadcrumbs around suspect operations.
- Bridge between `IFluentLog`, log4net, and `Microsoft.Extensions.Logging`.

## Concept Model

- EyeAuras app logging is built around log4net and wrapped by
  `PoeShared.Logging.IFluentLog`.
- `IFluentLog` is the preferred diagnostic surface in EyeAuras/PoeShared code.
  It exposes level checks, string and lazy-message overloads, exception
  overloads, and derived loggers with prefixes/suffixes.
- `typeof(MyType).PrepareLogger()` creates a normal type logger backed by
  log4net. These messages go through configured app appenders such as files,
  trace listeners, observable appenders, or console appenders.
- A top-level Aura script gets a different script-level logger through
  `AuraScriptSandbox.Log`. `AuraScriptRunner<TSandbox>` registers that
  `IFluentLog` in the script child container and forwards messages into
  `AuraEventCategory.Script`, so they appear in the EyeAuras event viewer.
- Ordinary C# helper classes do not automatically get top-level script members.
  Pass `IFluentLog` explicitly or resolve it from the relevant DI container.
- `IFluentLog.WithPrefix(...)` and `WithSuffix(...)` create cheap derived
  loggers for context. Use them for session ids, process ids, windows, readers,
  modules, or service instances.
- Lazy overloads such as `Debug(() => expensiveDump)` only evaluate the message
  when the effective level is enabled.
- Effective enablement depends on both the underlying writer capability and the
  fluent minimum-level settings or override.
- `BenchmarkTimer` and `Log.CreateProfiler(...)` are lightweight log-based
  timing helpers. Use MiniProfiler for structured profiling trees and this
  timer for local diagnostic breadcrumbs.

## Host And Runtime Contexts

- App/module/service code: use a type logger from `PrepareLogger()`, inject
  `IFluentLog`, or inherit from `DisposableReactiveObjectWithLogger` for a lazy
  protected `Log` property.
- Top-level Aura scripts: use the provided `Log` member for messages that
  should show in the script event stream.
- Script-owned helper classes: pass `Log`, `Log.WithPrefix(...)`, or the
  script-container `IFluentLog` into the helper so diagnostics stay attached to
  the script/event-viewer route.
- Library/helper code that is not script-owned: create a type logger with
  `typeof(MyType).PrepareLogger()` and treat it as normal app logging.
- ASP.NET Core or other `Microsoft.Extensions.Logging` consumers: use
  `FluentLogger`, `Log4NetLoggerProvider`, or `Log4NetLoggerFactory` when a
  bridge is needed.

## API Details

- `IFluentLog` - fluent logging interface used by EyeAuras/PoeShared code.
- `FluentLogLevel` - `Trace`, `Debug`, `Info`, `Warn`, `Error`; trace-level
  dynamic writes are treated as debug by the current fluent helpers/adapters.
- `Log.Debug(...)`, `Info(...)`, `Warn(...)`, `Error(...)` - level-specific
  writes with string, lazy `Func<string>`, and exception overloads.
- `Log.Error(message, exception)` - attach exception details to failed
  operations.
- `Log.IsDebugEnabled`, `IsInfoEnabled`, `IsWarnEnabled`, `IsErrorEnabled` -
  level checks for manual guards.
- `Log.IsEnabled(FluentLogLevel)` - dynamic level check.
- `Log.Write(level, () => message)` - dynamic level write with lazy message
  construction.
- `Log.WithPrefix(...)` / `WithSuffix(...)` - derived loggers with contextual
  message text.
- `Log.AddPrefix(...)` / `AddSuffix(...)` - mutate the logger's current log
  data; prefer derived loggers when sharing a logger across code paths.
- `Log.WithMaxLineLength(...)` / `WithoutMaxLineLength()` - control truncation
  of very long messages.
- `Log.WithMinLogLevelOverride(...)` - set an effective minimum level on a
  derived logger.
- `Log.WithAction(...)` / `WithLogAction(...)` - mirror log writes into a UI,
  in-memory buffer, event stream, or custom sink while still writing to the
  original writer.
- `Log.CreateChildCollectionLogWriter(...)` - append formatted log messages to
  a DynamicData source list.
- `Log.CreateProfiler(...)` - create a `BenchmarkTimer` tied to a logger.
- `BenchmarkTimer` - records named steps, optional per-step logs, optional
  disposal summary, log-level selection, conditions, and elapsed thresholds.
- `TypeExtensions.PrepareLogger(Type, string name = default)` - create a
  log4net-backed fluent logger for a type's assembly and name.
- `Log4NetExtensions.ToFluent()` - wrap a log4net `ILog` as `IFluentLog`.
- `Log4NetAdapter` - writes fluent log data to log4net and sets thread context
  metadata.
- `SharedLog` - application logging bootstrap, app info dump, log-level switch,
  immediate-flush switch, trace appender, console appender, and local file
  appender helpers.
- `ObservableAppender` - log4net appender that exposes log events as an
  observable stream.
- `FluentLogger` - adapts one `IFluentLog` to
  `Microsoft.Extensions.Logging.ILogger`.
- `Log4NetLoggerProvider` / `Log4NetLoggerFactory` - create Microsoft loggers
  backed by log4net categories.
- `AuraScriptRunner<TSandbox>` - creates the script event logger and registers
  it as the script container `IFluentLog`.
- `AuraScriptSandbox.Log` / `IAuraScriptSandbox.Log` - script-level fluent log
  exposed to top-level script code.

## Common Flows

### Create A Service Type Logger

```csharp
public sealed class SessionManager
{
    private static readonly IFluentLog Log = typeof(SessionManager).PrepareLogger();

    public void Start()
    {
        Log.Info("Session manager started");
    }
}
```

Use this for normal app/service diagnostics that should go through configured
app logging appenders.

### Pass Script Logging Into A Helper

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

Passing the top-level script `Log` keeps helper messages in the script event
viewer route. Creating `typeof(EntityReader).PrepareLogger()` would use normal
app logging instead.

### Resolve The Script Container Logger

```csharp
var log = GetService<IFluentLog>().WithPrefix("Worker");
log.Info("Worker initialized");
```

In an Aura script context this resolves the logger registered by
`AuraScriptRunner<TSandbox>`, so it follows the same script-level event route as
the top-level `Log` member.

### Add Context For Multi-Session Diagnostics

```csharp
var sessionLog = Log
    .WithPrefix($"Session {session.Id}")
    .WithSuffix(() => session.ProcessId?.ToString() ?? "no process");

sessionLog.Info("Attaching to selected window");
```

Use prefixes/suffixes instead of baking context into every message by hand.

### Guard Expensive Dumps

```csharp
Log.Debug(() => entities.DumpToNamedTable("Entities"));

if (Log.IsDebugEnabled)
{
    Log.Debug(BuildLargeDiagnosticsReport());
}
```

The lazy overload is the usual first choice. Manual guards are useful when the
expensive work has side effects or returns several messages.

### Time A Local Operation

```csharp
using var timer = Log.CreateProfiler("Attach session")
    .WithLoggingOnDisposal()
    .WithMinElapsedThreshold(TimeSpan.FromMilliseconds(100));

timer.Step("Selected window");
var process = processProvider.Open(window);
timer.Step(() => $"Opened process {process.Id}");
```

Use `BenchmarkTimer` for local diagnostic breadcrumbs. Use MiniProfiler when
you need a structured timing tree or user-facing profiling report.

## What To Log

- Startup/shutdown and long-running service lifecycle.
- User selections such as windows, processes, regions, files, and profiles.
- External resources such as DLLs, models, scripts, embedded files, and fonts.
- Process/memory backend choices and validation results.
- Config load/save, migration, fallback, and reset decisions.
- Optional SDK setup and container extension registration.
- Authorization, licensing, and permission decisions without secret values.
- Recoverable fallbacks and skipped actions.
- Caught exceptions with operation context.
- Cancellation and cleanup paths.

## Prefer

- Prefer `IFluentLog` over ad hoc `Console.WriteLine` or `Debug.WriteLine`.
- Prefer `Info` for important lifecycle checkpoints.
- Prefer `Debug` for detailed diagnostics that are useful during investigation.
- Prefer `Warn` for degraded behavior that can continue.
- Prefer `Error(message, ex)` when an expected operation failed.
- Prefer passing a caller-owned logger when a helper should log into the
  caller's context.
- Prefer type loggers for app-owned services with independent diagnostics.
- Prefer lazy log messages for tables, dumps, screenshots, memory reads, and
  other expensive formatting.
- Prefer prefixes/suffixes for repeated helpers, sessions, windows, and
  process-bound services.

## Avoid

- Avoid assuming top-level script `Log` is available in ordinary C# classes.
- Avoid accidentally using `PrepareLogger()` when the message is expected in
  the script event viewer.
- Avoid silent catches; log the operation and exception.
- Avoid tight-loop, per-frame, or per-entity log spam without sampling or
  level guards.
- Avoid logging secrets, keys, auth tokens, passwords, or private license data.
- Avoid mutating a shared logger with `AddPrefix` / `AddSuffix` when a derived
  logger from `WithPrefix` / `WithSuffix` would be safer.

## Research Anchors

- `IFluentLog`
- `FluentLogLevel`
- `FluentLogExtensions`
- `FluentLogBuilder`
- `TypeExtensions.PrepareLogger`
- `Log4NetExtensions.ToFluent`
- `Log4NetAdapter`
- `SharedLog`
- `ObservableAppender`
- `FluentLogger`
- `Log4NetLoggerProvider`
- `Log4NetLoggerFactory`
- `BenchmarkTimer`
- `AuraScriptRunner<TSandbox>`
- `AuraScriptSandbox.Log`
- `IAuraScriptSandbox.Log`

## Search Synonyms

- logging
- diagnostics
- fluent log
- app log
- script log
- event viewer
- log4net
- logger injection
- log prefix
- log suffix
- log level
- exception logging
- benchmark timer
- diagnostic breadcrumbs

## Related Maps

- `core/profiling.md`
- `core/app-runtime-contexts.md`
- `core/app-modules.md`
- `scripting/logging.md`
- `scripting/runtime.md`
- `scripting/container-extensions.md`
- `computer-vision/profiling.md`
