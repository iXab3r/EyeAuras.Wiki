---
title: Список полезных ссылок
description: Где искать ответ по C#, .NET, Blazor и устройству Windows, когда пишете скрипт.
published: true
date: 2025-09-21T11:29:06.078Z
tags: ai-translated
editor: markdown
dateCreated: 2025-09-21T11:29:06.078Z
---

# Найти справочник под задачу скрипта

Здесь собраны ссылки, которые пригодятся при написании скриптов. Для первого запуска нужен пример EyeAuras, для синтаксиса — справочник C#, для точной сигнатуры — документация нужной версии.

1. Поймите, что именно непонятно: язык, возможности EyeAuras, устройство интерфейса или формат данных.
2. Откройте подходящий источник из первой таблицы. Во внешней документации выберите версию .NET или библиотеки, как в вашем проекте.
3. Вернитесь к примеру и проверьте файлы, зависимости и хост. Найденный образец ещё нужно приспособить: сам по себе в EyeAuras он может не заработать.

| Задача | Подходящий источник |
|---|---|
| Первый запуск и контекст | [Начало работы](/ru/scripting/getting-started), [окружение скрипта](/ru/scripting/sandbox), [пакеты NuGet](/ru/scripting/nuget). |
| Найти область API EyeAuras | [Карты API](/ru/scripting/api/core/eyeauras-structure) ведут к операциям и исходным типам. Точный контракт сверяйте со справочником и SDK своей версии. |
| Повторить готовый пример | [Hello, World!](/ru/scripting/examples/basic/hello-world), [переменные](/ru/scripting/examples/basic/variables), [поиск изображения](/ru/scripting/examples/basic/image-search). |
| Создать интерфейс | Сначала [Blazor в EyeAuras](/ru/scripting/blazor-windows/getting-started), потом внешние материалы ниже. |
| Задать вопрос | [Контакты сообщества](/ru/contacts): укажите сборку, приложите короткий пример и ожидаемый результат. Секреты из примера уберите. |

## C# и .NET

