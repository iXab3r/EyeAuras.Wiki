---
title: ImGui - Getting started
description: 
published: true
date: 2025-06-21T22:04:21.031Z
tags: 
editor: markdown
dateCreated: 2025-06-21T22:04:21.031Z
---

# ImGui in the Context of EyeAuras

**ImGui** is an incredibly powerful yet simple and intuitive library for drawing *all kinds of things*. Originally designed for in-game UI development, it quickly found use well beyond that. The [list of projects using it](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui) is impressive.

But we're here for automation, right? So how does ImGui help us?

**Answer**: ImGui is the simplest and most straightforward way to build custom UI — even easier than [Blazor Windows](/scripting/blazor-windows/getting-started).

---

## Hello, World

There are just three things you need to do to get started with ImGui:

* Import the `ImGuiNET` namespace.
* Create an `IImGuiApi` instance via `GetService`.
* Call `AddRenderer` with a method that contains your rendering logic.

That’s it. EyeAuras will handle the overlay and rendering loop. Your job is to define what happens inside the method passed to `AddRenderer`.

> 💡 Keep in mind: ImGui will call that method on **every single render cycle**. Don’t put `Thread.Sleep` or blocking logic there.

```csharp
using ImGuiNET;

var img = GetService<IImGuiApi>() // Create ImGui API
    .AddTo(ExecutionAnchors);     // Dispose when the script stops

img.AddRenderer(() =>
{
    // This method gets called many times per second.
    // Add your render logic here.
    ImGui.ShowDemoWindow();
});

// Wait for the script to stop
cancellationToken.WaitHandle.WaitOne(); 
```

![ImGui Demo window](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)

---

## Creating a Toggle

Now let’s build something of our own. The demo window is useful for smoke testing, but not very practical.

Just like with [Blazor Windows](/scripting/blazor-windows/getting-started), let’s [create a simple toggle](/scripting/blazor-windows/4-toggle-hotkeyisactive).

### What needs to be done?

* Create the overlay with `IImGuiApi` as usual.
* Pass in your render method using `AddRenderer`.
* In the rendering code, draw a checkbox and some status text.

And that’s it. No need to manage state, no event handlers, no delay timers. ImGui is declarative and stateless. The syntax might be a bit unfamiliar at first, but ChatGPT knows ImGui well — feel free to ask anything.

```csharp
using System.Numerics;
using ImGuiNET;

[Inject] IAuraTreeScriptingApi AuraTree { get; init; }

IHotkeyIsActiveTrigger Trigger
{
    get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
}

var img = GetService<IImGuiApi>() // Create ImGui API
    .AddTo(ExecutionAnchors);     // Dispose when script stops

img.AddRenderer(() =>
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

// Wait for the script to stop
cancellationToken.WaitHandle.WaitOne();
```

![Toggle](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

---

## What Else Can You Do with ImGui?

Beyond interactive windows, ImGui also lets you create **OSD (On-Screen Display)** elements — drawing directly to the screen. Both 2D and 3D overlays are possible.

Everything you see in the example below — the UI and screen overlays — is implemented using ImGui:

🎬 [L2 Demo on YouTube](https://www.youtube.com/watch?v=y0u20InSjbg)

---

Let me know if you'd like this styled as documentation for internal use or linked into a script hub.
