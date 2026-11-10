---
title: EyePad
description: EyeAuras mode for scripts, solutions, and mini-apps
published: true
date: 2026-03-24T00:10:39.000Z
tags: 
editor: markdown
dateCreated: 2026-03-24T01:20:00.000Z
---
# Open a standalone script in EyePad

EyePad lets you open your own C# file without creating an aura in the main tree. It is a mode of the same `EyeAuras.exe`: the EyeAuras scripting engine runs the code, while the tab provides an editor, log and execution controls.

You need an installed or portable EyeAuras version with EyePad support, and your own `Script.csx`. Start with the [minimal log example](/en/scripting/examples/basic/hello-world). Read unfamiliar code first: separate tab trees are not an operating-system security boundary.

1. In the application directory, run `EyePad.vbs` if your distribution includes it. Alternatively, run:

```text
EyeAuras.exe --pad
```

![EyePad launcher in a portable distribution](https://s3.eyeauras.net/media/2026/03/explorer_TlhuI0lTDo.png)

2. Choose **File → Open...** and select your `Script.csx`.
3. Click **Run**. Its message should appear in the selected tab's log. A script that only logs a line finishes by itself; continuing work has **Stop** and **Restart** controls.
4. Save edits with **Save**. For a new file, choose **Save As...** and your own path.

![Single-script EyePad workspace](https://s3.eyeauras.net/media/2026/03/EyeAuras_IXRX6vl5Qg.png)

Older images label the log **Event Viewer**; panel placement can differ. Check the selected tab and its log, rather than only the application's overall startup status.

## Choose what to open

| Format | What EyePad opens |
| --- | --- |
| `.csx`, `.cs` | A C# script with the supported top-level context. An ordinary library class alone is not an entry point. |
| `.sln` | A solution containing a script project, synchronized from disk. Its files are read-only in EyePad; edit them in the IDE. |
| `.dll` | A prepared script assembly. An arbitrary DLL need not contain a suitable entry point. |
| `.json` | An EyeAuras aura or script configuration, not an arbitrary JSON document. |

To open a file at startup, pass its path after `--pad`. Replace these example paths with your own:

```text
EyeAuras.exe --pad "config\auras\HW\Script.json"
```

```text
EyeAuras.exe --pad "D:\Projects\MyTool\MyTool.sln"
```

```text
EyeAuras.exe --pad "D:\Projects\MyTool\Script.csx"
```

The mode flag itself is:

```text
--pad
```

## Continue in an IDE or work on a pack

For a project with several files, open its exported `.sln`. EyePad loads the project and starts **Live Import**. Save changes in the IDE, wait for synchronization, and check the next run's result. See [IDE integration](/en/scripting/ide-integration) for export and synchronization boundaries.

![Solution with EyePad Live Import](https://s3.eyeauras.net/media/2026/03/EyeAuras_ehBoMmbNoO.png)

**Import...** can load an existing pack into a temporary workspace. Edit the permitted scripts and settings, then explicitly save, export or publish the result. [Pack permissions](/en/features/permission-model) still apply; importing does not publish your edits.

![Imported pack workspace](https://s3.eyeauras.net/media/2026/03/EyeAuras_4kQGkesUgd.png)

Each tab has its own virtual aura tree and state. Tree-relative lookups belong to that context, rather than a global tree across tabs. A file-backed tab has its disk path; a new or imported pack needs an explicit saved result. Temporary workspace contents are not the main EyeAuras profile's persistent aura configuration. Tab separation also does not isolate arbitrary code from shared OS resources.

<details>
<summary>Larger projects and custom interfaces</summary>

EyePad uses C# and Roslyn and supports [NuGet](/en/scripting/nuget), [embedded resources](/en/scripting/embedded-resources), [Blazor Windows](/en/scripting/blazor-windows/1-intro) and [ImGui](/en/scripting/imgui/getting-started). A particular service still depends on the loaded modules and project dependencies; referencing an SDK does not register every service in this host.

Use the main EyeAuras interface for visual editing of triggers, actions, macros and behaviour trees. EyePad is a runtime/editor shell, not a replacement for Rider or Visual Studio. A [mini-app](/en/features/mini-app) is the product you build on that shell; provide its own interface before hiding the main UI.

</details>
