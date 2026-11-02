---
title: Code Cave
description: Что такое code cave в EyeAuras, как его искать и когда он вообще нужен
published: true
date: 2026-04-16T15:56:00.000Z
tags: c#, scripting, memory, reverse-engineering, code-cave, ai-translated
editor: markdown
dateCreated: 2026-04-16T15:56:00.000Z
---

# Code Cave в Memory API

`Code cave` — это свободный участок внутри PE-модуля, обычно заполненный нулями. Его можно использовать под данные, небольшой payload, trampoline или служебный буфер. По общей идее полезны [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/), [DLL Memory Hack](https://gamehacking.academy/pages/3/03/) и [DLL Injector](https://gamehacking.academy/pages/7/01/).

## Получить список кандидатов в модуле

Метод для обычного C#-класса принимает уже открытый `IProcess` и точное имя его PE-модуля. Он выполняет поиск, пока представление памяти ещё живо, и возвращает готовый массив:

```csharp
using System.Linq;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

static CodeCaveEntry[] FindCandidates(IProcess process, string moduleName)
{
    using var memory = process.MemoryOfModule(moduleName);
    return memory.EnumerateCodeCaves(minBytes: 64, alignment: 16).ToArray();
}
```

`StartVA` результата — абсолютный адрес, `StartRva` — смещение от базы модуля, `Size` — пригодная длина после выравнивания. Пустой массив означает, что в просмотренной части секций кандидатов нет. Reader остаётся у вызывающего кода.

В EyeAuras `20fd3d4` поиск ленивый, по умолчанию просматривает читаемые исполняемые секции и допускает смесь `0x00`, `0xCC`, `0x90`, а не только нули. `maxScanPerSection = 1_048_576` ограничивает число байт **каждой** секции; `alignment = 1` отключает выравнивание. Для ожидаемого округления выбирайте степень двойки. Токена отмены нет, чтение секции синхронное. Найденное заполнение не доказывает, что память никому не нужна, и не резервирует её.

## Как искать

Искать `code cave` нужно на памяти конкретного модуля:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

{
    using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
    using var moduleMemory = process.MemoryOfModule("kernel32.dll");
    var candidates = moduleMemory.EnumerateCodeCaves(minBytes: 64, alignment: 16).ToArray();
    Log.Info($"Кандидатов: {candidates.Length}");
}
```

После этого можно перечислить кандидатов:

Дальше — фрагменты для настройки поиска **внутри открытого блока** с `moduleMemory`,
не отдельные скрипты после его закрытия. Полный helper с получением модуля
и материализацией результата приведён в начале страницы.

```csharp
var caves = moduleMemory.EnumerateCodeCaves(
    minBytes: 64,
    alignment: 16);
```

Каждый результат приходит как `CodeCaveEntry`. На практике чаще всего важны `Section`, `StartVA`, `StartRva` и `Size`.

## Данные и код

Не каждый cave подходит для одних и тех же задач. Обычно сценарии делятся так:

- `readable + writable + not executable` — строки, структуры, аргументы, служебные данные
- `readable + executable` — `trampoline`, payload, redirection

Для этого есть `sectionFilter`:

```csharp
var dataCave = moduleMemory.EnumerateCodeCaves(
        minBytes: 128,
        alignment: 2,
        sectionFilter: s => s.IsReadable && s.IsWritable && !s.IsExecutable)
    .FirstOrDefault();

var execCave = moduleMemory.EnumerateCodeCaves(
        minBytes: 64,
        alignment: 16,
        sectionFilter: s => s.IsReadable && s.IsExecutable)
    .FirstOrDefault();
```

## Что это не делает

`EnumerateCodeCaves(...)`:

- не пишет данные сам
- не делает hook
- не ставит `jmp`
- не меняет protection
- не запускает код автоматически

Это только поиск подходящего места.

`FreeMemory(...)` освобождает выделенную память, а не найденное заполнение внутри PE-модуля. Поиск не устанавливает право на запись или владение диапазоном. Изменение защиты и размещение данных — отдельные операции, которые нельзя считать безопасными только по результату поиска.

## Ограничения

- Ищите cave через `MemoryOfModule(...)`, а не на всей памяти процесса.
- Сам поиск требует только чтения памяти.
- Запись в найденный cave зависит от backend'а.
- Для активного patching обычно нужны `LocalProcess`, `NativeLocalProcess` или `KDProcess`.
- Для `LCProcess` поиск cave полезен как анализ, но не как обычный инструмент управления процессом.

## Что читать дальше

- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [DLL inject](/ru/scripting/memory-api/dll-inject)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
