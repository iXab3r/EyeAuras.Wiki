---
title: How to Add Mouse Movement Smoothing
description: 
published: true
date: 2024-07-01T20:34:21.401Z
tags: mouse movement, smoothing, algorithms, custom input smoother, ai-translated
editor: markdown
dateCreated: 2024-07-01T20:20:30.551Z
---
# Plan a mouse movement with your own smoother

A smoothing algorithm gets a start point and a target point and returns a movement plan. Here we write a simple linear one: 20 segments, which is 21 points with both ends, and a 10 ms pause after each point. The script moves the real cursor once to the centre of the primary monitor and clicks nothing.

You need desktop EyeAuras with the input module and **Windows Input**. For the first try, keep your own test window on the primary monitor and do not move it. Do not run other actions at the same time that change this API or the `MyScript.Linear20` registry entry.

A ready-made trajectory may be enough: compare the [built-in smoothing algorithms](/en/actions/sendinput/mouseinputsmoothing) first, then decide whether you need your own. If the cursor ends up at the wrong point, check the [coordinate system](/en/features/coordinate-system) first and only then change the interpolation.

1. Add **C# Script** to your aura. Paste the whole code into `Script.csx`, including the class after the main block. It is an ordinary class: it implements an interface and does not use script globals.

```csharp
using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using EyeAuras.Roxy.Api;
using EyeAuras.Roxy.Services;
using EyeAuras.Roxy.Shared;

{
    var input = GetService<ISendInputScriptingApi>();
    var registry = GetService<IUserInputSmootherRegistrator>();
    var custom = new CustomInputSmoother();
    var previousRegistration = GetService<IUserInputSmootherProvider>()
        .KnownEntities.Items.FirstOrDefault(x => x.Id == custom.Id);
    var previousSmoother = input.InputSmootherId;
    var previousSimulator = input.InputSimulatorId;
    var previousTarget = input.TargetWindow;
    registry.Register(custom);
    try
    {
        input.InputSimulatorId = "Windows Input";
        input.InputSmootherId = custom.Id;
        input.TargetWindow = null;
        var bounds = System.Windows.Forms.Screen.PrimaryScreen.Bounds;
        var target = new Point(bounds.X + bounds.Width / 2, bounds.Y + bounds.Height / 2);
        cancellationToken.ThrowIfCancellationRequested();
        Log.Info($"Start: {input.CursorPosition}; target: {target}");
        input.MouseMoveTo(target);
        Log.Info($"Cursor after movement: {input.CursorPosition}");
    }
    finally
    {
        input.TargetWindow = previousTarget;
        input.InputSimulatorId = previousSimulator;
        input.InputSmootherId = previousSmoother;
        if (previousRegistration != null) registry.Register(previousRegistration);
    }
}

public sealed class CustomInputSmoother : IUserInputSmoother
{
    public string Id { get; init; } = "MyScript.Linear20";
    public string Name { get; init; } = "Linear path with 20 segments";
    public int NumberOfPoints { get; init; } = 20;
    public TimeSpan DelayBetweenPoints { get; init; } = TimeSpan.FromMilliseconds(10);

    public IReadOnlyList<MouseInput> Generate(Point startPosition, Point targetPosition)
    {
        var inputs = new List<MouseInput>();
        for (var i = 0; i <= NumberOfPoints; i++)
        {
            var t = (float)i / NumberOfPoints;
            var x = (int)(startPosition.X * (1 - t) + targetPosition.X * t);
            var y = (int)(startPosition.Y * (1 - t) + targetPosition.Y * t);
            inputs.Add(new MouseInput(new Point(x, y), DelayBetweenPoints));
        }
        return inputs;
    }
}
```

2. Click **Run**. The cursor moves through the planned points to the centre of the primary screen. Compare the target and the final position in the log. The cursor stays where it arrived: restoring the settings does not move it back.

| Field or operation | Meaning |
| --- | --- |
| `Generate(startPosition, targetPosition)` | Returns a plan but does not send input itself. The controller supplies the start point, which is the current cursor position. |
| `NumberOfPoints = 20` | Number of segments. The loop includes both ends, so there are 21 points. If you change it, keep the value positive. |
| `DelayBetweenPoints = 10 ms` | The controller waits after each point. The pauses add up to a nominal 210 ms. |
| `Id` | A stable ID for your registry entry. Registering the same ID replaces the entry, so do not use another algorithm's ID and do not create a new ID every frame. |
| `TargetWindow = null` | The points in this example are screen coordinates. When input goes to a window, the controller converts the screen start position to window coordinates and back to screen on delivery. These are not client coordinates. |
| `InputSmootherId` | Selects a registered smoother for the API. At the end, `finally` restores the previous settings and the previous entry with the same ID, if there was one. |

`Register` returns `void`, and there is no public way to remove an entry. If there was no entry before, this one stays in the registry under its ID after the run. Stop does not undo the registration. The class has nothing to release through `Dispose`.

`MouseMoveTo` is called synchronously and does not pass the script token into the plan. Cancellation is checked before the movement starts, and Stop may not interrupt a movement that is already running.

<details>
<summary>Select a built-in smoother instead</summary>

Instead of your own class you can select a built-in algorithm by ID. The input module registers BenLand presets and model-backed variants. The source also contains a Kalon implementation, but it is not registered as a built-in preset. Save the previous `InputSmootherId` and restore it afterwards, as in the main code:

| ID | Purpose |
| --- | --- |
| `BenLandLinearFast` | Fast BenLand preset with low wind and a linear configuration. For an explicitly straight line, use the custom algorithm above. |
| `BenLandRandomizedFast` | BenLand preset with trajectory deviations. Do not expect a single random offset only at the start. |
| `MlHumanMouseV1` | **ML Human Move**: predicts compact movement parameters from a model pack and plans a bounded route with the default `2×` timing multiplier. |
| `MlHumanMouseFastV1` | **ML Human Move Fast**: the same model-backed planner with a `4×` timing multiplier. |

In code it is one line. Put it where your program already has `input` and restores the setting:

```csharp
input.InputSmootherId = "MlHumanMouseV1"; // or "MlHumanMouseFastV1"
```

This line alone does not move the mouse: the next input call does the movement. If you only use a built-in preset, remove the custom class with its creation and registration, and keep the target, the movement and the code that restores the setting. The ML presets need their model pack to load successfully. The example above does not use ML and needs no model training.

See the [older ready-made example](https://eyeauras.net/share/S20240701201856mfdkUQbqEY1k), [script runtime](/en/scripting/api/scripting/runtime) and the [SendInput API](/en/scripting/api/ISendInputScriptingApi).

</details>
