---
title: Список полезных ссылок
description: Подборка полезных ссылок.
published: true
date: 2025-09-21T11:29:06.078Z
tags: ai-translated
editor: markdown
dateCreated: 2025-09-21T11:29:06.078Z
---
# Полезные ресурсы для разработки и реверс-инжиниринга

## Разработка на C#

* **.NET Documentation** — официальная документация по runtime, библиотекам и инструментам: [https://learn.microsoft.com/dotnet/](https://learn.microsoft.com/dotnet/)
* **C# Language Reference** — полная документация по языку и примеры: [https://learn.microsoft.com/dotnet/csharp/language-reference/](https://learn.microsoft.com/dotnet/csharp/language-reference/)
* **.NET API Browser** — просмотр всех публичных API в разных версиях: [https://learn.microsoft.com/dotnet/api/](https://learn.microsoft.com/dotnet/api/)
* **Roslyn (C# Compiler & Analyzers)** — исходники, анализаторы и code fixes: [https://github.com/dotnet/roslyn](https://github.com/dotnet/roslyn)
* **C# Language Design Notes** — предложения по языку и заметки со встреч: [https://github.com/dotnet/csharplang](https://github.com/dotnet/csharplang)
* **.NET Runtime Source** — внутреннее устройство JIT, GC и BCL: [https://github.com/dotnet/runtime](https://github.com/dotnet/runtime)
* **.NET Performance Guide** — паттерны, типичные проблемы и оптимизация: [https://learn.microsoft.com/dotnet/standard/garbage-collection/performance](https://learn.microsoft.com/dotnet/standard/garbage-collection/performance)
* **Maoni’s GC Blog** — подробные материалы по внутренностям GC: [https://devblogs.microsoft.com/dotnet/tag/garbage-collection/](https://devblogs.microsoft.com/dotnet/tag/garbage-collection/)
* **Stephen Toub on Async** — сильные статьи про async/await, tasks и производительность: [https://devblogs.microsoft.com/dotnet/author/stoub/](https://devblogs.microsoft.com/dotnet/author/stoub/)
* **Source Generators** — концепции и практические руководства: [https://learn.microsoft.com/dotnet/csharp/roslyn-sdk/source-generators-overview](https://learn.microsoft.com/dotnet/csharp/roslyn-sdk/source-generators-overview)
* **P/Invoke Reference** — community-база сигнатур для Win32: [https://www.pinvoke.net/](https://www.pinvoke.net/)
* **NativeAOT** — AOT-компиляция приложений .NET: [https://learn.microsoft.com/dotnet/core/deploying/native-aot/](https://learn.microsoft.com/dotnet/core/deploying/native-aot/)
* **BenchmarkDotNet** — фреймворк для микробенчмарков: [https://github.com/dotnet/BenchmarkDotNet](https://github.com/dotnet/BenchmarkDotNet)
* **ILSpy** — open-source декомпилятор для .NET: [https://github.com/icsharpcode/ILSpy](https://github.com/icsharpcode/ILSpy)
* **dnSpyEx** — отладчик и декомпилятор для .NET (community fork): [https://github.com/dnSpyEx/dnSpy](https://github.com/dnSpyEx/dnSpy)
* **Awesome .NET** — подборка библиотек и инструментов: [https://github.com/quozd/awesome-dotnet](https://github.com/quozd/awesome-dotnet)

---

## Разработка на Blazor

* **Blazor Docs (ASP.NET Core)** — официальная документация по Server, WASM и Hybrid: [https://learn.microsoft.com/aspnet/core/blazor/](https://learn.microsoft.com/aspnet/core/blazor/)
* **Blazor Performance Best Practices**: [https://learn.microsoft.com/aspnet/core/blazor/performance](https://learn.microsoft.com/aspnet/core/blazor/performance)
* **JS Interop** — вызов JS из .NET и наоборот: [https://learn.microsoft.com/aspnet/core/blazor/javascript-interoperability/](https://learn.microsoft.com/aspnet/core/blazor/javascript-interoperability/)
* **Security & Identity** — аутентификация, авторизация, токены: [https://learn.microsoft.com/aspnet/core/blazor/security/](https://learn.microsoft.com/aspnet/core/blazor/security/)
* **SignalR with Blazor** — возможности для real-time функциональности: [https://learn.microsoft.com/aspnet/core/blazor/fundamentals/signalr](https://learn.microsoft.com/aspnet/core/blazor/fundamentals/signalr)
* **Blazor University** — подробные community-материалы: [https://blazor-university.com/](https://blazor-university.com/)
* **Awesome Blazor** — компоненты, библиотеки и примеры: [https://github.com/AdrienTorris/awesome-blazor](https://github.com/AdrienTorris/awesome-blazor)
* **MudBlazor** — популярная библиотека UI-компонентов: [https://mudblazor.com/](https://mudblazor.com/)
* **Radzen Blazor** — UI-контролы и инструменты: [https://blazor.radzen.com/](https://blazor.radzen.com/)
* **Blazorise** — библиотека компонентов: [https://blazorise.com/](https://blazorise.com/)
* **.NET WebAssembly Docs** — детали runtime для WASM: [https://learn.microsoft.com/aspnet/core/blazor/webassembly/](https://learn.microsoft.com/aspnet/core/blazor/webassembly/)
* **gRPC & Minimal APIs** — backend-подходы, которые часто используют вместе с Blazor: [https://learn.microsoft.com/aspnet/core/grpc/](https://learn.microsoft.com/aspnet/core/grpc/) и [https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis)
* **NSwag/Swashbuckle** — OpenAPI для C# clients/UI: [https://github.com/RicoSuter/NSwag](https://github.com/RicoSuter/NSwag) и [https://github.com/domaindrivendev/Swashbuckle.AspNetCore](https://github.com/domaindrivendev/Swashbuckle.AspNetCore)

---

## Реверс-инжиниринг

* **Vergilius Project** — layouts/offsets структур ядра Windows: [https://www.vergiliusproject.com/](https://www.vergiliusproject.com/)
* **Ghidra** — open-source набор инструментов от NSA: [https://ghidra-sre.org/](https://ghidra-sre.org/)
* **IDA Free** — дизассемблер и отладчик (бесплатная версия): [https://hex-rays.com/ida-free/](https://hex-rays.com/ida-free/)
* **radare2 / r2** — фреймворк для RE: [https://github.com/radareorg/radare2](https://github.com/radareorg/radare2)
* **Cutter** — GUI для radare2: [https://cutter.re/](https://cutter.re/)
* **x64dbg** — open-source отладчик для Windows: [https://x64dbg.com/](https://x64dbg.com/)
* **WinDbg / WinDbg Preview** — отладчик Microsoft для kernel/user-mode: [https://learn.microsoft.com/windows-hardware/drivers/debugger/](https://learn.microsoft.com/windows-hardware/drivers/debugger/)
* **WDK Docs** — разработка драйверов и внутреннее устройство ядра: [https://learn.microsoft.com/windows-hardware/drivers/](https://learn.microsoft.com/windows-hardware/drivers/)
* **Windows Internals (Book)** — подробный справочник по внутренностям ОС: [https://learn.microsoft.com/sysinternals/resources/windows-internals](https://learn.microsoft.com/sysinternals/resources/windows-internals)
* **Sysinternals Suite** — мощные инструменты для Windows: [https://learn.microsoft.com/sysinternals/](https://learn.microsoft.com/sysinternals/)
* **Process Hacker** — системный explorer и инструменты для работы с памятью: [https://processhacker.sourceforge.io/](https://processhacker.sourceforge.io/)
* **Capstone / Keystone / Unicorn** — движки для disasm/asm/эмуляции: [https://www.capstone-engine.org/](https://www.capstone-engine.org/) / [https://www.keystone-engine.org/](https://www.keystone-engine.org/) / [https://www.unicorn-engine.org/](https://www.unicorn-engine.org/)
* **PE/COFF Spec** — официальная документация по формату файлов: [https://learn.microsoft.com/windows/win32/debug/pe-format](https://learn.microsoft.com/windows/win32/debug/pe-format)
* **ReactOS Source** — исходники NT-подобной ОС для изучения: [https://github.com/reactos/reactos](https://github.com/reactos/reactos)

---

## Реверс-инжиниринг игр

* **UnknownCheats** — крупный форум по безопасности игр, реверсу и читам: [https://unknowncheats.me/](https://unknowncheats.me/)
* **Cheat Engine** — memory scanner, отладчик и инструмент для trainer'ов: [https://www.cheatengine.org/](https://www.cheatengine.org/)
  * **CE Wiki** — туториалы и внутренняя кухня: [https://wiki.cheatengine.org/index.php?title=Main\_Page](https://wiki.cheatengine.org/index.php?title=Main_Page)
* **Guided Hacking** — туториалы, форумы и полезные материалы: [https://guidedhacking.com/](https://guidedhacking.com/)
* **GameHacking.org** — сообщество и ресурсы: [https://gamehacking.org/](https://gamehacking.org/)
* **ReClass.NET** — анализ layout'ов классов: [https://github.com/ReClassNET/ReClass.NET](https://github.com/ReClassNET/ReClass.NET)
* **MinHook** — лёгкая библиотека для API hooking: [https://github.com/TsudaKageyu/minhook](https://github.com/TsudaKageyu/minhook)
* **Microsoft Detours** — библиотека для патчинга функций: [https://github.com/microsoft/Detours](https://github.com/microsoft/Detours)
* **ScyllaHide** — anti-anti-debug плагин: [https://github.com/x64dbg/ScyllaHide](https://github.com/x64dbg/ScyllaHide)
* **Il2CppDumper** — дамп и генерация структур для Unity IL2CPP: [https://github.com/Perfare/Il2CppDumper](https://github.com/Perfare/Il2CppDumper)
* **Unreal Engine Docs** — reflection, система UObject и scripting для editor'а: [https://docs.unrealengine.com/](https://docs.unrealengine.com/)
* **DirectX Graphics Docs** — материалы по рендерингу и контекстам hooking'а: [https://learn.microsoft.com/windows/win32/direct3d/](https://learn.microsoft.com/windows/win32/direct3d/)
* **Dear ImGui** — immediate-mode GUI (часто используется в overlay и инструментах): [https://github.com/ocornut/imgui](https://github.com/ocornut/imgui)

---

## Правовая и этическая заметка

В этом списке есть инструменты и темы, которые часто используются в исследованиях безопасности и игровом реверс-инжиниринге. Используйте их ответственно, в рамках закона и с соблюдением условий использования программ и игр, которые вы анализируете.