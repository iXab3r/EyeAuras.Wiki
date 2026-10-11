---
title: Problem reports and receiving archives
description: What EyeAuras collects and how users and share authors can work with report archives
published: true
date: 2026-10-11T00:00:00.000Z
tags: reporting, mini-apps, ai-translated
editor: markdown
dateCreated: 2026-10-11T00:00:00.000Z
---

# Problem reports and receiving archives

An EyeAuras problem report is an archive containing your description, diagnostic information and selected attachments. Mini-apps built on EyeAuras use the same reporting infrastructure.

Users can send a report to EyeAuras support or save the archive and send it directly to a share author. Authors can accept these archives today. An API for authors to retrieve reports is planned; it is not available yet.

## Send or save a report

1. Open **Report a problem** in EyeAuras. A mini-app may provide its own button that opens the same dialog. The dialog may also open after an exception.
2. Describe what you did, what happened and what you expected. A mini-app can prefill the comment; you can edit or clear it.
3. Select relevant logs and other attachments. Include logs from the affected run, even if you have already restarted the app. Attach the aura configuration when the author needs to reproduce the problem.
4. Send the report to the central EyeAuras service, or save an archive and send it through the author's support channel.

Sending to EyeAuras does not automatically deliver the report to every author listed in its subscriptions. If an author asks for an archive, use the save option and send them that file.

The saved and sent archives use the same prepared diagnostic snapshot. Changing the account or subscriptions after opening the dialog does not update that snapshot.

## What is in the archive

| File | Contents and inclusion |
| --- | --- |
| `comment.txt` | The final comment, if it is not empty. |
| `systemInfo.txt` | System and process information, including OS version, Windows username, machine name, paths and command line. Included automatically when collected. |
| `applicationInfo.txt` | Application, sender, license, startup, tree counts and subscriptions. Required in current EyeAuras clients, independently of selected logs or aura configuration. Older clients may not have it. |
| `stacktrace.txt` | Exception details when reporting an exception; normally selected when available. A manually opened report may have no exception. |
| Application `.log` files | Selected logs. Recent files are selected by default; earlier runs can be selected in the dialog. |
| `EventLog_*.log`, `metrics.txt` and other diagnostics | Windows events, performance information and other files supplied by the host. Availability varies. |
| `Wnd *.png` / `Screen *.png` | Application-window and desktop screenshots. Window screenshots are selected by default when available; desktop screenshots are not. |
| `Auras.zip`, configuration files | Selected aura tree/configuration attachments. Aura and configuration attachments are not selected by default. |

The dialog lets you choose optional attachments. Required diagnostic files are included automatically. Review the content before sharing: command lines, startup text, logs, screenshots and selected configuration may contain local paths or data supplied by your scripts.

## Application information

`applicationInfo.txt` captures the locally available state when the report is prepared. Collection does not sign in, refresh a license or subscriptions, or contact the server.

| Keys | Meaning |
| --- | --- |
| `CapturedAtUtc`, `App.*` | Snapshot time, effective application name/version/profile, readiness and uptime. |
| `User.Id`, `User.Name` | The report sender from the local active-license snapshot. This is separate from share ownership. |
| `User.License.*` | License type, validity, available start/expiry dates and feature names. This block does not include the license key or full signed license. |
| `Startup.CommandLine`, `Startup.Config` | Original process command line and raw profile `startup.cfg` text at collection time. The raw text is retained even if the startup parser cannot read it. |
| `Startup.Parsed.*` | Available effective startup settings, such as EyePad/window/readiness modes, read-only/safe-mode flags and input/run/eval/compile/output options. |
| `Tree.*` | Counts of folders, auras, behavior trees and enabled items. Behavior trees include macros. No text tree or item-name list is included; use the aura attachment for that. |
| `Subscriptions.Count`, `Subscriptions.N.*` | Folder ID/path, subscription type, share ID, available revision/name/owner/URI and local-clone flag. Each subscription or clone has its own row. |
| `UnavailableSections.*` | Sections that could not be collected. Other available data remains in the file. |

