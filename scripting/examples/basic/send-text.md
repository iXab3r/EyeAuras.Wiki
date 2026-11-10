---
title: Printing Text
description: 
published: true
date: 2024-02-24T00:41:30.125Z
tags: ai-translated
editor: markdown
dateCreated: 2024-02-24T00:41:30.125Z
---
# Type three lines into your own editor

Open a blank local test document and leave focus in its text field. F2 will type three lines with different delays and explicit Enter presses between them. The example does not submit a form or choose an external recipient.

You need available **Windows Input** and an editor accepting ordinary keys. **TargetWindow = null** uses the active window. Clicking Run in EyeAuras can move focus away from the document, so use the hotkey for this exercise.

1. Create an aura with [Hotkey Is Active](/en/triggers/hotkey-is-active): **F2**, **Hold**.
2. Add **C# Script** to **On Enter** and put this complete program in top-level **Script.csx**:

```csharp
using System.Windows.Input;
using EyeAuras.Roxy.Api;
using PoeShared.Scaffolding;

var sendInputApi = GetService<ISendInputScriptingApi>();
sendInputApi.InputSimulatorId = "Windows Input";
sendInputApi.KeyPressDelay = new RandomInteger(1, 5);
sendInputApi.TargetWindow = null;
cancellationToken.ThrowIfCancellationRequested();
sendInputApi.Text("Hello, world!");

sendInputApi.KeyPressDelay = new RandomInteger(5, 15);
cancellationToken.ThrowIfCancellationRequested();
sendInputApi.KeyPress(Key.Enter);
sendInputApi.Text("this one is a bit slower");

cancellationToken.ThrowIfCancellationRequested();
sendInputApi.KeyPress(Key.Enter);
sendInputApi.Text("and this one is very slow!", delayMs: 30);
```

3. Focus your own blank document and release modifier keys.
4. Press and release F2. You should get `Hello, world!`, `this one is a bit slower` and `and this one is very slow!` on separate lines. Another run adds text at the current caret position.

This program requests line breaks explicitly with **KeyPress(Key.Enter)**.

| Call or setting | Meaning |
| --- | --- |
| Text(string, int? delayMs) | Ordinary text, not Send Sequence or AutoHotkey grammar. A string containing `{Enter}` does not replace a key call. |
| KeyPressDelay = new RandomInteger(1, 5) | Explicit initial range for the first text, also reset on a repeated Run. |
| new RandomInteger(5, 15) | Range for subsequent sends without a per-call delayMs. |
| delayMs: 30 | Fixed delay for that Text call. These generator delays do not guarantee when the application displays text. |
| KeyPress(Key.Enter) | A separate Enter between text fragments. It also accepts keyPressDelay, for example 30. |

This API's **Text** uses **SendChars**: each character maps to keys with automatic layout detection and fallback to the current layout. An unsupported character can fail conversion. It is not universal Unicode entry or clipboard paste. This path neither writes nor restores the clipboard. The separate UI **Control+V / Shift+Insert** modes are not selected by delayMs; do not assume those clipboard operations preserve previous clipboard contents.

<details>
<summary>A C# newline literal is not a delivery method</summary>

In a normal C# string, `"\n"` represents one LF character. In a verbatim string, `@"\n"` represents a backslash and n. The literal alone does not say how that character reaches an application. This character-to-key path uses the keyboard layout, so this example calls Enter explicitly.

Verbatim strings are useful for paths; normal strings support escapes. Neither is the grammar of [Send Sequence](/en/actions/sendinput/send-sequence).

</details>

**Text** waits synchronously for sending, not for the target application to process every event. Cancellation checks separate these short sections; an already started Text call takes no Run token and does not instantly stop with Stop. Keep focus on the document. A non-null TargetWindow requests activation under standard input, not universal background delivery.

The service belongs to the script context; pass it explicitly to ordinary classes. GetService and cancellationToken are host members, not global C# APIs. See [ISendInputScriptingApi](/en/scripting/api/ISendInputScriptingApi) for the full contract.
