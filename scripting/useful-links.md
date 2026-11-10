---
title: List of Useful Links
description: 
published: true
date: 2025-09-21T11:29:06.078Z
tags: ai-translated
editor: markdown
dateCreated: 2025-09-21T11:29:06.078Z
---

# Find a reference for your scripting task

Use an EyeAuras example for the first run, a language reference for C# syntax and the matching SDK/API contract for an exact method. This collection helps you choose a resource without installing every listed tool.

1. Identify what you need: language syntax, an EyeAuras capability, UI behaviour or a data format.
2. Choose the resource below and select the version used by your project.
3. Return to the example and check its files, dependencies and host. Finding a reference does not automatically make its code run inside EyeAuras.

| Your next task | Start here |
| --- | --- |
| Run your first script | [Getting started](/en/scripting/getting-started), [script context](/en/scripting/sandbox) and [NuGet dependencies](/en/scripting/nuget). |
| Find an EyeAuras API area | [Discovery maps](/en/scripting/api/core/eyeauras-structure) route you to operations and source types. Confirm the actual contract in your version’s reference/SDK; a map is not a list of every service installed in your host. |
| Follow one practical example | [Hello, World!](/en/scripting/examples/basic/hello-world), [variables](/en/scripting/examples/basic/variables) or [Image Search](/en/scripting/examples/basic/image-search). |
| Build a UI | Start with [Blazor windows in EyeAuras](/en/scripting/blazor-windows/getting-started), then consult the external references. An ASP.NET browser sample does not create a desktop EyeAuras window by itself. |
| Ask a focused question | [Community contacts](/en/contacts): provide the build, a short example and expected result without credentials or other secrets. |

## C# and .NET

