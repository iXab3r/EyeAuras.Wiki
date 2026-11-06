---
title: Setting Window Size
description: 
published: true
date: 2025-10-19T13:28:14.334Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T13:28:14.334Z
---

# SetTargetWindowSize

`SetTargetWindowSize` is a local function in this example, not a built-in command.
Paste the whole block into a top-level C# Script Action, BT script node or macro
step. Open Notepad; the example requests an 800×600 window. Change `notepad.exe`
to select another window.

### Interesting Points:
- `targetWindowExpression` could be window title, process name, etc. More details [here](/features/window-matching-expressions)
- if `targetWindowExpression` is not set, the method will pick TargetWindow that is set on folder/BT level 
- exactly same approach could be used to actually move window around, just change `SetWindowSize` to some other method

```csharp
using System.Drawing;
using PoeShared.Native;
using EyeAuras.Shared.Services;

SetTargetWindowSize(800, 600, "notepad.exe");
// SetTargetWindowSize(800, 600); // Use the folder/BT TargetWindow expression

private void SetTargetWindowSize(int width, int height, string? targetWindowExpression = default){
    SetTargetWindowSize(new Size(width, height), targetWindowExpression);
}

private void SetTargetWindowSize(Size newSize, string? targetWindowExpression = default)
{
    string windowExpression;
    if (string.IsNullOrEmpty(targetWindowExpression))
    {
        var defaultWindowVar = Variables.Get<string>("default.WindowSelector.TargetWindow");
        if (!defaultWindowVar.HasValue)
        {
            throw new ArgumentException("Folder's TargetWindow is not set");
        }
        windowExpression = defaultWindowVar.Value;
    }
    else
    {
        windowExpression = targetWindowExpression;
    }
    var targetWindow = GetService<IWindowSelector>().GetWindow(windowExpression);
    var accepted = UnsafeNative.SetWindowSize(targetWindow.Handle, newSize);
    Log.Info($"SetWindowSize accepted: {accepted}; requested: {newSize}");
}
```

`PoeShared.Native.UnsafeNative.SetWindowSize` calls `SetWindowPos` without moving,
changing Z-order or activating the window. Inspect the visible result: the target
can constrain sizing, be maximized or process the request differently. This is
native window size, not a promise of an 800×600 client area. Borders, DPI and input
coordinates are separate contexts. `accepted` reports the wrapper call's result,
not measured final geometry. See the [window map](/en/scripting/api/windows-subsystems/window-handles).
The native call receives no cancellation token.
