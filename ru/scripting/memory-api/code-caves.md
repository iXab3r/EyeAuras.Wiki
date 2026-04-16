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

## Как искать

Искать `code cave` нужно на памяти конкретного модуля:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var moduleMemory = process.MemoryOfModule("kernel32.dll");
```

После этого можно перечислить кандидатов:

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

Если вам нужно не просто найти cave, а реально подготовить его под patching или payload, используйте явные `ProtectMemory(...)` и `FreeMemory(...)` из `IProcessControlApi`. Короткий стартовый пример есть в [Memory API - С чего начать](/ru/scripting/memory-api/getting-started).

## Ограничения

- Ищите cave через `MemoryOfModule(...)`, а не на всей памяти процесса.
- Сам поиск требует только чтения памяти.
- Запись в найденный cave зависит от backend'а.
- Для активного patching обычно нужны `LocalProcess`, `NativeLocalProcess` или `KDProcess`.
- Для `LCProcess` поиск cave полезен как анализ, но не как обычный инструмент управления процессом.

## Что читать дальше

- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
