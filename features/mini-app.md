---
title: 🚀 Mini-app
description: How to turn a script or a pack into a mini-app built on top of EyeAuras
published: true
date: 2026-10-11T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2026-03-24T00:10:39.000Z
---

# Package your own EyeAuras mini-app

Make your panel the user's starting point by packaging its script together with the configuration and resources it needs. A mini-app uses EyeAuras infrastructure for your utility, launcher, control panel or automation project. Packaging does not automatically make it independent of the host, services or optional modules.

Start with your own working project and permission to distribute it. For a first panel, use the small [Blazor window example](/en/scripting/blazor-windows/getting-started) without external actions. Its main `Script.csx` must keep the window lifetime inside an explicit resource block, for example by waiting in `ShowDialog(cancellationToken)` before disposal.

## Prepare a panel and its launch path

1. Create your own folder **HW** with an aura **Script** and a **C# Script** action. Set up the window from the guide above. Use **Run** to check the panel, then close it or use **Stop**. Keep the normal EyeAuras interface available while preparing the set.
2. Open **Share/Export** for the folder. Review **Content** and linked dependencies. In **Pack Options**, set **Application name**, for example `MyPanel`, and an appropriate **Recommended Version**.
3. Set **Command line** for the prepared folder structure:

```text
--pad --ui normal "config/auras/HW/Script.json"
```

4. Check that the path names the actual configuration file. Folder and aura names affect it; this example does not locate a different project automatically. **Publish** creates a publication, while **Update** changes your existing one. These transfer data to the server; see [Packs](/en/features/packs) for preparation and local packaging alternatives.
5. Obtain **Download pack** for your prepared publication, extract it into a separate directory and launch its executable. Compare the panel and resources with your original run. A publication link alone does not mean that a build has completed successfully.
6. Once normal startup is understood, you can use **--ui splashOnly** and **--readiness script**. The main window is then hidden, and EyePad terminates the application after the target execution finishes. Closing your panel should finish the script waiting for it.

The shortest EyePad entry without selecting an input file is:

```text
EyeAuras.exe --pad
```

A portable distribution may provide `EyePad.vbs` as a helper for that command. The flag itself does not depend on that helper.

The earlier screenshot shows a script with its own window. Use the current window guide for namespaces and creation code rather than copying the small text in the image.

![Script opening its own window](https://s3.eyeauras.net/media/2025/11/EyeAuras_QuQTejuSag.png)

## Choose startup behavior

| Option | Effect |
| --- | --- |
| --pad | Uses the EyePad host to open and run the selected input |
| --ui normal | Keeps the normal interface available for initial checks |
| --ui splashOnly | Shows the splash without the main window. Your script must create its own UI |
| --readiness app | Reports readiness through application startup |
| --readiness script | Reports readiness during script preparation, not completion of every window, model or external connection |
| --read-only | Restricts persistence of normal configuration changes. Your code can still write files or call services |
| --publish-single-file | Requests a single-file distribution from the server-side packer; not every project can be reduced to one file |
| --acceptLicense | Accepts the standard agreement at startup. It does not grant a license, key or paid-pack entitlement |
| Final path argument | Selects the material to open and execute; an aura requires its actual configuration file |

The original combined configuration remains useful for a prepared set:

```text
--pad --read-only --publish-single-file --ui splashOnly --readiness script --acceptLicense "config/auras/HW/Script.json"
```

Edit a published folder's settings under **Synchronization → Pack Options**. The earlier screenshots call this Pack Config. Save your changes and prepare a new revision; an already downloaded copy does not change merely because you edited the publication settings. Some packing options are experimental and require the corresponding author access.

![Published folder and pack description](https://s3.eyeauras.net/media/2025/11/EyeAuras_lxOycYxSQe.png)
![Pack settings in the earlier interface](https://s3.eyeauras.net/media/2025/11/EyeAuras_P7miHrVhX5.png)
![Command line field](https://s3.eyeauras.net/media/2026/03/EyeAuras_vak8gVXBXn.png)

## Choose a project structure

| Structure | Suitable use |
| --- | --- |
| One .csx or .cs file | A small utility or prototype. [ImGui](/en/scripting/imgui/getting-started) needs its own SDK/runtime prerequisites |
| Several files, Razor and NuGet | A panel with custom logic, [Blazor windows](/en/scripting/blazor-windows/1-intro) and [embedded resources](/en/scripting/embedded-resources) |
| A .sln and an IDE | Export and [Live Import](/en/scripting/ide-integration) for larger projects. Not every helper project automatically becomes part of the script entrypoint |
| Background work or an overlay | A separate window is optional. Keep the main execution alive for the work it owns and release its resources when it ends |

An ordinary pack transfers a set the user can operate in EyeAuras. A mini-app makes your logic and UI central to that set. Auras, macros, trees, image capture, memory and other capabilities still require their actual modules and data sources. A package reference or launch argument does not install them automatically.

Include DLLs, images, fonts, videos and models through the appropriate resource route; an external path is not an [embedded resource](/en/scripting/embedded-resources). Configure [script protection](/en/features/script-protection), [sublicenses](/en/features/sublicenses), permissions and updates separately. Hiding the main interface does not remove authorization or network dependencies.

The [mini-app example](https://eyeauras.net/share/S20251105201607zPUUkZryl4CY) illustrates this distribution style. Its image is not the expected output of every project.

![Hello, World mini-app example](https://s3.eyeauras.net/media/2025/11/Wu2O1lIf2D.jpg)

Continue with [EyePad](/en/features/eyepad), [scripting basics](/en/scripting/getting-started) or [mini-app problem reports](/en/features/problem-reports).
