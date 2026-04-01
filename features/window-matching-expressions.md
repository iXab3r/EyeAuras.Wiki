---
title: Window Matching Expressions
description: EyeAuras user interface for selecting specific windows using a custom matching expression.
published: true
date: 2025-06-30T12:42:27.431Z
tags: eyeauras, выражения, интерфейс, окна, ai-translated
editor: markdown
dateCreated: 2023-06-18T11:57:49.061Z
---
# Window Matching Expressions

Window matching expressions let you define an expression that selects a specific window—or multiple windows—based on different criteria. These expressions are supported across EyeAuras actions and triggers, and let you control where input is sent, which window should be active, which window should be captured in a screenshot or recording, and more.

![](/eyeauras_zjebk8jadf.png)

## Components

This control includes three parts:

**Window picker dropdown**  
Clicking the small icon opens a dropdown list of all active windows. Selecting a window from that list generates a matching expression based on the window handle or title.

**Expression input field**  
A text field where you enter the matching expression. EyeAuras parses this expression to determine which window or windows should be selected.

**Selected window display**  
This area shows the windows currently selected by the expression. Hovering over a result shows a tooltip with detailed window information, which can help you refine the expression.

## Creating a matching expression

You can enter expressions manually in the input field. EyeAuras interprets them as matching criteria. Here are the supported formats:

- **Plain text**: Entering `test` matches all windows with `test` in the title using a case-insensitive partial match.
- **Exact text match**: Putting text in single (`' '`) or double (`" "`) quotes makes it an exact, case-sensitive match. For example, `'test'` matches only windows with the title `test`.
- **Regular expression match**: Text in the `/expression/` format is treated as a regular expression and used to match window titles by pattern.
- **By handle**: You can specify a window handle directly. Hex values such as `0xA` or values with the `&H` prefix such as `&HA` match a window by its handle. Keep in mind that handles can change whenever the window or application is restarted.
- **By index**: Adding `#number` to an expression selects a window by index. For example, `test #2` selects the second window with `test` in the title. `#2` selects the second window in the dropdown list.

The matching windows are then shown in the selected window display.

Window matching expressions make it easier to fine-tune how EyeAuras interacts with your applications.

## Examples

| Expression | Result |
|---|---|
| `"Explorer"` | Matches the window with the exact title `Explorer`. |
| `"/fire/"` | Matches all windows with `fire` in the title, ignoring case. |
| `"Explorer" #2` | Matches the second window with the exact title `Explorer`. |
| `"Mail" #1` | Matches the first window with the title `Mail`. |
| `0x5A` | Matches the window with the hexadecimal handle value `5A`. |
| `"paint"` | Matches all windows with `paint` in the title. |
| `"/^Notepad/"` | Matches all windows whose title starts with `Notepad`. |
| `&H2B` | Matches the window with the hexadecimal handle value `2B`. |
| `"/chrome$/"` | Matches all windows whose title ends with `chrome`. |
| `"Calculator" #3` | Matches the third window with the exact title `Calculator`. |
| `"Excel" #1` | Matches the first window with the title `Excel`. |
| `"/Microsoft/"` | Matches all windows with `Microsoft` in the title, ignoring case. |
| `0xA1F` | Matches the window with the hexadecimal handle value `A1F`. |
| `"/^Google Chrome/"` | Matches all windows whose title starts with `Google Chrome`. |
| `#5` | Matches the fifth window in the dropdown list. |
| `"Firefox #2"` | Matches the second window with the exact title `Firefox`. |
| `&H7C` | Matches the window with the hexadecimal handle value `7C`. |
| `#1` | Matches the first window in the dropdown list. |
| `"/.*/"` | Matches all windows, since this regular expression matches any character. |