---
title: IDE Integration (Rider/Visual Studio)
description: Export and Live Import
published: true
date: 2025-10-19T16:57:15.817Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T16:35:51.518Z
---
# Export, Import, and Live Import

One of the core traits of any automation project is that it tends to grow over time.

At first, you just want a script to press one button for you. Then you add a couple of conditions for when that button should be pressed. A day later, there is another button. Before you know it, the script is already 1000+ lines long.

The built-in EyeAuras script editor is mainly designed for smaller projects: a simple clicker, a small bot, some helper utility, and of course application scripts used in [behavior trees](/behavior-trees/scripting) and [macros](/macros/getting-started).

At some point, that is no longer enough. You want to organize classes into folders, navigate code with smart search, write unit tests, and use all the other advantages of modern development tools such as [JetBrains Rider](https://www.jetbrains.com/rider/) and [Visual Studio](https://visualstudio.microsoft.com/).

But those IDEs are built by companies with hundreds or thousands of people behind them, which is not the case for EyeAuras. The conclusion is simple: EyeAuras will never catch up to full-featured IDEs, so the better solution is to integrate with them instead.

That solution is `Export/Import/LiveImport`.

# Export

The idea is simple: your C# script is exported as a full C# project that you can even build inside your IDE. You then work on it with the modern development tools **you** prefer, and when everything is ready, you import the project back into EyeAuras. This gives you the best of both worlds.

You can still use all built-in EyeAuras SDK features, such as [image processing](https://wiki.eyeauras.net/en/scripting/examples/basic/image-search), [input simulation](https://wiki.eyeauras.net/en/scripting/examples/basic/send-text), [memory access](https://wiki.eyeauras.net/en/scripting/api/memory), and custom UI built with [Blazor](https://wiki.eyeauras.net/en/scripting/blazor-windows/getting-started) and [ImGui](https://wiki.eyeauras.net/en/scripting/imgui/getting-started), along with everything else.

A prototype of [exporting](https://wiki.eyeauras.net/en/changelogs/7930) appeared in December 2024, and over the following year it was gradually improved and expanded.

At this point, the largest bot built with this approach is already over 23000 lines long and uses almost everything that has been developed for EyeAuras over the years. So by now, this functionality is stable enough and recommended for real projects.  
![Bot example](https://s3.eyeauras.net/media/2025/10/rider64_NlTMZAX9e4.png =x500)

# Example

We will use [Hello, World](https://wiki.eyeauras.net/en/scripting/examples/basic/hello-world). In practice, there is no major difference here—almost all auras behave roughly the same way.

At the top of `C# Action`, there is a group of buttons responsible for IDE integration.  
![Controls](https://s3.eyeauras.net/media/2025/10/EyeAuras_gzfCRUFI9X.png)

## Export

![Export](https://s3.eyeauras.net/media/2025/10/EyeAuras_JSVt6axMGz.png)

This exports your script and all dependencies as `.sln` and `.csproj` files. During export, EyeAuras configures the `EyeAuras NuGet` server reference, imports, and all other required details.

Important: the target folder is cleared during export, so do not export into a folder that contains important data. By default, EyeAuras suggests one of the standard folders, and it is recommended to leave it as is.

After export, you will get a folder with a pseudo-random name and several files inside it. That is your project, and you can open it in your IDE from there.  
![Export Result](https://s3.eyeauras.net/media/2025/10/explorer_BOZVwOvceo.png)

### Building the project

The exported project is expected to build successfully. `Export` does not just prepare text files—it creates a real C# project with all required dependencies. If the script worked in EyeAuras, it should also build in your IDE.

If that is not the case, feel free to click `Report a Problem` in the EyeAuras window so it can be investigated. Just make sure to check `Auras.zip` so your script is included in the report.

![IDE](https://s3.eyeauras.net/media/2025/10/rider64_oeP2xd0Itf.png)

## Working with code

Almost all standard IDE functionality is available: syntax highlighting, code navigation, file creation, and so on.

The main exception is debugging. That feature is currently in beta testing and will become available later, either by the end of 2025 or in 2026.

What is already available and working:

- syntax highlighting and autocomplete
- code navigation, including EyeAuras internal libraries
- class documentation directly in the editor (hover with the mouse)
- support for adding NuGet packages
- support for Blazor files, both with and without code-behind
- the ability to create folders, classes, and similar project items
- support for external libraries, preferably through Embedded Resources
- the ability to write unit tests for your code — EyeAuras understands which projects should be imported from the solution and will not pull in your test project

What does **not** work yet:

- you still cannot run your script directly from the IDE and debug it there — that will come later
- pre-/post-build actions are not executed inside EyeAuras — this means you can still use them, for example, to generate JavaScript from TypeScript for your Blazor UI, but EyeAuras will import the final JS files only

## Import

![Import](https://s3.eyeauras.net/media/2025/10/EyeAuras_mu4Q1nJJ7V.png)

Once you are done working on the code, you can pull the changes back into EyeAuras and run the script.

There are several ways to do this. The simplest one is to click Import and select the `.sln` file.

EyeAuras will load the solution, extract all required information from it, and update the script. Keep in mind that during synchronization, all local changes made directly in EyeAuras **after export** will be lost — EyeAuras will _load_ the code from your project.

After that, you can simply run the script as usual—the code is already updated.  
![Run](https://s3.eyeauras.net/media/2025/10/EyeAuras_eO23JLfMTK.png)

Technically, this alone is already enough to build real solutions: you can export, edit in an IDE, and import back.

However, one of the most valuable things in development is turnaround time: how long it takes to make a change and then see it in the finished product. Shorter turnaround means faster development, faster testing, and more time spent improving the product instead of fighting the tools.

This is where EyeAuras offers something that can be even faster than a modern IDE workflow: `Live Import`.

## Live Import

![Live Import](https://s3.eyeauras.net/media/2025/10/EyeAuras_JLTElJy5Ey.png)

If you are familiar with the long-suffering [Hot Reload](https://learn.microsoft.com/en-us/visualstudio/debugger/hot-reload?view=vs-2022&pivots=programming-language-dotnet) feature in Visual Studio, the idea here will sound familiar. Unfortunately, even three years after its introduction, it still often feels like it works only occasionally. But the concept itself is great: the developer should not have to constantly rebuild and restart the project, and should be able to edit code "live" and see changes immediately.

`Live Import` sits somewhere between the standard `Fix - Rebuild - Run - Repeat` workflow and `Hot Reload`:

- EyeAuras keeps all libraries required by your script loaded
- it **watches for file changes** in the project
- it loads and recompiles changed parts on the fly

You still need to restart the script manually from the EyeAuras interface with Stop/Start, but that restart takes only milliseconds because everything is already prepared.

The biggest advantage over `Hot Reload` is that **it actually works**, while still noticeably improving development speed. In most cases, only a few seconds pass between editing code and seeing the result on screen, and most of that time is spent on restarting the script. If only that part could be avoided...

### Live Import + C# Overlay

EyeAuras provides several ways to run scripts, and one of them is `C# Overlay`. This overlay can be used to create custom UI, show notifications, or draw other information on the screen. Under the hood, it is a script that uses [Blazor Windows](/scripting/blazor-windows/getting-started) for rendering.  
![C# Overlay](https://s3.eyeauras.net/media/2025/10/EyeAuras_FXgRIKk17o.png =x300)

Its main difference from `C# Action` is that the window you see on screen is "live". Any changes you make to the script are reflected on screen immediately.  
![C# Overlay Live](https://s3.eyeauras.net/media/2025/10/EyeAuras_4geb5IBg7R.gif =x300)

Just like a regular script, overlay code can be exported and then used with `Live Import`. In that case, any changes you make in the IDE will be pulled in and displayed in the overlay window in real time.

![C# Overlay in Rider](https://s3.eyeauras.net/media/2025/10/Discord_uec9o89iub.gif =x400)

## Open in IDE

![Open in IDE](https://s3.eyeauras.net/media/2025/10/EyeAuras_C1aJ9hBHCB.png)

This button combines `Export` + `Live Import` and reduces the number of clicks to a minimum.

When you press it, EyeAuras first exports the project into the selected folder, then launches the IDE associated with `.sln` files on your system—it can be Rider, Visual Studio, or anything else—and then immediately starts `Live Import`.

So just a few seconds later, you can already start making changes in the project and see them on screen.