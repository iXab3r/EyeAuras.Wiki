---
title: Hello, world!
description: Step-by-step guide to creating the legendary Hello, world script in C# and setting it to run on a hotkey press.
published: true
date: 2024-02-23T23:15:46.402Z
tags: scripting, C#, automation, hotkey, tutorial
editor: markdown
dateCreated: 2024-02-20T19:56:21.080Z
---

# Hello, World - Printing the Legendary Hello, World

> You can import the ready-made example from here: [Hello, World Example](https://eu.eyeauras.net/share/S20240223231508UC4AdkJYNJjI){.is-info}

## Creating an Aura
Well, a screenshot is a must here, sorry.

## Creating a C# Script Action
![](https://i.imgur.com/mz7CUzL.png)

## Typing in the Code (in some fresh versions, the newly created script may already contain this code)
```csharp
Log.Info("Hello, world!");
```

## Pressing Run
![](https://i.imgur.com/VP8JnWk.png)

## Voila!
![](https://i.imgur.com/JeZXXU8.png)

Congratulations, this was officially the first step towards mighty scripts of the future.

## Run the script with a hotkey

To make it a bit more interesting, let's set up our script to run only when a specific key, for example, `F1`, is pressed.

## Adding the HotkeyIsActive Trigger to the Aura
![](https://i.imgur.com/j7ma0e1.png)

## Select Click/Hold mode and F1

![](https://i.imgur.com/s3eKrnp.png)


## That's It!
Now, every time you press `F1`, your script will print in the `Event Log`. Of course, this might not be the most exciting thing we can do, but more on that in the following examples.

Run `Log.Info("Hello, world!");` in the top-level C# Script Action. EyeAuras supplies
`Log`; no package or input is needed. The message appears in that Action's Event Log.
Ordinary classes receive a logger explicitly. A fresh script's default template
can vary by version.

The current tracker sets Hold active on KeyDown and inactive on KeyUp. Click
(Toggle in the UI) toggles on KeyUp. For an On Enter action, two press/release cycles
produce two entries in Hold; in Toggle the second cycle turns the state off.
This is a state-transition contract, not ordering of long-running actions.

[HotkeyTracker implementation](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Wpf/UI/Hotkeys/HotkeyTracker.cs).
