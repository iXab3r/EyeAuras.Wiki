---
title: Setting Window Size
description: 
published: true
date: 2025-10-19T13:28:14.334Z
tags: 
editor: markdown
dateCreated: 2025-10-19T13:28:14.334Z
---

`SetTargetWindowSize` allows you to set the size of a target window. Could be used in scripts/BehaviorTrees/Macros

### Interesting Points:
- `targetWindowExpression` could be window title, process name, etc. More details [here](/features/window-matching-expressions)
- if `targetWindowExpression` is not set, the method will pick TargetWindow that is set on folder/BT level 
- exactly same approach could be used to actually move window around, just change `SetWindowSize` to some other method

```csharp
SetTargetWindowSize(100, 200); //or SetTargetWindowSize(100, 200, "notepad.exe");

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
    UnsafeNative.SetWindowSize(targetWindow.Handle, newSize);
}
```