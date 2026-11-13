---
title: Getting Started
description: 
published: true
date: 2025-08-23T00:13:57.665Z
tags: c#, .net, roslyn, blazor, webui, dependency injection, nuget, scripts, ai-translated
editor: markdown
dateCreated: 2024-02-28T12:56:22.746Z
---

# Hello, world!
Who wants to jump straight into action - live example [here](/scripting/examples/basic/hello-world), you may find it useful if you're new to C# world.
And [this one](/scripting/examples/basic/image-search) is a bit more complex and closer to EyeAuras internals.

## First run — a log message

Add a **C# Script** action to an aura and enter:

```csharp
Log.Info("Hello, world!");
```

Click `Run` in the script editor. The script log should contain `Hello, world!`. The host supplies `Log`; no additional logger or package is required. For automatic aura execution, configure a trigger and action list as described below.

An ordinary `.cs` helper must receive its logger explicitly. Sandbox members are not C# globals; see the [runtime operation](/en/scripting/api/scripting/runtime).

## What are scripts?

EyeAuras supports custom **C#** code, external IDE workflows and a [custom interface](/en/overlays/custom-ui) built with Blazor. Earlier scripting generations differ from the current runtime.

The third scripting generation supports external NuGet packages and APIs supplied by the running application. The runtime assists with cancellation and diagnostics; it does not protect arbitrary code against every failure.

## Under the Hood

The program is built on the [**.NET**](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) platform. It is a rapidly evolving platform that is highly flexible and efficient. Available language features depend on the host Roslyn version and project settings. An exported project shows the dependencies of your installed version.

Every script you write will be compiled using [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/). Most of the headaches related to how to include files, what can be done, and what cannot, have already been solved within the program itself. This leaves you to focus solely on working with the script.

![](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)

## Getting Started with Scripting

There are three ways in the program to run your code, all of which will be executed within a [sandbox](/en/scripting/sandbox).

### 1. C# Action

The simplest option. You just need to add a "**C# Script**" action. It follows the same rules as any other action, so to run it, you need to add a trigger. For example, you can add [Hotkey Is Active](https://wiki.eyeauras.net/en/triggers/hotkey-is-active), assign it to a button, and activate the script on press/hold.

### 2. C# Trigger

A more complex option - your script will be executed at specific time intervals. It is expected that somewhere in the code, you will return true/false or null, which will activate or deactivate the trigger. Then you can attach actions to the trigger, including script actions. The increased complexity lies in the fact that your script runs continuously and is controlled only by [Enabling Conditions](/en/features/enabling-conditions). Therefore, you need to write code more carefully; otherwise, you may find yourself in a situation where a script error constantly takes control of the mouse/keyboard or consumes all available memory on the computer.

### 3. C# Overlay and WebUI

The most advanced scripting option. In addition to everything available in actions/triggers, WebUI allows you to create a custom user interface with buttons, switches, and input fields. The UI technology used for rendering is called [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor), a component UI model for **.NET**. While the technology itself has some issues since perfection doesn't exist, EyeAuras provides solutions that smooth out these problems, ultimately limiting your possibilities only by your imagination. Below are some examples of different forms assembled on **WebUI**.

![](https://s3.eyeauras.net/media/wiki/changelogs/7639/iaKm2Br.png =x500) ![](https://cdn.discordapp.com/attachments/1170312651621023755/1197134740906577981/image.png?ex=65ba299b&is=65a7b49b&hm=40f31b17035b500a9973b6bbc5e6e25a882a9a7fd76961cd26e730481bd0c28a& =x300) ![](https://s3.eyeauras.net/media/wiki/faq/d83bcbeeac554d2e9b939.png =x300)

![](https://cdn.discordapp.com/attachments/846848467795836969/1168590651798069379/image.png?ex=655251da&is=653fdcda&hm=260bde6f1673493c9ec42573c205716289afdd032c2cc710ba8146fbec1e2793 =x200) ![](https://s3.eyeauras.net/media/wiki/scripting/getting-started/D7Nxmv7.png =x200)



## Services

Both the program and API are built on something called [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection). In simple terms, the program is divided into small pieces, each responsible for its own task. Just like in a big house where someone cooks porridge, someone sews socks, and someone doesn't know how to do anything but still exists.

---
Each entity in this house has a name. For example, if you want to move the mouse, you need to refer to [ISendInputScriptingApi](/en/scripting/api/ISendInputScriptingApi) and call `MouseMoveTo`. If you want to play a sound, you would go to [IPlaySoundScriptingApi](/en/scripting/dependency-injection). Responsibilities vary, and just like in life, knowing the correct names is crucial for success. This documentation will list the main and most useful services, but there is no point in listing the full spectrum - **EyeAuras.SDK** helps inspect contracts. Live service availability depends on the host and loaded modules; optional SDKs may require separate packages and registration.

## External Dependencies

[![](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

If every programmer started from scratch, we would still collectively reinvent the wheel. Therefore, scripts fully support external packages. In the **.NET** infrastructure, almost everything is stored in [NuGet](https://www.nuget.org/), including official and unofficial libraries. There are dozens of lists of useful packages; you can start with [this one](https://github.com/quozd/awesome-dotnet). You can connect almost any of them in scripts. There are currently some exceptions, but I am working on resolving them.


Pin package versions. For example, at the start of `Script.csx`:

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"
using Newtonsoft.Json;

Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

With the package available and compatible, the log receives JSON. A reference supplies types; it does not register host services. See [references and resources](/en/scripting/api/scripting/references-and-resources).

The core contracts were checked at EyeAuras `20fd3d4` and PoeEye `0e02c98`. Use your version's SDK/XML for exact signatures; live services come from the host.
