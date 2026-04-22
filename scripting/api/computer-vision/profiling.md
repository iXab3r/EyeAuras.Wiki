---
title: AI Computer Vision: Profiling
description: AI-first map for profiling CV and script performance with MiniProfiler.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, computer-vision, profiling, performance
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Profiling / Performance Discovery Map

Reference map for measuring script and computer-vision performance with
MiniProfiler-backed APIs, CV profiling helpers, manual steps, and profiler
output.

## User Intents

- Find why a CV loop is slow.
- Measure image search, OCR, color search, ML search, or pixel processing.
- Compare two implementations.
- Add timings around custom script code.
- Render profiling data as text or custom UI.
- Avoid unbounded profiling memory growth.

## Concept Model

- EyeAuras uses MiniProfiler-style hierarchical timings.
- `ICvAccessor` has a `Profiler` property.
- `EnableProfiling()` enables timing for one CV accessor instance.
- CV operations create internal profiler steps only when profiling is enabled.
- Custom code can use `Profiler.Step("name")` around measured blocks.
- Profiling data is held in memory and should be bounded by scenario/lifetime.
- First calls often include initialization and are slower than steady-state
  calls.

## API Details

- `ICvAccessor.Profiler` - `MiniProfiler` instance associated with the accessor.
- `ICvAccessor.EnableProfiling()` - enables internal CV timings for this
  accessor.
- `MiniProfiler.Step(...)` - creates a timed child step.
- `MiniProfiler.RenderPlainText()` - text report for logs.
- `IProfilerProvider` - shared profiler provider for app/global scenarios.
- `ProfilerProvider.Default` / `ProfilerProvider.Startup` - common app-level
  profiler entry points.
- CV internal step names usually include operation, key, and phase:
  `Renting`, `Preparations`, `Refresh`, `Resolution`, `OSD`.

## Common Flows

### Profile CV Loop

1. Create a CV accessor for the target window/source.
2. Call `EnableProfiling()` on that accessor.
3. Wrap each loop iteration in `Profiler.Step("Loop #...")`.
4. Let CV calls add their own internal child steps.
5. Render or inspect `Profiler` output after a bounded run.

### Profile Custom Work

1. Choose an existing profiler or create/resolve a shared one.
2. Wrap expensive blocks in `using (profiler.Step("Meaningful step name"))`.
3. Keep step names stable enough for aggregation.
4. Compare warm-up and steady-state timings separately.

### Compare Implementations

1. Run one warm-up pass if the API/model/image pipeline initializes lazily.
2. Run candidate implementations under named profiler steps.
3. Compare average/min/max/percentile data, not only one sample.
4. Check memory allocations and data movement when CPU timings look surprising.

## Performance Notes

- First CV/ML calls may include model creation, capture initialization, image
  allocation, or OCR engine setup.
- Direct memory/span access can be much faster than per-pixel accessor APIs.
- OSD/debug drawing is useful but should be measured separately from detection.
- Profiling every iteration forever can become expensive.
- Profilers store timing trees in memory; long-running mini-apps should bound
  retention or periodically reset/report.

## Prefer

- Prefer `EnableProfiling()` before writing custom timers for CV APIs.
- Prefer stable step names for aggregating repeated loop timings.
- Prefer measuring warm-up separately from steady-state loops.
- Prefer `RenderPlainText()` for quick logs and custom renderers for dashboards.
- Prefer targeted profiling around suspected slow blocks.

## Avoid

- Avoid profiling unbounded loops indefinitely.
- Avoid comparing first-call initialization with steady-state work.
- Avoid measuring input/mouse/OSD time as part of pure CV detection time unless
  that is intentional.
- Avoid one-off timing conclusions from a single iteration.
- Avoid expensive logging inside tight loops when measuring performance.

## Research Anchors

- `ICvAccessor`
- `EnableProfiling`
- `MiniProfiler`
- `MiniProfiler.Step`
- `RenderPlainText`
- `IProfilerProvider`
- `ProfilerProvider`
- `ImageSearchRaw`
- `ColorCheckRaw`
- `PixelSearchRaw`
- `TextSearchRaw`
- `CountPixels`
- `ProcessPixels`
- `MLSearchRaw`

## Search Synonyms

- profiling
- performance
- MiniProfiler
- profiler step
- CV profiler
- render plain text
- image search timing
- pixel processing performance
- first call warmup
- steady state
- percentile
- profiling memory

## Related Maps

- `computer-vision/images.md`
- `ml/ai.md`
- `osd/screen-overlay.md`
- `scripting/runtime.md`
