---
title: 3. Building Blocks
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T01:13:28.765Z
---
# Change the counter in your overlay

Make **Click Me** increment a number in your own panel. This example separates the Razor markup from its C# handler so you can edit either without changing the host window.

1. Create a test aura with **C# Overlay**, keep it loaded and make it active with **Fixed Value → Is Active**. The generated project contains `Script.csx`, `UserOverlay.cs` and `UserOverlay.razor`.
2. Keep the entry point short:

```csharp
Log.Debug("This script is entry point for Overlay");
```

3. Replace both component files below. They deliberately use `BlazorDemo` as the same namespace in both files.

## UserOverlay.cs

```csharp
using System.Threading.Tasks;
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
    private int count;

    private async Task Increment()
    {
        count++;
        await Refresh("counter clicked");
    }
}
```

## UserOverlay.razor

```razor
@namespace BlazorDemo
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<h3 class="text-center">Interactive Counter</h3>
<div class="text-center mt-4">
    <button @onclick="Increment" class="btn btn-primary btn-lg">Click Me</button>
</div>
<p class="text-center mt-3" style="font-size: 1.5rem;">
    You clicked <strong>@count</strong> times!
</p>
```

4. Once the editor finishes compiling, click **Click Me**. The count starts at `0`, then shows `1`, `2`, and so on. If compilation fails, read the diagnostic before looking for a window setting.

![Counter markup and code in the earlier editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_uPjkmxmv2r.png)

| Part | What it does |
| --- | --- |
| `public partial class UserOverlay` and `@namespace BlazorDemo` | Join the C# and Razor files into one public component. |
| `@inherits BlazorReactiveComponent` | Supplies EyeAuras reactive component behaviour, including `Refresh`. |
| `count` | State of this component instance, initially zero. It is not a persistent aura variable. |
| `@onclick="Increment"` | Calls the C# handler for a click. The handler increments the field and awaits `Refresh("counter clicked")`. |
| `btn btn-primary btn-lg` | Bootstrap button styling; `text-center`, `mt-4` and `mt-3` control alignment and spacing. |
| `@count` inside `strong` | Inserts the current value into the markup. The inline `font-size` controls this paragraph only. |

Recreating the component resets this field. Merely hiding its window does not necessarily recreate it. `Script.csx` must finish its setup for C# Overlay to display the component.

The examples include their own namespace imports. A project `_Imports.razor` can supply shared Razor imports, but it does not import names into ordinary `.cs` files. The [earlier component template](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Blazor.Shared/CodeEditor/Templates/RazorComponentTemplate.cs) shows the generated code-behind arrangement.

The two files are component code, not executable top-level script code. `AuraTree`, `Variables`, `GetService` and the script's `cancellationToken` need explicit dependencies or parameters here. The reactive base class supplies its own `Log`; that does not turn it into the script host's global logger.

<details>
<summary>Keep the handler in the Razor file instead</summary>

Use this as an alternative to the two files above, not in addition to their field and handler. Leave `UserOverlay.cs` as an empty matching partial class:

```csharp
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
}
```

Keep the same `UserOverlay.razor` markup and add this block at its end. Also add `@using System.Threading.Tasks` with its other directives:

```razor
@code {
    private int count;
    private async Task Increment()
    {
        count++;
        await Refresh("counter clicked");
    }
}
```

Razor `@code` members belong to the same component class as code-behind. Duplicating them in both files produces duplicate members. This choice changes file organisation, not the counter's lifetime.

</details>

Next, [connect a button to a real Hotkey Is Active trigger](/en/scripting/blazor-windows/4-toggle-hotkeyisactive).
