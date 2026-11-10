---
title: Performance and Memory Profiler
description: Documentation for the performance and memory profiler.
published: false
date: 2024-05-14T19:49:19.852Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T14:55:28.895Z
---
# Record a performance profile or memory snapshot

When EyeAuras is slow during a workload you own, collect a profile of that interval to inspect what its process was doing. For steadily growing memory, collect a memory snapshot instead. Timing and retained objects answer different questions.

| Tool | Use it for |
| --- | --- |
| `Settings → Profiler` | Whole-process CPU/performance recording through JetBrains dotTrace. |
| Memory snapshot | Object-memory investigation through dotMemory, if your settings editor exposes the action. |
| Lower `Profiler` panel | MiniProfiler timings from explicitly instrumented code. This panel is registered with alpha access. |
| CV preview FPS tooltip | Capture/effects/analysis timings for one trigger. |

The JetBrains tools can download prerequisites on first use, add load and create large files. Memory snapshots can contain process data; review what you intend to share.

## Record your own image-search workload

Use an existing aura that captures your own [test window](/en/triggers/images/imagecapturetriggers) and searches without input actions. Keep the same region, frequency and effects that reproduce the slowdown.

1. Open **Settings → Profiler** and click **Start profiling**. Wait for **Collecting**: prerequisite preparation and attachment can precede actual collection.
2. Let that same workload run and note when a delay occurs. Start with a short reproducible interval; a gradually developing problem may need 10–30 minutes.
3. Click **Stop profiling**. Wait while EyeAuras saves an archive and detaches, then check **Idle**. **Running** means attached and does not by itself mean data is still being collected.
4. Find the created **Performance-PID…** archive in `traces` under this EyeAuras instance's application-data folder. Saving logs the actual path.
5. If preparing a support request, open **Report a problem** and inspect its files. Creating a capture or opening this dialog does not submit it; **Send** is a separate action in [problem reports](/en/features/problem-reports).

Your result is a local archive for the recorded interval, not an automatic diagnosis or a separate GPU profile. An interval without the slowdown does not establish that the problem cannot occur.

| State or control | Meaning |
| --- | --- |
| `Start profiling` | Prepare, attach dotTrace and begin collecting. |
| `Collecting` | Collection is active; keep the intended workload. |
| `Stop profiling` | Save data, create its archive and detach. |
| `Running` | Profiler attached; distinct from collecting. |
| `Idle` | Recording stopped. Check the file before treating the capture as saved. |

## If memory keeps growing

The earlier WPF settings editor exposed **Take memory snapshot** beside profiling controls. It creates a **Memory-PID…** `.dmw` under `traces`. The current Blazor **Settings → Profiler** row exposes performance start/stop, without that memory button.

If your version provides the snapshot action:

1. Wait until abnormal growth is visible under the same workload.
2. Take one snapshot and wait for completion. The application can slow or pause for a substantial time; duration depends on the capture.
3. Check the `.dmw` in `traces` and the corresponding prepared report item.

A snapshot does not terminate the application or automatically free retained objects.

<details>
<summary>Earlier recording and reporting interface</summary>

These images show the earlier WPF controls and the relationship between captures and report files, rather than the current settings layout.

![Profiling files offered in the earlier problem-report dialog](https://i.imgur.com/GVmE825.png)
![Starting and stopping a performance capture in earlier settings](https://i.imgur.com/W97u6Ku.png)
![The memory-snapshot action in the earlier editor](https://i.imgur.com/OrOAW7G.png)

If a capture is too large for **Send**, agree on a transfer method through [support contacts](/en/contacts) before sharing a selected file. Google Drive or another storage service is an alternative only when you choose to upload it. Earlier instructions named Discord `Xab3r#3780` and Telegram `ixab3r`; use the contacts page for the current route. Preparing a capture does not require publishing it to cloud storage.

</details>

## Inspect individual instrumented timings

When the lower **Profiler** panel is available, select **Tree** or **Text**. Opening it does not start sampling arbitrary methods.

| View or operation | What it shows |
| --- | --- |
| `Tree` | The **Startup** timing tree: step name, duration in **ms**, and percentage relative to the root. Parent durations include child time; the percentage is not CPU load. |
| `Text` | A snapshot of all registered named profiles at refresh time. The circular-arrow button refreshes the text. |
| Instrumentation | Application or script code creates the timing steps. Repeated names are not automatically averaged across runs. |
| Reset/history | There is no working clear-history control in this component. Refreshing neither resets previous steps nor defines a fresh measured interval. |

For a bounded measurement, use the [CV profiling example](/en/scripting/examples/advanced/profiling-cv). For a quick trigger check, inspect its preview FPS tooltip. Neither view is a continuously updated inventory of every CPU/GPU operation.

Files in `traces` are temporary and subject to cleanup. Keep a separate copy before waiting for support. Report preparation can offer recent captures with the newest selected; inspect the selection instead of assuming every old capture is attached or sent.
