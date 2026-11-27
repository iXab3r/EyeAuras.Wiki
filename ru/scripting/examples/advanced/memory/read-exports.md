---
title: Просмотр экспортов
description: Просмотр и работа с экспортированными данными.
published: true
date: 2025-06-12T16:08:52.785Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-12T16:08:52.785Z
---
# Найти экспорт DLL в своём процессе

Посмотрим таблицу экспортов `kernel32.dll`, которая уже загружена в процесс EyeAuras. Скрипт выведет имена, ordinal и RVA из PE-образа в памяти, включая перенаправления. Экспорт может быть функцией, данными или строкой перенаправления. Сама запись — это ещё не значение поля и не разрешение вызвать функцию.

Нужен настольный EyeAuras на Windows с загруженным **EyeAuras.Memory**. Скрипт берёт PID самого EyeAuras, поэтому не нужно угадывать имя чужого процесса или его адреса.

## Вывести экспорты и найти LoadLibraryA

1. Создайте действие **C# Script** и вставьте весь код в `Script.csx`:

```csharp
using System;
using System.Linq;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;
using PoeShared.Scaffolding;

{
    using var process = LocalProcess.ByProcessId(Environment.ProcessId);
    var modules = process.GetProcessModules();
    Log.Info($"Process: {process.ProcessName}, PID={process.ProcessId}; modules={modules.Count}");

    var module = process.GetProcessModule("kernel32.dll");
    using var memory = process.MemoryOfModule(module);
    var exports = memory.ReadExports();
    Log.Info($"Module: {module.FilePath}; base=0x{module.BaseAddress.ToInt64():X}");
    Log.Info(exports.DumpToNamedTable("Exports"));

    var matches = exports.Where(x => x.ExportName == "LoadLibraryA").ToArray();
    if (matches.Length == 0) Log.Info("LoadLibraryA: export not found");
    foreach (var export in matches)
    {
        var address = module.BaseAddress.ToInt64() + export.RVA;
        Log.Info($"{export.ExportName}: ordinal={export.Ordinal}, RVA=0x{export.RVA:X}, address=0x{address:X}");
        if (export.IsForwarder) Log.Info($"Forwarder: {export.ForwarderName}");
    }
}
```

2. Нажмите **Run** и откройте журнал событий. Сначала появятся PID, число модулей и путь к DLL, потом таблица экспортов и результат поиска `LoadLibraryA`.
3. Если у записи `IsForwarder = true`, смотрите `ForwarderName`: вычисленный адрес указывает на строку перенаправления внутри этой DLL. Пример не переходит в другую DLL и не вызывает найденный символ.

| Данные | Что они означают |
| --- | --- |
| `ModuleName` / `FilePath` | Имя, по которому выбирается загруженный модуль, и его путь. `GetProcessModule` сравнивает имя без учёта регистра. Если модуля нет, это ошибка, а не пустой список экспортов. |
| `BaseAddress` | Адрес, с которого начинается этот PE-образ в текущем процессе. При следующем запуске может быть другим. |
| `RVA` | Смещение от базы. Если экспорт не перенаправлен, его адрес равен `BaseAddress + RVA`. Нулевой RVA в незаполненной позиции таблицы не означает функцию по адресу базы. |
| `Ordinal` | Номер экспорта с учётом ordinal base DLL. Это не то же самое, что индекс `ExportAddressTableIndex`. |
| `ExportName` / `UnDecoratedExportName` | Исходное имя и, когда доступно, разобранное C++-имя. У экспорта только по номеру имени нет. |
| `IsForwarder` / `ForwarderName` | Признак перенаправления и строка вида `DLL.Symbol`. Конечный адрес здесь не вычисляется. |

`ReadExports()` — готовый PE-helper из `EyeAuras.Memory.Scaffolding`, он понимает PE32 и PE32+. Свой сканер писать не нужно. Если в корректном образе нет таблицы экспортов, вернётся пустой список. Ошибка доступа или разбора — это другой случай.

Представление `MemoryOfModule` не копирует DLL с диска и не владеет процессом. Сначала освобождается оно, потом читатель с его дескрипторами. `process.Memory` скрипту не принадлежит. Адреса верны, пока процесс жив и модуль загружен. Представление не проверяет автоматически все границы произвольного чтения.

<details>
<summary>Выбрать другой собственный экземпляр</summary>

Возьмите PID из [списка процессов](/ru/scripting/examples/advanced/memory/get-processes) и замените только `Environment.ProcessId`. Нужны права на чтение и модуль, который в этом процессе действительно загружен. Старый вариант `LocalProcess.ByProcessName("EyeAuras.exe")` тоже работает, но берёт первый совпавший процесс — не обязательно этот. Ни имя, ни PID не гарантируют, что приложение останется запущенным.

</details>
