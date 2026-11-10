---
title: Setting Window Size
description: 
published: true
date: 2025-10-19T13:28:14.334Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T13:28:14.334Z
---
# Resize a selected window

Request a new size for an already open window. For the first test, open your own empty Notepad in normal windowed mode and leave only one matching window. The script requests an outer size of `800 × 600`, without typing into or moving it.

1. Add **C# Script** to your own test aura. Paste the complete code into `Script.csx`; the functions are local to this script, not built-in commands or an ordinary helper class.
2. Keep `"notepad.exe"` for Notepad. For another window you own, change the [matching expression](/en/features/window-matching-expressions) after checking that it selects the one intended window.

```csharp
using System;
using System.Drawing;
using EyeAuras.Shared.Services;
using EyeAuras.Shared.Scaffolding;
using PoeShared.Native;
using PoeShared.Prism;

SetTargetWindowSize(800, 600, "notepad.exe");
// SetTargetWindowSize(new Size(800, 600)); // TargetWindow from folder/BT variables

private void SetTargetWindowSize(int width, int height, string targetWindowExpression = null)
{
    SetTargetWindowSize(new Size(width, height), targetWindowExpression);
}

private void SetTargetWindowSize(Size newSize, string targetWindowExpression = null)
{
    if (string.IsNullOrEmpty(targetWindowExpression))
    {
        var value = Variables.Get<string>("default.WindowSelector.TargetWindow");
        if (!value.HasValue || string.IsNullOrEmpty(value.Value))
        {
            Log.Warn("Set TargetWindow first or pass an expression");
            return;
        }
        targetWindowExpression = value.Value;
    }

    using var selector = GetService<IFactory<IWindowSelector>>().Create();
    var target = selector.FindWindow(targetWindowExpression);
    if (target == null || !target.IsWindow)
    {
        Log.Warn("No matching window found");
        return;
    }
    cancellationToken.ThrowIfCancellationRequested();
    var accepted = UnsafeNative.SetWindowSize(target.Handle, newSize);
    var actual = UnsafeNative.GetWindowRect(target.Handle);
    Log.Info($"Window: {target.Title}; requested: {newSize}; accepted: {accepted}; bounds: {actual}");
}
```

3. Click **Run**. Inspect the visible resize and the log's target, request, native return value and measured outer bounds. A missing window produces a separate message, not a successful resize.
4. Change the request to, for example, `1000, 700` and run it again for the same test window.

| Parameter or result | Meaning |
| --- | --- |
| `width`, `height` or `Size` | Dimensions passed to native `SetWindowPos`. Both local-function overloads are included. |
| `targetWindowExpression` | Explicit selector. If empty, reads `default.WindowSelector.TargetWindow` from the available variable hierarchy. |
| Folder/BT `TargetWindow` | Supplies that expression for the call without a third argument. Configure it first; this script does not create it. |
| `accepted` | The native wrapper's return value, not a measurement of final geometry. |
| `GetWindowRect` | HWND outer bounds, including Windows frames. These differ from client bounds and visible `DwmFrameBounds`. |

`SetWindowSize` uses no-move, no-Z-order and no-activation flags. It does not convert DPI or promise an `800 × 600` client area: native coordinates depend on the process's DPI context. The target can constrain resizing or remain maximised, so compare the visible result with the returned bounds.

The factory is borrowed from the host; the created selector is disposed on leaving the function, without closing the selected window. Cancellation is checked before the call, but the native resize itself receives no token. Moving a window requires a different native call and its own parameters; resizing is not a movement command.

See [coordinate systems](/en/features/coordinate-system) and the [versioned API reference](/en/scripting/api/reference) for the window contracts used by your host.
