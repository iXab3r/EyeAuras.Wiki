---
title: Hello, world!
description: Step-by-step guide to creating the legendary Hello, world script in C# and setting it to run on a hotkey press.
published: true
date: 2024-02-23T23:15:46.402Z
tags: scripting, C#, automation, hotkey, tutorial
editor: markdown
dateCreated: 2024-02-20T19:56:21.080Z
---
# Log a message and repeat it with F1

This minimal program writes one line to EyeAuras's log. It has no input data or external packages: the message comes from the code, and the running **C# Script** host supplies **Log**.

You can [import the prepared example](https://eu.eyeauras.net/share/S20240223231508UC4AdkJYNJjI), or create it manually in an aura you own.

1. Create an aura and add **C# Script** to **On Enter**.

![Adding the script action in the older editor](https://i.imgur.com/mz7CUzL.png)

2. Put this complete program in top-level **Script.csx**:

```csharp
Log.Info("Hello, world!");
```

3. Click **Run** in the editor.

![Manual Run control in the older editor](https://i.imgur.com/VP8JnWk.png)

4. Find `Hello, world!` in that action's **Event Log**. Running again adds another line. The program finishes after logging, so it needs no manual Stop.

![Hello world in the action log](https://i.imgur.com/JeZXXU8.png)

These images show an earlier editor. The result to check is the text in the selected action's log. In an ordinary C# class, pass a logger explicitly; copying this statement into an unrelated project does not create one. A fresh script's default template can differ between versions.

## Run it on a key press

1. In the same aura, add **Hotkey Is Active**.

![Adding the hotkey trigger](https://i.imgur.com/j7ma0e1.png)

2. Set **F1** and **Hold**, leaving the script in **On Enter**.

![Hotkey and mode settings in the older editor](https://i.imgur.com/s3eKrnp.png)

3. Press and release F1. The aura enters its active state and runs the action. Press and release again to get another entry.

| Mode | State changes |
| --- | --- |
| Hold | Active from KeyDown to KeyUp. Two separate press/release cycles produce two entries into the active state. |
| Toggle | Toggles on KeyUp. The first cycle activates it and the second deactivates it, so the second does not run On Enter again. The tracker calls this mode Click. |

These are state transitions, not a queue for an unlimited number of long-running actions. This short program finishes before the next press. The [HotkeyTracker implementation](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Wpf/UI/Hotkeys/HotkeyTracker.cs) defines those transitions.
