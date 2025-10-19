---
:title: Интеграция с IDE (Rider/Visual Studio)
:description: Export/Live Import
:published: true
:date: 2025-10-19T20:22:00.000Z
:tags: 
:editor: markdown
:dateCreated: 2025-10-19T16:35:51.518Z
:---

One of the main characteristics of any automation is that over time it tends to grow and cover more and more ground.
At first you want a script to just press a single button for you. Then you add a couple of conditions for that button. A day later — another button. Blink, and your script is already 1,000+ lines long.

The built‑in EyeAuras script editor is primarily designed for small projects — a simple clicker, a lightweight bot, some helper utility, and of course for using application scripts in [behavior trees](/behavior-trees/scripting) and [macros](/macros/getting-started).

At some point its capabilities just aren’t enough — you want to organize classes into folders, navigate code with smart search, write unit tests, and use all the other joys of modern development offered by IDEs like [JetBrains Rider](https://www.jetbrains.com/rider/) and [Visual Studio](https://visualstudio.microsoft.com/).
But those products have hundreds or thousands of people behind them — EyeAuras does not. The conclusion is simple: EyeAuras will never catch up with full IDEs, so we need a different solution.

And the solution is: Export/Import/Live Import.

# Export
The idea is simple — your C# script is exported as a full C# project that you can even build in an IDE. You then work on it using the modern tools you prefer, and when you’re done — import the project back into EyeAuras, getting the best of both worlds. You still have access to all EyeAuras SDK features like [image search](https://wiki.eyeauras.net/en/scripting/examples/basic/image-search), [input simulation](https://wiki.eyeauras.net/en/scripting/examples/basic/send-text), [memory API](https://wiki.eyeauras.net/en/scripting/api/memory), and creating custom interfaces with [Blazor](https://wiki.eyeauras.net/en/scripting/blazor-windows/getting-started) and [ImGui](https://wiki.eyeauras.net/en/scripting/imgui/getting-started), and more.

In December 2024 a prototype of [export](https://wiki.eyeauras.net/en/changelogs/7930) appeared and throughout the year it has been refined and expanded.

As of now, the largest bot implemented with this approach already exceeds 23,000 lines and uses practically everything developed for EyeAuras over the years. So at this stage the feature is stable enough and recommended for real projects.
![Bot example](https://s3.eyeauras.net/media/2025/10/rider64_NlTMZAX9e4.png =x500)

# Example
We’ll use [Hello, World](https://wiki.eyeauras.net/en/scripting/examples/basic/hello-world) — there’s no fundamental difference, auras behave roughly the same.

At the top of a C# Action you’ll find a group of buttons responsible for IDE integration:
![Controls](https://s3.eyeauras.net/media/2025/10/EyeAuras_gzfCRUFI9X.png)

## Export
![Export](https://s3.eyeauras.net/media/2025/10/EyeAuras_JSVt6axMGz.png)
Exports your script and all its dependencies as a .sln and .csproj. Along the way it configures a link to the EyeAuras NuGet server (for pulling dependencies and SDK), imports, and other necessary bits.
Important! The target folder is cleaned on export, so do not export into a folder with important data. By default EyeAuras suggests a standard folder — it’s recommended to keep it.
After export you’ll get a folder with a pseudo‑random name and several files inside. That’s your project, which you can then open in the IDE.
![Export Result](https://s3.eyeauras.net/media/2025/10/explorer_BOZVwOvceo.png)

### Building a project
Note that the resulting project should build successfully — Export doesn’t just prepare text files, it produces a fully fledged C# project with all needed dependencies. If the script worked in EyeAuras, it is expected to build in the IDE. If it doesn’t — press Report a Problem in EyeAuras and we’ll figure it out. Don’t forget to tick Auras.zip so your script is included in the report.

![IDE](https://s3.eyeauras.net/media/2025/10/rider64_oeP2xd0Itf.png)

## Working with the code
Almost all standard IDE features are available — syntax highlighting, code navigation, file creation, and more. Debugging is the exception — it’s currently in beta and will arrive either late 2025 or in 2026.
What definitely works:
- syntax highlighting and completion
- code navigation, including into EyeAuras helper libraries
- inline documentation on classes right in the editor (hover)
- ability to add NuGet packages
- Blazor files support (both code-behind and not)
- ability to create folders, classes, etc.
- ability to include external libraries — preferably via Embedded Resources
- ability to write unit tests for your code — EyeAuras will detect which projects from the solution are needed on import and will skip the test project

What does NOT work:
- you cannot yet run your script directly from the IDE and debug it. This will come later.
- pre-/post-build actions will not execute inside EyeAuras — that means you can still use them (e.g., to generate JavaScript from TypeScript for your Blazor UI), but EyeAuras will pull already generated JS files

## Import
![Import](https://s3.eyeauras.net/media/2025/10/EyeAuras_mu4Q1nJJ7V.png)
So, you’ve worked on the code and are ready to pull the changes back into EyeAuras and run the script.
There are several options. The simplest is to click Import and select the .sln file.
EyeAuras will load that solution, extract everything it needs, and update the script. Note that during synchronization all your local changes (made inside EyeAuras) after export will be lost — EyeAuras will load your code from the project.

You can then run the script as usual — the code is already updated.
![Run](https://s3.eyeauras.net/media/2025/10/EyeAuras_eO23JLfMTK.png)

We could stop here — we have export and import, which is already enough to develop. But in development one of the most valuable things is the turnaround time — how long it takes from changing the code to seeing it in the product. The shorter the turnaround, the faster the development and testing, and the more time you can spend improving the product instead of fiddling with tools.

This is where EyeAuras offers a solution that can be even faster than modern IDEs — Live Import.

## Live Import
![Live Import](https://s3.eyeauras.net/media/2025/10/EyeAuras_JLTElJy5Ey.png)
If you’re familiar with the much‑suffered [Hot Reload](https://learn.microsoft.com/en-us/visualstudio/debugger/hot-reload?view=vs-2022&pivots=programming-language-dotnet) in Visual Studio, the following will feel familiar. Unfortunately, even 3 years later, it still feels like “works in 10% of cases”, but the idea is great — the developer shouldn’t have to restart/rebuild the project and should edit code live, seeing changes immediately.

Live Import sits somewhere between the classic Fix — Rebuild — Run — Repeat and Hot Reload:
- EyeAuras keeps all libraries required by your script loaded
- watches for file changes in your project
- hot‑loads/recompiles changed parts on the fly

You still need to Stop/Start the script from the EyeAuras UI, but it takes only milliseconds because everything is already prepared. The main advantage over Hot Reload is that it works and noticeably speeds up development. Usually just a few seconds pass between changing code and seeing it on screen — mostly spent restarting the script. If only we could avoid even that…

### Live Import + C# Overlay
EyeAuras has several ways to run scripts, and one of them is C# Overlay. You can use this overlay to create a custom UI, show notifications, or render other information on the screen. Under the hood it’s a script that uses [Blazor Windows](/scripting/blazor-windows/getting-started) for rendering.
![C# Overlay](https://s3.eyeauras.net/media/2025/10/EyeAuras_FXgRIKk17o.png =x300)

Its key difference from C# Action is that the window you see on screen is “live”. Any changes you make to the script are immediately reflected on screen.
![C# Overlay Live](https://s3.eyeauras.net/media/2025/10/EyeAuras_4geb5IBg7R.gif =x300)

You can export an overlay just like a regular script and then enable Live Import — any changes you make in the IDE will be pulled in real time and displayed in the overlay window.

![C# Overlay in Rider](https://s3.eyeauras.net/media/2025/10/Discord_uec9o89iub.gif =x400)

## Open in IDE
![Open in IDE](https://s3.eyeauras.net/media/2025/10/EyeAuras_C1aJ9hBHCB.png)
This button combines Export + Live Import to minimize clicks. When you press it, EyeAuras will first export the project to the folder you specify, then launch the IDE (whichever is registered to open .sln files by default — Rider/Visual Studio/etc.), and immediately start Live Import.

So within a few seconds you can start making changes and see them on screen.
