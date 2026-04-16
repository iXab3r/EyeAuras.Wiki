---
title: LocalProcess
description: Основной WinAPI backend в EyeAuras и то, что он реально умеет
published: true
date: 2026-04-16T17:05:00.000Z
tags: c#, scripting, memory, reverse-engineering, backend, localprocess, ai-translated
editor: markdown
dateCreated: 2026-04-16T17:05:00.000Z
---

# `LocalProcess`

`LocalProcess` это основной user-mode backend в EyeAuras. Если нужен самый прямой путь к локальному процессу через WinAPI, почти всегда начинать стоит с него. По духу это тот же внешний сценарий, что и в [External Memory Hack](https://gamehacking.academy/pages/3/02/), только с более удобным верхним слоем.

## Когда подходит, а когда нет

`LocalProcess` хорош, когда:

- нужен обычный локальный процесс
- нужен быстрый старт без кастомного backend'а
- кроме чтения памяти нужен и обычный process control

Главное ограничение одно:

- он сам открывает процесс обычным WinAPI-путём, поэтому с защищёнными процессами не подходит

В таких случаях обычно смотрят на:

- `NativeLocalProcess` — если нужный handle уже получен заранее
- `LCProcess` — если память читается внешне, например через `DMA`
- `KDProcess` — если нужен более глубокий доступ через kernel driver

## Как его открыть

```csharp
using System.Diagnostics;
using EyeAuras.Memory;

using var byPid = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var byName = LocalProcess.ByProcessName("notepad");

var processes = LocalProcess.GetProcesses();
```

## Что он даёт

Через `LocalProcess` вы получаете сразу две вещи:

- нормальный доступ к памяти через `process.Memory`
- обычный user-mode контроль процесса

Из этого сразу вырастают:

- `MemoryOfModule(...)`
- `ReadExports()`, `ReadImports()`, `ReadSections()`
- `pattern scanning`
- `code caves`
- `DLL inject`, `manual mapping`, `APC`, `remote thread`

Именно поэтому это основной backend для большинства практических сценариев.

## Типичный маршрут

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessName("game");
using var moduleMemory = process.MemoryOfModule("game.exe");

var sections = moduleMemory.ReadSections();
var imports = moduleMemory.ReadImports();
var exports = moduleMemory.ReadExports();
```

Если потом хотите перейти от внешнего чтения к более активной internal-практике, полезны [DLL Memory Hack](https://gamehacking.academy/pages/3/03/), [DLL Injector](https://gamehacking.academy/pages/7/01/) и [Code Caves & DLL's](https://gamehacking.academy/pages/3/04/).

## Где `NativeLocalProcess` лучше

`NativeLocalProcess` нужен не вместо `LocalProcess`, а когда процесс уже открыт нужным вам способом и вы хотите положить Memory API поверх готового handle.

## Что читать дальше

- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Pattern Scanning](/ru/scripting/memory-api/pattern-scanning)
- [Code Cave](/ru/scripting/memory-api/code-caves)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
- [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process)
- [Кастомные memory backend](/ru/scripting/memory-api/backends/custom-memory-backends)
