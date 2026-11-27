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

Choose one of `1`, `2`, `4`, `5`, `A`, `D` and send one press to your own test text field. This is not a sequence through all six: each Run selects an array element again, so repeats are expected.

Use desktop EyeAuras with **Windows Input** and the OSD window picker. Open an empty text field in your own editor, put the caret in it, select an English keyboard layout and release modifiers. Use a local test document without a submit action.

1. Add **C# Script** to your test aura. Use manual **Run** for the first exercise.
2. Put this complete program in `Script.csx`:

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

3. Click **Run** and select your prepared window. Windows Input activates that target; the key is delivered to the control holding keyboard focus. Escape or right-click cancels window selection.
4. Repeat a few times. Compare the chosen key in the log with the editor's visible result; the same character can recur.

| Setting | Meaning |
| --- | --- |
| `keys` | Six distinct keys, selected through a pseudorandom array index with equal weight. A duplicate array entry increases that key's weight. |
| Repeat count | One press per Run; no automatic loop or interval between presses. |
| `20` in `KeyPress` | Requested milliseconds between key-down and key-up, not a repeat period. Omit it to use the API's `KeyPressDelay`. |
| `TargetWindow` | Your explicitly selected window, using activation rather than a promise of universal background delivery. |

Keys are not precomposed text: layout, modifiers and the focused control affect the result. The normal `KeyPress` path sends down, waits, then sends up. This synchronous call receives no Run token and an already started press is not interrupted by the pre-call cancellation check. The `finally` block restores the borrowed API's settings; it is not a general held-key recovery routine after every backend error.

For a word or sentence rather than a key event, use the [text-entry example](/en/scripting/examples/basic/send-text). It sends characters with explicit Enter presses between lines; prepare its focused test document as described there.

<details>
<summary>Hotkey invocation and the earlier foreground target</summary>

You can add **Hotkey Is Active → Hold** on `F3` with the action under **On Enter**. Each new activation selects one key; window selection remains part of that operation. Releasing the key allows a later activation.

The earlier variant used `input.TargetWindow = null`: Windows Input then addresses the current foreground application. That does not suppress input or select a safe editor for you. Explicit selection above makes the intended recipient clear before the press. See [SendInput](/en/scripting/api/ISendInputScriptingApi). Ordinary C# helpers receive the service explicitly instead of inheriting top-level `GetService`.

</details>
