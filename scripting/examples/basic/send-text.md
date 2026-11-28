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

Press F2 and the script types three lines with different delays, pressing Enter between them. Open a blank test document and leave the caret in its text field.

You need available **Windows Input** and an editor that accepts ordinary keys. **TargetWindow = null** means the active window, so focus must be in your document before you start. Clicking Run in EyeAuras can take focus away from the document, so start the example with the hotkey.

1. Create an aura with [Hotkey Is Active](/en/triggers/hotkey-is-active): **F2**, **Hold**.
2. Add **C# Script** to **On Enter** and paste the whole code into top-level **Script.csx**:

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

3. Open the blank document, put the caret in the field and release any modifier keys.
4. Press and release F2. You get `Hello, world!`, `this one is a bit slower` and `and this one is very slow!` on separate lines.

| Call or setting | What it sets |
| --- | --- |
| Text(string, int? delayMs) | Plain text. Send Sequence and AutoHotkey syntax do not work here: `{Enter}` inside the string does not press a key. |
| KeyPressDelay = new RandomInteger(1, 5) | Delay range for the first fragment. It is set explicitly, so it also applies when you Run again. |
| new RandomInteger(5, 15) | Range for later input that has no delayMs of its own. |
| delayMs: 30 | Fixed delay for that one Text call. |
| KeyPress(Key.Enter) | A separate Enter press between fragments. It also accepts keyPressDelay, for example 30. |

**Text** in this API types character by character through **SendChars**. Each character becomes a key press and the layout is detected automatically. If no fitting layout is found, the current one is used. A character that is not supported can make the conversion fail. The **Control+V / Shift+Insert** modes from the UI are separate settings and are not selected by delayMs.

<details>
<summary>A C# newline and an actual key press</summary>

In a normal C# string, `"\n"` is one LF character. In a verbatim string, `@"\n"` is a backslash and the letter n. The literal alone does not decide how that character reaches the application: character-by-character input converts it through the keyboard layout. That is why the example presses Enter with separate calls.

Verbatim strings are handy for paths, normal strings for escape sequences. Do not confuse either with the [Send Sequence](/en/actions/sendinput/send-sequence) syntax.

</details>

**Text** waits synchronously until the input has been sent. A Text call that has already started takes no Run token and does not stop instantly on Stop. Do not switch the active window while typing is in progress. If you set TargetWindow, standard input asks for that window to be activated.

The service belongs to the script context. Pass it to an ordinary class explicitly: GetService and cancellationToken are not global C# APIs. The full description is in [ISendInputScriptingApi](/en/scripting/api/ISendInputScriptingApi).
