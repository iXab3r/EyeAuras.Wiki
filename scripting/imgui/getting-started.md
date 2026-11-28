---
title: ImGui - Getting started
description: How to show your own ImGui panel from a C# script
published: true
date: 2026-02-14T16:30:30.911Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-06-21T22:04:21.031Z
---
# Build an ImGui control panel

This page builds a small panel with a checkbox that toggles a trigger in your own aura. ImGui redraws the UI on every frame: the checkbox reads the current value, and a click writes a new one. So you do not need to subscribe to changes to update the text, as you do in [Blazor Windows](/en/scripting/blazor-windows/getting-started).

You need desktop EyeAuras for Windows that is compatible with **EyeAuras.ImGuiSdk 0.1.47** and its native dependencies. The package is in the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json), targets .NET 8 Windows and depends on **EyeAuras.ClickableTransparentOverlay 11.5.28**. Do not load another version of ImGui.NET/CTO into the same process.

## Create the panel

1. Create an aura named `TargetAura` with **Hotkey Is Active → Toggle Trigger state on Click** and a free hotkey. Keep it loaded. It needs no actions for now.
2. In the same folder, create a second aura with a **C# Script** action. Paste the whole program into its top-level `Script.csx`:

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

3. Wait until the dependency is restored and the script compiles, then click **Run**. Toggle **Is Active** in the **My UI** panel, and `TriggerValue` of `TargetAura` changes. Toggle the trigger with the hotkey, and the next frame reads the new value.

![Panel with a checkbox in an old demo](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

4. Click **Stop**. The wait ends. The render registration is released first, then the API instance. Other scripts that use the shared window are not closed by this.

| Part | Meaning |
| --- | --- |
| `./TargetAura` | A neighbouring aura, relative to the script. The first matching trigger is used. If there is none, you get an error. |
| `TriggerValue` / `IsActive` | The checkbox changes the trigger's value, and the coloured text shows the resulting state. The aura's other conditions still apply. The checkbox shows `null` as off. |
| `AddNewExtension` then `GetService` | Register the SDK first, then get the API. `#r` alone is not enough. |
| `AddRenderer` | Takes a function that is called every frame on the render thread. Returns a disposable registration. |
| `Begin` / `End` | Open and close the description of a window in the current frame. `End` is required even when the content is collapsed. |
| `##target-control` | A hidden, fixed part of the window ID. Do not put a random value in it on every frame. |

The SDK creates the native window and context itself before it calls your render code. Until the context exists, do not call `GetIO`, `Begin` or any drawing. Do not create a second context by hand. This is native ImGui: it does not need Razor, HTML or WebView2. [Blazor OSD](/en/scripting/examples/basic/osd-cursor) works differently.

All API instances share one **Main** window, its settings and font atlas. Do not close that window directly. `GetService`, `AuraTree` and `cancellationToken` exist only in top-level `Script.csx` code. An ordinary class must be given its dependencies and the token explicitly. Keep waits and long work outside the frame function.

Need your own font or Cyrillic on the panel? See [how to make a TTF from resources the default font](/en/scripting/imgui/loading-font). If other renderers also use Main, [apply the font only to your own drawing](/en/scripting/imgui/loading-font-static).

<details>
<summary>Start with the standard demo window</summary>

This variant runs on its own, in place of the main program. It shows the standard ImGui demo window until you click Stop:

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

![Standard ImGui demo window](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)

</details>

<details>
<summary>Two windows with independent counters</summary>

Another complete program that replaces the main one. The windows are created inside the frame function, and their closing is requested there too. The manager calls `CounterPanel.ToImGui` itself and does `Begin/End` itself. The counter lives in a field of an ordinary class, which needs no script services.

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

If you close one window, the other stays open. When both are closed, the script ends. Stop asks the remaining windows to close and waits until they are released. The API keeps rendering during that time. The wait needs a working native frame loop. The manager also disposes content that is disposable. Do not replace these targeted calls with `CloseAll`: it also affects windows that belong to others.

</details>

<details>
<summary>Start asynchronous work without blocking frames</summary>

Another program that replaces the main one. The button starts ten steps of 200 ms each. If you click it again while the work is running, a second task does not start. The delays stand in for your own work, and ImGui stays on the render thread.

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

On Stop the order is: new starts are blocked, rendering is removed, the task is cancelled, and the program waits for it to finish. Only then is the token source disposed. The worker task does not dispose it itself. `gate`, `Interlocked` and `Volatile` keep the state consistent between threads.

</details>

ImGui can also draw lines, shapes, labels and projections of coordinates you supply. The [list of Dear ImGui projects](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui) and the old [L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg) show what such interfaces can look like. The contracts and the limits of shared state are described in [IImGuiExperimentalApi operations](/en/scripting/api/IImGuiExperimentalApi). Version 0.1.42 has basic rendering but not the window manager used here. That is why every program on this page uses 0.1.47.
