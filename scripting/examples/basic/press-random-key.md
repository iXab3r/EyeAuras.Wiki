---
title: How to Press Random Key
description: 
published: true
date: 2025-01-04T18:42:46.105Z
tags: ai-translated
editor: markdown
dateCreated: 2025-01-04T18:42:33.221Z
---
# Send one randomly selected key to your editor

The script picks one key from `1`, `2`, `4`, `5`, `A`, `D` and presses it once in your own test text window. The keys are not gone through in order: each run picks at random, so repeats are expected.

You need desktop EyeAuras with **Windows Input** and the OSD window picker. Open an empty text field in your own editor, put the caret in it, switch to an English keyboard layout and release modifiers. Do not use a chat or a submit form.

1. Add **C# Script** to your test aura. For the first try, start it by hand with **Run**.
2. Paste the whole program into `Script.csx`:

```csharp
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Osd;
using System.Windows.Input;

{
    var target = await GetService<IOsdSelectionService>().PickWindow();
    if (target == null || !target.IsWindow) { Log.Warn("No window selected"); return; }
    var keys = new[] { Key.D1, Key.D2, Key.D4, Key.D5, Key.A, Key.D };
    var key = keys[System.Random.Shared.Next(keys.Length)];
    var input = GetService<ISendInputScriptingApi>();
    var previousSimulator = input.InputSimulatorId;
    var previousTarget = input.TargetWindow;
    try
    {
        input.InputSimulatorId = "Windows Input";
        input.TargetWindow = target;
        cancellationToken.ThrowIfCancellationRequested();
        Log.Info($"Window: {target.Title}; key: {key}");
        input.KeyPress(key, 20);
    }
    finally
    {
        input.TargetWindow = previousTarget;
        input.InputSimulatorId = previousSimulator;
    }
}
```

3. Click **Run** and select the window you prepared. Windows Input activates it, and the character appears in the field with the caret. Escape or a right-click cancels window selection.
4. Repeat Run a few times. The log shows the chosen key and the editor shows what reached it.

| Setting | Meaning |
| --- | --- |
| `keys` | Six different keys, each with a 1/6 chance. If you add a duplicate to the array, that key comes up more often. |
| Repeat count | One press per Run. |
| `20` in `KeyPress` | Milliseconds between key-down and key-up, not a repeat period. Without the argument the API's `KeyPressDelay` is used. |
| `TargetWindow` | The window you selected yourself. Input is aimed at it and activates it. |

Keys are not ready-made text: the result depends on the layout, modifiers and focus inside the window. The token is checked before input. The synchronous `KeyPress` does not get the Run token, so it does not interrupt a press that has already started. The borrowed API's previous settings are restored in `finally`.

If you need a word or sentence rather than a single key, see the [text-entry example](/en/scripting/examples/basic/send-text). It sends characters with explicit Enter presses between lines.

<details>
<summary>Hotkey invocation and the earlier foreground target</summary>

You can add **Hotkey Is Active → Hold** on `F3` and put the action under **On Enter**. Each new activation picks one key. Release the key and the aura can be activated again. You still select your window on every run.

The earlier variant had `input.TargetWindow = null`. For Windows Input that means the current foreground application. With explicit selection, as above, the target is clear before the press. Other delivery methods are in [SendInput](/en/scripting/api/ISendInputScriptingApi). Pass the service to an ordinary C# class explicitly.

</details>
