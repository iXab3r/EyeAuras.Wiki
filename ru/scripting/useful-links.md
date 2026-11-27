---
title: Список полезных ссылок
description: Подборка полезных ссылок.
published: true
date: 2025-09-21T11:29:06.078Z
tags: ai-translated
editor: markdown
dateCreated: 2025-09-21T11:29:06.078Z
---

# Найти справочник под задачу скрипта

Для первого запуска нужен пример EyeAuras, для синтаксиса — справочник C#, а для точной сигнатуры — контракт подходящей версии. Подборка ниже помогает выбрать источник, не устанавливая все перечисленные инструменты.

1. Определите, что сейчас непонятно: язык, возможности EyeAuras, устройство интерфейса или формат данных.
2. Откройте соответствующий источник из первой таблицы. Для внешней документации выберите версию .NET или библиотеки своего проекта.
3. Вернитесь к примеру и проверьте файлы, зависимости и хост. Результат поиска — нужный контракт или образец, а не автоматически работающий код внутри EyeAuras.

| Задача | Подходящий источник |
|---|---|
| Первый запуск и контекст | [Начало работы](/ru/scripting/getting-started), [окружение скрипта](/ru/scripting/sandbox), [пакеты NuGet](/ru/scripting/nuget). |
| Найти область API EyeAuras | [Карты API](/ru/scripting/api/core/eyeauras-structure) ведут к операциям и исходным типам; точный контракт сверяйте со справочником и SDK своей версии. Карта не является перечнем всего, зарегистрированного в вашем хосте. |
| Повторить практический опыт | [Hello, World!](/ru/scripting/examples/basic/hello-world), [переменные](/ru/scripting/examples/basic/variables), [поиск изображения](/ru/scripting/examples/basic/image-search). |
| Создать интерфейс | Сначала [Blazor в EyeAuras](/ru/scripting/blazor-windows/getting-started), затем внешние материалы ниже. Обычный пример ASP.NET не задаёт автоматически настольное окно EyeAuras. |
| Задать вопрос с исходными данными | [Контакты сообщества](/ru/contacts): приложите сборку, короткий пример и ожидаемый результат без секретов. |

## C# и .NET

