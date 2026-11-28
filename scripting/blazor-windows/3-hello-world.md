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

Let's make a panel that counts clicks on **Click Me**. The example shows where the number is stored, what Razor draws and which code runs on a click.

1. Create a test aura with **C# Overlay**. Keep it loaded and make it active with **Fixed Value → Is Active**. The generated project has three files: `Script.csx`, `UserOverlay.cs` and `UserOverlay.razor`.
2. Keep the entry point short:

```csharp
Log.Debug("This script is entry point for Overlay");
```

3. Replace both component files with the code below. Both files use the same namespace, `BlazorDemo`.

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

4. Wait until the editor finishes compiling, then click **Click Me**. The count starts at `0`, then shows `1`, `2` and so on. If compilation fails, read the error before you look at window settings.

![Counter markup and code in the earlier editor](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_uPjkmxmv2r.png)

| Part | What it does |
| --- | --- |
| `public partial class UserOverlay` and `@namespace BlazorDemo` | Join the C# and Razor files into one public component. |
| `@inherits BlazorReactiveComponent` | Gives the component the EyeAuras reactive base class, including `Refresh`. |
| `count` | The number, starting at zero. It belongs to this component instance, not to an aura variable, and is not saved. |
| `@onclick="Increment"` | Calls the C# handler on a click. The handler adds one to the field and awaits `Refresh("counter clicked")`. |
| `btn btn-primary btn-lg` | Bootstrap button styling. `text-center`, `mt-4` and `mt-3` set alignment and spacing. |
| `@count` inside `strong` | Puts the current value into the markup. The inline `font-size` applies to this paragraph only. |

If the component is destroyed and created again, the number is zero again. `Script.csx` must finish, otherwise C# Overlay will not show the component.

The examples have their own `using` lines. A project `_Imports.razor` can hold shared Razor imports, but it does not import names into ordinary `.cs` files. The [earlier component template](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Blazor.Shared/CodeEditor/Templates/RazorComponentTemplate.cs) shows how the generated code-behind is laid out.

Razor and ordinary classes do not have the script globals `AuraTree`, `Variables`, `GetService` and `cancellationToken` from `Script.csx`. A component gets them as explicit dependencies or parameters. The base component has its own `Log`. It is the component's log, not the script's variable.

<details>
<summary>Keep the handler in the Razor file instead</summary>

In a small component you can keep the C# in `@code`. In that case leave `UserOverlay.cs` as an empty partial class, so the field and handler are not declared twice:

```csharp
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserOverlay : BlazorReactiveComponent
{
}
```

Keep the same `UserOverlay.razor` markup and add this block at the end. Also add `@using System.Threading.Tasks` next to the other directives:

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

</details>

Next you can [connect a button to a real Hotkey Is Active trigger](/en/scripting/blazor-windows/4-toggle-hotkeyisactive).
