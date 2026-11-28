---
title: Getting Started
description: How to run your first C# script in EyeAuras and what to learn next.
published: true
date: 2025-08-23T00:13:57.665Z
tags: c#, .net, roslyn, blazor, webui, dependency injection, nuget, scripts, ai-translated
editor: markdown
dateCreated: 2024-02-28T12:56:22.746Z
---
# Run your first C# Script

Use a script when the built-in actions are not enough: for example, you need to calculate something and write it to the log. EyeAuras compiles the C# code itself. Your first script needs no IDE, SDK package or external library.

1. Create an aura and open its **On Enter** action list.
2. Add a **C# Script** action, open **Script.csx** and replace the starting code with the line below.
3. Click **Run** in the action editor. A manual run needs no trigger.
4. Open the script's log: it shows `Hello, world!`. If you see a compilation error instead, fix it first and set up automatic runs after that.

```csharp
Log.Info("Hello, world!");
```

**Log** comes from the [sandbox](/en/scripting/sandbox), the environment EyeAuras runs the script in. The sandbox also gives the top-level script **AuraTree**, **Variables**, **GetService**, **Sleep** and **cancellationToken**. An ordinary `.cs` class or Razor component does not have these names: pass or inject what it needs. More in [script runtime and host context](/en/scripting/api/scripting/runtime).

**Run** checks only the script itself. To log the message on a key press, add a separate [Hotkey Is Active](/en/triggers/hotkey-is-active) trigger, so the aura becomes active when you press the key. The whole path is covered in [Hello, world](/en/scripting/examples/basic/hello-world).

## Choose where the code belongs

| Surface | When to choose it |
| --- | --- |
| C# Script action | The code runs when the action runs: manually, when an aura enters or leaves a state, or in a macro. Automatic runs follow the rules of the action list. |
| C# Script trigger | The code checks a condition from time to time. `true` or `false` sets the trigger state. If the result cannot be converted to Boolean, the state is unknown. Check the polling interval and the [enabling conditions](/en/features/enabling-conditions). |
| C# Overlay / WebUI | Your own Blazor interface: buttons, fields, data on screen. It lives as long as the overlay does. |
| [EyePad](/en/features/eyepad) | Open a standalone file or solution and run it in a dedicated EyeAuras shell. |

If a script runs for a long time, check `cancellationToken` and release the resources you own. Subscribing to an event does not keep a script running on its own. A script with a bug can eat memory or start pressing keys. So test it first on something short that only writes to the log.

## Add dependencies after the first run

EyeAuras runs on [.NET](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) and compiles code with [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/).

![C sharp](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![Blazor](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![Roslyn](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)

You can add libraries for JSON, images and other tasks. This separate **Script.csx** asks for a specific version of Newtonsoft.Json and, once the package is restored and the script compiles, logs JSON:

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"
using Newtonsoft.Json;

Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

[![NuGet](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

How to add packages through Properties is in [NuGet](/en/scripting/nuget). Files that travel with the project are in [embedded resources](/en/scripting/embedded-resources). The [.NET library collection](https://github.com/quozd/awesome-dotnet) is a handy place to look for a package, but check each one for compatibility with EyeAuras.

To control the program from a script, request its services through [Dependency Injection](/en/scripting/dependency-injection). For example, [ISendInputScriptingApi](/en/scripting/api/ISendInputScriptingApi) handles input and IPlaySoundScriptingApi handles sound. **EyeAuras.SDK** only describes the contracts.

<details>
<summary>Custom interfaces and the next examples</summary>

In [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) you build forms from components. Action code alone is not enough for a window: you need a [custom UI](/en/overlays/custom-ui). Here is an example of such a form.

![Example form](https://s3.eyeauras.net/media/wiki/faq/d83bcbeeac554d2e9b939.png =x300)

After the log, move on to [image search](/en/scripting/examples/basic/image-search). When you reuse an old example, bring its dependencies and context along with the code.

</details>
