---
title: How to Launch a Game/Process
description: 
published: true
date: 2024-07-02T14:36:35.228Z
tags: running programs, C# Script, process automation, ai-translated
editor: markdown
dateCreated: 2024-07-02T14:36:35.228Z
---
# Running an Arbitrary Program/Game
> You can import a ready-made example from here: [https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL](https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL)
{.is-info}

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, in the example it's `F3`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to `On Enter`.
4. Copy and paste the script itself.
5. Pressing `F3` will launch `Notepad`.

```csharp
using System.Diagnostics;

{
    using var process = Process.Start("notepad");
    // Or supply an existing full path to the executable.
}
```

Run this in a top-level C# Script Action on Windows. Supply an available program
name or an existing executable path. A game may also need a working directory
configured through `ProcessStartInfo`. The expected visible result is Notepad.
`using` releases the `Process` component; it does not terminate the launched program.
Stopping the script does not stop the child process, and `Process.Start` accepts
no cancellation token. See [Process.Start](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0)
and the [.NET 8.0.19 Close/Dispose implementation](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/System.Diagnostics.Process/src/System/Diagnostics/Process.cs).