| Источник | Когда открывать |
|---|---|
| [.NET Documentation](https://learn.microsoft.com/dotnet/) | Вся документация .NET: библиотеки, среда выполнения и инструменты. |
| [C# Language Reference](https://learn.microsoft.com/dotnet/csharp/language-reference/) | Синтаксис, ключевые слова и выражения C#. |
| [.NET API Browser](https://learn.microsoft.com/dotnet/api/) | Сигнатуры и описания типов .NET. Выберите нужную версию. |
| [Roslyn (C# Compiler & Analyzers)](https://github.com/dotnet/roslyn) | Исходники компилятора и средства анализа кода. |
| [C# Language Design Notes](https://github.com/dotnet/csharplang) | Как проектируют язык и какие есть предложения. |
| [.NET Runtime Source](https://github.com/dotnet/runtime) | Исходники среды выполнения, сборщика мусора и базовых библиотек. |
| [.NET Performance Guide](https://learn.microsoft.com/dotnet/standard/garbage-collection/performance) | Как измерять и разбирать проблемы производительности сборщика мусора. |
| [Maoni’s GC Blog](https://devblogs.microsoft.com/dotnet/author/maoni/) | Статьи разработчика Microsoft о сборщике мусора. |
| [Stephen Toub on Async](https://devblogs.microsoft.com/dotnet/how-async-await-really-works/) | Подробный разбор того, как работает async/await. |
| [Source Generators](https://learn.microsoft.com/dotnet/csharp/roslyn-sdk/source-generators-overview) | Документация генераторов исходного кода. |
| [P/Invoke Reference](https://www.pinvoke.net/) | Справочник сообщества по сигнатурам Win32. Сверяйте их с документацией Microsoft. |
| [NativeAOT](https://learn.microsoft.com/dotnet/core/deploying/native-aot/) | Условия и ограничения NativeAOT для отдельного проекта. Script.csx так не запускается. |
| [BenchmarkDotNet](https://github.com/dotnet/BenchmarkDotNet) | Измерение небольших операций .NET в подготовленном проекте. |
| [ILSpy](https://github.com/icsharpcode/ILSpy) | Просмотр декомпилированных сборок .NET. |
| [dnSpyEx](https://github.com/dnSpyEx/dnSpy) | Отладчик и декомпилятор .NET от сообщества. |
| [Awesome .NET](https://github.com/quozd/awesome-dotnet) | Подборка сообщества для поиска библиотек. |

<details>
<summary>Blazor</summary>

| Источник | Когда открывать |
|---|---|
| [Blazor Docs (ASP.NET Core)](https://learn.microsoft.com/aspnet/core/blazor/) | Общее руководство по Blazor. Можно выбрать версию и способ размещения приложения. |
| [Blazor Performance Best Practices](https://learn.microsoft.com/aspnet/core/blazor/performance) | Рекомендации по производительности компонентов Blazor. |
| [JS Interop](https://learn.microsoft.com/aspnet/core/blazor/javascript-interoperability/) | Обмен вызовами между .NET и JavaScript. |
| [Security & Identity](https://learn.microsoft.com/aspnet/core/blazor/security/) | Аутентификация и авторизация веб-приложения. |
| [SignalR with Blazor](https://learn.microsoft.com/aspnet/core/blazor/fundamentals/signalr) | Работа SignalR в соответствующем режиме размещения Blazor. |
| [Blazor University](https://blazor-university.com/) | Учебные материалы сообщества по Blazor. |
| [Awesome Blazor](https://github.com/AdrienTorris/awesome-blazor) | Подборка компонентов и примеров сообщества. |
| [MudBlazor](https://mudblazor.com/) | Библиотека компонентов интерфейса. |
| [Radzen Blazor](https://blazor.radzen.com/) | Библиотека элементов интерфейса и её примеры. |
| [Blazorise](https://blazorise.com/) | Библиотека компонентов Blazor и документация автора. |
| [.NET WebAssembly Docs](https://learn.microsoft.com/aspnet/core/blazor/webassembly-build-tools-and-aot) | Сборка WebAssembly и AOT. Не путайте с настольным WebView2. |
| [gRPC](https://learn.microsoft.com/aspnet/core/grpc/) / [Minimal APIs](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis) | Серверные интерфейсы и маршруты ASP.NET Core. |
| [NSwag](https://github.com/RicoSuter/NSwag) / [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore) | Создание и использование описаний OpenAPI. |

</details>

<details>
<summary>Windows и двоичные форматы</summary>

| Источник | Когда открывать |
|---|---|
| [Vergilius Project](https://www.vergiliusproject.com/) | Разметка структур Windows для конкретных версий ОС. |
| [Ghidra](https://github.com/NationalSecurityAgency/ghidra) | Инструменты анализа программ от разработчиков Ghidra. |
| [IDA Free](https://hex-rays.com/ida-free) | Возможности IDA Free и действующие условия автора. |
| [radare2 / r2](https://github.com/radareorg/radare2) | Средства анализа двоичных файлов и их документация. |
| [Cutter](https://cutter.re/) | Графический интерфейс анализа на основе Rizin. |
| [x64dbg](https://x64dbg.com/) | Отладчик Windows и материалы проекта. |
| [WinDbg / WinDbg Preview](https://learn.microsoft.com/windows-hardware/drivers/debugger/) | Отладчик Microsoft и документация его возможностей. |
| [WDK Docs](https://learn.microsoft.com/windows-hardware/drivers/) | Документация разработки драйверов Windows. |
| [Windows Internals (Book)](https://learn.microsoft.com/sysinternals/resources/windows-internals) | Материалы по книгам Windows Internals. |
| [Sysinternals Suite](https://learn.microsoft.com/sysinternals/) | Утилиты диагностики Windows и документация Microsoft. |
| [System Informer](https://systeminformer.io/) | Средства просмотра процессов и исследования системы. |
| [Capstone](https://www.capstone-engine.org/) / [Keystone](https://github.com/keystone-engine/keystone) / [Unicorn](https://www.unicorn-engine.org/) | Три разные библиотеки: дизассемблирование, ассемблирование и эмуляция. |
| [PE/COFF Spec](https://learn.microsoft.com/windows/win32/debug/pe-format) | Официальное описание форматов PE и COFF. |
| [ReactOS Source](https://github.com/reactos/reactos) | Исходники отдельной NT-подобной ОС. |

</details>

<details>
<summary>Инструменты и сообщества анализа игр</summary>

| Источник | Когда открывать |
|---|---|
| [UnknownCheats](https://unknowncheats.me/) | Форум сообщества об анализе игр и безопасности. |
| [Cheat Engine](https://www.cheatengine.org/) | Средства исследования памяти и отдельная wiki проекта. |
| [Guided Hacking](https://guidedhacking.com/) | Учебные материалы и форум сообщества. |
| [GameHacking.org](https://gamehacking.org/) | Ресурсы и обсуждения сообщества. |
| [ReClass.NET](https://github.com/ReClassNET/ReClass.NET) | Просмотр разметки классов и структур. |
| [MinHook](https://github.com/TsudaKageyu/minhook) | Библиотека перехвата функций и примеры автора. |
| [Microsoft Detours](https://github.com/microsoft/Detours) | Библиотека Microsoft для перехвата функций. |
| [ScyllaHide](https://github.com/x64dbg/ScyllaHide) | Документация плагина ScyllaHide. |
| [Il2CppDumper](https://github.com/Perfare/Il2CppDumper) | Разбор метаданных Unity IL2CPP в поддерживаемом формате. |
| [Unreal Engine Docs](https://docs.unrealengine.com/) | Документация Unreal Engine. Выбирайте нужную версию движка. |
| [DirectX Graphics Docs](https://learn.microsoft.com/windows/win32/direct3d/) | Графические API DirectX и их контракты. |
| [Dear ImGui](https://github.com/ocornut/imgui) | Исходники Dear ImGui. Для EyeAuras ещё нужны подходящие обёртка и хост. |

</details>

В [Wiki Cheat Engine](https://wiki.cheatengine.org/index.php?title=Main_Page) есть свои руководства в дополнение к странице проекта.

В примерах для обычного .NET, браузерного Blazor и C++ нет `Log`, `AuraTree` и других возможностей Script.csx. При переносе учитывайте зависимости, регистрацию служб и то, кто владеет ресурсами. Исследуйте только те данные и программы, на которые у вас есть право.
