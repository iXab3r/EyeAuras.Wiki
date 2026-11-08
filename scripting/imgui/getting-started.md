---
title: ImGui - Getting started
description: 
published: true
date: 2026-02-14T16:30:30.911Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-06-21T22:04:21.031Z
---

# ImGui in the Context of EyeAuras

**ImGui** is a remarkably powerful yet simple and intuitive library for drawing *stuff*. The author originally intended it for UI development in games, but it quickly found use far beyond that — the [list of adopters](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui) is quite impressive.

But here we’re dealing with **automation**, right? So how does ImGui help us?

The answer: ImGui is the **simplest and most intuitive** way to build custom UI. It’s even easier than [Blazor Windows](/scripting/blazor-windows/getting-started).

---

## How to Install

EyeAuras is gradually transitioning to a modular NuGet-based system so that users can include **only the features they need**. The current functionality has grown too large — image capture, analysis, effects, behavior trees, input simulation, memory reading, audio processing, Blazor UIs… almost no mini-app uses even half of it.

So we're moving various features into NuGet packages that you can install just like any other.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
 
using EyeAuras.ImGuiSdk; // required for registration methods
using ImGuiNET;          // access to ImGui APIs
using System.Numerics;   // for Vector2/Vector3 use with ImGui

{
    AddNewExtension<ImGuiContainerExtensions>(); // registers IImGuiExperimentalApi and others

    using var osd = GetService<IImGuiExperimentalApi>();
}
```

---

## Hello, World

There are 3 things you need to do to start using ImGui:

* Import the `ImGuiNET` namespace
* Create `IImGuiExperimentalApi` via `GetService`
* Call `AddRenderer()` with your rendering method

That's it. EyeAuras will handle overlay creation and the render loop. You only need to put your logic in the method passed to `AddRenderer`.

> 💡 Note: Your method will be called **on every frame**, so avoid sleeping or long blocking code.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
 
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;

{
    AddNewExtension<ImGuiContainerExtensions>();

    using var osd = GetService<IImGuiExperimentalApi>();

    using var rendering = osd.AddRenderer(() =>
    {
        ImGui.ShowDemoWindow();
    });

    cancellationToken.WaitHandle.WaitOne(); // keep running until script is stopped
}
```

![ImGui Demo window](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)

---

## Creating a Toggle

Let’s create something of our own. The demo window is useful for testing, but not very practical.

Just like in [Blazor Windows](/scripting/blazor-windows/getting-started), let’s [create a toggle](/scripting/blazor-windows/4-toggle-hotkeyisactive).

### What needs to be done?

* Create the `IImGuiExperimentalApi` overlay
* Pass a rendering method to `AddRenderer`
* Draw a checkbox and some text inside the render method

And that’s it! No state management, no sleep calls, no click processing — it’s all immediate mode. The syntax might seem odd at first, but ChatGPT knows ImGui **very well**, so don’t hesitate to ask questions.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"

using EyeAuras.ImGuiSdk;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;
using ImGuiNET;
using System.Numerics;

// Create a sibling TargetAura with a HotkeyIsActive trigger.

{
    var trigger = AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");

    AddNewExtension<ImGuiContainerExtensions>();

    using var osd = GetService<IImGuiExperimentalApi>();

    using var rendering = osd.AddRenderer(() =>
    {
        var visible = ImGui.Begin("My UI");
        try
        {
            if (!visible) return;
            ImGui.Text("Control window flags and interaction behavior.");

            var isActive = trigger.TriggerValue ?? false;
            if (ImGui.Checkbox("Is Active", ref isActive))
            {
                trigger.TriggerValue = isActive;
            }
            ImGui.SameLine();
            ImGui.TextDisabled("(Gets/Sets whether Trigger is active or not)");

            ImGui.Separator();
            if (trigger.IsActive == true)
            {
                ImGui.TextColored(new Vector4(0f, 1f, 0f, 1f), "Trigger is currently ACTIVE");
            }
            else
            {
                ImGui.TextColored(new Vector4(1f, 0f, 0f, 1f), "Trigger is currently INACTIVE");
            }
        }
        finally
        {
            ImGui.End();
        }
    });

    cancellationToken.WaitHandle.WaitOne();
}
```

![Toggle](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

---

## What Else Can You Do With ImGui?

Besides drawing interactive windows, ImGui can also be used for **OSD (On-Screen Display)** — drawing overlays directly onto the screen. You can render both **2D** and **3D** objects.

Here's an example — everything you see is rendered using ImGui, including both UI and screen overlays:

📺 [L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg)

---

Let me know if you'd like this converted into a docs page or integrated into EyeAuras script templates.


The examples show the demo window or a toggle for a sibling `TargetAura`. On Stop, dispose the `AddRenderer` subscription before the API instance; the subscription is not automatically owned by that instance. Instances share `Main`, so releasing your share does not close another script's overlay. See [API operations](/en/scripting/api/IImGuiExperimentalApi) for shared settings, fonts and ownership.

## Two windows with separate state

These examples use `0.1.47`: its published assembly contains `ImGuiWindowManager` and `ImGuiWindowHost`. Those types are absent from `0.1.42`, although basic `AddRenderer` is available there. Package `0.1.47` depends on `EyeAuras.ClickableTransparentOverlay 11.5.28`; use a compatible host build.

With the package reference above, run this alternative `Script.csx`. Each window has its own counter and close button. `CounterPanel` is an ordinary class and may live in a separate `.cs` file:

```csharp
using System;
using System.Reactive.Disposables;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var first = ImGuiWindowManager.OpenNew(() => new CounterPanel(), "First");
    var second = ImGuiWindowManager.OpenNew(() => new CounterPanel(), "Second");
    var firstClosed = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    var secondClosed = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    first.Anchors.Add(Disposable.Create(() => firstClosed.TrySetResult(true)));
    second.Anchors.Add(Disposable.Create(() => secondClosed.TrySetResult(true)));
    try
    {
        await Task.WhenAll(firstClosed.Task, secondClosed.Task).WaitAsync(cancellationToken);
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
    }
    finally
    {
        ImGuiWindowManager.Close(first);
        ImGuiWindowManager.Close(second);
        // Keep the API alive while the manager handles closure on a frame.
        await Task.WhenAll(firstClosed.Task, secondClosed.Task);
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

The manager draws these windows; no separate `AddRenderer` is needed. `ImGuiWindowHost` owns Begin/End, so the content must not call them. Closing one window leaves the other open. The script completes after both hosts are disposed. Stop requests closure and waits while the API still holds the overlay; this requires a working render loop and does not guarantee shutdown after a native renderer failure. The manager also disposes disposable content. Use targeted `Close`, not `CloseAll()`.

## Start work from a button without blocking rendering

This alternative `Script.csx` uses the same package setup. A click starts one sequence; further clicks during it are ignored. Delays represent asynchronous work. Keep expensive computation outside the render callback too:

```csharp
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
            ImGui.TextUnformatted($"Progress: {Volatile.Read(ref progress)}/10");
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

The gate protects task ownership and prevents new work during shutdown; Interlocked/Volatile transfer progress. The frame callback never waits for the worker. Stop first prevents new starts, removes rendering, then cancels and awaits the active worker before disposing its token source. The worker must not dispose the source, because the owner's later Cancel would access a disposed object. ImGui calls stay on the render thread; ordinary helper classes receive script dependencies explicitly.
