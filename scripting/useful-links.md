---
title: List of Useful Links
description: Where to look up C#, .NET, Blazor and Windows internals when you write a script.
published: true
date: 2025-09-21T11:29:06.078Z
tags: ai-translated
editor: markdown
dateCreated: 2025-09-21T11:29:06.078Z
---

# Find a reference for your scripting task

These are links that come in handy when you write scripts. For the first run you need an EyeAuras example. For syntax you need the C# reference. For an exact method you need the SDK or API documentation for your version.

1. Work out what is unclear: the language, an EyeAuras capability, how a UI works or a data format.
2. Open the matching resource below. In external documentation, select the version your project uses.
3. Go back to the example and check its files, dependencies and host. A sample you found still has to be adapted: it may not run in EyeAuras as is.

| Your next task | Start here |
| --- | --- |
| Run your first script | [Getting started](/en/scripting/getting-started), [script context](/en/scripting/sandbox) and [NuGet dependencies](/en/scripting/nuget). |
| Find an EyeAuras API area | [Discovery maps](/en/scripting/api/core/eyeauras-structure) lead you to operations and source types. Check the exact contract in the reference and SDK for your version. |
| Follow one practical example | [Hello, World!](/en/scripting/examples/basic/hello-world), [variables](/en/scripting/examples/basic/variables) or [Image Search](/en/scripting/examples/basic/image-search). |
| Build a UI | Start with [Blazor windows in EyeAuras](/en/scripting/blazor-windows/getting-started), then read the external references below. |
| Ask a focused question | [Community contacts](/en/contacts): give your build, a short example and the result you expect. Remove passwords and other secrets from the example. |

## C# and .NET

