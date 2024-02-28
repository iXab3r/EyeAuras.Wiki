---
title: Getting Started
description: Overview of scripting capabilities and features in the program.
published: true
date: 2024-02-20T19:34:49.206Z
tags: scripting, C#, .NET, Roslyn, Blazor, WebUI, Dependency Injection, NuGet
editor: markdown
dateCreated: 2024-02-20T14:01:34.128Z
---

# What Are Scripts?
Since its inception, the program has had the ability to write custom code in **C#**. In the early versions (~spring 2021), it was very painful and inconvenient, but still possible. The second version was released in spring 2023 and introduced features such as the ability to use an external IDE for script writing and significantly enhanced script capabilities, for example, creating a full-fledged [custom user interface](/en/overlays/custom-ui) using [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor). Essentially, this unlocked the potential to write powerful scripts, although there were still many obstacles and "peculiarities".

And now, in spring 2024, a new version of scripts is gradually emerging. In this third generation, the capabilities of the scripting system are vast - almost everything the program itself can do is accessible, with the ability to integrate third-party NuGet packages, protection against crashes and common errors, and much more. The entry barrier has also been significantly lowered - new APIs have been added, diagnostics improved, and so on.

# Under the Hood
The program is built on the [**.NET**](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) platform. It is a rapidly evolving platform that is highly flexible and efficient. The scripting language used is [C# 12](https://learn.microsoft.com/en-us/dotnet/csharp/).

Every script you write is compiled using [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/). Most of the headaches related to file inclusion, what can and cannot be done, and similar issues are already resolved within the program, allowing you to focus solely on working with the script.

![](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)

# How to Start Writing Scripts?
There are 3 ways in the program to run your code, all of which will run within a [sandbox](/en/scripting/sandbox).

### 1. C# Action
The simplest option. You just need to add a "**C# Script**" action. It follows the same rules as any other action, so to run it, you need to add a trigger. For example, you can add a [Hotkey Is Active](https://wiki.eyeauras.net/en/triggers/hotkey-is-active), assign it to a button, and activate the script on press/hold.

### 2. C# Trigger
A more complex option - your script will be executed at specific time intervals. It is expected that at some point in the code, you will return true/false or null, which will activate or deactivate the trigger. Then you can attach actions to the trigger, including script actions. The increased complexity lies in the fact that your script runs continuously and is controlled only by [Enabling Conditions](/en/docs/enablingconditions), so you need to write code more carefully; otherwise, you may end up in a situation where a script error constantly takes control of the mouse/keyboard or consumes all available memory on the computer.

### 3. WebUI Overlay
The most advanced scripting option. In addition to everything available in actions/triggers, WebUI allows you to create a custom user interface with buttons, switches, and input fields. The UI technology used for rendering is called [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor), and as of 2024, it is the best infrastructure that **.NET** can offer. While the technology itself has some issues since perfection does not exist, EyeAuras provides solutions that smooth out these problems, ultimately limiting your capabilities only by your imagination. Below are some examples of different forms assembled on **WebUI**.

![](https://i.imgur.com/iaKm2Br.png =x500) ![](https://cdn.discordapp.com/attachments/1170312651621023755/1197134740906577981/image.png?ex=65ba299b&is=65a7b49b&hm=40f31b17035b500a9973b6bbc5e6e25a882a9a7fd76961cd26e730481bd0c28a& =x300) ![](https://telegra.ph/file/d83bcbeeac554d2e9b939.png =x300)

![](https://cdn.discordapp.com/attachments/846848467795836969/1168590651798069379/image.png?ex=655251da&is=653fdcda&hm=260bde6f1673493c9ec42573c205716289afdd032c2cc710ba8146fbec1e2793 =x200) ![](https://i.imgur.com/D7Nxmv7.png =x200)

> February 20, 2024
> At the time of writing this article, WebUI still uses an older version of scripts, which will be updated in the coming weeks.
{.is-warning}

# Services Galore
Both the program and API are built on something called [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection). In simple terms, the program is divided into small pieces, each responsible for its own task. Just like in a big house where someone cooks, someone sews socks, and someone doesn't know how to do anything but still exists.

---
In this house, everyone has a name. For example, if you want to move the mouse, you need to refer to [ISendInputUnstableScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html) and call [MouseMoveTo](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.MouseMoveTo.html#EyeAuras_Roxy_Api_ISendInputUnstableScriptingApi_MouseMoveTo_System_Int32_System_Int32_). If you want to play a sound, you go to [IPlaySoundScriptingApi](https://docs.eyeauras.net/api/EyeAuras.DefaultAuras.Scripting.IPlaySoundScriptingApi.html). Responsibilities vary, and just like in life, knowing the right names is crucial for success. This documentation will list the main and most useful services, but listing the full spectrum is unnecessary - the **NuGet** package **EyeAuras.SDK** lists everything that can be used and will be available to your scripts.

# External Dependencies
[![](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

If every programmer wrote everything from scratch, we would still collectively reinvent the wheel. Therefore, scripts have full support for external packages. In the **.NET** infrastructure, almost everything is stored in [NuGet](https://www.nuget.org/), including official and unofficial libraries. There are dozens of lists of useful packages; you can start with [this one](https://github.com/quozd/awesome-dotnet). You can connect almost any of them in scripts. There are currently some exceptions, but I am working on resolving them.

> February 20, 2024
> Currently, external library support is only enabled for alpha testers. Once this functionality stabilizes, it will be enabled for everyone else. I expect these restrictions to be lifted in early to mid-March.
{.is-warning}