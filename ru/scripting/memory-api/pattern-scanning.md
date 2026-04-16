---
title: Pattern Scanning
description: Какие виды сигнатур поддерживает EyeAuras и как искать паттерны в памяти
published: true
date: 2026-04-16T15:55:00.000Z
tags: c#, scripting, memory, reverse-engineering, pattern-scanning, ai-translated
editor: markdown
dateCreated: 2026-04-16T15:55:00.000Z
---

# Pattern Scanning в Memory API

`Pattern scanning` нужен, когда адрес нельзя держать жёстко: мешают обновления, `ASLR` и плавающие layout'ы. Вместо "читать по `0x12345678`" вы ищете устойчивую последовательность байтов рядом с нужным местом. По теме хорошо зайти через [Dynamic Memory Allocation](https://gamehacking.academy/pages/2/08/) и [Pattern Scanner](https://gamehacking.academy/pages/7/02/).

## С чего начинать

Почти всегда сканировать стоит не весь процесс, а память конкретного модуля:

```csharp
using System.Diagnostics;
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using var process = LocalProcess.ByProcessId(Process.GetCurrentProcess().Id);
using var memory = process.MemoryOfModule("kernel32.dll");
```

Так и быстрее, и понятнее: найденный offset сразу привязан к модулю.

## Какие сигнатуры поддерживаются

Всё строится вокруг `BytePattern`. Из коробки поддерживаются:

- точные байты
- hex-строки
- wildcard через `?` и `??`
- C-style запись вида `\xAA\xBB`
- маска плюс байты
- маркер `^`, который отмечает точку интереса внутри совпадения

```csharp
var exact = BytePattern.FromPattern(new byte[] { 0x48, 0x85, 0xC0, 0x74, 0x0A });
var hex = BytePattern.FromTemplate("48 85 C0 74 0A");
var wildcards = BytePattern.FromTemplate("48 85 ?? 74 0A");
var cStyle = BytePattern.FromTemplate(@"\x48\x85\xC0\x74\x0A");
var masked = BytePattern.FromMaskedPattern(new byte[] { 0x48, 0x85, 0xC0, 0x74, 0x0A }, "xxxxx");
var withOffset = BytePattern.FromTemplate("48 ^ 85 C0 74 0A");
```

В примере ниже мы будем использовать один и тот же паттерн `48 85 C0 74 0A`, чтобы было проще связать схему, код и результат поиска.

`^` особенно полезен, когда вам нужен не старт совпадения, а конкретный байт внутри инструкции. Например, `48 ^ 85 C0 74 0A` вернет offset не на первый `48`, а на следующий байт `85`.

![](/assets/pattern-scan-match.svg)

Короткий разбор этой схемы:

1. Внутри блока `Memory` лежит обычная последовательность байтов.
2. Подсвеченный фрагмент `48 85 C0 74 0A` это и есть найденный `match`.
3. Стрелка показывает старт совпадения. Именно от этой точки обычно и считается найденный `offset`.
4. Дальше вы уже решаете, что делать с этим местом: читать инструкцию как опорную точку, прибавлять смещение или идти к нужному адресу через pointer chain.

## Как искать

Основные методы:

- `FindOffset(...)` — вернуть offset или `-1`
- `GetOffset(...)` — вернуть offset или бросить исключение
- `FindOffsets(...)` и `GetOffsets(...)` — то же самое для нескольких сигнатур

```csharp
var pattern = BytePattern.FromTemplate("48 85 C0 74 0A");
var offset = memory.FindOffset(pattern);

if (offset >= 0)
{
    var va = memory.BaseAddress + offset;
    Log.Info($"Found at 0x{offset:X}, VA={va.ToHexadecimal()}");
}
```

## Offset и адрес

- `offset` — смещение внутри текущего `IMemory`
- `VA` — абсолютный адрес в процессе

Если вы ищете внутри `MemoryOfModule(...)`, абсолютный адрес обычно считается как `memory.BaseAddress + offset`.

Если взять схему выше, `FindOffset(BytePattern.FromTemplate("48 85 C0 74 0A"))` вернет offset на первый подсвеченный байт `48`.

## Что выбрать: `Find*` или `Get*`

- `Find*` — если отсутствие сигнатуры это нормальный сценарий
- `Get*` — если отсутствие сигнатуры уже означает несовместимую версию клиента или ошибку

## Практические советы

- Сканируйте модуль, а не весь процесс, если знаете нужный `.exe` или `.dll`.
- Не делайте сигнатуру слишком короткой.
- Нестабильные байты лучше закрывать wildcard'ами.
- Если нужна точка внутри инструкции, используйте `^`, а не лишнюю ручную арифметику.
- Для игровых сценариев вроде `entity list` или `view matrix` сигнатура обычно выступает только как опорная точка. Дальше вы уже читаете указатели и структуры.

## Что читать дальше

- [PE basics](/ru/scripting/memory-api/pe-basics)
- [Code Cave](/ru/scripting/memory-api/code-caves)
- [API pattern scanning](/ru/scripting/api/pattern-scanning)
