---
title: Sandbox
description: The environment your scripts run in and what it gives them.
published: true
date: 2025-03-23T11:44:49.173Z
tags: sandbox, scripting, code execution, logging, dependency injection, ai-translated
editor: markdown
dateCreated: 2024-02-20T19:26:43.431Z
---
# Script sandbox

The sandbox is the environment your scripts run in. It gives a script its basic methods and properties. In `Script.csx` you can use them directly. Ordinary C# classes do not have them, so pass dependencies to those classes explicitly.

## Why do you need it?

### It keeps **state** between runs

Say you created a property or a service, drew something on the screen or recognized text. The sandbox keeps that data and uses it again, so you do not redo the work on every run. Scripts run faster and are easier to write.

### It cleans up after the script

You can attach the resources of one run to `ExecutionAnchors`: they are released when the current `Run` ends. The sandbox itself and its `Anchors` can live longer and be reused. Look after your subscriptions and other resources yourself. Not everything `GetService` returns is released automatically.

![e0219e2e257a9878d5b6b2323dcb9c37.jpg](/assets/e0219e2e257a9878d5b6b2323dcb9c37.jpg =x200)

### It provides a set of basic functionality

Every script has a few built-in services by default: logging, access to program files and so on. The set is small on purpose, so a script does not carry anything it does not need. You add everything else with `GetService<>`. More on that below.

## What does it look like in code?

Below are the methods and properties every script has.

## Logging

```csharp
IFluentLog Log { get; }
```

Almost every script needs to report something: current variable values, debug messages and so on.

`Log` does that. It writes both to the program log files and to the `Event Log` window.

Each log entry has a **level**: **Debug**, **Info**, **Warn** or **Error**.

The higher the level, the more important the message. **Error** is the most important. In `Event Log` you can choose the lowest level to show. By default it shows **Info** and above.

```csharp 
Log.Info("Hello!"); 
Log.Debug("Hello from debug level!");
```

![](https://s3.eyeauras.net/media/wiki/scripting/sandbox/vWkUbVS.png =x300)

## For those who like to sleep

```csharp
void Sleep(TimeSpan delay);
void Sleep(int delayMs);
void Sleep(double delayMs);
void Sleep(double minDelayMs, double maxDelayMs);
```

This method pauses the script for the given time. It uses the current `cancellationToken`. The pause is synchronous. For an asynchronous wait, use `await Task.Delay(..., token)`.

```csharp
Sleep(2000); // Pause for two seconds.
Sleep(TimeSpan.FromMilliseconds(100)); // Pause for 100 milliseconds.
cancellationToken.ThrowIfCancellationRequested();
```

> `Sleep` itself does not throw a cancellation exception. On desktop, a wait longer than 30 ms can end early if the run is cancelled. A wait of 30 ms or less does not check the token. If the script must not go on after cancellation, call `cancellationToken.ThrowIfCancellationRequested()`. In asynchronous code, use `await Task.Delay(delay, cancellationToken)`.
{.is-info}

![](https://s3.eyeauras.net/media/wiki/scripting/sandbox/TYwJwzi.png =x300)

## [Dependency Injection](/scripting/dependency-injection)

```csharp
T GetService<T>()
```

This is the most powerful method in the sandbox. Through `GetService` a script reaches the different parts of the program: it requests the service it needs and works through it.

For example, let's pass the logger to an ordinary class. In `Script.csx`:

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

`Event Log` shows `Result: 5`. To get a registered service, give its exact interface and namespace. You can add your own services through [Script Container Extensions](/en/scripting/script-container-extensions).

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

The script writes three messages with pauses. If the run is cancelled, the wait stops. `cancellationToken` and `ExecutionAnchors` are issued for each `Run` and reset when it ends. So save the token at the start of the run and pass it to the work you start. Do not keep it as a permanent token for the whole sandbox, and do not leave background work running unattended after the run.

The state of the script object can survive between runs while the project version stays the same. A change in a dependent project version recreates the context. Do not treat this as long-term storage. For shared data and settings there are [variables](/en/scripting/variables), and for resources there is [resource lifetime](/en/scripting/api/scripting/reactive-lifetime).

The exact behaviour of `Sleep` is in the source code: [ScriptSandbox](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting.Metadata/Api/ScriptSandbox.cs) and the [desktop wait provider](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Scaffolding/WaitableTimerUtils.cs). Numeric delays are in milliseconds. The real duration depends on the OS scheduler. The two-number overload picks a random delay within the given range.
