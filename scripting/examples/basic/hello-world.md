---
title: Hello, world!
description: How to write a Hello, world script in C# and run it with a hotkey.
published: true
date: 2024-02-23T23:15:46.402Z
tags: scripting, C#, automation, hotkey, tutorial
editor: markdown
dateCreated: 2024-02-20T19:56:21.080Z
---
# Log a message and repeat it with F1

The simplest script: it writes one line to the EyeAuras log. There is no input data and no external packages. The message is set in the code, and the running **C# Script** host gives you **Log**.

You can [import the prepared example](https://eu.eyeauras.net/share/S20240223231508UC4AdkJYNJjI) or build it by hand in your own aura.

1. Create an aura and add **C# Script** to **On Enter**.

2. Paste the whole program into top-level **Script.csx**:

```csharp
Log.Info("Hello, world!");
```

3. Click **Run** in the editor.

4. Find the line `Hello, world!` in that action's **Event Log**. Every new **Run** adds one more. The code finishes right after logging, so you do not need to stop it by hand.

In an ordinary C# class, Log has to be passed in as a dependency.

Next, try the [typed counter example](/en/scripting/examples/basic/variables). It works with data that changes.

## Run it on a key press

1. In the same aura, add **Hotkey Is Active**.

2. Set **F1** and choose **Hold**. Leave the script in **On Enter**.

3. Press and release F1. The aura becomes active and runs the action. Press and release again to get one more line.

| Mode | State changes |
| --- | --- |
| Hold | Active from KeyDown to KeyUp. Two separate presses with a release give two entries into the active state. |
| Toggle | Switches on KeyUp. The first press turns the state on and the second turns it off, so the second press does not run On Enter again. The tracker code calls this mode Click. |

These are state transitions, not a queue for an endless number of long runs. You can see how the transitions work in [HotkeyTracker](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Wpf/UI/Hotkeys/HotkeyTracker.cs).
