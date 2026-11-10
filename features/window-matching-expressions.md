---
title: Window Matching Expressions
description: EyeAuras user interface for selecting specific windows using a custom matching expression.
published: true
date: 2025-06-30T12:42:27.431Z
tags: eyeauras, выражения, интерфейс, окна, ai-translated
editor: markdown
dateCreated: 2023-06-18T11:57:49.061Z
---

# Window Matching Expressions — keep the right window selected

If two documents are open in the same application, choose which one an aura should use. A matching expression narrows the candidates; the window selector shows the actual result beside the field. Capture sources, activity checks and input targets can have separate selectors. Changing one does not configure the others.

## Select a report window

1. Open your report and a second window of the same application. In a capture trigger, expand **Capture settings → Target Window**.
2. Use **Click to select Window** to pick the report. Check the selected window and hover over it for details.
3. To find it again after reopening, enter a distinctive title fragment, such as `October report`, without quotes. Plain text is searched across several window fields.
4. For a complete match, quote the **whole actual title**, including the application's suffix. If it is exactly `October report — Viewer`, enter `"October report — Viewer"`.
5. Switch to the other document. The selected-window display and capture preview should still identify the report. Close and reopen the report, then verify the expression finds it again.

An exact title stops matching if the document name changes. A native handle selected for one window can change when that window is recreated. Choose what remains stable in your setup.

If several checks need this same target, set the expression once in the folder’s [Default Properties](/en/features/default-properties) and bind their Target Window fields to that default. This avoids maintaining separate copies when the chosen window changes.

![Expression and selected-window display in the older interface](/assets/legacy/eyeauras_zjebk8jadf.png)

The older dropdown is shown here. Current editors offer window and process picker buttons; their placement differs. The expression and the actual selected result are still separate things to inspect.

## Simple expressions

The matcher checks **process path, process name, window title and process arguments**. A match in a supported field is enough, so a broad string is not a title-only or process-only filter.

| Expression | Meaning |
| --- | --- |
| `notepad` | Substring in path, title or arguments; process name is compared as a whole value. |
| `"My document"` or `'My document'` | Complete field match. |
| `/^My document/` | Regular expression for path, title or arguments. |
| `0x5A` or `&H5A` | Native window handle. These numbers illustrate syntax, not a handle to use on your machine. |
| `notepad #2` | Second match after the matcher's sorting. |
| `#1` | First window in the eligible list. |

Plain and quoted comparisons use **OrdinalIgnoreCase**. Quoting requires a complete match; it does not make matching case-sensitive or restrict it to the title. Regex also uses IgnoreCase.

Enter regex as `/pattern/`, without outer quotes. `"/fire/"` is exact text, not regex; `/fire/` searches a pattern. Put an index **outside** quotes: `"Firefox" #2`, not `"Firefox #2"`. The [text evaluator's Regex mode](/en/features/text-match-expressions) uses a different field syntax and does not need these outer slashes.

Indices start at one after sorting by process creation time, Z-order, title length, title text and PID. They are not stable document identifiers, and need not match an old dropdown's visual order.

## Combine criteria

| Expression | Meaning |
| --- | --- |
| `notepad && /report/` | Narrows sequentially: first notepad candidates, then /report/ within that set. |
| `notepad \|\| calc` | First nonempty alternative. If notepad matches, calc results are not added. |
| `!title` or `NOT title` | No standalone negation operator is defined by this grammar. Do not use these as an exclusion filter. |

Alternatives are not a union. Operators are processed sequentially; do not assume C# precedence or parentheses. Build from a simple expression and inspect the actual selected window after each change. Negation inside a regex is regex syntax, and still operates within this multi-field matching rule.

<details>
<summary>Selector filters and the script API boundary</summary>

The candidate list also depends on the window provider and selector filters. Bracket properties are parsed by that selector rather than treated as ordinary text.

| Setting or suffix | Scope |
| --- | --- |
| `[type=toplevel]` | Main windows; type=child and type=any are also supported. Results are limited to the supplied window list. |
| `[ownedBy=external]` / `[ownedBy=any]` | Excludes EyeAuras-owned windows or removes that restriction. Defaults are external and toplevel. |
| `[visible]` / `[focus]` | These parsed flags do not themselves enable visibility or foreground filtering. |
| OnlyVisible | A selector property for visible-window filtering; appending `[visible]` is not equivalent. |
| ProcessName | Use an explicit process filter in a context that supplies one for a process-only restriction. Broad text is not a direct equivalent of AutoHotkey ahk_exe. |

**Click to select Process** writes the chosen process name as an expression. The ordinary multi-field rules still apply.

In scripts, `IWindowMatcher.FindMatches` handles compound `&&` / `||` expressions. Single-window `IsMatch` and `WindowMatchParams` take a simple expression. This is an API boundary, not a requirement to write a script for the UI selector. For script-side contracts and version selection, start with the [API reference](/en/scripting/api/reference).

</details>

Use [Window Is Active](/en/triggers/window-is-active) to test the chosen window's foreground state. For pixel searches, configure [capture and region](/en/triggers/images/imagecapturetriggers) separately: a matching title does not prove the captured frame is correct.
