---
title: IDE Integration (Rider/Visual Studio)
description: Export and Live Import
published: true
date: 2025-10-19T16:57:15.817Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T16:35:51.518Z
---
# Edit a project in your IDE and bring it back to EyeAuras

When a script needs several classes, folders and code navigation, export it as a C# solution. Edit it in your IDE, then import it back. EyeAuras remains the execution host: the generated project supports compilation without becoming a separate running EyeAuras instance.

You need your own editable **C# Script**, a dedicated empty export directory, and a C# IDE that can work with `.sln`, such as [Rider](https://www.jetbrains.com/rider/), [Visual Studio](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/). An IDE build needs the SDK and dependencies specified by the generated project. You can start from [Hello, world](/en/scripting/examples/basic/hello-world).

## Complete one round trip

1. In the script editor, choose **Export...** and a dedicated directory. **Export clears its files and subdirectories, retaining `.git`.** Do not select a directory containing unrelated work.

![IDE integration controls in the older editor](https://s3.eyeauras.net/media/2025/10/EyeAuras_gzfCRUFI9X.png)

![Export command](https://s3.eyeauras.net/media/2025/10/EyeAuras_JSVt6axMGz.png)

2. Open the exported `.sln` in your IDE. Its directory contains projects and NuGet settings for the EyeAuras SDK. Restore dependencies and inspect diagnostics.

![Exported solution files](https://s3.eyeauras.net/media/2025/10/explorer_BOZVwOvceo.png)

![Project opened in an IDE](https://s3.eyeauras.net/media/2025/10/rider64_oeP2xd0Itf.png)

3. Change the message in **Script.csx** to `Log.Info("Hello from IDE");` and save.
4. In EyeAuras, choose **Import...**, select that `.sln` and wait for it to load. Import replaces the script project's contents from disk; edits made only in EyeAuras after export will be lost.

![Import command](https://s3.eyeauras.net/media/2025/10/EyeAuras_mu4Q1nJJ7V.png)

5. Click **Run** in EyeAuras and find `Hello from IDE` in the action's **Event Log**. The changed message identifies the code that returned from disk.

![Running the imported code](https://s3.eyeauras.net/media/2025/10/EyeAuras_eO23JLfMTK.png)

The images show an earlier editor. Current EyePad solution files are marked **Read-only**: edit them externally and inspect the result here. **CompileOnce** disables import and file monitoring; turn it off for an editable copy you own.

## Choose how changes return

| Command | Behaviour |
| --- | --- |
| Export... | Writes `.sln`, `.csproj`, source, resources and dependency references to the selected directory. |
| Import... | Loads the disk project once. It replaces code rather than merging two sets of edits. |
| Live Import / Live... | Watches the selected solution and imports saved changes. |
| Open in IDE... | Exports, opens `.sln` through its Windows file association, and starts Live Import. |

For a shorter cycle, enable **Live Import** for your `.sln`, edit the message in the IDE and save. Wait for the project update, restart the action and check the log. If it did not change, inspect the selected path and synchronization diagnostics before Stop/Run.

![Live Import control](https://s3.eyeauras.net/media/2025/10/EyeAuras_JLTElJy5Ey.png)

![Open in IDE control](https://s3.eyeauras.net/media/2025/10/EyeAuras_C1aJ9hBHCB.png)

This is synchronization from disk, not preservation of all running .NET state. Changes can recreate the script context and reset fields. Automatic restart depends on the surface and host version; update latency is not guaranteed. Monitoring respects `.gitignore`, `.eaignore` and generated-file exclusions. Ending monitoring does not undo changes already imported. Resource handling is covered in [embedded resources](/en/scripting/embedded-resources).

## Edit an overlay interface

The same workflow can update a **C# Overlay** window's Razor components; see [Blazor Windows](/en/scripting/blazor-windows/getting-started). After successful import and compilation, check the particular visible text or control. Updating can recreate the content.

![C sharp overlay](https://s3.eyeauras.net/media/2025/10/EyeAuras_FXgRIKk17o.png =x300)

These earlier demonstrations show a counter changing in the built-in editor and Rider. They illustrate the development cycle, not guaranteed preservation of every window's state:

![Overlay editing demonstration](https://s3.eyeauras.net/media/2025/10/EyeAuras_4geb5IBg7R.gif =x300)

![Overlay editing in Rider](https://s3.eyeauras.net/media/2025/10/Discord_uec9o89iub.gif =x400)

<details>
<summary>Project boundaries and IDE features</summary>

An IDE provides navigation, autocomplete, documentation, folders, ordinary classes, NuGet and Razor editing, including code-behind where supported. Put pure logic in classes and test it in a separate project. Do not reference that test project as a runtime dependency: import matches the script and its dependencies, rather than every project in an arbitrary solution.

Generated host stubs support compilation. They do not make **Log**, **Variables**, **Sleep** or **cancellationToken** globals in helper classes, or run EyeAuras inside the IDE. Pass dependencies explicitly and use the [script-host context](/en/scripting/api/scripting/runtime). Debugger and extension support depends on your environment.

EyeAuras import does not run pre-/post-build actions. If an IDE step generates JavaScript from TypeScript, import the resulting JS files. See [embedded resources](/en/scripting/embedded-resources) and [NuGet](/en/scripting/nuget) for dependencies.

This workflow applies to [macros](/en/macros/getting-started), [behaviour-tree scripts](/en/behavior-trees/scripting), [image search](/en/scripting/examples/basic/image-search), [input](/en/scripting/examples/basic/send-text), [memory contracts](/en/scripting/api/memory) and [ImGui](/en/scripting/imgui/getting-started), subject to their host/module requirements. The [early export announcement](/en/changelogs/7930) records its history. This earlier project image shows a larger multi-component use:

![Earlier multi-component project](https://s3.eyeauras.net/media/2025/10/rider64_NlTMZAX9e4.png =x500)

If your exported working script cannot build with its required SDK and dependencies, prepare a [problem report](/en/features/problem-reports). Review the contents before including **Auras.zip**, which carries configuration.

</details>

## Connect an IDE's MCP client

MCP lets an AI client call tools exposed by another program. EyeAuras offers analysis of the **selected exported EyePad project**: compilation diagnostics, symbols, documentation and package/reference information. Every `script_ondisk_*` call resolves the selection again. Check its returned **resolvedWorkspace** instead of assuming that the previous call's project is still selected. The IDE or its client edits the disk files.

1. Open [AI Assistant](/en/features/ai-assistant), then **AI**.
2. Choose **Show Settings** if needed, inspect **MCP Port**, and click **Start MCP**.
3. Wait for **MCP server is running.** or inspect the error. The default port is `48080`; use the endpoint actually shown:

```text
http://127.0.0.1:48080/mcp
```

4. Add that HTTP MCP endpoint in your client. Rider's route is **Settings | Tools | AI Assistant | Model Context Protocol (MCP)**; VS Code uses its MCP settings or `mcp.json`. In Visual Studio, use the settings of your MCP-capable AI tool. See the official [JetBrains guide](https://www.jetbrains.com/help/ai-assistant/mcp.html) and [VS Code guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) for your installed version.
5. Check the client's available tools and the project returned by a diagnostic request. Starting a server alone does not prove client connection, grant access to every file or execute the script.

The [workspace-selection implementation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/AI/Mcp/EyeAurasMcpOnDiskScriptingPlugin.cs) describes this boundary.
