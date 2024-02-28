---
title: How to Find an Aura
description: A guide on how to find an aura and access its properties and triggers within a script.
published: true
date: 2024-02-23T23:14:03.060Z
tags: aura, scripting, triggers, properties, C#
editor: markdown
dateCreated: 2024-02-20T20:35:06.280Z
---

> You can import a ready-made example from here: https://eu.eyeauras.net/share/S202402232313367YDKhksLfySg
{.is-info}

# Why Find an Aura?
To access the current state, name, actions, and triggers within the aura itself, you first need to locate the aura, and then you can explore its contents.

## What Will We Do?
Often, scripts need to retrieve results from triggers' actions. For example, recognized text or coordinates of a found image. Let's start with something simple - finding out the current state of the aura, whether it is active or not.

## Preliminary Steps
Let's set up what we will work with in the script:
- Create a folder named `Examples` at the root of the program, and within it, create a subfolder named `FindAura`.
- Create an aura named `Switch` in the subfolder.
- Add a trigger named `Fixed Value` to the `Switch` aura. Essentially, this is just a manual switch.
- Now, create another aura named `Script` next to it (you can be creative with the name of this aura; it's not important).
- In the `Script` aura, create an `OnEnter` action of type `C# Script`.
- It should look something like this:
![](https://i.imgur.com/8nk8IOG.png =x150)

## Now
```csharp
var aura = AuraTree.GetAuraByPath(@".\Switch"); // or by absolute path AuraTree.GetAuraByPath(@"Examples\FindTrigger\Switch");

// print the status, it will be true/false or null (for undefined state)
Log.Info($"Aura {aura.FullPath} IsActive: {aura.IsActive}");
```

![](https://i.imgur.com/deQdFyB.png)

## Let's Break It Down
To access the aura tree (the left panel displaying your auras and folders), we use [AuraTree](/ru/scripting/api/IAuraTreeScriptingApi). 
The `GetAuraByPath` method can search by absolute or relative path. If the aura is not found, it will halt the script with an error. There is a similar method called `FindAuraByPath`, which returns `null` if nothing is found. This `Get*` and `Find*` pattern is common and can be relied upon in various scenarios.

Once we have found the [aura](/ru/scripting/api/IAuraAccessor), we can read its current state from the `IsActive` property. Additionally, there are other important and useful properties such as the aura's name, triggers, actions within it, and more. We will explore these in the following examples.