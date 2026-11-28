---
title: Problem reports and receiving archives
description: What data EyeAuras collects and how users and share authors work with report archives
published: true
date: 2026-10-13T00:00:00.000Z
tags: reporting, mini-apps, ai-translated
editor: markdown
dateCreated: 2026-10-11T00:00:00.000Z
---
# Prepare a report that helps reproduce a problem

If an action failed or a mini-app showed an error, save a report from that run: your steps, the logs and the attachments you choose. **Save…** creates a file on your disk, so you can look at what went into it before you give it to the set's author. Sending is a separate button, **Send**.

## Save an archive for review

1. After the problem, open **Report a problem** in EyeAuras. The window can also open by itself after an exception, or from a button in a mini-app if its author added one.
2. In the comment, write what you did, what happened and what you expected. For example: “After choosing a file I clicked Execute. A log entry appeared, but the file did not open.” If the author prefilled the comment, you can edit or clear it.
3. Select the logs of the run that failed. If EyeAuras has been restarted since then, you also need the earlier file that contains the error. Add the aura configuration only if it is related to the problem.
4. Look through the selected attachments, especially window screenshots and configuration. Click **Save…**, choose a folder and wait for the `.7z` archive to appear in Explorer.

   ![Choose Save in the earlier report window to create a local archive](/assets/callouts/batch2/en/report-save-send.png)
5. Open the archive and check `comment.txt` and the logs you need. A file on disk has not been sent anywhere. Neither support nor the author has it yet.

**Save…** and **Send** use the same snapshot of diagnostic data. If you changed the account or subscriptions after opening the window, the snapshot is not updated. To collect the new state, open the report window again.

| Button or state | Result |
| --- | --- |
| Save… | Prepares the archive and saves it to your disk. Then opens the folder it is in. |
| Send | Prepares the archive and uploads it through the configured handler. In standard EyeAuras that is the EyeAuras server, and a mini-app can set its own. The button is available only when a handler exists. |
| Report sent / Report sent successfully | The handler returned a report ID. Keep the ID for your support request. |
| Copy | Copies the sent report ID or the current status text. |
| Cancel | Closes the window. |

If you decide to send the report to EyeAuras, click **Send** and wait for the confirmation with an ID. **Compressing report…** and **Sending report…** are not the end yet. A report sent to EyeAuras is not delivered automatically to every author in your subscriptions. If an author asked for the file directly, you need the saved archive.

If the failure appeared after you changed settings, save the report first and only then roll back with [configuration history](/en/features/config-rollback). A restore replaces the working configuration and restarts the application.

## What is in the archive

| File | Contents and inclusion |
| --- | --- |
| `comment.txt` | The final comment, if it is not empty. |
| `systemInfo.txt` | System and process information: OS version, Windows username, machine name, paths and command line. Added automatically when it was collected. |
| `applicationInfo.txt` | Application, sender, license, startup, tree counts and subscriptions. A required file: current EyeAuras always adds it, whatever logs and auras you select. An older report may not have it. |
| `stacktrace.txt` | Exception details, if there is an exception. Usually selected when available. A report opened by hand may have no exception. |
| Application `.log` files | The selected logs. Recent files are selected by default, and earlier ones can be selected in the window. |
| `EventLog_*.log`, `metrics.txt` and other diagnostics | Windows events, performance figures and other files the application could collect. |
| `Wnd *.png` / `Screen *.png` | Screenshots of application windows and of the desktop. Available window screenshots are selected by default, desktop screenshots are not. |
| `Auras.zip`, configuration files | The selected aura tree and settings. Not selected by default. |

The command line, startup text, logs, screenshots and selected auras may contain your local data. If you deselect configuration, the account and subscription information still stays in the required `applicationInfo.txt`.

<details>
<summary>Diagnostic format and receiving archives as an author</summary>

This section is for an author or support: how to read the archive and where the report ends up on the server.

## Application information

