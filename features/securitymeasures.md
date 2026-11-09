---
title: Security Measures
description: Configure startup through a prepared EyeAuras copy
published: true
date: 2025-03-12T23:19:10.881Z
tags: безопасность, защита, программирование, ai-translated
editor: markdown
dateCreated: 2022-12-20T17:27:54.469Z
---
# Launch EyeAuras through a prepared copy

**Security measures** changes how EyeAuras starts. It prepares a separate copy in a randomly named directory under LocalAppData, changes the executable name, prepares its executable files and launches it instead of the original process. The original process exits after handing over startup. This lets the application run from a prepared location with a different name while keeping the original installation for later launches.

Preparation can copy program files or use a separate executable name. It does not turn your auras into a newly published pack. The mode does not guarantee invisibility or compatibility with every other program's protection system.

Use your own working configuration and make a [local export](/en/features/export-import) of important auras first. Finish current work before changing a startup setting.

1. Open EyeAuras settings and find **Security measures**.
2. Enable it and click **Save**. When changing from disabled to enabled, the application offers a restart; confirm when ready.
3. Wait for preparation and the new EyeAuras window. Check your profile and familiar auras. A new process following the original's exit is the startup handover, not a second independent user set. Preparation time depends on the distribution and its files.
4. If your workflow requires EyeAuras to start before a target application, complete this restart before opening the target.
5. To return, clear the checkbox, **Save**, and use the next normal launch. An already prepared copy and an explicit startup override take precedence over the saved checkbox. Check which copy you launch; changing the checkbox does not switch the running process in place.

## Choose the mechanism for the job

| Mechanism | What it changes |
| --- | --- |
| Security measures | Preparation and startup handover to a separate EyeAuras copy. |
| Application and module packaging | Distribution contents and loading of program components, separate from the startup-mode choice. |
| Folder Private Content | Viewing and editing through the application; see [permissions](/en/features/permission-model). |
| Binaries Only and Script Protection Mode | Distributed source text and binary processing; see [script protection](/en/features/script-protection). |
| Sublicense | Access to a particular author's product. |
| Approval to run someone else's logic | Your decision to trust that action or set. It does not enable Security measures or grant a license. |

<details>
<summary>Override the setting in a portable pack</summary>

**Pack Options → Security Measures** provides these overrides:

| Value | Bundle behaviour |
| --- | --- |
| Not set | Keeps the source configuration's setting. |
| Enable | Enables prepared-copy startup. |
| Disable | Disables it for the bundle. |

Check a prepared bundle with its own launch before distributing it. See [Packs](/en/features/packs) for its contents and preparation; the [early packaging announcement](https://wiki.eyeauras.net/en/changelogs/6736) describes the feature's history.

</details>

Capture methods, software or hardware input, splitting components across computers and adding external libraries are separate choices. Check their requirements and actual results for your workflow.
