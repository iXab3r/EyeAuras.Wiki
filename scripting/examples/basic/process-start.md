---
title: How to Launch a Game/Process
description: 
published: true
date: 2024-07-02T14:36:35.228Z
tags: running programs, C# Script, process automation, ai-translated
editor: markdown
dateCreated: 2024-07-02T14:36:35.228Z
---
# Open a local program from an action

This script starts Notepad and writes the process ID (PID) to the log.

1. Create a test aura and add **C# Script** under **On Enter**. To begin with, start it by hand with **Run**.
2. Paste the whole code into top-level `Script.csx`. It needs Windows with `notepad.exe`:

```csharp
using System;
using System.Diagnostics;
using System.IO;

{
    var systemFolder = Environment.GetFolderPath(Environment.SpecialFolder.System);
    var start = new ProcessStartInfo
    {
        FileName = Path.Combine(systemFolder, "notepad.exe"),
        Arguments = "",
        WorkingDirectory = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
        UseShellExecute = false
    };
    cancellationToken.ThrowIfCancellationRequested();
    using var process = Process.Start(start);
    if (process == null) { Log.Warn("No new process was created"); return; }
    Log.Info($"Started PID: {process.Id}");
}
```

3. Click **Run**. Notepad opens and the log shows its PID. Each new Run sends another launch request.
4. When you no longer need the test window, close it the usual way. The script does not close it.

| Field or result | Meaning |
| --- | --- |
| `FileName` | A real executable. The example builds the path from the Windows system folder, so it is not tied to drive `C:`. |
| `Arguments` | The program's argument string. It is empty here. |
| `WorkingDirectory` | The starting working folder of the new process. With `UseShellExecute = false`, the executable is not searched for there. |
| `UseShellExecute = false` | Starts the program directly. To open a document in its associated program you need a shell launch, with `true`. |
| `Process.Id` | ID of the started process. The process can hand the request to an instance that is already running and exit quickly, so a PID does not confirm that the window is ready. |

`using` releases the `Process` object and the resources used to watch it, but it does not call `Kill`. **Stop** does not end the started program either: `Process.Start` takes no cancellation token. To wait for the program to exit, call `await process.WaitForExitAsync(cancellationToken)` **inside the block, before `Process` is disposed**. Cancelling that wait does not end the process either.

If the next step has to wait for a window, add a separate [Window Exists](/en/triggers/window-exists) condition. To bring an already open window forward instead of starting the program again, use [Win Activate](/en/actions/win-activate).

<details>
<summary>Short name, another program or a hotkey</summary>

The shortest `Script.csx` variant:

```csharp
using System.Diagnostics;

{
    using var process = Process.Start("notepad");
}
```

Instead of the short name you can pass a full path, for example `C:/Windows/system32/notepad.exe`, if that file exists on your machine. For your own program or game, set its real executable, the arguments it needs and its working folder.

To start it with a key, add **Hotkey Is Active → Hold**, assign a free `F3` and leave the action under **On Enter**. Each press sends a new launch request. Releasing the key does not close the started process.

[Ready-made historical example](https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL), [Process.Start](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0), [.NET Close/Dispose source](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/System.Diagnostics.Process/src/System/Diagnostics/Process.cs).

</details>
