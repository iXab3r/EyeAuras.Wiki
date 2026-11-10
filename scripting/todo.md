---
title: Choose Your Next Scripting Example
description: Choose an existing example for state, auras, input, display or asynchronous work
published: false
date: 2024-02-20T22:29:52.393Z
tags: ai-translated, scripting, programming, guides, syntax, auras, APIs, services, multithreading
editor: markdown
dateCreated: 2024-02-18T22:39:16.329Z
---

# Choose your next scripting example

After your first script runs, choose one small task: keep a value, find an aura, display something or inspect an image. The links below lead to existing examples. Each example still needs its stated host, files and dependencies; a topic name does not make every service available in every build.

1. Start with [your first Run](/en/scripting/getting-started) and [Hello, World!](/en/scripting/examples/basic/hello-world) if you have not yet printed a message in the event log.
2. Choose one task from the table. Read its complete example, including where to put `Script.csx`, helper `.cs` files and resources.
3. Check the input and expected result. Use your own simple test window or data before adding more actions.
4. When you need a precise method or type, use the [API discovery maps](/en/scripting/api/core/eyeauras-structure) to find the area, then check the source or SDK/reference contract for your version.

| Task | Start here |
| --- | --- |
| Understand C# in an EyeAuras script | [Script context](/en/scripting/sandbox) explains the host and the difference between top-level code and an ordinary class. Use the C# language reference for loops and conditions. |
| Keep a value between runs | [Variables](/en/scripting/examples/basic/variables) distinguishes local values, run-owned state and variables belonging to an aura or folder. Their lifetimes differ. |
| Find an aura and read its data | [Find Aura](/en/scripting/examples/basic/find-aura), then the [IAuraAccessor](/en/scripting/api/IAuraAccessor) and [AuraTree](/en/scripting/api/IAuraTreeScriptingApi) contracts. Find the owner before accessing its triggers or actions. |
| Obtain a service | [Runtime context and dependencies](/en/scripting/api/scripting/runtime). `GetService<T>()` resolves a registered type; its presence depends on the host and loaded modules. |
| Move the mouse or enter text | [Move to a window's centre](/en/scripting/examples/basic/send-mouse-center) and [Send Text](/en/scripting/examples/basic/send-text). Each specifies the target, coordinate space and input method. |
| Draw a marker, track the cursor or show HTML | [Cursor marker](/en/scripting/examples/basic/osd-cursor), [mouse track with an overlay](/en/scripting/examples/basic/mouse-track-with-overlay) and [Blazor windows](/en/scripting/blazor-windows/getting-started) use different display hosts. |
| Find an image before an action | [Script Image Search](/en/scripting/examples/basic/image-search). Study [Hotkey Is Active](/en/triggers/hotkey-is-active) separately before combining a key condition with a configured action. |
| Wait for work and stop cleanly | [Asynchronous operations](/en/scripting/api/scripting/async): awaited tasks, cancellation and owned resources. `async` does not automatically move every operation to another thread. |

You should leave with one complete example whose input and output you understand. `Log`, `AuraTree`, `Variables`, `GetService` and `cancellationToken` belong to the top-level script host. Ordinary C# helpers and Razor components receive their dependencies separately.

<details>
<summary>Reading older examples and interface references</summary>

Older script versions can use different entry formats or interfaces. Check the current getting-started guide before copying a v2/v3 listing. Keep a shareable example's entry file, helpers and resources together; a folder name such as `Guides/example_name/` does not determine how the host runs it. Include the important code when asking a question so another reader can inspect it.

| Reference | Why keep it |
| --- | --- |
| [IVariablesScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IVariablesScriptingApi.html) | Understand variable handles in listings that use this interface. |
| [ISendInputUnstableScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html) | Read older input examples. Start new work with the current practical example and its dependencies. |
| [IOnScreenCanvasScriptingApi](https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IOnScreenCanvasScriptingApi.html) | Understand the screen-canvas interface used by older drawing examples. |

These references do not install a module or select a compatible host for you. For an explanation that is still missing, ask the [community](/en/contacts) with your EyeAuras build, a short source example and the result you want. A requested topic is not a promised API or delivery date.

</details>
