---
title: AutoHotkey Migration: Runtime, Timers, And State
description: Mapping AutoHotkey Sleep, SetTimer, and variables to EyeAuras script runtime and state APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ahk, autohotkey, migration, runtime, timers, variables
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AutoHotkey Migration: Runtime, Timers, And State

Use this page for `Sleep`, `SetTimer`, ordinary variables, globals, built-in
variables, and shared state.

## Quick Map

| AutoHotkey Need | AHK APIs | EyeAuras Route | First C# Shape | Judgment | Notes |
|---|---|---|---|---|---|
| Sleep or repeat later | `Sleep`, `SetTimer` | Script `Sleep(...)`, loops, services, observables | `Sleep(250);` or run a cancellation-aware loop | `Sleep` is good; `SetTimer` needs redesign. | EyeAuras script `Sleep(...)` is cancellation-aware and can finish early when the script stops. Aura Tree timer actions/triggers are configurable components, not lightweight script API equivalents. |
| Store script state | Variables, built-in variables, globals | C# locals, fields, objects; `ScriptVariable<T>` only for shared/persistent state | `var count = 0;` or `int Count { get; set; }` | Better for normal in-script state; use script variables only when sharing is needed. | `ScriptVariable<T>` / `IVariablesScriptingApi` are for state shared across launches, between scripts, or with EyeAuras infrastructure outside the script. |

## Sleep

AutoHotkey v2:

```ahk
Sleep 250
```

EyeAuras script:

```csharp
Sleep(250);
cancellationToken.ThrowIfCancellationRequested();
Log.Info("Delay finished");
```

**Recommendation:** Good shape. EyeAuras `Sleep(...)` is cancellation-aware,
which is usually better for scripts that may be stopped by the user.

## Ordinary State

AutoHotkey v2:

```ahk
count := 0
count += 1
```

EyeAuras script:

```csharp
var count = 0;
count += 1;
Log.Info($"Count: {count}");
```

Use normal C# locals, fields, and objects for ordinary in-script state. Use
`ScriptVariable<T>` / `IVariablesScriptingApi` only when the value must be
shared across launches, between scripts, or with EyeAuras infrastructure
outside the script.

**Recommendation:** Better than AHK for normal in-script state because it is
typed and explicit. Shared/persistent variables need separate examples.

## Repeat work with explicit cancellation

In a top-level C# Action, this logs steps 1–3 with a pause between steps:

```csharp
for (var i = 1; i <= 3; i++)
{
    cancellationToken.ThrowIfCancellationRequested();
    Log.Info($"Step {i}");
    Sleep(250);
}
```

This is a sequential loop, not AHK timer scheduling or reentrancy. `Sleep`, `Log`
and `cancellationToken` come from the script host. Ordinary classes receive token
and logger explicitly and can use `await Task.Delay(250, token)`. Local state is
recreated when this code runs; for shared state choose an owner in the
[Variables guide](/en/scripting/variables).

## Verification Links

- AHK docs:
  [Sleep](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/Sleep.htm),
  [SetTimer](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/lib/SetTimer.htm),
  [Variables and Expressions](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/Variables.htm),
  [Functions](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/Functions.htm),
  [Concepts](https://github.com/AutoHotkey/AutoHotkeyDocs/blob/v2/docs/Concepts.htm).
- AHK source:
  [script2.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/script2.cpp),
  [vars.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/lib/vars.cpp),
  [var.cpp](https://github.com/AutoHotkey/AutoHotkey/blob/v2.0/source/var.cpp).
- EyeAuras docs:
  [Scripting Runtime](../scripting/runtime),
  [IVariablesScriptingApi](../IVariablesScriptingApi).
- EyeAuras contracts: [sandbox Sleep](/en/scripting/sandbox),
  [variable lifetime](/en/scripting/api/scripting/variable-lifecycle-operations).

AHK v2 `Sleep 0` yields execution and `Sleep -1` checks the message queue;
these are not portable meanings for EyeAuras `Sleep`. AHK `SetTimer` uses positive
periods for repetition, negative periods for one-shot execution, and zero for
deletion; it does not interrupt a callback already executing. EyeAuras waits up
to 30 ms ignore cancellation in the current provider; longer waits may return
early without throwing. Check the token before continuing protected work.
