---
title: Keybinds
description: aka Hotkeys
published: true
date: 2025-03-23T12:02:08.793Z
tags: 
editor: markdown
dateCreated: 2025-03-23T12:02:08.793Z
---

# What are Keybinds?

Keybinds allow you to link a specific function to a key press or key combination.

This is useful when you need to quickly activate a certain action, such as running a macro or executing a command.

---

## How Does It Work?

To assign a hotkey, use the `[Keybind]` attribute. This attribute can be added to a method, and it will be called when the specified key is pressed.

```csharp
[Keybind("p")] // Simple example - triggers when 'p' is pressed
[Keybind("Ctrl+2")] // Triggers only when 'Ctrl + 2' is pressed
[Keybind("Ctrl+2", IgnoreModifiers = true)] // Triggers on ANY combination containing 'Ctrl + 2' (e.g., 'Ctrl + Alt + 2')
public void OnKey(){
    Log.Info("Key pressed");
}

[Keybind(Hotkey = "4", SuppressKey = false)] // Handles the key, but it will still pass through to other apps
public void HandleKeyWithInjectedServices(IAuraEventLoggingService loggingService){
    Log.Info("Key pressed");
    loggingService.LogMessage(new AuraEvent(){ Text = "Message", Loglevel = FluentLogLevel.Info });
}
```

> IMPORTANT! Keybinds only work while the script is running!

---

## `[Keybind]` Attribute Parameters

The `[Keybind]` attribute supports several parameters:

- **`Hotkey`** — Required parameter that specifies the hotkey or key combination (e.g., `Ctrl+A`, `Shift+X`, `Alt+Tab`).
- **`SuppressKey`** — Suppresses the key press event, preventing it from reaching other applications. Default is `true`. **Important:** Suppression works regardless of the `ActivationType` setting (see below).
- **`IgnoreModifiers`** — Ignores additional modifier keys. Default is `true`. This works similarly to `*` in AutoHotkey (Wildcard).
- **`ActivationType`** — Determines when the method should be triggered: on **KeyDown** (when the key is pressed) or on **KeyUp** (when the key is released). Default is `KeyDown`.

## How Does `IgnoreModifiers` Work?

If `IgnoreModifiers = true`, the method will be triggered even if additional modifier keys (e.g., `Shift`, `Alt`, `Ctrl`) are pressed.
By default, `IgnoreModifiers` is **off**.

Example:

```csharp
[Keybind("Ctrl+2", IgnoreModifiers = true)] // Triggers on: Ctrl+2, Ctrl+Alt+2, Ctrl+Shift+2
[Keybind("Ctrl+2", IgnoreModifiers = false)] // Triggers ONLY on Ctrl+2
```

## How Does `ActivationType` Work?

The `ActivationType` parameter specifies when your method should be triggered:

- **`KeyDown`** — The method is triggered when the key is pressed down.
- **`KeyUp`** — The method is triggered when the key is released.

Examples:

```csharp
[Keybind("F1", ActivationType = KeyDown)] // Calls method when F1 is pressed
[Keybind("F2", ActivationType = KeyUp)]   // Calls method when F2 is released
```

## How Does `SuppressKey` Work?

If `SuppressKey = true`, the key press will not be passed to other applications. This is useful when you want to handle the key exclusively inside your script.

**Important:** Suppression always works, regardless of the `ActivationType`. For example:

```csharp
[Keybind("F1", SuppressKey = true, ActivationType = KeyUp)] // Suppresses F1 and triggers on release
[Keybind("F2", SuppressKey = true, ActivationType = KeyDown)] // Suppresses F2 and triggers on press
```

This helps prevent "key leaks" in unusual situations.

---

# Remapping
By combining the above parameters, you can fully remap one key to another. For example:

Now, no matter what other keys you press with `D`, it will always be replaced with `R`.

```csharp
ISendInputScriptingApi SendInput {get; init;} //initialize SendInput API

[Keybind(Hotkey = "d", ActivationType = KeybindActivationType.KeyDown, IgnoreModifiers = true)]
public void OnKeyDownForD(){
    SendInput.KeyDown(Key.R);
}

[Keybind(Hotkey = "d", ActivationType = KeybindActivationType.KeyUp, IgnoreModifiers = true)]
public void OnKeyUpForD(){
    SendInput.KeyUp(Key.R);
}
```

---

# How Keybind Handlers Work
The system supports parallel handling of key presses. This means that even if you press multiple keys quickly or repeatedly press the same key, each handler runs independently.

### Organizing Sequential Execution
Here's how you can organize sequential processing of key presses — with [SemaphoreSlim](https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim?view=net-9.0), you can ensure that other handlers wait until the current one finishes.

```csharp
// Allow only ONE active handler at a time - others will be queued
SemaphoreSlim hotkeySemaphore = new(1);

[Keybind("A")]
public void HandleA(){
   using var blockUntilCompleted = hotkeySemaphore.Rent(); //Important! This should be in all handlers you want to block

   Log.Info("Processing key A");
   Sleep(1000);    
}
```
If you press `A` several times in a row, the method will be processed **once** until the previous call finishes.

### Skipping Key Presses
If you need to **skip** extra presses instead of queuing them, you need to organize the code differently by checking for available slots.

```csharp
SemaphoreSlim hotkeySemaphore = new(1);

[Keybind("A")]
public void HandleA(){
   if (hotkeySemaphore.CurrentCount <= 0){ //Check for available slots
       Log.Info("Skipping handler - key press already being processed");
       return;
   }

   using var blockUntilCompleted = hotkeySemaphore.Rent(); //Occupy an available slot

   Log.Info("Processing key A");
   Sleep(1000);    
}
```
If you press `A` several times in a row, only one handler will run at a time, and the others will be **skipped**.

---

## Useful Tips

- ✅ Use `IgnoreModifiers = true` for flexibility if you want to handle combinations regardless of additional modifiers.
- ✅ Use `SemaphoreSlim` or other synchronization mechanisms if you need to prevent simultaneous calls to the same method.
- ✅ Remember that methods can accept parameters, which will be automatically requested through `GetService<>` (e.g., `IAuraEventLoggingService`).