| Resource | What is there |
| --- | --- |
| [.NET Documentation](https://learn.microsoft.com/dotnet/) | All .NET documentation: libraries, runtime and tools. Select your project's version. |
| [C# Language Reference](https://learn.microsoft.com/dotnet/csharp/language-reference/) | C# syntax, keywords and operators for your compiler version. |
| [.NET API Browser](https://learn.microsoft.com/dotnet/api/) | Members and signatures of .NET types. Select the version you need. |
| [Roslyn (C# Compiler & Analyzers)](https://github.com/dotnet/roslyn) | Source code of the C# compiler and analyzers. |
| [C# Language Design Notes](https://github.com/dotnet/csharplang) | How the language is designed and what proposals exist. A proposal is not yet a shipped feature. |
| [.NET Runtime Source](https://github.com/dotnet/runtime) | Source code of the runtime, the garbage collector and the base libraries. |
| [.NET Performance Guide](https://learn.microsoft.com/dotnet/standard/garbage-collection/performance) | How to measure and investigate garbage-collection performance. |
| [Maoni’s GC Blog](https://devblogs.microsoft.com/dotnet/author/maoni/) | Articles by a Microsoft developer about the garbage collector. |
| [Stephen Toub on Async](https://devblogs.microsoft.com/dotnet/how-async-await-really-works/) | A detailed look at how async/await works. |
| [Source Generators](https://learn.microsoft.com/dotnet/csharp/roslyn-sdk/source-generators-overview) | Documentation for source generators. |
| [P/Invoke Reference](https://www.pinvoke.net/) | A community reference of Win32 signatures. Check them against the Microsoft documentation. |
| [NativeAOT](https://learn.microsoft.com/dotnet/core/deploying/native-aot/) | Requirements and limits of NativeAOT for a separate application. Script.csx does not run this way. |
| [BenchmarkDotNet](https://github.com/dotnet/BenchmarkDotNet) | Measuring small .NET operations in a prepared project. |
| [ILSpy](https://github.com/icsharpcode/ILSpy) | Viewing decompiled .NET assemblies. |
| [dnSpyEx](https://github.com/dnSpyEx/dnSpy) | A community .NET debugger and decompiler. |
| [Awesome .NET](https://github.com/quozd/awesome-dotnet) | A community collection for finding libraries. |

<details>
<summary>Blazor</summary>

| Resource | What is there |
| --- | --- |
| [Blazor Docs (ASP.NET Core)](https://learn.microsoft.com/aspnet/core/blazor/) | The general Blazor guide. You can select the version and hosting model. |
| [Blazor Performance Best Practices](https://learn.microsoft.com/aspnet/core/blazor/performance) | Advice on Blazor component performance. |
| [JS Interop](https://learn.microsoft.com/aspnet/core/blazor/javascript-interoperability/) | Calls between .NET and JavaScript, and object lifetime. |
| [Security & Identity](https://learn.microsoft.com/aspnet/core/blazor/security/) | Authentication and authorization for a web app. |
| [SignalR with Blazor](https://learn.microsoft.com/aspnet/core/blazor/fundamentals/signalr) | How SignalR works in each Blazor hosting mode. |
| [Blazor University](https://blazor-university.com/) | Community tutorials on Blazor. |
| [Awesome Blazor](https://github.com/AdrienTorris/awesome-blazor) | A community collection of components and samples. |
| [MudBlazor](https://mudblazor.com/) | A UI component library. |
| [Radzen Blazor](https://blazor.radzen.com/) | A UI control library and its examples. |
| [Blazorise](https://blazorise.com/) | A Blazor component library and its documentation. |
| [.NET WebAssembly Docs](https://learn.microsoft.com/aspnet/core/blazor/webassembly-build-tools-and-aot) | WebAssembly builds and AOT. Do not confuse them with desktop WebView2. |
| [gRPC](https://learn.microsoft.com/aspnet/core/grpc/) / [Minimal APIs](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis) | Server endpoints and gRPC in ASP.NET Core, for a separate backend. |
| [NSwag](https://github.com/RicoSuter/NSwag) / [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore) | Generating and using OpenAPI descriptions. |

</details>

<details>
<summary>Windows and binary formats</summary>

| Resource | What is there |
| --- | --- |
| [Vergilius Project](https://www.vergiliusproject.com/) | Layouts of Windows structures for specific OS versions. |
| [Ghidra](https://github.com/NationalSecurityAgency/ghidra) | The Ghidra program-analysis tool: documentation and source. |
| [IDA Free](https://hex-rays.com/ida-free) | What IDA Free can do and the author's current terms. |
| [radare2 / r2](https://github.com/radareorg/radare2) | A binary-analysis framework and its documentation. |
| [Cutter](https://cutter.re/) | A graphical analysis tool built on Rizin. |
| [x64dbg](https://x64dbg.com/) | A Windows debugger and its project materials. |
| [WinDbg / WinDbg Preview](https://learn.microsoft.com/windows-hardware/drivers/debugger/) | The Microsoft debugger: concepts and commands. |
| [WDK Docs](https://learn.microsoft.com/windows-hardware/drivers/) | Documentation for Windows driver development. |
| [Windows Internals (Book)](https://learn.microsoft.com/sysinternals/resources/windows-internals) | The Windows Internals books and related material. |
| [Sysinternals Suite](https://learn.microsoft.com/sysinternals/) | Microsoft diagnostic utilities and their documentation. |
| [System Informer](https://systeminformer.io/) | A tool for inspecting processes and the system. |
| [Capstone](https://www.capstone-engine.org/) / [Keystone](https://github.com/keystone-engine/keystone) / [Unicorn](https://www.unicorn-engine.org/) | Three different libraries: disassembly, assembly and emulation. |
| [PE/COFF Spec](https://learn.microsoft.com/windows/win32/debug/pe-format) | The official PE and COFF format specification. |
| [ReactOS Source](https://github.com/reactos/reactos) | Source code of a separate NT-like OS. |

</details>

<details>
<summary>Game-analysis tools and communities</summary>

| Resource | What is there |
| --- | --- |
| [UnknownCheats](https://unknowncheats.me/) | A community forum about game analysis and security. |
| [Cheat Engine](https://www.cheatengine.org/) / [CE Wiki](https://wiki.cheatengine.org/index.php?title=Main_Page) | A memory-analysis tool and its separate wiki with tutorials. |
| [Guided Hacking](https://guidedhacking.com/) | Community tutorials and a forum. |
| [GameHacking.org](https://gamehacking.org/) | Community resources and discussions. |
| [ReClass.NET](https://github.com/ReClassNET/ReClass.NET) | Viewing class and structure layouts. |
| [MinHook](https://github.com/TsudaKageyu/minhook) | A function-hooking library and the author's examples. |
| [Microsoft Detours](https://github.com/microsoft/Detours) | Microsoft's library for intercepting functions. |
| [ScyllaHide](https://github.com/x64dbg/ScyllaHide) | Documentation for the ScyllaHide plugin. |
| [Il2CppDumper](https://github.com/Perfare/Il2CppDumper) | Analysis of Unity IL2CPP metadata in the supported formats. |
| [Unreal Engine Docs](https://docs.unrealengine.com/) | Unreal Engine documentation. Choose your engine version. |
| [DirectX Graphics Docs](https://learn.microsoft.com/windows/win32/direct3d/) | The DirectX graphics APIs. |
| [Dear ImGui](https://github.com/ocornut/imgui) | Dear ImGui source code. For EyeAuras you also need a compatible wrapper and host. |

</details>

Examples written for ordinary .NET, browser Blazor and C++ do not have `Log`, `AuraTree` or the other Script.csx capabilities. When you adapt one, check its dependencies, the registered services and who owns the resources. Work only with software and data you have the right to inspect.
