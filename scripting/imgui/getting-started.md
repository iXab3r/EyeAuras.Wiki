---
title: ImGui - Getting started
description: 
published: true
date: 2025-06-22T11:13:37.560Z
tags: 
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
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
 
using EyeAuras.ImGuiSdk; // required for registration methods
using ImGuiNET;          // access to ImGui APIs
using System.Numerics;   // for Vector2/Vector3 use with ImGui

AddNewExtension<ImGuiContainerExtensions>(); // registers IImGuiExperimentalApi and others

var osd = GetService<IImGuiExperimentalApi>() // creates the ImGui overlay
    .AddTo(ExecutionAnchors); // ensures cleanup when script stops
```

---

## Hello, World

There are 3 things you need to do to start using ImGui:

* Import the `ImGuiNET` namespace
* Create `IImGuiApi` via `GetService`
* Call `AddRenderer()` with your rendering method

That's it. EyeAuras will handle overlay creation and the render loop. You only need to put your logic in the method passed to `AddRenderer`.

> 💡 Note: Your method will be called **on every frame**, so avoid sleeping or long blocking code.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
 
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;

AddNewExtension<ImGuiContainerExtensions>();

var osd = GetService<IImGuiExperimentalApi>()
    .AddTo(ExecutionAnchors);

osd.AddRenderer(() =>
{
    ImGui.ShowDemoWindow();
});

cancellationToken.WaitHandle.WaitOne(); // keep running until script is stopped
```

![ImGui Demo window](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)

---

## Creating a Toggle

Let’s create something of our own. The demo window is useful for testing, but not very practical.

Just like in [Blazor Windows](/scripting/blazor-windows/getting-started), let’s [create a toggle](/scripting/blazor-windows/4-toggle-hotkeyisactive).

### What needs to be done?

* Create the `IImGuiApi` overlay
* Pass a rendering method to `AddRenderer`
* Draw a checkbox and some text inside the render method

And that’s it! No state management, no sleep calls, no click processing — it’s all immediate mode. The syntax might seem odd at first, but ChatGPT knows ImGui **very well**, so don’t hesitate to ask questions.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"

using EyeAuras.ImGuiSdk; 
using ImGuiNET;
using System.Numerics;

[Inject] IAuraTreeScriptingApi AuraTree { get; init; }

IHotkeyIsActiveTrigger Trigger => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");

AddNewExtension<ImGuiContainerExtensions>();

var osd = GetService<IImGuiExperimentalApi>()
    .AddTo(ExecutionAnchors);

osd.AddRenderer(() =>
{
    ImGui.Begin("My UI");

    ImGui.Text("Control window flags and interaction behavior.");

    var isActive = Trigger.TriggerValue ?? false;
    if (ImGui.Checkbox("Is Active", ref isActive))
    {
        Trigger.TriggerValue = isActive;
    }
    ImGui.SameLine();
    ImGui.TextDisabled("(Gets/Sets whether Trigger is active or not)");

    ImGui.Separator();

    if (Trigger.IsActive == true)
    {
        ImGui.TextColored(new Vector4(0f, 1f, 0f, 1f), "Trigger is currently ACTIVE");
    }
    else
    {
        ImGui.TextColored(new Vector4(1f, 0f, 0f, 1f), "Trigger is currently INACTIVE");
    }

    ImGui.End();
});

cancellationToken.WaitHandle.WaitOne();
```

![Toggle](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

---

## What Else Can You Do With ImGui?

Besides drawing interactive windows, ImGui can also be used for **OSD (On-Screen Display)** — drawing overlays directly onto the screen. You can render both **2D** and **3D** objects.

Here's an example — everything you see is rendered using ImGui, including both UI and screen overlays:

📺 [L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg)

---

Let me know if you'd like this converted into a docs page or integrated into EyeAuras script templates.
