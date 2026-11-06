---
title: Dependency Injection
description: 
published: true
date: 2025-03-23T12:04:28.776Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T12:04:28.776Z
---
# Dependency injection

DI lets your code request registered host services instead of constructing them.
A type appearing in the SDK does not establish that the service is registered
in the current host.

## Resolve a service in Script.csx

In an EyeAuras C# Script with input services registered:

```csharp
using EyeAuras.Roxy.Api;

var input = GetService<ISendInputScriptingApi>();
Log.Info($"Screen cursor: {input.CursorPosition}");
```

This reads the cursor position without moving it. `GetService<T>()` resolves
through the sandbox container and related contexts; it is not a nullable
service-availability check. Repeated resolution need not create a new instance.
Ownership depends on registration, so give your own resources an explicit
[lifetime owner](/en/scripting/api/scripting/reactive-lifetime).

## Initialize a script property once

When several methods need the dependency, use a property. This is an alternative
complete `Script.csx` body:

```csharp
using Microsoft.AspNetCore.Components;
using EyeAuras.Roxy.Api;

[Inject] public ISendInputScriptingApi Input { get; init; }

Log.Info($"Screen cursor: {Input.CursorPosition}");
```

Runtime discovers writable `[Inject]` properties during `OneTimeSetupScript`
and assigns them through reflection. `init` restricts normal C# assignment;
it does not trigger injection by itself. Setup belongs to the script instance,
not every Run of a reused context.

Unity `[Dependency]` is another supported attribute. Use `set` if your code
needs to assign the property explicitly:

```csharp
using Unity;
using EyeAuras.Roxy.Api;

[Dependency] public ISendInputScriptingApi Input { get; set; }

Log.Info($"Screen cursor: {Input.CursorPosition}");
```

A setter does not automatically switch services when the target window changes.

## Pass a dependency to an ordinary class

An object created with `new` does not automatically receive sandbox members.
Put this class in `CursorReporter.cs`:

```csharp
using EyeAuras.Roxy.Api;
using PoeShared.Logging;

public sealed class CursorReporter
{
    private readonly ISendInputScriptingApi input;
    private readonly IFluentLog log;

    public CursorReporter(ISendInputScriptingApi input, IFluentLog log)
    {
        this.input = input;
        this.log = log;
    }

    public void Report() => log.Info($"Screen cursor: {input.CursorPosition}");
}
```

Then call it from `Script.csx`:

```csharp
using EyeAuras.Roxy.Api;

var reporter = new CursorReporter(GetService<ISendInputScriptingApi>(), Log);
reporter.Report();
```

The class borrows both services and writes to the script log. It does not dispose
them after the call. For larger object graphs, use a
[ScriptContainerExtension](/en/scripting/api/scripting/container-extensions).
Razor injection is performed by Blazor and does not apply to arbitrary objects.

## Another registered service: sound

With the default aura module and audio services available:

```csharp
using EyeAuras.DefaultAuras.Scripting;
using PoeShared.Audio.Services;

await GetService<IPlaySoundScriptingApi>()
    .PlaySound(AudioNotificationType.Minions, playInBackground: false);
```

The task waits for playback when `playInBackground` is false; the default is
true. This overload has no cancellation token and its implementation uses
`CancellationToken.None`, so the script token does not cancel playback.

## Choose the simplest acquisition

- One call in a top-level script: `GetService<T>()`.
- Several script methods: `[Inject]` or `[Dependency]` property.
- An ordinary class: an explicit constructor parameter.

Check exact registrations against the host and SDK version.
[Mouse overlay](/en/scripting/examples/basic/mouse-track-with-overlay) and
[displaying variables](/en/scripting/examples/basic/print-variables-on-screen)
show these services in larger operations.

Reading `CursorPosition` delegates to the selected `InputController`. The base controller returns `System.Windows.Forms.Cursor.Position` in screen coordinates; assigning the property instead invokes `MouseMoveTo`.

[SendInputScriptingApi](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Roxy/Api/SendInputScriptingApi.cs).
