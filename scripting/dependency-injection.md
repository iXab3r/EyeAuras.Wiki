---
title: Dependency Injection
description: 
published: true
date: 2025-03-23T12:04:28.776Z
tags: 
editor: markdown
dateCreated: 2025-03-23T12:04:28.776Z
---

# What is Dependency Injection (DI)?

**Dependency Injection (DI)** is a mechanism that allows your code to access various services and program functionality. Imagine you have a toolbox (DI container), and you can simply ask for the tool you need by name instead of building it yourself.

In simple terms:
- You say: "I need a service for moving the mouse."
- The program responds: "Here it is, take it and use it!"

This approach helps you instantly see which parts of the program the script interacts with — it's clear what "tools" the script requires. 
This not only simplifies script maintenance but also allows for some optimization techniques — when it's clear what the script needs, unused parts can be ignored to improve efficiency.

---

# Ways to Obtain Services Using DI

## 1. Init-only Properties (Recommended)
Using `init` properties is a simple and safe way to receive dependencies. Such properties are initialized **once at script startup** and cannot be changed later.

Example:
```csharp
ISendInputScriptingApi SendInput { get; init; } // Automatically initialized when the script starts

SendInput.MouseMoveTo(200, 100); // Moves the mouse to X200 Y100
SendInput.MouseRightClick(); // Performs a right mouse click
```

---

## 2. The `Dependency` Attribute
The `[Dependency]` attribute tells EyeAuras to automatically initialize a property when the script starts. Unlike `init`, such a property can be **changed** after the script starts.

Example:
```csharp
[Dependency] ISendInputScriptingApi SendInput { get; set; }

SendInput.MouseMoveTo(200, 100); // Moves the mouse to X200 Y100
SendInput.MouseRightClick(); // Performs a right mouse click
```

When to use `Dependency`?
- When a service may change dynamically (e.g., switching to another window)
- When you want the ability to manually override the service

---

## 3. The `GetService` Method (Most Powerful and Flexible Option)
The `GetService` method is the most flexible way to access services in your script. It allows you to "on the fly" request the necessary dependency and use it immediately.

Example for mouse control:
```csharp
var sendInput = GetService<ISendInputScriptingApi>();
sendInput.MouseMoveTo(200, 100); // Moves the mouse to X200 Y100
sendInput.MouseRightClick(); // Performs a right mouse click
```

Example for playing sounds:
```csharp
using PoeShared.Audio.Services; // Don't forget to include the namespace
var sound = GetService<IPlaySoundScriptingApi>();
sound.PlaySound(AudioNotificationType.Minions); // Plays a sound
```

When to use `GetService`?
- When services need to be created dynamically and in an unspecified number
- When a service may change dynamically or be temporarily unavailable

---

# Which Method Should I Choose?
- ✅ Use `init` properties for the easiest way to get access to services.
- ✅ Use `[Dependency]` if you want the ability to change services while the script is running.
- ✅ Use `GetService` in situations where a service is needed temporarily or may change dynamically.