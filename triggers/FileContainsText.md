---
title: Text File
description: Continue an earlier file-trigger configuration using the current whole-file evaluator
published: true
date: 2022-11-02T14:59:35.793Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T14:58:25.417Z
---

# Continue from the older File Contains Text guide

This earlier address describes the same **File Contains Text** trigger. It is not a second current trigger with different capitalization. Use [the current file guide](/en/triggers/file-contains-text) for the full setup.

For a small text configuration where `enabled=true` represents the state you need:

1. Save an accessible local file in **UTF-8**. Use a small file where `enabled=true` occurs only for the intended state.
2. Open the existing **File Contains Text**, or add it to an aura. Select that file with **File path → …**, then check **File contents**.
3. Choose **Regex** and enter `(?m)^enabled=true\r?$`. This matches a complete line with that exact value; `enabled=false` does not match. Turn off **Test mode**.
4. Save `enabled=true` in the file: the trigger should become active. Change it to `enabled=false` and save to deactivate it. Add an overlay or an **On Enter** action separately for a visible reaction, as in the current guide.

| Earlier setting or behavior | Current meaning |
| --- | --- |
| File path | One local file, not a folder or only the newly appended log lines |
| Text / Regex / C# | Supported [text-matching modes](/en/features/text-match-expressions). C# runs as an evaluator expression rather than a standalone script |
| Reevaluate on change | Reads a new whole-file snapshot after saving; activity persists while it matches, rather than pulsing for every write |
| Large log | Still read in full. There is no appended-tail-only mode here; use a small status file for frequent changes instead of a large general log |

Use the current File path, File contents and expression controls.

A file missing at the selected path gives **Unknown**. Check access and the displayed contents separately when an existing file cannot be read.
