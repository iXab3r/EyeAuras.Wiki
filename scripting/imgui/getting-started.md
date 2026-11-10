---
title: ImGui - Getting started
description: 
published: true
date: 2026-02-14T16:30:30.911Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-06-21T22:04:21.031Z
---
# Build an ImGui control panel

Show a checkbox that changes a trigger in your own aura. ImGui describes the UI again on every frame: the checkbox reads the current value and writes a new one when clicked. It does not need the text-update subscription used by [Blazor Windows](/en/scripting/blazor-windows/getting-started).

Use a desktop Windows EyeAuras host compatible with **EyeAuras.ImGuiSdk 0.1.47** and its native dependencies. This package from the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json) targets .NET 8 Windows and depends on **EyeAuras.ClickableTransparentOverlay 11.5.28**. Do not load a second ImGui.NET/CTO version into the same process. The package supplies types; `ImGuiContainerExtensions` registers the script service. These are separate setup steps.

## Create the panel

1. Create your own `TargetAura` with **Hotkey Is Active → Toggle Trigger state on Click** and a free hotkey. Keep it loaded, with no actions for this first exercise.
2. In the same folder, create another aura with a **C# Script** action. Paste this complete program into top-level `Script.csx`:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using EyeAuras.ImGuiSdk;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;
using ImGuiNET;
using System.Numerics;

{
    var trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    using var rendering = imgui.AddRenderer(_ =>
    {
        var visible = ImGui.Begin("My UI##target-control");
        try
        {
            if (!visible) return;
            var value = trigger.TriggerValue ?? false;
            if (ImGui.Checkbox("Is Active", ref value)) trigger.TriggerValue = value;
            ImGui.SameLine();
            ImGui.TextDisabled("Hotkey Is Active");
            ImGui.Separator();
            ImGui.TextColored(trigger.IsActive == true
                ? new Vector4(0, 1, 0, 1) : new Vector4(1, 0, 0, 1),
                trigger.IsActive == true ? "ACTIVE" : "INACTIVE");
        }
        finally { ImGui.End(); }
    });
    cancellationToken.WaitHandle.WaitOne();
}
```

3. After dependency restore and compilation, click **Run**. Change **Is Active** in **My UI**: it writes `TargetAura`'s `TriggerValue`. Toggle the hotkey and the next frame reads its new value.

![Toggle in the earlier demonstration](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

4. Click **Stop**. The outer wait ends; reverse `using` order removes the render subscription before releasing the API instance. Other scripts holding the shared overlay are not closed by releasing your share.

| Part | Meaning |
| --- | --- |
| `./TargetAura` | A neighbouring aura in this script's tree context. Lookup requires the target and selects the first matching trigger. |
| `TriggerValue` / `IsActive` | The checkbox changes the trigger's value; the coloured text reads its evaluated state. Other aura conditions still apply. The checkbox displays `null` as off. |
| `AddNewExtension` then `GetService` | Register the SDK service before resolving it; `#r` alone does not do this. |
| `AddRenderer` | Returns an owned disposable registration for a callback invoked on the render thread each frame. |
| `Begin` / `End` | Describe a window in the current frame. `End` is required even when `Begin` reports collapsed content. |
| `##target-control` | A stable hidden part of the window ID. Do not replace it with a random ID each frame. |

The SDK starts the native window/context before render callbacks. Keep `GetIO`, `Begin` and drawing inside that context; do not manually create a second context. This native UI does not require Razor, HTML or WebView2. [Blazor OSD](/en/scripting/examples/basic/osd-cursor) is a different renderer.

API instances share **Main**, its settings and font atlas. Do not close that window directly. `GetService`, `AuraTree` and `cancellationToken` are top-level script capabilities; ordinary classes receive dependencies explicitly. Keep waits and lengthy work outside the frame callback.

To use your own typeface or Cyrillic glyphs in the panel, follow [loading a TTF resource as the default font](/en/scripting/imgui/loading-font). If other renderers share Main, prefer [local font selection](/en/scripting/imgui/loading-font-static) for only your drawing; both routes require a TTF containing the requested glyphs.

<details>
<summary>Start with the standard demo window</summary>

