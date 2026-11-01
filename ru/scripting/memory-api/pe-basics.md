---
title: PE basics
description: Базовые PE-понятия в контексте Memory API и практической reverse engineering работы
published: true
date: 2026-04-16T15:57:00.000Z
tags: c#, scripting, memory, reverse-engineering, pe, ai-translated
editor: markdown
dateCreated: 2026-04-16T15:57:00.000Z
---

# PE basics для Memory API

`PE` это формат `.exe` и `.dll` в Windows. В контексте Memory API это важно потому, что большая часть удобной работы идёт не с "произвольным адресом", а с конкретным модулем: его секциями, импортами, экспортами и `RVA`. Для внешнего контекста полезны [Game Fundamentals](https://gamehacking.academy/pages/1/02/), [DLL Injector](https://gamehacking.academy/pages/7/01/) и [PE/COFF Spec](https://learn.microsoft.com/windows/win32/debug/pe-format).

## Минимум терминов

- модуль — загруженный `.exe` или `.dll`
- `RVA` — адрес относительно базы модуля
- `VA` — абсолютный адрес в памяти процесса
- секция — кусок PE-образа вроде `.text`, `.rdata`, `.data`
- экспорт — то, что модуль отдаёт наружу
- импорт — то, что модуль подтягивает из других DLL

Если база модуля `0x7FF700000000`, а `RVA` равен `0x1234`, то `VA` будет `BaseAddress + 0x1234`.

## Главное правило

Примеры с `LocalProcess` рассчитаны на верхний уровень C#-скрипта в запущенном EyeAuras с загруженным модулем памяти. `Log` даёт хост скрипта. В обычном C#-классе передайте логгер и процесс явно. Одна ссылка на SDK не запускает модуль: во встраиваемом хосте сначала нужны запуск приложения, `UseMemory()` и ожидание `EnsureReadyAsync()`; подробнее в [Embedded SDK](/ru/scripting/api/nuget/embedded-sdk).

`LocalProcess.ByProcessId(...)` возвращает новый `ILocalProcess`, который освобождает создавший его код. `process.Memory` используется вместе с этим reader'ом; отдельно закрывать заимствованный сервис хоста не нужно. Эти примеры не проверяют доступность нативных компонентов вашей сборки.

Нормальный маршрут почти всегда такой:

1. открыть процесс
2. взять модуль
3. работать уже внутри этого модуля

Для этого и нужен `MemoryOfModule(...)`:

```csharp
using System.Diagnostics;
using System.Linq;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var kernel32 = process.MemoryOfModule("kernel32.dll");
```

После этого `kernel32` описывает базу и размер загруженного PE-образа. Это не копия DLL и не проверка границ при каждом чтении. Прямые адреса у этого backend абсолютные; процесс держим открытым до конца работы с представлением.

## Что умеет Memory API

Для PE-практики чаще всего нужны:

- `ReadSections()`
- `ReadExports()`
- `ReadImports()`

Чтобы увидеть результат, выполните следующий отдельный скрипт в EyeAuras с модулем памяти. Вход — текущий процесс и его загруженный `kernel32.dll`; внешние адреса и файлы не нужны.

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var module = process.MemoryOfModule("kernel32.dll");
foreach (var section in module.ReadSections())
{
    Log.Info($"{section.Name}: RVA=0x{section.VirtualAddress:X}, " +
             $"VA=0x{section.StartVA:X}, end=0x{section.EndVA:X}");
}
foreach (var export in module.ReadExports())
{
    if (export.IsForwarder)
        Log.Info($"{export.ExportName}: forwarder={export.ForwarderName}");
    else
        Log.Info($"{export.ExportName}: ordinal={export.Ordinal}, " +
                 $"VA=0x{module.BaseAddress + (long)export.RVA:X}");
}
var imports = module.ReadImports();
Log.Info($"Imports={imports.Count}");
foreach (var import in imports)
{
    Log.Info($"{import.DllName}!{import.FunctionName}: " +
             $"IAT slot VA=0x{module.BaseAddress + (long)import.IatEntryRva:X}");
}
```

Журнал покажет секции с RVA и VA, экспорты и записи импортов. Списки могут быть пустыми. Имена ordinal-only экспортов могут отсутствовать; forwarded export указывает на строку перенаправления, поэтому `BaseAddress + RVA` для него нельзя считать адресом исполняемой функции. `IatEntryRva` у импорта — место ячейки IAT, а не адрес импортированной функции. Импорт по ordinal не обязан иметь `FunctionName`.

Это синхронное чтение живого образа без токена отмены и без гарантии неизменности процесса. PE-helper'ы могут бросить исключение при недоступных данных или неподдерживаемом заголовке. Они не выполняют вызов функции и не меняют IAT.

Этого обычно хватает, чтобы:

- понять layout модуля
- найти публичную функцию
- посмотреть внешние зависимости
- подготовить `IAT`-patching, `pattern scanning` или `code cave`

## RVA и смещение в файле

`ReadSections`, `ReadExports` и `ReadImports` работают с загруженным образом по `IMemory.BaseAddress`. Нельзя просто передать им массив байтов DLL с диска и считать его тем же layout: загрузчик размещает секции по RVA, а файл хранит их по смещениям raw data.

К примеру, секция начинается с RVA `0x1000`, её `PointerToRawData` в файле равен `0x400`. Для RVA `0x1234`:

- в загруженном модуле адрес будет `BaseAddress + 0x1234`
- в файле байт будет по `0x400 + (0x1234 - 0x1000) = 0x634`, если он входит в raw data секции

Виртуальный хвост секции может вообще не иметь байтов в файле. `VirtualSize` и `RawSize` различаются; у `ModuleSectionEntry` нет `PointerToRawData`, поэтому это пояснение формата, а не готовый файловый конвертер. Для разбора файла нужен PE-reader с таблицей секций. Ручное декодирование байтов здесь уместно именно как разбор формата, но для загруженного модуля уже есть перечисленные helper'ы.

В этой версии `StartVA`/`EndVA` у секции — абсолютные адреса, верхняя граница исключающая; вычисляемая длина использует максимум `VirtualSize` и `RawSize`. Не принимайте её за доказательство, что все страницы доступны для чтения. Размер ячеек import thunk определяется PE32/PE32+, а не размером `IntPtr` вашего helper-класса.

## Где это пригодится

PE-база нужна почти везде, где вы хотите уйти от мышления "вот случайный адрес" к более устойчивой модели:

- модуль
- секция
- экспорт
- импорт
- `RVA`

Именно эта модель потом лучше всего стыкуется с сигнатурами, инжектом и patching-сценариями.

Контракты на этой странице сверены по EyeAuras `20fd3d4`; это чтение исходников, без запуска примеров. Полные сигнатуры и ограничения своей версии проверяйте по [карте API памяти](/ru/scripting/api/memory) и SDK/XML reference.

## Что читать дальше

- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
- [Чтение экспортов модулей](/ru/scripting/examples/advanced/memory/read-exports)
- [API памяти](/ru/scripting/api/memory)
