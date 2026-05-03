---
title: XignProcess
description: Memory API backend через XignCode3-драйвер
published: true
date: 2026-05-03T00:00:00.000Z
tags: scripting, c#, memory, reverse-engineering, backend, xign, driver
editor: markdown
dateCreated: 2026-05-03T00:00:00.000Z
---

# `XignProcess`

`XignProcess` это реализация `IProcess`, которая работает через XignCode3-драйвер
определенной версии. Снаружи это обычный Memory API backend: у вас остается
`process.Memory`, `MemoryOfModule(...)`, helpers для модулей/регионов, manual
mapping и общий process-control слой. Отличается источник доступа: вместо
обычного user-mode `OpenProcess` используется `xhunter1.sys`.

Если совсем коротко:

- `LocalProcess` — обычный WinAPI;
- `LCProcess` — чтение памяти через DMA-плату;
- `XignProcess` — локальный процесс через XignCode3-драйвер.

## Зачем он нужен

Главный плюс по сравнению с `LocalProcess` — работа на уровне драйвера. При этом
драйвер подписан и загружается официальным Windows-путем через Service Control
Manager. Это заметно стабильнее, чем самодельные обходы загрузки драйверов, и
позволяет сохранить привычный Memory API наверху.

По состоянию на **1 мая 2026** проверенная нами версия XignCode3-драйвера
работает в том числе с защищенными процессами: там, где `LocalProcess` может
упереться в `OpenProcess` / `Access denied`, `XignProcess` открывает процесс
через драйвер.

Это не обещание на все будущие версии Windows, XignCode3 и античитов. Это
практическое наблюдение про конкретную версию драйвера и наши проверенные
окружения.

## Дисклеймер

Под капотом используется Xign/XignCode3, то есть third-party driver dependency.
На реальных машинах возможны конфликты с другими драйверами, античитами,
защитным ПО, Code Integrity/VBS и локальными политиками загрузки драйверов.

Относитесь к `XignProcess` как к прагматичному временному решению: пользуйтесь,
пока оно работает в вашем контролируемом сценарии. Для коммерческого или
публичного продукта лучше смотреть в сторону
[кастомного `IProcess`](/ru/scripting/memory-api/backends/custom-process). Это
единственный путь реально контролировать опыт пользователя.

Хорошая новость: Memory API закрывает backend интерфейсами. Если код принимает
`IProcess` и работает через `process.Memory` / helpers, замена `XignProcess` на
другой backend обычно остается локальным изменением в месте создания процесса.

## Как открыть

Если драйвер уже загружен:

```csharp
using EyeAuras.XignSdk;

using var process = XignProcess.ByProcessId(pid);

var health = process.Memory.Read<int>(healthAddress);
process.Memory.Write<int>(healthAddress, 100);
```

Если драйвер нужно загрузить перед открытием процесса:

```csharp
using EyeAuras.XignSdk;

using var process = XignProcess
    .WithLoadDriver()
    .ByProcessName("game.exe");
```

Загрузка идет обычным SCM-путем. SDK не занимается обходом подписи драйвера или
политик Windows.

## `EnterOpenProcess()`

По умолчанию `XignProcess` открывает handle процесса через драйвер на время
операции и закрывает его после нее. Для одиночных вызовов это нормально. Для
серии операций это лишняя работа.

`EnterOpenProcess()` держит handle открытым до выхода из `using`:

```csharp
using var process = XignProcess
    .WithLoadDriver()
    .ByProcessId(pid);

using (process.EnterOpenProcess())
{
    var regions = process.GetMemoryRegions();
    var module = process.MemoryOfModule("game.exe");
    var value = process.Memory.Read<int>(address);
}
```

Используйте его вокруг пачки чтений/записей, обхода модулей/регионов,
manual mapping или allocation/write/execute последовательностей. Вложенные
`EnterOpenProcess()` переиспользуют тот же handle и закроют его только после
выхода из последнего scope.

Если handle должен жить весь lifetime объекта, создавайте процесс через
`WithOpenProcess()`:

```csharp
using var process = XignProcess
    .WithLoadDriver()
    .WithOpenProcess()
    .ByProcessId(pid);
```

## Что важно знать

`XignProcess` не означает, что каждый метод является отдельной командой
драйвера. Часть операций идет через Xign, часть через обычный WinAPI поверх
handle, который был получен через драйвер. Для пользователя Memory API это
обычно не важно, но полезно понимать при диагностике.

`ExecuteCode` вызывает код, который уже лежит в целевом процессе. Для x86
процесса адреса должны помещаться в 32-bit user-mode range. Manual mapping
строится поверх общего `LibraryMapper`, поэтому использует тот же `process.Memory`
и `ExecuteCode`, что и другие backend'и.

APC-путь использует обычный `OpenThread` / `QueueUserAPC`, поэтому APC выполнится
только когда целевой поток войдет в alertable wait.

## Где границы

`XignProcess` не стоит воспринимать как магический `LocalProcess`. Нужен
совместимый `xhunter1.sys`, x64 процесс для общения с драйвером, права на
загрузку/открытие драйвера и окружение, где XignCode3 не конфликтует с другими
kernel-компонентами.

Если процесс спокойно открывается обычным WinAPI, начинайте с
[LocalProcess](/ru/scripting/memory-api/backends/local-process). Если память
нужно получать извне, смотрите [LCProcess](/ru/scripting/memory-api/backends/lc-process).
Если важна предсказуемость для публичного продукта, проектируйте собственный
[`IProcess`](/ru/scripting/memory-api/backends/custom-process).

## Что читать дальше

- [Xign SDK](/ru/scripting/api/nuget/xign-sdk)
- [Memory API - С чего начать](/ru/scripting/memory-api/getting-started)
- [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- [LCProcess](/ru/scripting/memory-api/backends/lc-process)
- [Кастомный IProcess](/ru/scripting/memory-api/backends/custom-process)
