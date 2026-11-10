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

A smoother receives start and target points and returns a movement plan. Implement a straight-line plan with 20 segments, 21 points including both endpoints, and a requested 10 ms delay after each point. The script moves the real cursor once to the primary monitor's centre, without clicking.

Use desktop EyeAuras with its input module and **Windows Input**. Keep your own stationary test window on the primary monitor. Do not run other actions that change this API or the `MyScript.Linear20` registry entry at the same time.

1. Add **C# Script** to your own aura. Put the whole program into `Script.csx`, including the ordinary class after the executable block. The class implements an interface without accessing script globals.

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

2. Click **Run**. The cursor moves through the planned points towards the primary-screen centre. Compare the target and final cursor position in the log. Restoring settings does not move the cursor back.

| Field or operation | Meaning |
| --- | --- |
| `Generate(startPosition, targetPosition)` | Returns a plan; it does not itself send input. The controller supplies the current cursor position as the start. |
| `NumberOfPoints = 20` | Segment count; the inclusive loop yields 21 points. Keep this value positive if you change it. |
| `DelayBetweenPoints = 10 ms` | Delay after each point. The nominal 210 ms sum is not an exact wall-clock promise. |
| `Id` | Stable private registry key. Registering the same ID replaces its entry; do not use another algorithm's ID or generate a new ID each frame. |
| `TargetWindow = null` | This example's plan uses screen coordinates. For targeted movement, the controller converts the screen start to window coordinates, then back to screen on delivery; those are not client coordinates. |
| `InputSmootherId` | Selects a registered smoother. Previous API settings and any previous same-ID registration are restored in `finally`. |

`Register` returns `void` and exposes no public unregister operation. If there was no previous entry, this one remains under its stable ID after Run; Stop does not unregister it. The class owns no disposable native resources. Do not invent an `Unregister` call or promise complete registry rollback.

`MouseMoveTo` is synchronous and does not pass the script token into the plan. The check acts before movement, not as an instant interruption of an in-progress route. The plan interpolates points; delivery depends on the selected backend and is not a guarantee of an exact physical device trajectory.

<details>
<summary>Select a built-in smoother instead</summary>

The current input module registers BenLand presets and model-backed variants. The source also contains a Kalon implementation, but it is not registered as a built-in preset. Choose an available registered ID, while preserving and restoring `InputSmootherId` as in the main program:

| ID | Purpose |
| --- | --- |
| `BenLandLinearFast` | Fast BenLand preset with low wind and a linear configuration. Use the custom algorithm above when you need explicit straight-line interpolation. |
| `BenLandRandomizedFast` | BenLand preset with trajectory deviations, not a promise of only one initial offset. |
| `MlHumanMouseV1` | **ML Human Move**: predicts compact movement parameters from a model pack and plans a bounded route with the default `2×` timing multiplier. |
| `MlHumanMouseFastV1` | **ML Human Move Fast**: the same model-backed planner with a `4×` timing multiplier. These are planner settings, not measured speed guarantees. |

For example, this selection fragment belongs where your existing program already has `input` and owns restoration:

```csharp
input.InputSmootherId = "MlHumanMouseV1"; // or "MlHumanMouseFastV1"
```

Selection alone sends no movement. If using only a built-in preset, omit custom creation/registration and its class, and keep the target, movement and setting-restoration code. The ML presets need their model pack to load successfully; registration or an SDK reference alone does not prove the model is available. The example above does not use ML or require model training. Neither planner offers an invisibility or detection-avoidance guarantee.

See the [historical ready-made example](https://eyeauras.net/share/S20240701201856mfdkUQbqEY1k), [script runtime](/en/scripting/api/scripting/runtime) and [SendInput contract](/en/scripting/api/ISendInputScriptingApi) for the host and delivery boundaries.

</details>
