---
title: Printing Text
description: 
published: true
date: 2024-02-24T00:41:30.125Z
tags: ai-translated
editor: markdown
dateCreated: 2024-02-24T00:41:30.125Z
---

# Printing Text

Run this top-level C# Action with a working input simulator. Before pressing F2, focus an editor such as Notepad. TargetWindow = null sends to the active application.
> You can import a ready-made example from here https://eu.eyeauras.net/share/S20240224004118uKKy4R0wIpLd
{.is-info}

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, in the example `F2`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to the `On Enter` event.
4. Copy and paste the script itself.
5. Pressing `F2` will print several lines of text.

![](https://s3.eyeauras.net/media/wiki/scripting/examples/basic/send-text/mwIxxsL.gif)

```csharp
using EyeAuras.Roxy.Api;
using PoeShared.Scaffolding;

var sendInputApi = GetService<ISendInputScriptingApi>();
sendInputApi.TargetWindow = null;
cancellationToken.ThrowIfCancellationRequested();
sendInputApi.Text("Hello, world!");

sendInputApi.KeyPressDelay = new RandomInteger(5, 15);
sendInputApi.Text("\nthis one is a bit slower");

sendInputApi.Text("\nand this one is very slow!", delayMs: 30);
```

> In the example, the special character `\n` is specified at the beginning of the lines, which is a line break character.
{.is-info}

Three lines are sent with different delays. Text synchronously waits for sending; without delayMs it uses KeyPressDelay, initially 1–5 ms. These generator delays do not guarantee application display timing. The call has no Run token; the pre-call cancellation check cannot interrupt an active send. For a single key use KeyPress(Key.Enter, keyPressDelay: 30).
