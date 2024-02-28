---
title: Printing Text
description: 
published: true
date: 2024-02-24T00:41:30.125Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:41:30.125Z
---

## Printing Text
> You can import a ready-made example from here https://eu.eyeauras.net/share/S20240224004118uKKy4R0wIpLd
{.is-info}

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, in the example `F2`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to the `On Enter` event.
4. Copy and paste the script itself.
5. Pressing `F2` will print several lines of text.

![](https://i.imgur.com/mwIxxsL.gif)

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); 
sendInputApi.Text("Hello, world!"); // printing with the standard interval (random, 1-5ms)

sendInputApi.KeyPressDelay = new RandomInteger(5, 15); // changing the interval to 5-15ms
sendInputApi.Text("\nthis one is a bit slower"); 

sendInputApi.Text("\nand this one is very slow!", delayMs: 30); // printing with a 30ms interval
```

> In the example, the special character `\n` is specified at the beginning of the lines, which is a line break character.
{.is-info}