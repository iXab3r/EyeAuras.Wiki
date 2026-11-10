---
title: "Edit an exported project with an explicit helper"
description: "Move counter formatting into an ordinary C# class, edit the exported solution and run the imported result in EyeAuras."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Edit an exported project with an explicit helper

Use IDE navigation for a two-file project while EyeAuras remains the execution host. An ordinary helper formats known values and receives its logger through a constructor.

You need an editable **C# Script**, a C# IDE for the generated solution, and a dedicated empty export directory. Do not use a directory holding unrelated files: **Export... clears its files and subdirectories, retaining `.git`.**

1. Create your own aura `RecipeIde` with **Actions → On Enter → C# Script** for manual Run. Replace **Script.csx** below. Through **New file → C# Class**, create `CounterFormatter.cs` and replace the generated class completely. Keep namespace `RecipeIde` in that file and its matching import in the script.
2. Wait for compilation and click **Run** in EyeAuras. The action's **Event Log** should show `Counter: 001`, `Counter: 002`, `Counter: 003`, separated by 500 ms waits. Stop during a wait ends this finite run without adding the remaining reports.
3. Choose **Export...** and the dedicated empty directory. Open the generated `.sln` in your IDE. Keep the **actual exported project names, `.csproj` files, SDK/reference entries and NuGet configuration**; do not replace them with a hand-written minimal project.
4. In `CounterFormatter.cs` on disk, change only the displayed prefix `Counter:` to `Sample:` and save. In EyeAuras choose **Import...**, select that exported `.sln`, and wait for synchronization and diagnostics. Import replaces the project with the disk contents, so first save any EyeAuras-only changes you need.
5. Click **Run in EyeAuras** again. Seeing `Sample: 001` through `Sample: 003` identifies the helper version that returned from disk. An IDE build alone does not run this script host.

## Script.csx

```csharp
using System;
using System.Threading.Tasks;
using RecipeIde;

{
    var formatter = new CounterFormatter(Log);
    try
    {
        for (var value = 1; value <= 3; value++)
        {
            formatter.Report(value);
            await Task.Delay(500, cancellationToken);
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
}
```

## CounterFormatter.cs

```csharp
using PoeShared.Logging;

namespace RecipeIde;

public sealed class CounterFormatter
{
    private readonly IFluentLog log;

    public CounterFormatter(IFluentLog log)
    {
        this.log = log;
    }

    public void Report(int value)
    {
        log.Info($"Counter: {value:D3}");
    }
}
```


| Part | Responsibility |
| --- | --- |
| `Script.csx` | Top-level entry point; owns the loop and current-run cancellation token. |
| `new CounterFormatter(Log)` | Explicitly passes the host logger to an ordinary class. |
| `CounterFormatter.cs` | Compiles as project support code; has no implicit `Log`, `AuraTree` or `cancellationToken` globals. |
| Exported `.csproj` | Preserves the generated compilation environment and references. Its name is determined by your actual export. |

For repeated edits, choose **Live Import / Live...** for that solution, save externally, wait for the project update and deliberately Stop/Run in EyeAuras. Imported files may be shown as **Read-only** in EyePad; that is an external editing surface. **CompileOnce** disables import and file monitoring, so use an editable copy with that mode off.

Synchronization goes from disk into the project; it does not merge two edit sets or preserve all running state. Use a compatible SDK if you build the generated solution externally, then still inspect EyeAuras diagnostics. [IDE integration](/en/scripting/ide-integration) explains exclusions and ownership; [script entry context](/en/scripting/getting-started) explains why the helper receives dependencies explicitly.
