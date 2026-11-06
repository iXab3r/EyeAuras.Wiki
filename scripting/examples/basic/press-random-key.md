---
title: How to Press Random Key
description: 
published: true
date: 2025-01-04T18:42:46.105Z
tags: ai-translated
editor: markdown
dateCreated: 2025-01-04T18:42:33.221Z
---

# How to Press Random Key

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, in the example it's `F3`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to `On Enter`.
4. Copy and paste the script itself.
5. Focus the application that should receive input. Pressing `F3` sends one of `1`, `2`, `4`, `5`, `A`, or `D`.

```csharp
using EyeAuras.Roxy.Api;
using System.Windows.Input;

var randomKeys = new[] { Key.D1, Key.D2, Key.D4, Key.D5, Key.A, Key.D }; // list your random keys here
var input = GetService<ISendInputScriptingApi>();
input.TargetWindow = null;
input.KeyPress(randomKeys[System.Random.Shared.Next(randomKeys.Length)]);
```

Each aura entry picks one key and sends one press. KeyPress is synchronous, takes no Run token, and uses the API press/release delay. GetService is supplied by the script host; an ordinary class must receive the input service explicitly.
