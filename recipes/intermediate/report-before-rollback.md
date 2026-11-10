---
title: "Keep failure evidence before restoring your configuration"
description: "Save and review a local report and your affected set, then deliberately restore a known profile snapshot."
published: true
date: 2026-11-10T17:01:45.000Z
tags: recipes, intermediate
editor: markdown
dateCreated: 2026-11-10T17:01:45.000Z
---

# Preserve the failed state before returning to a usable one

Keep diagnostics from a failed run while separately restoring a known configuration. The result is a local report archive and an export you can inspect later, plus a deliberately restored profile. Saving a report does not send it.

Use your own test profile without unrelated unsaved work. You need file-based configuration saving, **File system version control** enabled, a known usable snapshot and a writable backup directory **outside the profile's config directory**. Restoration affects the whole profile configuration and restarts EyeAuras. If no suitable snapshot exists, stop after saving evidence; this is not server-side recovery.

## Save the affected run before changing it

1. Note the failure time, EyeAuras version/profile and affected folder. Record the steps, actual result and expected result in your own words. Do not invent a cause or repeat harmful actions just to obtain a report.
2. In the title bar click **Report a problem**. In **Error Report**, enter that description. Select logs from the affected run; include an earlier log if you have restarted since the failure. Review screenshots and add aura configuration only when relevant.
3. Click **Save...**, choose your backup directory and wait for the `.7z` archive. Open it for reading and check **comment.txt**, selected logs and attachments. Required system/application context may also be included, even without aura configuration; review private paths, images and settings before sharing. Close the dialog without **Send**.
4. Select your own affected folder and open **Share/Export**. In **Content**, check its contents and any **Missing linked objects detected**; review **Add linked objects** before adding dependencies. Use **Destination → Local export → Save to file...** to save its JSON beside the report. This is a selected-set export, not a backup of all profile history or external files.
5. Record both filenames. Check they are outside config: restoring can remove untracked files there. Preserve any other newer settings you need before proceeding. Export does not scrub secrets.

## Select the exact snapshot and restore intentionally

1. Click the main-window **Version history** button. Use **All-time → Refresh** if the known snapshot is outside the current filter. Select its **Commit ID**, time and description, not simply the newest row.
2. If the date or scope is wrong, choose **Cancel**. The report/export remain saved and the current configuration is not restored. Refresh only reloads the list; it does not save a new snapshot of your edits.
3. For the intended snapshot, click **Reset to Selected Commit**, check its date in the confirmation, and confirm. Follow the selected command even if the confirmation title says Hard-reset. This route flushes writes, restores the snapshot files, retains history and creates a restoration commit; **Hard Reset** is a different operation that discards later branch states from its normal list.
4. After the application restarts, inspect the known setting that identifies the usable snapshot, such as your folder's earlier name. Check the intended local behavior separately. Keep the report/export: restoration does not establish the failure's cause and does not automatically merge newer saved changes back.

| Kept item | Purpose |
| --- | --- |
| Report archive from the affected run | Logs, description and selected diagnostic attachments |
| Exported JSON | The selected current set and included dependencies |
| Version-history snapshot | The profile configuration state chosen for restoration |

[Reporting](/en/report-a-problem) and [archive contents](/en/features/problem-reports) explain the evidence; [Export/Import](/en/features/export-import) explains the selected set; [Version history](/en/features/config-rollback) explains replacement and restart scope. These are separate copies, not a guaranteed lossless transfer across every version. A report saved locally is neither an upload nor proof anyone received it.
