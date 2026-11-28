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

The script asks Windows to resize a window that is already open. For the example, open an empty Notepad in normal windowed mode and leave only one such window. The script requests an outer size of `800 × 600`.

1. Add **C# Script** to your aura and paste the whole code into `Script.csx`. The functions belong to this script. They are not built-in API methods or a separate ordinary class.
2. For Notepad, keep the call with `"notepad.exe"`. For another window, change the [matching expression](/en/features/window-matching-expressions) and first check that it finds exactly the one window you want.

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

3. Click **Run**. Notepad should change size. The log shows the window, the requested size, the call result and the outer bounds that were read back.
4. Change the size in the call, for example to `1000, 700`, and run the script again for the same window.

| Parameter or result | Meaning |
| --- | --- |
| `width`, `height` or `Size` | The size passed to native `SetWindowPos`. The script keeps both overloads of the local function. |
| `targetWindowExpression` | An explicit matching expression. If it is empty, the function reads `default.WindowSelector.TargetWindow` from the available variable hierarchy. |
| Folder/BT `TargetWindow` | Where the expression comes from when you call without the third argument. Set it up beforehand: the script does not create it. |
| `accepted` | The result of the wrapper around the native request. It does not measure the final geometry. |
| `GetWindowRect` | Outer bounds of the HWND, including Windows frames. They differ from the client area and from the visible `DwmFrameBounds` frame. |

`SetWindowSize` does not change the window's position, Z-order or activation. It does not convert DPI, and the client area will not necessarily be `800 × 600`: native coordinates depend on the process's DPI context. The application can limit its size or stay maximised, so compare what you see with the bounds that were read back.

More: [coordinate systems](/en/features/coordinate-system) and the [versioned API reference](/en/scripting/api/reference).
