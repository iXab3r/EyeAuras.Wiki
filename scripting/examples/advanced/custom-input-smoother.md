---
title: How to Add Mouse Movement Smoothing
description: 
published: true
date: 2024-09-11T20:54:40.417Z
tags: input, programming, mouse movement, smoothing, algorithms
editor: markdown
dateCreated: 2024-07-01T21:50:13.798Z
---

# Adding Mouse Movement Smoothing
By default, the mouse "teleports" from point A to point B, which is not always the desired behavior. This is where "smoothers" come to the rescue - tools that can plan mouse movement based on some logic.
The algorithm itself can vary. By default, the program includes algorithms from BenLand (`BenLandUserInputSmoother`) and Kalon (`KalonUserInputSmoother`).
These algorithms have some parameters that you can adjust, but even by default, the program includes several presets, here are the most useful ones:
- `BenLandLinearFast` - moves the mouse from point A to point B in a straight line
- `BenLandRandomizedFast` - adds some deviation at the starting point of the trajectory

By specifying `InputSmootherId` in the code, you can instruct the simulator to smooth mouse movements.

```csharp
ISendInputUnstableScriptingApi SendInput { get; } = GetService<ISendInputUnstableScriptingApi>(); // needed for input sending
SendInput.InputSmootherId = "BenLandRandomizedFast"; // specify the Smoother Id here
```

## Example where we implement our own smoothing
> You can import the ready-made example from here: https://eyeauras.net/share/S20240701201856mfdkUQbqEY1k
{.is-info}

1. Create an aura with a script
2. Copy-paste, run it, if everything is fine - the script will move the mouse to the center of the screen with a visible delay and smoothly enough

```csharp
using EyeAuras.Roxy.Services;

ISendInputUnstableScriptingApi SendInput { get; } = GetService<ISendInputUnstableScriptingApi>(); // needed for input sending

var customSmoother = new CustomInputSmoother();
GetService<IUserInputSmootherRegistrator>() // get the service responsible for our "smoothers"
    .Register(customSmoother); // and add ours

// now tell the API to use our smoother
SendInput.InputSmootherId = customSmoother.Id; // or something like "BenLandRandomizedFast";

var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize; // get the size of the primary screen

Log.Info($"Primary monitor size: {screenSize}");
SendInput.MouseMoveTo(screenSize.Width / 2, screenSize.Height / 2); // move to the center
Log.Info($"Movement completed, cursor is at: {SendInput.CursorPosition}");

/// <summary>
/// This class contains the essence of our smoother.
/// It adds NumberOfPoints points between the starting and target positions.
/// A "real" smoother can use things like Bezier curves or any other logic
/// </summary>
class CustomInputSmoother : IUserInputSmoother
{
    public string Id { get; init; } = "MySmoother";

    public string Name { get; init; } = "This is my new cool input smoother";

    public int NumberOfPoints { get; init; } = 20;

    public TimeSpan DelayBetweenPoints { get; init; } = TimeSpan.FromMilliseconds(10);

    public IReadOnlyList<MouseInput> Generate(
        Point startPosition,
        Point targetPosition)
    {
        var inputs = new List<MouseInput>();

        // thanks to ChatGPT for some code for approximating points on a line
        for (int i = 0; i <= NumberOfPoints; i++)
        {
            var t = (float)i / NumberOfPoints;

            var x = (int)(startPosition.X * (1 - t) + targetPosition.X * t);
            var y = (int)(startPosition.Y * (1 - t) + targetPosition.Y * t);

            var input = new MouseInput(new Point(x, y), DelayBetweenPoints);
            inputs.Add(input);
        }

        return inputs;

    }
}
```