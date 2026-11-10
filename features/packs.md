---
title: Packs
description: Packaging your auras and scripts for easier distribution
published: true
date: 2025-09-02T10:14:01.733Z
tags: eyeauras, automation, scripts, packaging, distribution
editor: markdown
dateCreated: 2025-03-13T00:32:43.365Z
---
# Package your set for a separate launch

A portable **Pack** bundles your aura folder with EyeAuras and its configuration. The recipient extracts it and runs it separately from an installed copy. For example, you can distribute a prepared status display and its auras without asking someone to import each item.

You need your own checked set, an account to publish under your name, and access to the EyeAuras website. Disable unwanted automatic actions and remove personal secrets first. For a copy without the application, use [JSON export](/en/features/export-import).

## Publish the set and download its portable bundle

1. Select the set's root folder. Open **Publish/Synchronize** from its context menu, or use the export dialog. For a new publication, leave the destination address empty, check **Content** and name it in **Overview**.
2. Start with **Configuration source = Use defaults**, **Recommended Version = Current**, and **Pack Distribution Policy = Any**. If source distribution is acceptable, use **Script Compilation Mode = Script Only** and protection **None**. Keep the main window visible until your set has a working interface of its own.
3. Click **Publish**. The older dialog calls this **Publish folder**. After success, the folder shows its source and revision.
4. Open the publication link and select **Download portable pack**. Wait for preparation and download the ZIP. A publication link and a prepared archive are separate results.
5. Extract into a separate directory, not over your working installation. Run the included executable and check that it loads the intended set. Required external windows, files, drivers and services must also be available on that PC.

These images show the publication entry and the older small dialog; the current export window has a different layout.

![Publishing the selected folder](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_bq0a7eVSQ9BKw337.png =x200)
![Older Publish folder button](https://s3.eyeauras.net/media/2025/03/EyeAuras_jUc5dtIKmpmoZbw5.png =x150)

The synchronization indicator identifies the linked publication. The adjacent link opens its website page.

![Folder linked to its publication](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_gXZvzr9Bq2WDvppS.png =x200)
![Opening the publication page](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_cq93pPKwMCu5MUZQ.png)
![Downloading a portable pack](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_QH1tYoEBoCemep3b.png =x200)

## What the bundle contains

| Part | Transfer scope |
| --- | --- |
| Application | A prepared EyeAuras version and files for a separate launch. Portability does not remove system requirements. |
| Configuration | Settings chosen by the author. Use defaults applies defaults with selected overrides; Copy local settings carries more local settings. |
| Folder contents | The set's auras, macros, trees and script projects with prepared resources. Check external dependencies separately. |
| Working data | The bundle's own data directory. It does not share the installed copy's history with the recipient. |

**Standalone**, downloaded from the website and registered as an installed program, and an extracted Pack can coexist independently. A Pack does not need installation registration and keeps its data nearby. This does not imply that it leaves no Windows traces or is invisible to other software.

## Choose distribution and compilation separately

| Pack Distribution Policy | Recipient's options |
| --- | --- |
| Any | Content import and a portable bundle. |
| Prefer Packed | Prefers the prepared version. This is not a source-code protection setting. |
| Packed Only | Requires prepared content for an ordinary recipient. The policy does not itself compile scripts or remove their text. |

![Distribution policy in the older packing editor](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_bJkfO2dFN6UYcplP.png =x200)

The import option **Prefer packed version** requests prepared publication contents. It is not the same as downloading an application ZIP: those contents can be imported into a running EyeAuras. Ownership checks and server policy determine the available choices.

| Script Compilation Mode | Prepared contents |
| --- | --- |
| Script Only | Script source; compilation runs on the recipient's machine. |
| Script w/ Binaries | Source and precompiled files. |
| Binaries Only | Prepared assemblies instead of script source. This does not make recovering the logic impossible. |

**Script Protection Mode** is separate and available with **Binaries Only**: **None**, **Performance-first**, or **Security-first**. See [C# script protection](/en/features/script-protection) for preparation and limits, and the [binary-packaging announcement](/en/changelogs/7994) for its history. Without additional protection, compiled scripts receive ordinary compilation.

If recipients should configure only selected values, set [folder permissions](/en/features/permission-model) before distributing the pack. If access requires a key, follow [sublicenses](/en/features/sublicenses) for the product’s current lease and loss-of-access handling. Preparing binaries or selecting Packed Only does not implement that access logic.

<details>
<summary>Additional settings and local packing</summary>

| Setting | Purpose |
| --- | --- |
| Output Directory | Destination for a locally prepared bundle. Use a separate output directory. |
| Application name / Icon | Application name and icon; neither changes ownership or licensing. |
| Recommended Version: Any / Current | Any allowed version, or a recommendation of the author's current version. This does not validate the set on every version. |
| Configuration source | Use defaults reduces personal-settings transfer. With Copy local settings, review the result. EyeAuras sign-in data is explicitly cleared; secrets in your scripts are not automatically scrubbed. |
| Packing Mode | Embed everything includes prepared contents; Install on startup includes installation material for first launch. |
| Security Measures / Check for Updates / Pause Everything if Active | Bundle overrides: Not set, Enable or Disable. Choose for your set's intended behaviour. |

The folder's **Pack…** command is a separate local route requiring Alpha access and file-based configuration storage. Choose **Output Directory**, inspect **Preview**, and click **Pack**. After **Packed Successfully**, **here** opens the result and **run** launches it. This differs from downloading the server-prepared ZIP.

You can provide a [Blazor window](/en/scripting/blazor-windows/getting-started) or [mini-app](/en/features/mini-app) instead of the main UI. Make that interface work before hiding the main window. Folder editing restrictions, access licenses and binary protection solve different problems.

</details>
