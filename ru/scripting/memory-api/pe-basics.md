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

После этого `kernel32` это уже не вся память процесса, а окно на конкретный PE-образ.

## Что умеет Memory API

Для PE-практики чаще всего нужны:

- `ReadSections()`
- `ReadExports()`
- `ReadImports()`

```csharp
var sections = kernel32.ReadSections();
var exports = kernel32.ReadExports();

var mainModule = process.GetProcessModules()
    .First(x => x.ModuleName.EndsWith(".exe", StringComparison.OrdinalIgnoreCase));

using var mainMemory = process.MemoryOfModule(mainModule);
var imports = mainMemory.ReadImports();
```

Этого обычно хватает, чтобы:

- понять layout модуля
- найти публичную функцию
- посмотреть внешние зависимости
- подготовить `IAT`-patching, `pattern scanning` или `code cave`

## Где это пригодится

PE-база нужна почти везде, где вы хотите уйти от мышления "вот случайный адрес" к более устойчивой модели:

- модуль
- секция
- экспорт
- импорт
- `RVA`

Именно эта модель потом лучше всего стыкуется с сигнатурами, инжектом и patching-сценариями.

## Что читать дальше

- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
- [Чтение экспортов модулей](/ru/scripting/examples/advanced/memory/read-exports)
- [API памяти](/ru/scripting/api/memory)
