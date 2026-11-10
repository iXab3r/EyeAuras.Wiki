---
title: SendText
description:
published: true
date: 2025-08-17T08:39:46.611Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:39:46.611Z
---

# Send Text — fill a local draft

Use `Send Text` to enter a string in your own window. It either converts characters to keys or places the string on the clipboard and sends a paste gesture. Entering text is separate from submitting a form or sending a message.

## Type a line without clipboard paste

Open a separate text-editor window with an empty nonsecret draft and click in its text so a caret is visible. Use an installed English keyboard layout for the single-language string `alpha beta`.

1. Put a separate tree in a folder. Enable `Target Window` for the draft in `Triggers/Actions/Overlays Defaults`; through `show more...`, enable `Input Simulator → Windows Input`. The tree's Settings must not override the target.
2. Keep `Activation → Is Loaded`, `Execution → When Activated → Do nothing`. Add `Send Text` and connect it to the entry.
3. Choose `General → Method → Type characters`, enter `alpha beta` without quotes in `Text`, and set `Delay = 30 ms`, randomization off.
4. Check the displayed `Window` and `Simulator`. Click the upper `Tick BT Once` once. Windows Input activates the selected window; expect `alpha beta` to appear in the draft and the node to return Success on normal completion.

The earlier screenshot demonstrates `Hello, World!` with a 30 ms delay setting. Its `Key Press Delay` field is now labelled `Delay`:

![Text, delay and delivery methods in the earlier Send Text editor](https://s3.eyeauras.net/media/2025/08/EyeAuras_ea1jBx1plw.png)

| Setting | Effect |
| --- | --- |
| Text | Literal text, not a C# string or command language; quotes and a backslash followed by n remains literal text |
| Method — Type characters | Convert characters to key gestures using automatic layout detection; unsupported characters or mixed layouts may fail conversion |
| Method — Shift+Insert | Write Text to the clipboard and queue Shift+Insert; this gesture does not add Ctrl |
| Method — Control+V | Write Text to the clipboard and queue Ctrl+V |
| Delay | Pause after individual keyboard events; not an exact whole-character interval or time until all text is visible |
| Random Min / Max | Use a range of event delays instead of a fixed value |
| Window / Simulator | Inherited target and backend; Windows Input activates the selected window |

To enter a new line, put a real line break in Text. In Type characters it becomes a newline key gesture; another application's field might treat that as a command. Begin in your own draft. The current node editor has no separate manual layout-mode selector; do not assume the layout controls of a different action are available here.

## Paste a whole string

For text that cannot be converted through one layout, choose Control+V or Shift+Insert if your editor supports it. This uses the shared system clipboard and **does not restore its previous contents automatically**. Use nonsecret practice text.

In these modes Success means paste preparation and enqueueing, not that the target has processed the gesture. An immediately following node receives no acknowledgement of insertion. Check the actual text. Cancellation does not remove characters already typed or undo a completed paste, and may leave a partially typed line.

Other supported [input backends](/en/actions/sendinput/options) have their own delivery limits; there is no universal background typing for every application. The same mechanism can fill message or command drafts, but this node does not itself provide an account, login, messaging or submission integration. After successful delivery calls it can execute a child; retained child Running resumes without resending the text. The template is available in both BT and Macro.
