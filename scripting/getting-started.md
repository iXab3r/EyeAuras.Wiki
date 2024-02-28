---
title: Where to Start?
description: An overview of scripting capabilities in a software program and how to begin writing scripts using C#.
published: true
date: 2024-02-20T19:34:49.206Z
tags: scripting, C#, .NET, Roslyn, Blazor, WebUI, Dependency Injection, NuGet
editor: markdown
dateCreated: 2024-02-20T14:01:34.128Z
---

# What Are Scripts Anyway?
Since its inception, the program has allowed writing custom code in **C#**. In the early versions (around spring 2021), it was quite painful and inconvenient, but still possible. The second version was released in spring 2023, introducing features like the ability to use an external IDE for script writing and significantly enhanced script capabilities, such as creating a full-fledged [custom user interface](/en/overlays/custom-ui) using [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor). Essentially, this unlocked the potential to write powerful scripts, although there were still many obstacles and "peculiarities".

Now, in spring 2024, a new version of scripts is gradually emerging. In this third generation, the scripting system's capabilities are enormous - almost everything the program itself can do is accessible, including the ability to connect external NuGet packages, crash protection, type safety, and much more. The entry barrier has also been significantly lowered with new APIs, improved diagnostics, and more.

# Under the Hood
The program is built on the [**.NET**](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) platform, a highly dynamic, flexible, and efficient platform. It uses [C# 12](https://learn.microsoft.com/en-us/dotnet/csharp/) as the scripting language.

Every script you write is compiled using [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/). Most of the headaches related to file inclusion, do's and don'ts, and similar issues are already resolved within the program, allowing you to focus solely on working with the script.

![](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)

# Getting Started with Scripting
There are three ways to run your code within the program, all executed within a [sandbox](/en/scripting/sandbox).

### 1. C# Action
The simplest option. You just need to add a "**C# Script**" action. It follows the same rules as any other action, so to run it, you need to add a trigger. For example, you can add a [Hotkey Is Active](https://wiki.eyeauras.net/en/triggers/hotkey-is-active), assign it to a button, and activate the script on press/hold.

### 2. C# Trigger
A more complex option - your script will run at specified time intervals. It is expected that somewhere in the code, you will return true/false or null, which will activate or deactivate the trigger. You can then attach actions to the trigger, including script actions. The increased complexity lies in the fact that your script runs continuously and is controlled only by [Enabling Conditions](/en/docs/enablingconditions), requiring more careful coding to avoid situations where a script error continuously takes control of the mouse/keyboard or consumes all available memory on the computer.

### 3. WebUI Overlay
The most advanced scripting option. In addition to everything available in actions/triggers, WebUI allows you to create a custom user interface with buttons, switches, and input fields. The UI technology used for rendering is called [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor), which is the best infrastructure **.NET** can offer as of 2024. While the technology has some issues since perfection doesn't exist, EyeAuras provides solutions that mitigate these problems, ultimately limiting your possibilities only by your imagination. Below are examples of different forms assembled on **WebUI**.

![](https://i.imgur.com/iaKm2Br.png =x500) ![](https://cdn.discordapp.com/attachments/1170312651621023755/1197134740906577981/image.png?ex=65ba299b&is=65a7b49b&hm=40f31b17035b500a9973b6bbc5e6e25a882a9a7fd76961cd26e730481bd0c28a& =x300) ![](https://telegra.ph/file/d83bcbeeac554d2e9b939.png =x300)

![](https://cdn.discordapp.com/attachments/846848467795836969/1168590651798069379/image.png?ex=655251da&is=653fdcda&hm=260bde6f1673493c9ec42573c205716289afdd032c2cc710ba8146fbec1e2793 =x200) ![](https://i.imgur.com/D7Nxmv7.png =x200)

> February 20, 2024
> At the time of writing this article, WebUI still uses an older version of scripts, which will be updated in the coming weeks.
{.is-warning}

# Services Galore
Both the program and API are built on something called [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection). In simple terms, the program is divided into small pieces, each responsible for its own task. Just like in a big house where someone cooks, someone sews socks, and someone doesn't know how to do anything but still exists.

---
In this house, everyone has a name. For example, if you want to move the mouse, you need to refer to [ISendInputUnstableScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html) and call [MouseMoveTo](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.MouseMoveTo.html#EyeAuras_Roxy_Api_ISendInputUnstableScriptingApi_MouseMoveTo_System_Int32_System_Int32_). If you want to play a sound, you turn to [IPlaySoundScriptingApi](https://docs.eyeauras.net/api/EyeAuras.DefaultAuras.Scripting.IPlaySoundScriptingApi.html). Everyone has different responsibilities, and just like in life, knowing the right names is crucial. This documentation will list the main and most useful ones, but there's no point in listing the full spectrum - the **NuGet** package **EyeAuras.SDK** lists everything available for your scripts.

# External Dependencies
[![](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

If every programmer started from scratch, we'd still collectively reinvent the wheel. That's why scripts fully support external packages. In the **.NET** infrastructure, almost everything is stored in [NuGet](https://www.nuget.org/), including official and unofficial libraries. There are dozens of lists of useful packages; you can start with [this one](https://github.com/quozd/awesome-dotnet). You can connect almost any of them in scripts. There are currently some exceptions, but I'm working on resolving them.

> February 20, 2024
> Currently, external library support is only enabled for alpha testers. Once this functionality stabilizes, it will be available to everyone else. I expect these restrictions to be lifted in early to mid-March.
{.is-warning}