The raw `startup.cfg` is read when preparing the report and may differ from the file used at startup. Sender and license fields are diagnostic data, not proof of authentication. A share's presence in the report does not establish that it caused the error.

### Format and example

The file uses UTF-8 and one `Key=Value` pair per line. Split at the **first** `=`. Keys are case-sensitive. Ignore unknown keys and empty lines, and do not depend on key order.

Values escape backslash as `\\`, carriage return as `\r`, newline as `\n` and tab as `\t`. Decode once, from left to right; do not repeatedly replace escape sequences. Equals signs and quotes remain literal. Booleans are `true`/`false`, numbers use invariant culture and timestamps use ISO 8601 UTC.

`Version=1` corresponds to `IPoeEyeConfigVersioned.Version`. It marks an incompatible format boundary; adding a key does not increment it. `App.Version` is the application version. The central reader currently supports version 1; missing, unreadable or unsupported context does not prevent the base report from being processed, and the original archive is retained.

Missing values are omitted. An available empty string is `Key=`; an available empty collection is `Prefix.Count=0`. An unavailable collection has no count. Indexed collections start at zero.

Illustrative names and IDs; this is a shortened snapshot:

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

Ask the user to save the report and send the original archive with a short reproduction description. A screenshot of the report dialog usually does not contain enough information to diagnose the issue.

The default name is `AppName_version_profile_reportId.7z`, for example:

```text
DemoMiniApp_1.9.10047.0_release_0123456789abcdef0123456789abcdef.7z
```

App names may contain underscores. Keep the original filename and report ID when recording the report. The EyeAuras server also recognizes `.zip` archives with the same naming pattern.

1. Read `comment.txt` and any `stacktrace.txt` to understand the reported behavior and exception.
2. Read `applicationInfo.txt`: check the app/version/profile, sender, startup settings and relevant share revision. Use the full subscription list when several shares or clones are present.
3. Match the problem to the logs from that run. If needed, ask for an archive with the earlier logs or the optional aura configuration included.
4. Keep the original archive alongside your support ticket. A generated description may shorten long startup text; the archive contains the full collected file.

If `applicationInfo.txt` is absent, continue with the comment, system information and logs. Older reports are valid. Missing user/share/license data should stay unknown rather than being filled with guesses.

## What the central processor records

For EyeAuras reports, the processor uses nonempty `User.Name` first and retains the existing system-info/log fallback. It records these string fields in YouTrack when the corresponding data is available:

| Field | Source |
| --- | --- |
| `External Id` | Report ID from the archive name, used for deduplication within the target project. |
| `External UserName` | Sender name, with the legacy fallback. |
| `External AppName` | `App.Name`. |
| `External UserId` | `User.Id`. |
| `External ShareId` | The first subscription with a nonempty `ShareId`, in file order. |
| `External OwnerUserName` | Canonical server owner of that first share/revision, when resolved. |

All subscriptions and clones remain in the description and original file. Only the selected first share is indexed; later shares do not supply a replacement owner or share ID. The client `OwnerUserName` is a local hint, not the canonical server owner. With no revision the server uses the active revision; an unavailable explicit revision is not silently replaced by the active one.

License information, features, tree counts and startup text appear in the description rather than separate search fields. The original archive is attached. Reports are deduplicated by project and exact report ID across issue states.

EyeAuras and its mini-app reports currently go to the EyeAuras project. PoEBane has a separate importer with its own configured project, POE by default. When that importer is disabled, `PoEBane_` archives are skipped; they never fall through into the EyeAuras importer. A general author/share routing mechanism and an API for authors to retrieve reports are planned. Neither is required to accept saved archives manually.

## Related pages

- [Report a problem](/report-a-problem)
- [Mini-apps](/features/mini-app)
- [Opening the report dialog from a script](/scripting/api/core/error-reporting)
- [Русская версия](/ru/features/problem-reports)
