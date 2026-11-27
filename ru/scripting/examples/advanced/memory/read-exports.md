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

Посмотрим таблицу экспортов `kernel32.dll`, уже загруженной в процесс EyeAuras. Результат — имена, ordinal и RVA из PE-образа в памяти, включая перенаправления. Экспорт может обозначать функцию, данные или строку перенаправления; сама запись ещё не является значением поля или разрешением вызвать функцию.

Нужен настольный Windows-хост EyeAuras с загруженным **EyeAuras.Memory**. Для первого опыта выбирается PID самого хоста, поэтому не требуется угадывать имя чужого процесса или его адреса.

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

2. Нажмите **Run**, откройте журнал событий. Сначала появятся PID, число модулей и путь к DLL, затем таблица экспортов и результат поиска `LoadLibraryA`.
3. Если запись содержит `IsForwarder = true`, прочитайте `ForwarderName`: вычисленный адрес указывает на строку перенаправления в этой DLL. Пример не переходит в другую DLL и не вызывает найденный символ.

| Данные | Что они означают |
| --- | --- |
| `ModuleName` / `FilePath` | Имя для выбора загруженного модуля и его путь. `GetProcessModule` сравнивает имя без учёта регистра; отсутствие модуля — ошибка, а не пустой список экспортов. |
| `BaseAddress` | Адрес начала этого загруженного PE-образа в текущем процессе. Он может измениться при следующем запуске. |
| `RVA` | Смещение относительно базы. Для неперенаправленного экспорта адрес равен `BaseAddress + RVA`; нулевой RVA в незаполненной позиции таблицы не означает функцию по базе. |
| `Ordinal` | Номер экспорта с учётом ordinal base DLL. Он отличается от индекса `ExportAddressTableIndex`. |
| `ExportName` / `UnDecoratedExportName` | Исходное имя и, когда доступно, разобранное C++ имя. У экспорта только по номеру имени нет. |
| `IsForwarder` / `ForwarderName` | Признак и строка вида `DLL.Symbol`; разрешение конечного адреса в этой операции не выполняется. |

`ReadExports()` — готовый PE-helper из `EyeAuras.Memory.Scaffolding`, поддерживающий PE32 и PE32+. Не нужно писать свой сканер. Если в корректном образе нет таблицы экспортов, возвращается пустой список; ошибка доступа или разбора — другой исход.

Представление `MemoryOfModule` не копирует DLL с диска и не владеет процессом. Сначала освобождается представление, затем читатель с его дескрипторами; `process.Memory` заимствовано. Адреса имеют смысл, пока существует этот процесс и загружен модуль. Представление не проверяет автоматически все границы произвольного чтения.

<details>
<summary>Выбрать другой собственный экземпляр</summary>

Получите его PID из [списка процессов](/ru/scripting/examples/advanced/memory/get-processes) и замените только `Environment.ProcessId`. Нужны соответствующие права чтения и реально загруженный модуль. Старый вариант `LocalProcess.ByProcessName("EyeAuras.exe")` также поддерживается, но выбирает первый совпавший процесс, а не обязательно этот хост. Ни имя, ни PID не фиксируют время жизни приложения.

</details>
