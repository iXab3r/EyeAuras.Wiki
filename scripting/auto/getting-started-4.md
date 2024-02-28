---
title: GPT 4
description: 
published: true
date: 2024-02-28T12:29:34.938Z
tags: 
editor: markdown
dateCreated: 2024-02-28T12:29:34.938Z
---


# What are these scripts anyway?
From the very beginning of the program, there has been the ability to write custom code in **C#**. In the first versions (~spring 2021), it was very painful, very inconvenient, but still possible. The second version was released in the spring of 2023 and included features such as the ability to use an external IDE for writing programs and significantly greater capabilities for the scripts themselves, for example, creating a full-fledged [custom user interface](/en/overlays/custom-ui) using [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor). Essentially, this unlocked the ability to write truly powerful scripts, but the number of obstacles and "quirks" was still too great.

And now, in the spring of 2024, a new version of scripts is slowly emerging. In this, the third generation, the capabilities of the scripting system itself are huge - almost everything that the program itself can do is available, with the possibility of connecting third-party nuget packages, protection from crashes and typical errors, and much, much more. The entry threshold has also been significantly lowered - new APIs have been added, diagnostics have been improved, etc.

# What's under the hood
The program itself is built on the [**.NET**](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) platform. It is a very dynamically developing platform, extremely flexible and at the same time efficient. [C# 12](https://learn.microsoft.com/en-us/dotnet/csharp/) is used as the scripting language.

Each script you write will be compiled using [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/). Most of the headache associated with how to connect files, what can be done, and what cannot, and similar issues have already been resolved in the program itself, so you only need to focus on working with the script itself.

![](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)


# How to start writing scripts?
There are as many as 3 ways you can run your code in the program. All of them will be executed inside a [sandbox](/ru/scripting/sandbox).

### 1. C# Action
The simplest option. You just need to add a "**C# Script**" action. It (the action) follows the same rules as any other, so to run it, you need to add some trigger. For example, you can add [Hotkey Is Active](https://wiki.eyeauras.net/en/triggers/hotkey-is-active), hang it on some button, and activate the script when pressing/holding.

### 2. C# Trigger
A more complex option - your script will be executed at certain intervals of time. At the same time, it is expected that at some point in the code you will return true/false or null, which will lead to the activation and deactivation of the trigger. Further, actions can be hung on the trigger, including script actions. The increased complexity lies in the fact that your script is constantly running and is controlled only by [Enabling Conditions](/ru/docs/enablingconditions), which means that you need to write code more carefully, otherwise you can find yourself in a situation where a script with an error will constantly take control of the mouse/keyboard or eat up all the available memory on the computer.

### 3. WebUI Overlay
The most advanced script option. In addition to everything that is available in actions/triggers, WebUI allows you to write a custom user interface with buttons, levers, and input fields. The UI technology used for rendering is called [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) and as of 2024, it is the best that the **.NET** infrastructure can offer. The technology itself has several problems, as there is no ideal, but EyeAuras offers several solutions that smooth out these problems and, ultimately, your possibilities are limited only by imagination. Below are a few examples of different forms that are assembled on **WebUI**

![](https://i.imgur.com/iaKm2Br.png =x500) ![](https://cdn.discordapp.com/attachments/1170312651621023755/1197134740906577981/image.png?ex=65ba299b&is=65a7b49b&hm=40f31b17035b500a9973b6bbc5e6e25a882a9a7fd76961cd26e730481bd0c28a& =x300) ![](https://telegra.ph/file/d83bcbeeac554d2e9b939.png =x300)

![](https://cdn.discordapp.com/attachments/846848467795836969/1168590651798069379/image.png?ex=655251da&is=653fdcda&hm=260bde6f1673493c9ec42573c205716289afdd032c2cc710ba8146fbec1e2793 =x200) ![](https://i.imgur.com/D7Nxmv7.png =x200) 

> February 20, 2024
> at the time of writing the article, WebUI still uses an older version of scripts, this will be corrected in the coming weeks.
{.is-warning}


# Services-services
Both the program and the API are built on something called [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection). In layman's terms, the program is cut into small pieces, each of which is responsible for its own thing. Like in a big house, someone knows how to cook porridge, someone knows how to sew socks, and someone can't do anything, but it just so happened that he still exists.

---
Everyone in this house has a name, for example, if you want to move the mouse, you need to refer to [ISendInputUnstableScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html) and call [MouseMoveTo](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.MouseMoveTo.html#EyeAuras_Roxy_Api_ISendInputUnstableScriptingApi_MouseMoveTo_System_Int32_System_Int32_). If you want to play a sound, then we go to [IPlaySoundScriptingApi](https://docs.eyeauras.net/api/EyeAuras.DefaultAuras.Scripting.IPlaySoundScriptingApi.html). The responsibilities of all are different and, as in life, to succeed it is very important to know the right names :) 
This documentation will list the main and most useful ones, however, it makes no sense to list the full spectrum - the **NuGet** package **EyeAuras.SDK** lists absolutely everything that can be used and that will be available to your scripts.

# External Dependencies
[![](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

If every programmer wrote everything from scratch, we would still collectively be reinventing the wheel. Therefore, there is full support for external packages in scripts. In the **.NET** infrastructure, almost everything is stored in [NuGet](https://www.nuget.org/), both official libraries and unofficial ones. There are dozens of lists of useful packages, you can start with [this one](https://github.com/quozd/awesome-dotnet).
In scripts, you can connect almost any of them. There are exceptions for now, but I am working on eliminating them.

> February 20, 2024
> At the moment, support for external libraries is enabled only for alpha testers. As soon as this functionality stabilizes, it will be enabled for everyone else. I think the restrictions will be lifted in early to mid-March.
{.is-warning}
