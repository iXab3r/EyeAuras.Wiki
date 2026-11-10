---
title: Where to start?
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-11-04T00:26:45.232Z
---
# Open a dialog from a C# Script action

Show a small window with a title supplied by your script and a counter owned by its component. Closing the dialog finishes the waiting script; starting it again creates a fresh counter.

Use the desktop EyeAuras host with its Blazor window services and WebView2 Runtime. This example runs in a **C# Script action**, not an EyePad-only project or a browser page. Adding an SDK reference alone does not register a native window service.

## Create the project files

1. Create your own test aura. Add a **C# Script** action under **On Enter**, and use its manual **Run** control for this exercise so repeated trigger events do not open more windows.

![C# Script action editor](https://s3.eyeauras.net/media/2024/11/EyeAuras_xCVTs8bdg1Y7ZU8T.png)

2. In the script editor, use **New file → Component (with code-behind)** and name it `UserComponent`. Older editors call this a Razor component. Add an ordinary C# file named `WindowModel.cs`.

![Component template in the earlier editor](https://s3.eyeauras.net/media/2024/11/EyeAuras_I6MYDieptaZe5a8u.png)

3. Replace the four files with the contents below. All component and model files use `BlazorDemo`; `Script.csx` imports it.

### Script.csx

```csharp
using BlazorDemo;
using EyeAuras.Shared.Scripting;

{
    using var window = GetService<IDialogWindowUnstableScriptingApi>()
        .CreateWindow<UserComponent>(new WindowModel { Title = "My window" });

    window.Title = "Test dialog";
    window.Width = 480;
    window.Height = 260;
    window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
    window.ShowDialog(cancellationToken);
}
```

### WindowModel.cs

```csharp
namespace BlazorDemo;

public sealed class WindowModel
{
    public string Title { get; set; } = "Settings";
}
```

### UserComponent.cs

```csharp
using System.Threading.Tasks;
using PoeShared.Blazor;

namespace BlazorDemo;

public partial class UserComponent : BlazorReactiveComponent<WindowModel>
{
    private int count;

    private async Task Increment()
    {
        count++;
        await Refresh("dialog counter clicked");
    }
}
```

### UserComponent.razor

```razor
@namespace BlazorDemo
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent<WindowModel>

<h2>@DataContext.Title</h2>
<button class="btn btn-primary" @onclick="Increment">Increment</button>
<p>Clicks: @count</p>
```

4. Once compilation finishes, click **Run**. The `480 × 260` window opens in the centre with native title **Test dialog** and component heading **My window**. Click the counter button, then close the window. The script finishes; a new Run starts at zero.

![Dialog created from the earlier script example](https://s3.eyeauras.net/media/2024/11/EyeAuras_fmFnsjgMCW8P6Z4b.png)

| Part | Purpose and lifetime |
| --- | --- |
| `CreateWindow<UserComponent>(model)` | Creates a native Blazor window and passes the model as the component's `DataContext`. |
| `window.Title`, `Width`, `Height`, `WindowStartupLocation` | Configure the native window before showing it. The model's `Title` is separate content inside the component. |
| `ShowDialog(cancellationToken)` | Blocks this script call until the dialog closes or cancellation ends the wait. It keeps the Run alive while the window is in use. |
| Explicit `{ ... }` with `using var window` | Keeps creation, configuration and the blocking call inside the owned scope. Leaving the block disposes the window. Namespace imports stay above it. |
| **Stop** | Cancels the current Run token. The window API handles the cancellation and the script leaves its owning scope. |
| `WindowModel` | Initial data passed to the component. This plain property does not promise automatic notifications for later external changes. |
| `BlazorReactiveComponent<WindowModel>` | Supplies a typed `DataContext`; the counter handler awaits `Refresh` on the component dispatcher. |

`GetService` and `cancellationToken` belong to top-level `Script.csx`. Razor and ordinary helper classes need their dependencies explicitly. The component base has its own logger; it does not inherit the script's globals. The window API is named `IDialogWindowUnstableScriptingApi`; do not treat that name as a promise of compatibility across versions. See its [contract](/en/scripting/api/IDialogWindowUnstableScriptingApi) for the supported service surface.

`Show()` is non-blocking. Replacing `ShowDialog(...)` with `Show()` in this short block would immediately reach disposal. `.AddTo(ExecutionAnchors)` is another way to assign cleanup to the Run, but anchors alone do not keep a Run alive: meaningful work or a window wait must still remain in progress.

When the displayed state can change outside a button handler, the [reactive toggle](/en/scripting/blazor-windows/reactive-toggle) shows how to observe an aura trigger from the component. Keep this dialog’s script-owned window lifetime; use the observation pattern inside Razor rather than copying the overlay’s short entry point into this program.

<details>
<summary>When to use C# Overlay instead</summary>

Use **C# Overlay** when aura activity should control a persistent panel. Its generated entry point must finish setup before the overlay displays; do not place the blocking dialog code above into that entry point. Start with [the overlay counter](/en/scripting/blazor-windows/1-intro).

![Earlier counter example](https://i.imgur.com/iaKm2Br.png)
![Earlier Blazor window example](http://files.eyesquad.net/screenshots/31-10-2024/1YWZKXCaFhEh7SNnSx8YMWjAf.png)
![Adding an overlay in the earlier editor](https://s3.eyeauras.net/media/2024/11/msedge_zVrveCuFgBbtBB68.png)
![Editing the overlay component](https://s3.eyeauras.net/media/2024/11/Code_MJvkplH0Iiqmm9SV.png)

The [reactive component contract](/en/scripting/api/core/blazor) describes the shared base. The same HTML/CSS/Razor principles apply, but the overlay settings own its window. You can put a handler in a Razor `@code` block or its matching partial C# class; [the counter files](/en/scripting/blazor-windows/3-hello-world) show both arrangements.

</details>
