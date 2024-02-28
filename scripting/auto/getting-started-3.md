---
title: GPT 3.5
description: 
published: true
date: 2024-02-28T12:29:08.509Z
tags: 
editor: markdown
dateCreated: 2024-02-28T12:29:08.509Z
---


# What are scripts in general?
Since its inception, the program has had the ability to write custom code in **C#**. In the early versions (~spring 2021), it was very painful and inconvenient, but still possible. The second version was released in spring 2023 and included features such as the ability to use an external IDE for writing programs and significantly greater capabilities for the scripts themselves, for example, creating a full-fledged [custom user interface](/en/overlays/custom-ui) using [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor). Essentially, this unlocked the ability to write truly powerful scripts, although the number of obstacles and "peculiarities" was still too great.

And now, in spring 2024, a new version of scripts is gradually emerging. In this, the third generation, the capabilities of the script system are enormous - almost everything that the program itself can do is available, with the ability to connect external NuGet packages, protection against crashes and common errors, and much more. The entry threshold has also been significantly lowered - new APIs have been added, diagnostics have been improved, and so on.

# What's under the hood
The program is built on the [**.NET**](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) platform. It is a highly dynamic, flexible, and efficient platform. The scripting language used is [C# 12](https://learn.microsoft.com/en-us/dotnet/csharp/).

Every script you write will be compiled using [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/). Most of the headaches related to how to include files, what can be done, and what cannot be done are already solved in the program itself, so you only need to focus on working with the script.

![](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)


# How to start writing scripts?
There are 3 ways in the program to run your code, all of which will run inside a [sandbox](/en/scripting/sandbox).

### 1. C# Action
The simplest option. You just need to add a "**C# Script**" action. It follows the same rules as any other action, so to run it, you need to add some trigger. For example, you can add a [Hotkey Is Active](https://wiki.eyeauras.net/en/triggers/hotkey-is-active), assign it to a button, and activate the script when pressed/held.

### 2. C# Trigger
A more complex option - your script will be executed at specific time intervals. It is expected that at some point in the code, you will return true/false or null, which will activate and deactivate the trigger. Then you can attach actions to the trigger, including script actions. The increased complexity lies in the fact that your script runs constantly and is controlled only by [Enabling Conditions](/en/docs/enablingconditions), so you need to write code more carefully, otherwise you may end up in a situation where a script with an error will constantly take control of the mouse/keyboard or consume all available memory on the computer.

### 3. WebUI Overlay
The most advanced script option. In addition to everything available in actions/triggers, WebUI allows you to create a custom user interface with buttons, levers, and input fields. The UI technology used for rendering is called [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor), and as of 2024, it is the best infrastructure that **.NET** can offer. The technology itself has some issues, as there is no perfection, but EyeAuras offers some solutions that smooth out these issues and ultimately, your possibilities are limited only by your imagination. Below are some examples of different forms assembled on **WebUI**.

![](https://i.imgur.com/iaKm2Br.png =x500) ![](https://cdn.discordapp.com/attachments/1170312651621023755/1197134740906577981/image.png?ex=65ba299b&is=65a7b49b&hm=40f31b17035b500a9973b6bbc5e6e25a882a9a7fd76961cd26e730481bd0c28a& =x300) ![](https://telegra.ph/file/d83bcbeeac554d2e9b939.png =x300)

![](https://cdn.discordapp.com/attachments/846848467795836969/1168590651798069379/image.png?ex=655251da&is=653fdcda&hm=260bde6f1673493c9ec42573c205716289afdd032c2cc710ba8146fbec1e2793 =x200) ![](https://i.imgur.com/D7Nxmv7.png =x200)

> February 20, 2024
> At the time of writing this article, WebUI still uses an older version of scripts, this will be corrected in the coming weeks.
{.is-warning}


# Services-Services
Both the program and the API are built on something called [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection). In simple terms, the program is divided into small pieces, each of which is responsible for its own task. Just like in a big house, someone knows how to cook porridge, someone knows how to sew socks, and someone doesn't know anything but still exists.

---
Everyone in this house has a name, for example, if you want to move the mouse, you need to refer to [ISendInputUnstableScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html) and call [MouseMoveTo](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.MouseMoveTo.html#EyeAuras_Roxy_Api_ISendInputUnstableScriptingApi_MouseMoveTo_System_Int32_System_Int32_). If you want to play a sound, you go to [IPlaySoundScriptingApi](https://docs.eyeauras.net/api/EyeAuras.DefaultAuras.Scripting.IPlaySoundScriptingApi.html). Responsibilities vary, and just like in life, knowing the right names is very important :)
This documentation will list the main and most useful services, however, there is no point in listing the full range - the **NuGet** package **EyeAuras.SDK** lists absolutely everything that can be used and will be available to your scripts.

# External Dependencies
[![](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

If every programmer wrote everything from scratch, we would still collectively reinvent the wheel. Therefore, scripts have full support for external packages. In the **.NET** infrastructure, almost everything is stored in [NuGet](https://www.nuget.org/), including official and unofficial libraries. There are dozens of lists of useful packages, you can start with [this one](https://github.com/quozd/awesome-dotnet).
In scripts, you can connect almost any of them. There are currently some exceptions, but I am working on resolving them.

> February 20, 2024
> Currently, support for external libraries is only enabled for alpha testers. Once this functionality stabilizes, it will be enabled for everyone else. I believe these restrictions will be lifted in early to mid-March.
{.is-warning}