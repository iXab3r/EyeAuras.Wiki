---
title: Custom UI (HTML+C#)
description: allows user-developed, feature-rich, unique applications within EyeAuras using familiar web technologies and C#
published: true
date: 2024-04-09T18:16:02.869Z
tags: 
editor: markdown
dateCreated: 2023-06-18T17:26:53.242Z
---

The Custom UI Overlay is the most versatile and complex overlay offered by EyeAuras, enabling a user to create a fully custom interface using their own C# and [_Razor pages_](https://docs.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-5.0) code.

Under the hood, this overlay utilizes several sophisticated technologies to deliver its powerful functionality. One of these is [_Microsoft's WebView2_](https://docs.microsoft.com/en-us/microsoft-edge/webview2/), a [_Chromium_](https://www.chromium.org/Home)\-based browser control. This is coupled with [_Blazor_](https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor), a framework for building interactive client-side web UI with .NET, which bridges the gap between WebView2 and the user's C# codebase.

### Key features:

-   A fully customizable interface via C# and Razor pages
-   Use of WebView2 and Blazor technology for a browser-based interface
-   The ability to interact with external data sources or APIs
-   Distributable code, making it easy to share and import/export custom interfaces
-   Full access to EyeAuras internals, allowing custom interfaces to control a wide range of application aspects

The Custom UI Overlay represents a significant step towards making EyeAuras a more customizable and user-oriented platform. The flexibility it provides opens up a wide range of possibilities for users, making EyeAuras a tool that can be adapted to a multitude of tasks

## Examples
WebUI allows you to basically write ANY user interface you can imagine, here are some examples of working auras with custom UI.

Lineage 2 Scryde autofarm Behavior Tree (https://eyeauras.net/share/S202403150219539BfeOJ0eRl1q)
![8tr179z[1].png](/assets/8tr179z[1].png)

GTA 5 RP Majestic helper [Alt:V] (https://eyeauras.net/share/S20240121210358gpJJuNtIZRSQ)
![f9882rg[1].png](/assets/f9882rg[1].png)

Lineage 2 Essence auto flags (https://eyeauras.net/share/S20240325120506y5CPVmuwLvC3)
![hrux7lu[1].png](/assets/hrux7lu[1].png)

Time Alert (https://eyeauras.net/share/S20230424095833g0ccyvLqWNNo)
![d83bcbeeac554d2e9b939[1].png](/assets/d83bcbeeac554d2e9b939[1].png)

## Code Editor and Distribution

One of the major advantages of the Custom UI overlay is its inherent portability and ease of editing. All code associated with a Custom UI overlay is stored as a part of its properties, which means it can be readily edited, exported, and imported for distribution.

For on-the-spot editing, EyeAuras features a built-in code editor powered by [_AvalonEdit_](http://avalonedit.net/). This feature-rich text editor is capable of syntax highlighting and code autocompletion, greatly enhancing the coding experience within EyeAuras.

Given the complexity of the built-in code editor, it's recommended to use the "Load editor in a separate window" option for a smoother, more resource-optimized experience. Alternatively, users can export their code and work on it using external integrated development environments (IDEs), such as [_JetBrains Rider_](https://www.jetbrains.com/rider/), [_Visual Studio_](https://visualstudio.microsoft.com/), or [_SharpDevelop_](http://www.icsharpcode.net/OpenSource/SD/Default.aspx). This is described in sections below.

## Export, Import, and Monitor Functionality for Custom UI

The Export, Import, and Monitor features form a central part of the functionality of EyeAuras' Custom UI overlay. They provide a powerful set of tools that enable users to smoothly transition their work between the EyeAuras environment and their preferred Integrated Development Environment (IDE), and vice versa.

#### Export Project

The 'Export Project' function enables users to export the entirety of their Custom UI as a standalone C# project. This includes the overlay code, as well as a reference to the special NuGet package 'EyeAuras.SDK', which encompasses all the necessary references and declarations.

Exporting a Custom UI project offers several advantages. Not only does it allow users to work in an IDE of their choice, but it also opens up all the possibilities that come with a standard C# project, such as version control, unit testing, and regular code manipulation. Furthermore, it allows users to share their projects with others easily or even collaborate on joint projects.

### Import Project

The 'Import Project' function allows users to import a previously exported EyeAuras project back into the application. This can be particularly useful in instances where users have made extensive changes to their codebase using an external IDE and want to integrate those changes back into EyeAuras.

In the future, EyeAuras plans to add functionality that will allow the integration of additional package references during the import process, further expanding the versatility of the Custom UI overlay.

### Monitor Project**

The 'Monitor Project' function builds on the import feature by adding real-time code update capabilities. When a project is being monitored, any changes made to the project from an external IDE are automatically detected and integrated into EyeAuras.

This offers a seamless development experience for users who prefer using an external IDE for major coding tasks but still want to benefit from the real-time updates and testing capabilities within EyeAuras. The monitoring can be stopped at any time by simply closing the editor window or clicking 'Stop monitoring'.

These features collectively provide a comprehensive toolset for managing Custom UI overlays in EyeAuras. They facilitate a highly flexible and effective workflow, enabling users to leverage the strengths of external development environments while still retaining the unique advantages that EyeAuras offers.

### Debugging with DevTools

Developers can make use of WebView2's built-in [_DevTools_](https://docs.microsoft.com/en-us/microsoft-edge/webview2/how-to/webview2-devtools) for debugging their code. This provides access to a powerful suite of debugging and performance profiling tools, making it easier to develop, test, and optimize your Custom UI overlays. 

To access DevTools press F12 while the overlay is active and focused

### Custom CSS and JS

The Custom UI Overlay supports the inclusion of custom CSS and JavaScript, either embedded directly in the code or linked from CDN sources. This allows for an even greater degree of customization and control over the overlay's appearance and behavior. By default, EyeAuras includes [_Bootstrap 5_](https://getbootstrap.com/docs/5.0/getting-started/introduction/) and its associated CSS and JavaScript files, providing a solid foundation for building responsive, mobile-first projects.

Despite its complexity, the Custom UI Overlay is treated like any other overlay in EyeAuras. It shares all the common properties with other overlays, with the difference being that the content it displays is dictated by user-defined code. As such, the Custom UI Overlay does not affect the overall appearance of EyeAuras.

Because the Custom UI Overlay allows user-defined code to interact deeply with EyeAuras internals, it is recommended to only use code from trusted sources. The code itself is compiled client-side, allowing for static analysis before execution.