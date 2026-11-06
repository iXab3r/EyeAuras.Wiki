---
title: Keybinds
description: aka Hotkeys
published: true
date: 2025-03-23T12:02:08.793Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T12:02:08.793Z
---

# What are Keybinds?

Keybinds allow you to link a specific function to a key press or key combination.

This is useful when you need to quickly activate a certain action, such as running a macro or executing a command.

---

## How Does It Work?

To assign a hotkey, use the `[Keybind]` attribute. This attribute can be added to a method, and it will be called when the specified key is pressed.

Paste this into `Script.csx` of a C# Action, run it and press Ctrl+2:

```csharp
using System.Threading.Tasks;
using EyeAuras.Scripting.Api;

Log.Info("Waiting for Ctrl+2");
var runToken = cancellationToken;
await Task.Delay(System.Threading.Timeout.Infinite, runToken);

[Keybind("Ctrl+2", SuppressKey = false)]
public void OnKey()
{
    Log.Info("Ctrl+2 pressed");
}
```

The Event Log receives `Ctrl+2 pressed`; the gesture also reaches other applications.
The explicit wait keeps Run open. Without it the script returns and stops accepting
keybind invocations. Stop cancels the wait. Runtime scans methods on the script
object during one-time setup; an attribute on an arbitrary helper class does not
register itself. This implementation supports keyboard gestures.

---

## `[Keybind]` Attribute Parameters

The `[Keybind]` attribute supports several parameters:

- **`Hotkey`** — Required parameter that specifies the hotkey or key combination (e.g., `Ctrl+A`, `Shift+X`, `Alt+Tab`).
- **`SuppressKey`** — Suppresses the key press event, preventing it from reaching other applications. Default is `true`. **Important:** Suppression works regardless of the `ActivationType` setting (see below).
- **`IgnoreModifiers`** — Ignores additional modifier keys. Default is `false`. This works similarly to `*` in AutoHotkey (Wildcard).
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
[Keybind("F1", ActivationType = KeybindActivationType.KeyDown)] // Calls method when F1 is pressed
[Keybind("F2", ActivationType = KeybindActivationType.KeyUp)]   // Calls method when F2 is released
```

## How Does `SuppressKey` Work?

If `SuppressKey = true`, the key press will not be passed to other applications. This is useful when you want to handle the key exclusively inside your script.

**Important:** Suppression always works, regardless of the `ActivationType`. For example:

```csharp
[Keybind("F1", SuppressKey = true, ActivationType = KeybindActivationType.KeyUp)] // Suppresses F1 and triggers on release
[Keybind("F2", SuppressKey = true, ActivationType = KeybindActivationType.KeyDown)] // Suppresses F2 and triggers on press
```

This helps prevent "key leaks" in unusual situations.

---

## Remap press and release

Add the following members to the same `Script.csx`, keeping the wait from the first
example, and add `using System.Windows.Input;`. The host must provide
`ISendInputScriptingApi` with the intended simulator/target configuration.

With `IgnoreModifiers = true`, extra modifiers do not prevent D from matching.
`SuppressKey` defaults to suppressing the original matching event. Sending R depends
on the simulator; it is not a guarantee for every target application. If the script
stops between Down and Up, arrange release of your sent key separately.

```csharp
[Unity.Dependency]
public EyeAuras.Roxy.Api.ISendInputScriptingApi SendInput { get; init; }

[Keybind(Hotkey = "d", ActivationType = KeybindActivationType.KeyDown, IgnoreModifiers = true)]
public void OnKeyDownForD(){
    SendInput.KeyDown(Key.R);
}

[Keybind(Hotkey = "d", ActivationType = KeybindActivationType.KeyUp, IgnoreModifiers = true)]
public void OnKeyUpForD(){
    SendInput.KeyUp(Key.R);
}
```

## Handler concurrency

Invocations are scheduled independently and can overlap. They are not automatically
a serial queue for each key.

### Queue invocations through a semaphore

Add `using System.Threading;` and choose one of these handlers in the same script.
The semaphore is a property retained across calls, not a new local per invocation:

```csharp
SemaphoreSlim HotkeySemaphore { get; } = new(1, 1);

[Keybind("A", SuppressKey = false)]
public async Task HandleA()
{
    var runToken = cancellationToken;
    await HotkeySemaphore.WaitAsync(runToken);
    try
    {
        Log.Info("Processing key A");
        await Task.Delay(1000, runToken);
    }
    finally
    {
        HotkeySemaphore.Release();
    }
}
```

Calls wait for the slot; the token can cancel that wait. An already scheduled callback
is not automatically stopped with Run. Return `Task`, not `async void`; the runtime
waits for returned Tasks.

### Skip extra invocations

Use this handler instead, retaining the same `HotkeySemaphore` property:

```csharp
[Keybind("A", SuppressKey = false)]
public async Task HandleA()
{
    var runToken = cancellationToken;
    if (!HotkeySemaphore.Wait(0))
    {
        return;
    }
    try
    {
        Log.Info("Processing key A");
        await Task.Delay(1000, runToken);
    }
    finally
    {
        HotkeySemaphore.Release();
    }
}
```

`Wait(0)` checks and takes the slot atomically. Checking `CurrentCount` before a
separate acquisition has a race: multiple callbacks can observe a free slot.

## Useful Tips

- ✅ Use `IgnoreModifiers = true` for flexibility if you want to handle combinations regardless of additional modifiers.
- ✅ Use `SemaphoreSlim` or other synchronization mechanisms if you need to prevent simultaneous calls to the same method.
- ✅ Remember that methods can accept parameters, whose types are resolved through the script Unity container at invocation (e.g., `IAuraEventLoggingService`).


## Source lifetime boundary

At `c8b2304`, the [runtime visitor](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting/Visitors/HotkeyTrackerRuntimeVisitor.cs)
checks the main key and requires all declared modifiers; `IgnoreModifiers` permits
additional modifiers. Suppression marks both matching Down and Up before filtering
which edge invokes the method. If required modifiers no longer match on release,
that release does not pass the same match test.

Run exit disables admission to the key stream. It does not await/drain callbacks
already scheduled on the background scheduler or synthesize KeyUp for keys your
handler sent. A callback reads the sandbox token when it actually runs; a late
callback can outlive the run that scheduled it. Its returned Task is synchronously
waited on that background callback, not joined by the main script. Coordinate
state, captured run ownership and shutdown explicitly for long-running handlers.
