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

# Oh, Manually Clicking Run Isn't Cool

To make it a bit more interesting, let's set up our script to run only when a specific key, for example, `F1`, is pressed.

## Adding the HotkeyIsActive Trigger to the Aura
![](https://i.imgur.com/j7ma0e1.png)

## Switching it to `Click/Hold` mode and specifying `F1`
![](https://i.imgur.com/s3eKrnp.png)

`Click/Hold` is used to deactivate the trigger immediately after pressing. So, by pressing `F1` twice, we will execute our script twice. The `Toggle` mode would toggle the trigger on and off with each press. Since our action is in the OnEnter block, pressing twice would execute our script only **once**.

## That's It!
Now, every time you press `F1`, your script will print in the `Event Log`. Of course, this might not be the most exciting thing we can do, but more on that in the following examples.