| Resource | When to use it |
| --- | --- |
| [.NET Documentation](https://learn.microsoft.com/dotnet/) | Find runtime, library and tooling documentation; select your project version. |
| [C# Language Reference](https://learn.microsoft.com/dotnet/csharp/language-reference/) | Look up C# syntax, keywords and operators for your compiler version. |
| [.NET API Browser](https://learn.microsoft.com/dotnet/api/) | Find .NET type members and signatures; select the relevant framework version. |
| [Roslyn (C# Compiler & Analyzers)](https://github.com/dotnet/roslyn) | Inspect the C# compiler and analyzer source. |
| [C# Language Design Notes](https://github.com/dotnet/csharplang) | Read language proposals and design notes. A proposal is not a shipped compiler feature. |
| [.NET Runtime Source](https://github.com/dotnet/runtime) | Inspect runtime, GC and base-library implementation. |
| [.NET Performance Guide](https://learn.microsoft.com/dotnet/standard/garbage-collection/performance) | Investigate garbage-collection performance with measurements from your workload. |
| [Maoni’s GC Blog](https://devblogs.microsoft.com/dotnet/author/maoni/) | Read Microsoft author articles about GC internals. |
| [Stephen Toub on Async](https://devblogs.microsoft.com/dotnet/how-async-await-really-works/) | Understand async/await implementation; distinguish language behaviour from the EyeAuras host. |
| [Source Generators](https://learn.microsoft.com/dotnet/csharp/roslyn-sdk/source-generators-overview) | Learn source-generator contracts for a compatible project. |
| [P/Invoke Reference](https://www.pinvoke.net/) | Find community Win32 signatures, then check them against Microsoft contracts. |
| [NativeAOT](https://learn.microsoft.com/dotnet/core/deploying/native-aot/) | Read NativeAOT deployment requirements for a separate application; this is not a Script.csx run mode. |
| [BenchmarkDotNet](https://github.com/dotnet/BenchmarkDotNet) | Design a microbenchmark in a prepared .NET project. |
| [ILSpy](https://github.com/icsharpcode/ILSpy) | Inspect decompiled .NET assemblies. |
| [dnSpyEx](https://github.com/dnSpyEx/dnSpy) | Read the community .NET debugger/decompiler documentation. |
| [Awesome .NET](https://github.com/quozd/awesome-dotnet) | Discover libraries; a listing does not mean a package is registered in EyeAuras. |

<details>
<summary>Blazor</summary>

| Resource | When to use it |
| --- | --- |
| [Blazor Docs (ASP.NET Core)](https://learn.microsoft.com/aspnet/core/blazor/) | Read Blazor concepts for the matching version and hosting model. |
| [Blazor Performance Best Practices](https://learn.microsoft.com/aspnet/core/blazor/performance) | Investigate component rendering performance in the matching host. |
| [JS Interop](https://learn.microsoft.com/aspnet/core/blazor/javascript-interoperability/) | Look up .NET–JavaScript interop and object lifetime. |
| [Security & Identity](https://learn.microsoft.com/aspnet/core/blazor/security/) | Read web authentication/authorization contracts, separately from EyeAuras account access. |
| [SignalR with Blazor](https://learn.microsoft.com/aspnet/core/blazor/fundamentals/signalr) | Understand SignalR in the relevant Blazor hosting mode. |
| [Blazor University](https://blazor-university.com/) | Read community explanations and compare them with versioned official contracts. |
| [Awesome Blazor](https://github.com/AdrienTorris/awesome-blazor) | Find community component and sample projects. |
| [MudBlazor](https://mudblazor.com/) | Read the component library documentation before adding its dependency and setup. |
| [Radzen Blazor](https://blazor.radzen.com/) | Inspect the library controls and examples. |
| [Blazorise](https://blazorise.com/) | Read the component library documentation and dependencies. |
| [.NET WebAssembly Docs](https://learn.microsoft.com/aspnet/core/blazor/webassembly-build-tools-and-aot) | Understand WebAssembly builds/AOT; do not confuse them with desktop WebView2. |
| [gRPC](https://learn.microsoft.com/aspnet/core/grpc/) / [Minimal APIs](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis) | Look up server endpoints and gRPC contracts for a separately configured backend. |
| [NSwag](https://github.com/RicoSuter/NSwag) / [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore) | Read OpenAPI generation and client/documentation tooling contracts. |

</details>

<details>
<summary>Windows and binary formats</summary>

| Resource | When to use it |
| --- | --- |
| [Vergilius Project](https://www.vergiliusproject.com/) | Look up Windows structure layouts for a specific OS version. |
| [Ghidra](https://github.com/NationalSecurityAgency/ghidra) | Read the Ghidra project documentation and source. |
| [IDA Free](https://hex-rays.com/ida-free) | Check the author’s current IDA Free features and terms; do not assume another edition’s permissions. |
| [radare2 / r2](https://github.com/radareorg/radare2) | Read the binary-analysis framework documentation. |
| [Cutter](https://cutter.re/) | Read the Rizin-based analysis UI documentation. |
| [x64dbg](https://x64dbg.com/) | Read the Windows debugger project documentation. |
| [WinDbg / WinDbg Preview](https://learn.microsoft.com/windows-hardware/drivers/debugger/) | Find Microsoft debugger concepts and commands. |
| [WDK Docs](https://learn.microsoft.com/windows-hardware/drivers/) | Read Windows driver-development contracts. |
| [Windows Internals (Book)](https://learn.microsoft.com/sysinternals/resources/windows-internals) | Find the Windows Internals books and related material. |
| [Sysinternals Suite](https://learn.microsoft.com/sysinternals/) | Find Microsoft diagnostic utilities and their documentation. |
| [System Informer](https://systeminformer.io/) | Read the system/process inspection project documentation. |
| [Capstone](https://www.capstone-engine.org/) / [Keystone](https://github.com/keystone-engine/keystone) / [Unicorn](https://www.unicorn-engine.org/) | Distinguish disassembly, assembly and emulation libraries and their own APIs. |
| [PE/COFF Spec](https://learn.microsoft.com/windows/win32/debug/pe-format) | Look up the PE/COFF format specification. |
| [ReactOS Source](https://github.com/reactos/reactos) | Study an NT-like OS implementation; it is not a contract for every Windows build. |

</details>

<details>
<summary>Game-analysis tools and communities</summary>

| Resource | When to use it |
| --- | --- |
| [UnknownCheats](https://unknowncheats.me/) | Find community discussions about game analysis and security. |
| [Cheat Engine](https://www.cheatengine.org/) / [CE Wiki](https://wiki.cheatengine.org/index.php?title=Main_Page) | Read the memory-analysis tool’s project documentation and its separate tutorial wiki. |
| [Guided Hacking](https://guidedhacking.com/) | Find community learning material; access conditions are set by the site. |
| [GameHacking.org](https://gamehacking.org/) | Find community resources and discussions. |
| [ReClass.NET](https://github.com/ReClassNET/ReClass.NET) | Inspect class and structure layouts in the supported tool. |
| [MinHook](https://github.com/TsudaKageyu/minhook) | Read the hooking library documentation and examples. |
| [Microsoft Detours](https://github.com/microsoft/Detours) | Read Microsoft’s function-interception library contracts. |
| [ScyllaHide](https://github.com/x64dbg/ScyllaHide) | Read the plugin documentation without assuming an invisibility guarantee. |
| [Il2CppDumper](https://github.com/Perfare/Il2CppDumper) | Read supported Unity IL2CPP metadata-analysis workflows. |
| [Unreal Engine Docs](https://docs.unrealengine.com/) | Choose documentation for the relevant Unreal Engine version. |
| [DirectX Graphics Docs](https://learn.microsoft.com/windows/win32/direct3d/) | Look up DirectX graphics API contracts. |
| [Dear ImGui](https://github.com/ocornut/imgui) | Read Dear ImGui source; EyeAuras separately needs a compatible wrapper and host. |

</details>

Community collections and forums help with discovery; the library author’s documentation supplies its primary contract. If a site restricts access, use its ordinary public documentation or another primary reference without assuming that the project has ended.

Ordinary .NET, browser Blazor and C++ examples do not inherit `Log`, `AuraTree` or other Script.csx capabilities. Check dependencies, registered services and resource ownership. Work with software and data you are authorized to inspect, and check the tool authors’ licensing and access terms.