`applicationInfo.txt` holds what was known locally when the report was prepared. While collecting it, the application does not sign in, does not refresh the license or subscriptions and does not contact the server.

| Keys | Meaning |
| --- | --- |
| `CapturedAtUtc`, `App.*` | Snapshot time, the effective application name, version and profile, readiness and uptime. |
| `User.Id`, `User.Name` | The sender, taken from the local snapshot of the active license. It has nothing to do with share owners. |
| `User.License.*` | License type, validity, available start and expiry dates and feature names. The license key and the full signed license are not here. |
| `Startup.CommandLine`, `Startup.Config` | The original process command line and the raw text of the profile's `startup.cfg` at collection time. The raw text is kept even if the startup parser could not read it. |
| `Startup.Parsed.*` | The available effective startup settings: EyePad, window and readiness modes, read-only and safe-mode flags, input/run/eval/compile/output options. |
| `Tree.*` | The number of folders, auras, behavior trees and enabled items. Macros count as behavior trees. The tree itself and the list of names are not here. Attach the aura configuration for that. |
| `Subscriptions.Count`, `Subscriptions.N.*` | Folder ID and path, subscription type, share ID, the available revision, name, owner and URI, and the local-clone flag. Each subscription or clone has its own row. |
| `UnavailableSections.*` | Sections that could not be collected. The rest of the data is kept. |

The `startup.cfg` text is read when the report is prepared and may differ from the file the application started with.

### Format and example

The file is UTF-8, with one `Key=Value` pair per line. Split the line at the **first** `=`. Keys are case-sensitive. You can skip unknown keys and empty lines. Do not rely on the order of keys.

In values a backslash is written as `\\`, a carriage return as `\r`, a newline as `\n` and a tab as `\t`. Decode once, from left to right, without repeated replacements. Equals signs and quotes are ordinary characters. Booleans are `true`/`false`, numbers use invariant culture and timestamps are ISO 8601 UTC.

`Version=1` corresponds to `IPoeEyeConfigVersioned.Version` and changes only when the format changes incompatibly. A new key does not change it. `App.Version` is the version of the application itself. The central reader currently supports version 1. If the context is missing, unreadable or unsupported, the base report is still processed and the original archive is kept.

Missing values are left out. An available empty string is written as `Key=`, and an available empty collection as `Prefix.Count=0`. An unavailable collection has no count. Collection indexes start at zero.

Below is a shortened snapshot with made-up names and IDs:

```text
Version=1
CapturedAtUtc=2026-10-11T10:15:30.0000000Z
App.Name=DemoMiniApp
App.Version=1.9.10047.0
App.Profile=release
App.IsLoaded=true
App.UptimeSeconds=125
User.Id=8b8fae9e-1c40-4b37-bbc7-c9728c12db34
User.Name=Alice
User.License.Type=Standard
User.License.IsValid=true
User.License.Features.Count=2
User.License.Features.0=EyeAuras.DefaultAuras
User.License.Features.1=EyeAuras.Social
Startup.CommandLine=DemoMiniApp.exe --profile release
Startup.Config={"CommandLine":"--profile release"}\r\n
Startup.Parsed.IsEyePad=true
Tree.TotalItems=7
Tree.Folders=3
Tree.Auras=3
Tree.BehaviorTrees=1
Tree.EnabledItems=6
Subscriptions.Count=2
Subscriptions.0.FolderPath=DemoMiniApp
Subscriptions.0.SubscriptionType=ShareAuraSubscriptionConfig
Subscriptions.0.ShareId=demo-share-one
Subscriptions.0.Revision=12
Subscriptions.0.OwnerUserName=AuthorOne
Subscriptions.0.IsLocalClone=false
Subscriptions.1.FolderPath=Helpers
Subscriptions.1.SubscriptionType=ShareAuraSubscriptionConfig
Subscriptions.1.ShareId=demo-share-two
Subscriptions.1.OwnerUserName=AuthorTwo
Subscriptions.1.IsLocalClone=true
UnavailableSections.Count=0
```

