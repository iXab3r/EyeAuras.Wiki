---
title: 3. Building Blocks
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T01:13:28.765Z
---

# Building Blocks

Create an aura with C# Overlay, then use the two `UserOverlay` files below as parts of one public partial class in the same namespace. Clicking `Click Me` increments the count.
When you add a new overlay, several files are created automatically. Each is important to the program.
![Header](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_uPjkmxmv2r.png)

## Script.csx
This is the script entry point. Compilation and script execution have a separate lifecycle from Razor rendering; do not use it as an event for every show or hide.
It can contain nothing beyond the sample code, but you can use it to initialize data, read information, etc. You can also do this in the window/component code, but sometimes it's convenient to have a common entry point.
```csharp
Log.Debug("This script is entry point for Overlay");
```

---

## UserOverlay.cs
```csharp
using PoeShared.Blazor;

public partial class UserOverlay : BlazorReactiveComponent {
    private int count = 0;

    private void IncrementCount()
    {
        count++;
    }
}
```
This is the **code-behind** file. Most Razor components consist of two parts—`*.razor` and `*.cs`. The Razor part usually contains Razor/HTML/CSS markup, while the `*.cs` file holds methods, fields and properties accessible from the markup.
> Note: you *can* write C# directly inside `*.razor` and skip the `*.cs` file, but this series keeps logic in code-behind to make markup smaller. Editor completion capabilities depend on the EyeAuras version.
{.is-info}

Let's break down the code:
```csharp
public partial class UserOverlay : BlazorReactiveComponent
```
Class declaration. To let EyeAuras find it, the class must be `public`. Because it has a second part (`*.razor`), it must be `partial`, meaning the class is split across multiple files. Finally, `: BlazorReactiveComponent` sets the base class—more on that later.

```csharp
private int count = 0;
```
We declare a field storing how many times the button was clicked.
> Note: This field value persists for the lifetime of the overlay. If the aura unloads or the overlay is destroyed, the value is reset.

```csharp
private void IncrementCount()
{
    count++;
}
```
This method simply increments the counter, allowing us to track clicks.

---

## UserOverlay.razor
```razor
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<h3 class="text-center">Interactive Counter</h3>

<div class="text-center mt-4">
    <button @onclick="IncrementCount" class="btn btn-primary btn-lg">
        Click Me
    </button>
</div>

<p class="text-center mt-3" style="font-size: 1.5rem;">
    You clicked <strong>@count</strong> times!
</p>
```
The second part of our component describing how it should render. Let's look at what's inside:
```html
@inherits BlazorReactiveComponent
```
This tells Blazor to use `BlazorReactiveComponent` (provided by **EyeAuras**) as the base class. It's optional but strongly recommended for access to extra functionality.

```html
<h3 class="text-center">Interactive Counter</h3>
```
Just a centered heading.

```html
<div class="text-center mt-4">
    <button @onclick="IncrementCount" class="btn btn-primary btn-lg">
        Click Me
    </button>
</div>
```
Here the interesting part is `@onclick="IncrementCount"` which hooks up the click handler. Each click increases `count` by 1.

```html
<p class="text-center mt-3" style="font-size: 1.5rem;">
    You clicked <strong>@count</strong> times!
</p>
```
The final piece: display the current value of `count`, the same variable we increment when the button is pressed.

---

We end up with a simple form containing a button and an updating value. In about 20 lines we created a functional and somewhat nice program. Play with colors, add more values and use this overlay as a test bed. More to come!

`Log` in `Script.csx` is a sandbox member; an ordinary `UserOverlay` class does not inherit it. Matching filenames or imports do not share script fields with a component. Pass a model through `DataContext` or inject a service. For explicit redraw in `BlazorReactiveComponent`, use `await Refresh("reason")`; external changes need an observed source. [Next: control a trigger](/en/scripting/blazor-windows/4-toggle-hotkeyisactive).

The current generator creates `UserOverlay.razor` with `@namespace` and `UserOverlay.cs` with the same `namespace`. Preserve these lines when replacing the example body: class name and namespace must match between both parts. The current entity is named `C# Overlay`; older screenshots use the v3 suffix.

[RazorComponentTemplate](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Blazor.Shared/CodeEditor/Templates/RazorComponentTemplate.cs).
