---
title: File Contains Text
description: Evaluate a local text-file snapshot and display a persistent ready state
published: true
date: 2024-05-14T10:30:56.210Z
tags: 
editor: markdown
dateCreated: 2023-06-18T12:56:51.981Z
---

# Show when a status file is ready

**File Contains Text** reads a local text file and evaluates its entire contents. Replacing `Waiting` with `Ready` in a small status file can show “Review complete” in EyeAuras. The trigger does not perform the review: the data comes from a file saved by you or another program.

## Configure a small status file

1. In a folder you can access, create **status.txt** in **UTF-8**. Enter `Waiting` and save it. Start with a small file rather than a continuously growing log.
2. Add **File Contains Text** to an aura. Enter the full **File path** or select the file with **…**. Check that **File contents** shows `Waiting`.
3. Choose **Regex** and enter `\AReady\s*\z`. This checks the whole file while allowing whitespace and a final newline after the word. Turn off **Test mode**.
4. Add a [Text overlay](/en/overlays/text) containing `Review complete`, visible while the aura is active. Disable forced editor preview.
5. Replace the file contents with `Ready` and save. File contents and the trigger state should update, showing the text. Save `Waiting` again to hide it.

The older image shows the path and expression. The current editor also displays File contents, file size and time since modification.

![File path and matching condition](https://s3.eyeauras.net/media/2024/05/EyeAuras_7j9OpEKOveRWtpG9.png)

| Setting or result | Meaning |
| --- | --- |
| File path | One local file on the EyeAuras computer, not a folder-search pattern |
| File contents | A snapshot of the text read. Check it first when matching gives an unexpected result |
| Text | Exact whole-text comparison; see [text-matching rules](/en/features/text-match-expressions) |
| Regex | A regular expression over the full snapshot. The example's anchors prevent an old line in the middle of a log from satisfying the condition |
| C# | A text-evaluator expression, not a standalone script; the same matching guide defines its context |
| Ignore Case | Ignore letter case during matching |
| Test mode | Substitute test text for the real input. Turn it off after checking the expression |

## Updates and state

EyeAuras reads when connecting to the file, then watches change, creation, deletion and rename events. Nearby events are collected in windows of about **250 ms**, not an exact deadline after each save.

A match makes the trigger Active; a nonmatch makes it Inactive. It stays active while the saved contents match. This is not a one-shot “line appended” event. Add a reaction in **On Enter** for the transition into a match; saving the same matching contents does not itself create another entry transition.

No selected path or no file at that path gives **Unknown**. Renaming a file does not move the configured path with it. Select the new location or restore the old one. Failure to read an existing file is different from a missing file: inspect access and the displayed contents rather than relying on Unknown as a universal access-error signal.

Every update reads the full file, recognizing an encoding marker and otherwise using UTF-8. The editor does not select an arbitrary legacy code page. Large, frequently changing logs can cost substantial memory and time; this trigger has no appended-tail-only mode. A small dedicated status file is often a better source than a general log.