## Receiving an archive as a share author

Ask the user to save the report and send you the original archive with a short description of how to reproduce the problem.

The default name looks like `AppName_version_profile_reportId.7z`, for example:

```text
DemoMiniApp_1.9.10047.0_release_0123456789abcdef0123456789abcdef.7z
```

App names may contain underscores. When you record the report, keep the original filename and the report ID. The EyeAuras server also recognizes `.zip` archives with the same naming pattern.

1. Read `comment.txt` and `stacktrace.txt`, if there is one, to understand the problem and the exception.
2. Open `applicationInfo.txt` and check the app, version, profile, sender, startup settings and the relevant share revision. If there are several shares or clones, look at the whole subscription list.
3. Match the problem to the logs of that run. If there is not enough data, ask for an archive with the earlier logs or with the aura configuration.
4. Keep the original archive next to your support ticket. A generated description may shorten long startup text, while the archive has the full file.

If there is no `applicationInfo.txt`, use the comment, the system information and the logs. If user, share or license data is missing, do not fill it in with guesses.

## What the central processor records

For EyeAuras reports the processor takes a nonempty `User.Name` first. The earlier lookup of the name in system information and logs remains as a fallback. When the data is available, these string fields are filled in YouTrack:

| Field | Source |
| --- | --- |
| `External Id` | Report ID from the archive name. Used to find duplicates in the target project. |
| `External UserName` | Sender name, with the legacy fallback. |
| `External AppName` | `App.Name`. |
| `External UserId` | `User.Id`. |
| `External ShareId` | The first subscription with a nonempty `ShareId`, in file order. |
| `External OwnerUserName` | The canonical server owner of that first share and its revision, when it could be resolved. |

All subscriptions and clones stay in the description and in the original file. Only the first share is indexed. Later shares do not replace it or its owner. `OwnerUserName` from the client file is a local hint, not the canonical name from the server. If no revision is given, the server uses the active one. If a revision is given explicitly but is unavailable, the active one is not used in its place.

License information, features, tree counts and startup text go into the description, not into separate search fields. The original archive is attached to the issue. A report is identified by its exact ID, whatever state the issue is in. After mini-app delivery is turned on, the ID is looked up in both EA and MAPS. POE is handled separately.

Ordinary EyeAuras reports go to EA. PoEBane keeps its own importer and its own target project, POE by default. When that importer is disabled, `PoEBane_` archives are skipped. Saved archives can be accepted by hand. This workflow does not provide an API for authors to fetch reports.

## Mini-app reports in YouTrack

When central mini-app delivery is turned on, new mini-app reports go to **EyeAuras MiniApps (MAPS)**. Older reports stay on their previous route. If delivery is paused, new mini-app archives stay in the queue and are not sent to EA.

For the first nonempty ShareId, the server resolves the share's details and creates or reuses a group named `reports-share-ShareId`. The group covers all revisions of that share. The report is visible to internal support and to this one group. If there is no first share or it could not be resolved, the report stays internal. A later share is not used to grant access.

A YouTrack administrator adds the author and their team to the right group. User and owner names from the report do not add anyone automatically. Group members can work with the reports they can see, and with their comments, states and attachments. The fields the processor filled in (report, sender, share), the project and the visibility can only be changed by internal support. Marked replies can be sent to the report's sender. Restricted internal notes are not forwarded.

Access is to the whole report: the original archive, the license details, other subscriptions and any attached configuration.

After delivery is turned on, the processor recognizes the same report in both EA and MAPS. If an issue was closed or an unfinished import was restarted, no new issue is created. A saved receipt lets the processor finish uploading attachments to the issue that is already published.


</details>

## Related pages

- [Report a problem](/en/report-a-problem)
- [Mini-apps](/en/features/mini-app)
- [Opening the report dialog from a script](/en/scripting/api/core/error-reporting)
- [Русская версия](/ru/features/problem-reports)
