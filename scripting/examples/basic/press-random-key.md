---
title: How to Press Random Key
description: 
published: true
date: 2025-01-04T18:42:33.221Z
tags: 
editor: markdown
dateCreated: 2025-01-04T18:42:33.221Z
---

## Running an Arbitrary Program/Game

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, in the example it's `F3`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to `On Enter`.
4. Copy and paste the script itself.
5. Pressing `F3` will launch `Notepad`.

```csharp
var randomKeys = new[] { Key.D1, Key.D2, Key.D4, Key.D5, Key.A, Key.D }; // list your random keys here
GetService<ISendInputUnstableScriptingApi>().KeyPress(randomKeys.PickRandom()); // press one of them
```