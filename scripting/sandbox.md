---
title: Sandbox
description: Testing and experimentation area
published: true
date: 2025-03-23T11:44:49.173Z
tags: sandbox, scripting, code execution, logging, dependency injection, ai-translated
editor: markdown
dateCreated: 2024-02-20T19:26:43.431Z
---
# Script sandbox

The sandbox is the environment where your scripts run. It provides host members directly to `Script.csx`. Ordinary C# classes do not inherit these members and must receive their dependencies explicitly.

## Why do you need it?

### It keeps **state** between runs

When you create a property or service, draw something on the screen, or recognize text, the sandbox stores and reuses data from previous runs so the same thing does not have to be created again and again. This improves performance and makes scripts easier to write.

### It cleans up after the script

Resources attached to `ExecutionAnchors` are released when the current `Run` ends.
The sandbox and its `Anchors` can live longer and be reused. Manage subscriptions
and other owned resources explicitly; not every result of `GetService` is
released automatically.

![e0219e2e257a9878d5b6b2323dcb9c37.jpg](/assets/e0219e2e257a9878d5b6b2323dcb9c37.jpg =x200)

### It provides a set of basic functionality

To make life easier, every script comes with a small set of built-in services by default: logging, access to program files, and so on. To avoid unnecessary bloat, this built-in functionality is intentionally very limited.

The expectation is that you will use `GetService<>` to add whatever capabilities your script needs. More on that below.

## What does it look like in code?

Let’s go over the methods and properties available in every script.

## Logging

```csharp
IFluentLog Log { get; }
```

At some point, almost every script needs to report something back: current variable values, debug messages, and so on.

`Log` is responsible for that. You can use it to write messages both to the program log files and to the `Event Log` window.

Each log entry has one of these **levels**: **Debug**, **Info**, **Warn**, **Error**.

The higher the level, the more important the message is. **Error** is the most important. In `Event Log`, you can choose which minimum level should be displayed. By default, it shows **Info** and above.

```csharp 
Log.Info("Hello!"); 
Log.Debug("Hello from debug level!");
```

![](https://i.imgur.com/vWkUbVS.png =x300)

## For those who like to sleep

```csharp
void Sleep(TimeSpan delay);
void Sleep(int delayMs);
void Sleep(double delayMs);
void Sleep(double minDelayMs, double maxDelayMs);
```

This is a synchronous pause using the current `cancellationToken`. For an
asynchronous wait, use `await Task.Delay(..., token)`.

```csharp
Sleep(2000); // Pause for two seconds.
Sleep(TimeSpan.FromMilliseconds(100)); // Pause for 100 milliseconds.
cancellationToken.ThrowIfCancellationRequested();
```

> `Sleep` does not itself throw a cancellation exception. On desktop, waits longer than 30 ms can return early on cancellation; waits of 30 ms or less do not check the token. Call `cancellationToken.ThrowIfCancellationRequested()` when work must not continue after cancellation. For asynchronous code, use `await Task.Delay(delay, cancellationToken)`.
{.is-info}

![](https://i.imgur.com/TYwJwzi.png =x300)

## [Dependency Injection](/scripting/dependency-injection)

```csharp
T GetService<T>()
```

This is the most powerful method in the sandbox. It is your script’s connection to the outside world and the way to access different parts of the program’s functionality.

With `GetService`, you can request the “handles” that let you trigger one behavior or another.

For example, pass the logger to an ordinary class. In `Script.csx`:

```csharp
var reporter = new Reporter(Log);
reporter.Report(2 + 3);
```

In a separate `Reporter.cs`:

```csharp
using PoeShared.Logging;

public sealed class Reporter
{
    private readonly IFluentLog log;
    public Reporter(IFluentLog log) => this.log = log;
    public void Report(int value) => log.Info($"Result: {value}");
}
```

`Event Log` shows `Result: 5`. Use the exact interface and namespace to resolve a
registered service; a type's presence in the SDK does not guarantee registration.
Add your own services through [Script Container Extensions](/en/scripting/script-container-extensions).

## Work with cancellation for one run

In `Script.csx`:

```csharp
using System.Threading.Tasks;

var runToken = cancellationToken;
for (var step = 1; step <= 3; step++)
{
    runToken.ThrowIfCancellationRequested();
    Log.Info($"Step {step}");
    await Task.Delay(500, runToken);
}
```

The script writes three messages with pauses. Cancelling the run cancels the wait.
`cancellationToken` and `ExecutionAnchors` are assigned for each `Run` and reset
when it ends. Capture the token for the work you start; do not keep it as the
sandbox's permanent lifetime token or leave untracked background work running.

Script-object state can persist between runs of the same project version.
A dependent project version change recreates the context; this is not durable
storage. See [variables](/en/scripting/variables) for shared state and settings,
and [resource lifetime](/en/scripting/api/scripting/reactive-lifetime) for cleanup.

The `Sleep` contract is defined by [ScriptSandbox](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting.Metadata/Api/ScriptSandbox.cs)
and the [desktop wait provider](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Scaffolding/WaitableTimerUtils.cs).
Numeric delays use milliseconds; actual timing depends on OS scheduling.
The two-number overload selects a random delay within the supplied range.
