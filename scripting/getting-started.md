---
title: Getting Started
description: 
published: true
date: 2025-08-23T00:13:57.665Z
tags: c#, .net, roslyn, blazor, webui, dependency injection, nuget, scripts, ai-translated
editor: markdown
dateCreated: 2024-02-28T12:56:22.746Z
---
# Run your first C# Script

Use a script when a built-in action is not enough: for example, to calculate a value and log it. EyeAuras compiles C# inside the application. The first log message needs no IDE, SDK package or external library.

1. Create your own aura and open its **On Enter** action list.
2. Add **C# Script**, open **Script.csx**, and replace the initial code with the program below.
3. Click **Run** in the action editor. This manual run needs no trigger.
4. Open that script's log and find `Hello, world!`. If compilation reports an error instead, fix it before arranging automatic execution.

```csharp
Log.Info("Hello, world!");
```

The EyeAuras [sandbox](/en/scripting/sandbox) supplies **Log** to this top-level script. It also provides context capabilities such as **AuraTree**, **Variables**, **GetService**, **Sleep** and **cancellationToken**. These names are not globals in an ordinary `.cs` helper or Razor component. Pass or inject the dependencies required by that component; see [script runtime and host context](/en/scripting/api/scripting/runtime).

To log on a key press, add a separate [Hotkey Is Active](/en/triggers/hotkey-is-active) trigger and use the aura's state transition. [Hello, world](/en/scripting/examples/basic/hello-world) covers that complete path. Another manual Run only checks the script itself.

## Choose where the code belongs

| Surface | Purpose |
| --- | --- |
| C# Script action | Work invoked as an action: manually, on an aura entering or leaving a state, or in a macro. Automatic execution follows the action list's rules. |
| C# Script trigger | Periodically evaluates a condition. Boolean results determine the state; a result that cannot convert to Boolean gives an unknown state. Check its polling interval and [enabling conditions](/en/features/enabling-conditions). |
| C# Overlay / WebUI | A Blazor interface with buttons, fields and displayed data, whose lifetime belongs to the overlay. |
| [EyePad](/en/features/eyepad) | Opens a standalone file or solution in the dedicated EyeAuras shell. |

Long-running work must cooperate with `cancellationToken` and release owned resources. Subscribing to an event does not by itself keep a script running. Incorrect code can still consume memory or control input, so begin with a short log-only result.

## Add dependencies after the first run

EyeAuras uses [.NET](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) and [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/). The linked .NET overview is background reading; the installed host and project settings determine your language version and assemblies.

![C sharp](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![Blazor](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![Roslyn](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)

Libraries can add JSON handling, image processing and other capabilities. This separate **Script.csx** requests a pinned Newtonsoft.Json version and logs JSON after successful restore and compilation:

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"
using Newtonsoft.Json;

Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

[![NuGet](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

See [NuGet](/en/scripting/nuget) for the Properties workflow and [embedded resources](/en/scripting/embedded-resources) for files that travel with the project. The [.NET library collection](https://github.com/quozd/awesome-dotnet) can help locate a package; compatibility with EyeAuras must be checked separately.

Application services are accessed through [Dependency Injection](/en/scripting/dependency-injection). For example, [ISendInputScriptingApi](/en/scripting/api/ISendInputScriptingApi) handles input, and IPlaySoundScriptingApi handles sound. **EyeAuras.SDK** describes contracts; it does not create live services or automatically load optional modules.

<details>
<summary>Custom interfaces and the next examples</summary>

[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) builds interfaces from components. Use the [custom UI route](/en/overlays/custom-ui) to host one, rather than pasting component markup into an action. This example from an earlier version shows a possible form; it is not part of the first program:

![Earlier form layout](https://telegra.ph/file/d83bcbeeac554d2e9b939.png =x300)

After logging, try [image search](/en/scripting/examples/basic/image-search). Earlier scripting generations differ from the current runtime; carry an example's dependencies and context with its code. Runtime diagnostics and cancellation support do not protect arbitrary code against every failure.

</details>