| Источник | Когда открывать |
|---|---|
| [.NET Documentation](https://learn.microsoft.com/dotnet/) | Общий вход в документацию .NET: библиотеки, среда выполнения и инструменты. |
| [C# Language Reference](https://learn.microsoft.com/dotnet/csharp/language-reference/) | Синтаксис, ключевые слова и выражения C#. |
| [.NET API Browser](https://learn.microsoft.com/dotnet/api/) | Сигнатуры и описание типов .NET; выберите нужную версию. |
| [Roslyn (C# Compiler & Analyzers)](https://github.com/dotnet/roslyn) | Исходники компилятора и средства анализа кода. |
| [C# Language Design Notes](https://github.com/dotnet/csharplang) | Проектирование языка и предложения. Предложение не означает поддержку в вашем компиляторе. |
| [.NET Runtime Source](https://github.com/dotnet/runtime) | Исходники среды выполнения, сборщика мусора и базовых библиотек. |
| [.NET Performance Guide](https://learn.microsoft.com/dotnet/standard/garbage-collection/performance) | Измерение и разбор проблем производительности сборщика мусора. |
| [Maoni’s GC Blog](https://devblogs.microsoft.com/dotnet/author/maoni/) | Авторские материалы Microsoft о сборщике мусора. |
| [Stephen Toub on Async](https://devblogs.microsoft.com/dotnet/how-async-await-really-works/) | Подробный разбор работы async/await. |
| [Source Generators](https://learn.microsoft.com/dotnet/csharp/roslyn-sdk/source-generators-overview) | Документация генераторов исходного кода. |
| [P/Invoke Reference](https://www.pinvoke.net/) | Справочник сообщества по сигнатурам Win32; проверяйте их по документации Microsoft. |
| [NativeAOT](https://learn.microsoft.com/dotnet/core/deploying/native-aot/) | Условия и ограничения NativeAOT для отдельного проекта; это не режим запуска Script.csx. |
| [BenchmarkDotNet](https://github.com/dotnet/BenchmarkDotNet) | Измерение небольших операций .NET в подготовленном проекте. |
| [ILSpy](https://github.com/icsharpcode/ILSpy) | Просмотр декомпилированных сборок .NET. |
| [dnSpyEx](https://github.com/dnSpyEx/dnSpy) | Отладчик и декомпилятор .NET от сообщества. |
| [Awesome .NET](https://github.com/quozd/awesome-dotnet) | Подборка сообщества, полезная для поиска библиотек, а не подтверждения их регистрации в EyeAuras. |

<details>
<summary>Blazor</summary>

| Источник | Когда открывать |
|---|---|
| [Blazor Docs (ASP.NET Core)](https://learn.microsoft.com/aspnet/core/blazor/) | Общее руководство Blazor, с выбором версии и способа размещения приложения. |
| [Blazor Performance Best Practices](https://learn.microsoft.com/aspnet/core/blazor/performance) | Рекомендации по производительности компонентов Blazor. |
| [JS Interop](https://learn.microsoft.com/aspnet/core/blazor/javascript-interoperability/) | Обмен вызовами между .NET и JavaScript. |
| [Security & Identity](https://learn.microsoft.com/aspnet/core/blazor/security/) | Аутентификация и авторизация веб-приложения; это отдельный слой от входа в EyeAuras. |
| [SignalR with Blazor](https://learn.microsoft.com/aspnet/core/blazor/fundamentals/signalr) | Работа SignalR в соответствующем режиме размещения Blazor. |
| [Blazor University](https://blazor-university.com/) | Учебные материалы сообщества по Blazor. |
| [Awesome Blazor](https://github.com/AdrienTorris/awesome-blazor) | Подборка компонентов и примеров сообщества. |
| [MudBlazor](https://mudblazor.com/) | Библиотека компонентов интерфейса; требует своей зависимости и настройки. |
| [Radzen Blazor](https://blazor.radzen.com/) | Библиотека элементов интерфейса и её примеры. |
| [Blazorise](https://blazorise.com/) | Библиотека компонентов Blazor и документация автора. |
| [.NET WebAssembly Docs](https://learn.microsoft.com/aspnet/core/blazor/webassembly-build-tools-and-aot) | Сборка WebAssembly и AOT; не путайте с настольным WebView2. |
| [gRPC](https://learn.microsoft.com/aspnet/core/grpc/) / [Minimal APIs](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis) | Серверные интерфейсы и маршруты ASP.NET Core. |
| [NSwag](https://github.com/RicoSuter/NSwag) / [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore) | Создание и использование описаний OpenAPI. |

</details>

<details>
<summary>Windows и двоичные форматы</summary>

| Источник | Когда открывать |
|---|---|
| [Vergilius Project](https://www.vergiliusproject.com/) | Разметка структур Windows для конкретных версий ОС. |
| [Ghidra](https://github.com/NationalSecurityAgency/ghidra) | Инструменты анализа программ от разработчиков Ghidra. |
| [IDA Free](https://hex-rays.com/ida-free) | Возможности IDA Free и действующие условия автора; не переносите условия другой редакции. |
| [radare2 / r2](https://github.com/radareorg/radare2) | Средства анализа двоичных файлов и их документация. |
| [Cutter](https://cutter.re/) | Графический интерфейс анализа на основе Rizin. |
| [x64dbg](https://x64dbg.com/) | Отладчик Windows и материалы проекта. |
| [WinDbg / WinDbg Preview](https://learn.microsoft.com/windows-hardware/drivers/debugger/) | Отладчик Microsoft и документация его возможностей. |
| [WDK Docs](https://learn.microsoft.com/windows-hardware/drivers/) | Документация разработки драйверов Windows. |
| [Windows Internals (Book)](https://learn.microsoft.com/sysinternals/resources/windows-internals) | Материалы по книгам Windows Internals. |
| [Sysinternals Suite](https://learn.microsoft.com/sysinternals/) | Утилиты диагностики Windows и документация Microsoft. |
| [System Informer](https://systeminformer.io/) | Средства просмотра процессов и исследования системы. |
| [Capstone](https://www.capstone-engine.org/) / [Keystone](https://github.com/keystone-engine/keystone) / [Unicorn](https://www.unicorn-engine.org/) | Библиотеки дизассемблирования, ассемблирования и эмуляции; это разные компоненты. |
| [PE/COFF Spec](https://learn.microsoft.com/windows/win32/debug/pe-format) | Официальное описание форматов PE и COFF. |
| [ReactOS Source](https://github.com/reactos/reactos) | Исходники отдельной NT-подобной ОС; не спецификация поведения любой Windows. |

</details>

<details>
<summary>Инструменты и сообщества анализа игр</summary>

| Источник | Когда открывать |
|---|---|
| [UnknownCheats](https://unknowncheats.me/) | Форум сообщества об анализе игр и безопасности. |
| [Cheat Engine](https://www.cheatengine.org/) | Средства исследования памяти и отдельная wiki проекта. |
| [Guided Hacking](https://guidedhacking.com/) | Учебные материалы и форум сообщества; условия доступа определяет сайт. |
| [GameHacking.org](https://gamehacking.org/) | Ресурсы и обсуждения сообщества. |
| [ReClass.NET](https://github.com/ReClassNET/ReClass.NET) | Просмотр разметки классов и структур. |
| [MinHook](https://github.com/TsudaKageyu/minhook) | Библиотека перехвата функций и примеры автора. |
| [Microsoft Detours](https://github.com/microsoft/Detours) | Библиотека Microsoft для перехвата функций. |
| [ScyllaHide](https://github.com/x64dbg/ScyllaHide) | Документация плагина ScyllaHide; наличие инструмента не гарантирует незаметность. |
| [Il2CppDumper](https://github.com/Perfare/Il2CppDumper) | Разбор метаданных Unity IL2CPP в поддерживаемом формате. |
| [Unreal Engine Docs](https://docs.unrealengine.com/) | Документация Unreal Engine; выбирайте нужную версию движка. |
| [DirectX Graphics Docs](https://learn.microsoft.com/windows/win32/direct3d/) | Графические API DirectX и их контракты. |
| [Dear ImGui](https://github.com/ocornut/imgui) | Исходники Dear ImGui. Для EyeAuras отдельно нужны подходящие обёртка и хост. |

</details>

[Wiki Cheat Engine](https://wiki.cheatengine.org/index.php?title=Main_Page) дополняет страницу проекта собственными руководствами. Внешние форумы и подборки отражают материалы сообщества; первичный контракт конкретной библиотеки ищите у её автора.

Примеры обычного .NET, браузерного Blazor и C++ не получают `Log`, `AuraTree` и другие возможности Script.csx автоматически. Учитывайте зависимости, регистрацию служб и владельца ресурсов. Работайте с данными и программами, на исследование которых у вас есть право, и проверяйте условия выбранных инструментов у авторов.
