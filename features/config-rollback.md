---
title: Configuration Version History
description: Restore a profile configuration from local version history
published: true
date: 2025-03-12T23:00:53.963Z
tags: version control, Git, configuration management, rollbacks, ai-translated
editor: markdown
dateCreated: 2024-10-30T17:29:03.641Z
---
# Restore an earlier configuration

If your changes break a set, **Version history** can restore the profile's configuration to an earlier snapshot. For example, you can recover a folder's original name along with the other settings saved at that time. Restoration affects the whole configuration and restarts EyeAuras.

Practise in your own test profile, with file-based configuration saving and **File system version control** enabled. First make a [local export](/en/features/export-import) of anything you need to keep: history on the same disk is not a separate backup.

## Make a change and undo it

1. Name your test folder `History — original`. Exit EyeAuras normally and reopen the same profile so the exit save records that state.
2. Open **Version history** using the main-window button with that tooltip. Find the original snapshot and note its **Commit ID** and time. Close with **Cancel**.
3. Rename the folder to `History — changed`. Exit normally and reopen again. Export any newer changes you also want to retain before restoring.
4. Open **Version history**. Select **All-time** and **Refresh** if needed, then select the original snapshot, rather than the latest one with the new name.
5. Click **Reset to Selected Commit**, check the snapshot's date in the confirmation, and confirm. EyeAuras flushes current configuration writes, restores the selected files and restarts.
6. The folder should again be `History — original`. Later commits remain in the history, with a new restoration commit. This distinguishes this operation from **Hard Reset**.

![Version history button in the main window](https://s3.eyeauras.net/media/2024/10/Code_6kH4xNd9ioGMtjIK.png)
![Snapshots, dates, descriptions and period filter](https://s3.eyeauras.net/media/2024/10/EyeAuras_Y3P3cw9Pi1E0WkMc.png)

## Choose the restoration scope

| Command | What it does |
| --- | --- |
| Reset to Selected Commit | Restores the snapshot's files, retains the existing history and creates a new restoration commit. It can remove untracked files inside the configuration directory. |
| Hard Reset | Moves the current history head to the selected commit and resets tracked files. Later states disappear from that branch's normal list; do not rely on undoing this through the dialog. |
| Refresh | Reloads the commit list. It does not manually save a snapshot of current edits. |
| 1 day / 1 week / 1 month / 1 year / All-time | Filters the visible period. A commit outside the filter is not necessarily deleted. |
| Cancel | Closes without restoring. Aura execution is paused while this dialog is open. |

Older descriptions call the first operation **Soft Reset**. It is not Git's `reset --soft`: EyeAuras restores files and records a new commit. [Git](https://git-scm.com/) stores the snapshots; you do not need its commands to use this dialog.

The older confirmation below belongs to the first operation. Follow the selected button and operation description: its confirmation title can say Hard-reset even for **Reset to Selected Commit**.

![Confirmation for restoring while retaining later history](https://s3.eyeauras.net/media/2024/10/EyeAuras_3fDx8YnlGoQL6K16.png)

<details>
<summary>When to use Hard Reset</summary>

Use it when you intend to discard the later configuration branch, rather than merely return to earlier values. Export needed newer auras and settings first.

1. Select the commit in **Version history**.
2. Click **Hard Reset** and check the time, description and warning about later changes.
3. Confirm, then inspect the configuration and history after restart.

![Hard Reset confirmation](https://s3.eyeauras.net/media/2024/10/EyeAuras_2kw8xktqIXGgOkYG.png)

Resetting tracked files does not promise to delete every arbitrary file in the directory. It does not delete your account, website publications or external programs' files.

</details>

## What is saved automatically

History belongs to the current profile's `config` directory. It covers configuration files, rather than the Windows installation or every external resource. Changes are recorded periodically, approximately every **15 minutes**, and on normal exit. A commit requires changes; moving a slider need not create its own history entry.

Restoration flushes pending configuration writes first, but does not promise a separate historical snapshot of every unsaved edit. It replaces current values. The profile and its history must still exist on disk; this is not server-side recovery.

| Normal release profile | Usual config location |
| --- | --- |
| Standalone | `%appdata%\EyeAuras\release\config`. |
| Portable / Pack | `data\release\config` beside the application bundle. |
| Another profile or custom data directory | Its own directory; the normal release path is not universal. |

**Local History** for scripts and other tracked objects is a different tool. Its **Commit**, **Apply** and text comparison operate on the supplied objects and can include an unsaved document. These features do not describe **Version history**, which restores the profile configuration with a restart.
