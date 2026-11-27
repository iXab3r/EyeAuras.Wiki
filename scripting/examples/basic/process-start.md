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

Launch your own Notepad and log the returned process ID. A PID confirms a process resource, not that its editor window is ready for input.

1. Create a test aura and add **C# Script** under **On Enter**. Start with manual **Run**.
2. Put this complete program in top-level `Script.csx`. It requires Windows with `notepad.exe` available:

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

3. Click **Run**. Notepad should open and the log reports its PID. Running again sends another launch request; it is not an activate-existing-window command.
4. Close only your own test window normally when finished. This script does not terminate it automatically.

| Field or result | Meaning |
| --- | --- |
| `FileName` | An existing executable. The example obtains the Windows system folder rather than assuming drive `C:`. |
| `Arguments` | The program's argument string, empty here. Its syntax belongs to that program. |
| `WorkingDirectory` | Initial child working folder. With `UseShellExecute = false`, it is not the executable search path. |
| `UseShellExecute = false` | Starts the executable directly. Opening a document through its file association uses a different shell-based route with `true`. |
| `Process.Id` | ID of the returned process. It can hand work to an existing instance and exit quickly; PID is not ready-UI proof. |

`using` releases the `Process` component and observation resources; it does not call `Kill`. **Stop** also does not terminate the child: `Process.Start` takes no cancellation token. To wait for exit, place `await process.WaitForExitAsync(cancellationToken)` **inside the block before disposal**. Cancelling that wait still does not terminate the process.

If a later step depends on a matching window, use [Window Exists](/en/triggers/window-exists) as a separately configured condition. To bring an already open window forward instead of requesting another launch, use [Win Activate](/en/actions/win-activate); window existence and foreground activation are separate decisions.

<details>
<summary>Short name, another program or a hotkey</summary>

The shortest independent `Script.csx` variant is:

```csharp
using System.Diagnostics;

{
    using var process = Process.Start("notepad");
}
```

An existing full path also works, for example `C:/Windows/system32/notepad.exe` if that file exists on your machine. For your own program or game, supply its real executable, required arguments and working folder; there are no universal arguments for every application.

For a hotkey, add **Hotkey Is Active → Hold**, assign a free `F3` and leave the action under **On Enter**. Each new activation requests a launch; releasing the key does not close the child. The earlier name `Click/Hold` does not make this a program-lifetime toggle.

See the [historical example](https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL), [Process.Start](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0) and [.NET Close/Dispose source](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/System.Diagnostics.Process/src/System/Diagnostics/Process.cs).

</details>
