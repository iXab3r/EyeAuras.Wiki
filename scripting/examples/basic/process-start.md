---
title: How to Launch a Game/Process
description: 
published: true
date: 2024-07-02T14:36:35.228Z
tags: running programs, C# Script, process automation
editor: markdown
dateCreated: 2024-07-02T14:36:35.228Z
---
## Running an Arbitrary Program/Game
> You can import a ready-made example from here: [https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL](https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL)
{.is-info}

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, in the example it's `F3`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to `On Enter`.
4. Copy and paste the script itself.
5. Pressing `F3` will launch `Notepad`.

```csharp
// You can use either the short name
Process.Start("notepad");
// or the full path
//Process.Start("C:/Windows/system32/notepad.exe");

// Full documentation can be found here - [https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0)
```