This complete alternative displays ImGui's built-in demo until Stop:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    using var rendering = imgui.AddRenderer(_ => ImGui.ShowDemoWindow());
    cancellationToken.WaitHandle.WaitOne();
}
```

![Standard ImGui demo](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)

</details>

<details>
<summary>Two windows with independent counters</summary>

This alternative creates and requests closure of its managed windows inside the frame callback. The manager calls `CounterPanel.ToImGui` and owns each window's `Begin/End`; the ordinary content class has only its own counter field.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Reactive.Disposables;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    ImGuiWindowHost first = null, second = null;
    var closed = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    var remaining = 2;
    var closing = 0;
    using var rendering = imgui.AddRenderer(_ =>
    {
        if (first == null)
        {
            first = ImGuiWindowManager.OpenNew(() => new CounterPanel(), "First");
            second = ImGuiWindowManager.OpenNew(() => new CounterPanel(), "Second");
            void OnClosed()
            {
                if (Interlocked.Decrement(ref remaining) == 0) closed.TrySetResult(true);
            }
            first.Anchors.Add(Disposable.Create(OnClosed));
            second.Anchors.Add(Disposable.Create(OnClosed));
        }
        if (Volatile.Read(ref closing) != 0)
        {
            ImGuiWindowManager.Close(first);
            ImGuiWindowManager.Close(second);
        }
    });
    try { await closed.Task.WaitAsync(cancellationToken); }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally
    {
        Interlocked.Exchange(ref closing, 1);
        await closed.Task;
    }
}

public sealed class CounterPanel : ICanBeDisplayedInImGui
{
    private int count;
    public void ToImGui()
    {
        if (ImGui.Button("Add")) count++;
        ImGui.TextUnformatted($"Value: {count}");
    }
}
```

Closing one window leaves the other open. The script completes after both hosts are disposed. Stop requests targeted closure and waits while the API still holds the render loop. That acknowledgement requires working native frames; it does not guarantee shutdown after a renderer failure. The manager also disposes disposable content. Do not replace these targeted calls with `CloseAll`, which can affect other owners.

</details>

<details>
<summary>Start asynchronous work without blocking frames</summary>

This complete alternative starts ten 200 ms steps from a button. Clicks while work is active do not start another task. The delays stand for your asynchronous work; ImGui calls stay on the render thread.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var runToken = cancellationToken;
    using var stop = CancellationTokenSource.CreateLinkedTokenSource(runToken);
    var workToken = stop.Token;
    var gate = new object();
    var worker = Task.CompletedTask;
    var stopping = false;
    var progress = 0;
    var rendering = imgui.AddRenderer(_ =>
    {
        var visible = ImGui.Begin("Work");
        try
        {
            if (!visible) return;
            var clicked = ImGui.Button("Start");
            lock (gate)
            {
                if (clicked && !stopping && worker.IsCompleted)
                {
                    Interlocked.Exchange(ref progress, 0);
                    worker = Task.Run(async () =>
                    {
                        try
                        {
                            for (var step = 1; step <= 10; step++)
                            {
                                await Task.Delay(200, workToken);
                                Interlocked.Exchange(ref progress, step);
                            }
                        }
                        catch (OperationCanceledException) when (workToken.IsCancellationRequested) { }
                        catch (Exception error) { Log.Error("Operation failed", error); }
                    });
                }
            }
            ImGui.TextUnformatted($"Done: {Volatile.Read(ref progress)}/10");
        }
        finally { ImGui.End(); }
    });
    try
    {
        await Task.Delay(Timeout.Infinite, runToken);
    }
    catch (OperationCanceledException) when (runToken.IsCancellationRequested) { }
    finally
    {
        Task active;
        lock (gate) { stopping = true; active = worker; }
        rendering.Dispose();
        stop.Cancel();
        await active;
    }
}
```

The gate prevents new work during shutdown and protects task ownership; Interlocked/Volatile transfer progress between threads. Stop disables new starts, removes rendering, then cancels and awaits the worker before disposing its token source. The worker must not dispose that shared source itself. Keep expensive computation outside the render callback too.

</details>

ImGui can also draw lines, shapes, labels and projections of coordinates supplied by your program. The [Dear ImGui adopters](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui) and historical [L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg) illustrate uses; they do not provide built-in game data. See [IImGuiExperimentalApi operations](/en/scripting/api/IImGuiExperimentalApi) for ownership and shared-state contracts. Basic rendering exists in 0.1.42, but its package lacks the managed-window types used here; these programs consistently select 0.1.47.
