---
title: Choose Your Next Scripting Example
description: Ready examples for the next step after your first script.
published: false
date: 2024-02-20T22:29:52.393Z
tags: ai-translated, scripting, programming, guides, syntax, auras, APIs, services, multithreading
editor: markdown
dateCreated: 2024-02-18T22:39:16.329Z
---

# Choose your next scripting example

Is your first script running? Pick one next task: keep a value, find an aura, show something on screen or work with an image. Below is a ready example for each.

1. If you have not run any code yet, start with [your first Run](/en/scripting/getting-started), then go through the full [Hello, World!](/en/scripting/examples/basic/hello-world).
2. Pick a task in the table and open the whole example. See where `Script.csx`, ordinary `.cs` files and resources go.
3. Compare the example's result with what you need. Start with your own test window and one action. Add more once the example works.
4. Find the right API area in the [API maps](/en/scripting/api/core/eyeauras-structure). Check the exact method or type against the reference for your version.

| Task | Start here |
| --- | --- |
| Understand C# and the script environment | [Script context](/en/scripting/sandbox): top-level code, what is available in it and how it differs from an ordinary class. |
| Keep a value between runs | [Variables](/en/scripting/examples/basic/variables): a local value, the state of one run and the variables of an aura or folder live for different lengths of time. |
| Find an aura and read its data | [Find Aura](/en/scripting/examples/basic/find-aura), then the [IAuraAccessor](/en/scripting/api/IAuraAccessor) and [AuraTree](/en/scripting/api/IAuraTreeScriptingApi) contracts. |
| Get a service | [Runtime context and dependencies](/en/scripting/api/scripting/runtime): `GetService<T>()` returns a registered service. |
| Move the mouse or enter text | [Move to a window's centre](/en/scripting/examples/basic/send-mouse-center) and [Send Text](/en/scripting/examples/basic/send-text): each one names the target window, the coordinate space and the input method. |
| Draw a marker, track the cursor or show HTML | [Cursor marker](/en/scripting/examples/basic/osd-cursor), [mouse track with an overlay](/en/scripting/examples/basic/mouse-track-with-overlay), [Blazor windows](/en/scripting/blazor-windows/getting-started). |
| Find an image before an action | [Script Image Search](/en/scripting/examples/basic/image-search). A key condition is a separate topic, see [Hotkey Is Active](/en/triggers/hotkey-is-active). You combine the two yourself. |
| Wait for work and stop cleanly | [Asynchronous operations](/en/scripting/api/scripting/async): awaiting a task, the cancellation token and releasing resources. The word `async` alone does not move an operation to another thread. |

`Log`, `AuraTree`, `Variables`, `GetService` and `cancellationToken` are available only to top-level script code. An ordinary C# class or Razor component gets its dependencies separately.

<details>
<summary>Reference links from older examples</summary>

These links help when you meet an interface name in a listing.

| Reference | What it is for |
| --- | --- |
| [IVariablesScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IVariablesScriptingApi.html) | Variables in listings that use this interface. |
| [ISendInputUnstableScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html) | The older input interface. For new code, look at the current input example and its dependencies first. |
| [IOnScreenCanvasScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IOnScreenCanvasScriptingApi.html) | The screen canvas used by older drawing examples. |

Did not find the walkthrough you need? Write to the [community](/en/contacts): describe the task, your EyeAuras build, a short example of your code and the result you want.

</details>
