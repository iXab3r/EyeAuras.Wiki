---
title: AI Core: Profiling
description: AI-first map for MiniProfiler timings, JetBrains dotTrace/dotMemory captures, and profiling workflows.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, profiling, performance, diagnostics, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Profiling Discovery Map

Reference map for choosing between EyeAuras MiniProfiler instrumentation and
JetBrains whole-process profiling, then finding the right API, UI, and support
workflow.

## User Intents

- Find why startup, module loading, aura tree loading, or config saving is slow.
- Measure script, CV, ML, input, overlay, or custom helper code.
- Add local timing steps around a suspected slow block.
- Compare warm-up and steady-state behavior.
- Collect a full CPU/performance trace when the whole app lags.
- Collect a memory snapshot when the process grows over time.
- Prepare files that can be attached to a problem report.

## Concept Model

- EyeAuras uses two different profiling families.
- MiniProfiler is an in-process timing tree from
  [MiniProfiler for .NET](https://miniprofiler.com/dotnet/). It records named
  steps such as startup phases, module loads, CV calls, script loops, and custom
  code blocks.
- MiniProfiler data is lightweight enough for targeted diagnostics, but it is
  still stored in memory and should be bounded or cleared for long-running
  loops.
- JetBrains profiling uses
  [JetBrains.Profiler.SelfApi](https://www.nuget.org/packages/JetBrains.Profiler.SelfApi)
  to let the running app collect dotTrace and dotMemory snapshots of itself.
- JetBrains dotTrace is for whole-process CPU/performance investigation:
  stalls, high CPU, frozen UI, slow startup, or a problem that cannot be
  isolated by a few manual timing steps.
- JetBrains dotMemory is for memory growth, leaks, retained objects, and large
  allocation investigations.
- JetBrains captures can be large and can affect responsiveness while they are
  being collected.

## Zones Of Application

### MiniProfiler

Use MiniProfiler when the code path is known or can be narrowed to a script,
service, CV operation, startup section, module load, config save, or UI action.

Good fits:

- "Which part of this loop is slow?"
- "Is image search slow, or is OSD/input slow?"
- "Did startup spend time loading modules, aura tree config, or WebView?"
- "How long did this config save take, and why was it triggered?"
- "Can I compare two script implementations over hundreds of iterations?"

MiniProfiler is not a replacement for a CPU sampler. It tells you how long
instrumented named blocks took. It does not automatically explain every method
called inside those blocks unless code adds more steps.

### JetBrains dotTrace

Use JetBrains dotTrace when the app itself is sluggish or CPU-heavy and the slow
area is not yet obvious.

Good fits:

- EyeAuras freezes or becomes laggy during normal use.
- CPU usage is high but no single script block is suspected.
- Startup or module load is slow and MiniProfiler only shows a broad phase.
- The problem appears only after 10-30 minutes of normal automation.
- A support report needs a performance capture that can be opened in dotTrace.

### JetBrains dotMemory

Use JetBrains dotMemory when memory keeps growing or a large retained-object
graph must be inspected.

Good fits:

- Working set grows while the same aura pack keeps running.
- A script, overlay, CV accessor, module, or window appears to keep old objects
  alive.
- Memory usage is already much higher than normal and a support snapshot is
  needed.
- A reproduction requires inspecting object retention rather than timing.

## API Details

- `StackExchange.Profiling.MiniProfiler` - underlying MiniProfiler type.
- `MiniProfiler.Step(string name)` - creates a timed child step; timing stops
  when the returned `IDisposable` is disposed.
- `MiniProfiler.Ignore()` - suppresses nested timings for a block that should
  not be recorded.
- `MiniProfiler.RenderPlainText()` - renders timing data as plain text.
- `IProfilerProvider.GetOrAdd(string name)` - retrieves a named shared
  profiler.
- `IProfilerProvider.EnumerateProfilers()` - returns shared profilers for UI or
  reporting.
- `ProfilerProvider.Default` - normal app-level shared profiler.
- `ProfilerProvider.Startup` - long-lived startup profiler used during app
  initialization.
- `ProfilerProvider.Create(string name = default)` - creates an isolated
  MiniProfiler with memory-cache storage.
- `MiniProfilerExtensions.StepInfo(...)` - wraps `Step(...)` and writes an
  `Info` log with elapsed milliseconds when disposed.
- `MiniProfilerExtensions.StepDebug(...)` - wraps `Step(...)` and writes a
  `Debug` log with elapsed milliseconds when disposed.
- `MiniProfilerExtensions.Clear(...)` - clears `MemoryCacheStorage`, not the existing profiler's timing tree.
- `ICvAccessor.EnableProfiling()` - enables internal CV steps for one accessor.
- `ICvAccessor.Profiler` - MiniProfiler associated with one CV accessor.
- `MiniProfilerViewer` / `IMiniProfilerViewer` - in-app tree/text viewer for
  MiniProfiler data.
- `JetBrains.Profiler.SelfApi.DotTrace` - starts, saves, archives, and detaches
  performance profiling sessions.
- `JetBrains.Profiler.SelfApi.DotMemory` - creates memory snapshots.
- `PoeShared.Profiler.IProfilerService` - desktop service wrapping dotTrace/dotMemory; the Web host has a separate `IPerformanceProfilerService`.
- `ProfilerController` - web endpoints for status, `startProfiling`,
  `stopProfiling`, and `takeSnapshot`.
- `IProfilerViewModel` - UI-facing profiler state/commands used by Settings and
  the compact title-bar profiler control.

## Common Flows

### Add MiniProfiler Steps In App Code

Insert this in an existing startup phase where `auraTreeConfigManager` is the injected tree manager and `Log` is the service logger. It is an instrumentation fragment, not a standalone script.

```csharp
using (ProfilerProvider.Startup.StepInfo(Log, "Loaded aura tree config"))
{
    await auraTreeConfigManager.Load();
}
```

Use `ProfilerProvider.Startup` for startup and first-load phases. Use
`StepInfo` or `StepDebug` when the duration should also appear in logs.

### Add MiniProfiler Steps In A Script

```csharp
using StackExchange.Profiling;
using EyeAuras.Shared.Services;

var profilerProvider = ProfilerProvider.Instance;
var profiler = profilerProvider.GetOrAdd("My pack / Farm loop");

using (profiler.Step("Loop iteration"))
{
    using (profiler.Step("Read state"))
    {
        await Task.Delay(20, cancellationToken);
    }

    using (profiler.Step("Choose action"))
    {
        await Task.Delay(10, cancellationToken);
    }
}

Log.Info(profiler.RenderPlainText());
```

The top-level script logs a timing tree with two awaited delays. Replace them with your operations. `GetOrAdd` reuses the named profiler; use `ProfilerProvider.Create("One run")` for an isolated run without previous history.

### Profile A CV Loop

Create a CV accessor for a specific window or screen, then call
`EnableProfiling()`. Wrap your own work with `cv.Profiler.Step("...")`;
internal steps measure the accessor's phases. See the complete setup in
[CV profiling](../computer-vision/profiling). Check a nullable detection result
and its coordinate space before using it for input.


`EnableProfiling()` records internal CV phases such as renting, preparation,
refresh, model/search work, and OSD. Add your own steps around non-CV work so
the final report separates detection from input, sleeps, logging, and UI.

### Inspect MiniProfiler Data In The App

1. Add or use existing `ProfilerProvider.Startup`, `ProfilerProvider.Default`,
   `ICvAccessor.Profiler`, or named `IProfilerProvider` steps.
2. Open the in-app profiler panel when available.
3. Use Tree view for parent/child timing shape.
4. Use Text view or `RenderPlainText()` when the result should be copied into
   logs or a report.
5. Use a separate profiler for each bounded interval in long-running scenarios.

### Collect A JetBrains Performance Capture

1. Open Settings and use **Start profiling**, or use the registered desktop profiler service. Web profiler endpoints collect the Web process.
2. Reproduce the lag while profiling is collecting. For support captures,
   10-30 minutes is usually enough.
3. Click **Stop profiling**. EyeAuras saves a `Performance-PID...` archive under
   the app `traces` folder.
4. Attach the generated file through **Report a problem**, or share it by cloud
   storage if it is too large.

### Collect A JetBrains Memory Snapshot

1. Wait until memory usage is already clearly abnormal.
2. Use the memory snapshot action in the profiler/report workflow, or use the desktop profiler service. The Web `takeSnapshot` endpoint snapshots the Web process.
3. EyeAuras saves a `Memory-PID...` dotMemory workspace under the app `traces`
   folder.
4. Expect the app to pause or slow down while the snapshot is being written.
5. Attach the generated file to the problem report.

## Practical Examples

- Startup takes 40 seconds: inspect `ProfilerProvider.Startup` in Tree view,
  then add `StepInfo` around the broad section that still looks opaque.
- A CV aim loop feels slow: call `EnableProfiling()`, wrap each loop iteration,
  and add separate steps for ML search, OSD, mouse movement, click, and sleeps.
- A config save blocks the UI: use `Log.CreateProfiler(...)` or
  `ProfilerProvider.Default.Step(...)` around serialization, disk write, and
  change-reason aggregation.
- A pack works for an hour and then lags: use MiniProfiler first if a loop is
  suspected; switch to dotTrace if the entire process is slow and the culprit is
  unknown.
- Memory grows from 500 MB to several GB: collect a dotMemory snapshot when the
  growth is visible; MiniProfiler timing data will not explain object retention.
- A module load is slow only on one machine: use startup MiniProfiler steps for
  local structure and dotTrace capture if the slow section needs method-level
  CPU detail.

## Performance Notes

- MiniProfiler step names should be stable enough to compare repeated runs.
- Measure warm-up separately from steady state; first CV/ML/OCR calls often load
  models, native libraries, capture resources, or caches.
- Avoid logging inside every tight-loop step while measuring performance unless
  the logging overhead is part of the scenario.
- MiniProfiler data lives in memory. For long-running loops, render summaries,
  clear old data, or keep profiling windows bounded.
- JetBrains captures are support-grade diagnostics. They are more complete than
  MiniProfiler but heavier to collect and inspect.
- dotTrace explains CPU/time across the process; dotMemory explains heap
  retention and allocations. Use the profiler that matches the symptom.

## Prefer

- Prefer MiniProfiler for targeted code-path timing.
- Prefer `EnableProfiling()` for CV APIs before writing custom timers around
  every CV call.
- Prefer named shared profilers for multi-script or multi-service scenarios.
- Prefer `StepInfo` / `StepDebug` when the step duration should also be in logs.
- Prefer dotTrace for whole-process lag, high CPU, or unknown slowdowns.
- Prefer dotMemory for leaks, retained objects, and unexplained memory growth.
- Prefer reproducing the user's normal workload while collecting JetBrains
  captures.

## Avoid

- Avoid treating MiniProfiler as an always-on unbounded telemetry store.
- Avoid drawing conclusions from only the first warm-up iteration.
- Avoid profiling OSD, input, sleeps, and detection as one unnamed block when
  comparing CV algorithms.
- Avoid taking dotMemory snapshots before the memory problem is visible.
- Avoid collecting long dotTrace sessions when a short, focused reproduction is
  available.
- Avoid sending profiler archives through the normal report upload when they are
  too large; use cloud storage and share a link instead.

## Research Anchors

- `MiniProfiler`
- `StackExchange.Profiling`
- `MiniProfiler.Step`
- `MiniProfiler.Ignore`
- `MiniProfiler.RenderPlainText`
- `IProfilerProvider`
- `ProfilerProvider`
- `ProfilerProvider.Startup`
- `ProfilerProvider.Default`
- `MiniProfilerExtensions`
- `StepInfo`
- `StepDebug`
- `Clear`
- `MiniProfilerViewer`
- `MiniProfilerTreeView`
- `MiniProfilerTiming`
- `ICvAccessor.EnableProfiling`
- `ICvAccessor.Profiler`
- `JetBrains.Profiler.SelfApi`
- `DotTrace`
- `DotMemory`
- `IPerformanceProfilerService`
- `ProfilerController`
- `IProfilerViewModel`

## Search Synonyms

- profiler
- profiling
- performance profiling
- memory profiling
- MiniProfiler
- StackExchange.Profiling
- profiler step
- timing tree
- startup profiler
- CV profiler
- RenderPlainText
- JetBrains profiler
- dotTrace
- dotMemory
- SelfApi
- performance snapshot
- memory snapshot
- traces folder
- report a problem profiler files

## Related Maps

- [computer-vision/profiling.md](/en/scripting/api/computer-vision/profiling)
- [scripting/logging.md](/en/scripting/api/scripting/logging)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [core/app-modules.md](/en/scripting/api/core/app-modules)
- [core/blazor.md](/en/scripting/api/core/blazor)
- [../../../features/profiler.md](/en/features/profiler)
- [../../examples/advanced/profiling-cv.md](/en/scripting/examples/advanced/profiling-cv)
- [MiniProfiler .NET docs](https://miniprofiler.com/dotnet/)
- [MiniProfiler profile-code docs](https://miniprofiler.com/dotnet/HowTo/ProfileCode)
- [MiniProfiler GitHub repository](https://github.com/MiniProfiler/dotnet)
- [JetBrains dotTrace API reference](https://www.jetbrains.com/help/profiler/API_Reference.html)
- [JetBrains dotMemory self-profiling API](https://www.jetbrains.com/help/dotmemory/Profiling_Guidelines__Advanced_Profiling_Using_dotTrace_API.html)


## Verified host boundaries

The pinned dependencies are MiniProfiler 4.3.8 and JetBrains.Profiler.SelfApi
2.2.0. Their XML contracts confirm that `Step` times until disposal, `Ignore`
scopes suppression, `SaveData` saves and stops collection, and the collected
snapshot archive includes its index files. `EnsurePrerequisiteAsync` can download
the profiler tools; it is not merely a local availability check.

Desktop `PoeShared.Profiler.IProfilerService` exposes `StartProfiling()`,
`StopCollecting()`, and `TakeMemorySnapshot()` as tasks. Its stop operation saves,
archives, and detaches. The Web `ProfilerController` routes are `/profiler`,
`/profiler/startProfiling`, `/profiler/stopProfiling`, and
`/profiler/takeSnapshot`; they operate on the **Web process**, not an arbitrary
desktop instance. Command routes require Admin authorization. Availability
still depends on the deployed Web host and profiler prerequisites.

[Desktop implementation](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Wpf/Profiler/PerformanceProfiler.cs) · [Web controller](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Web/Controllers/ProfilerController.cs).
