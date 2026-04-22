---
title: Сканирование по сигнатурам
description: Практическое введение в поиск по сигнатурам.
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-12-15T10:54:50.446Z
---
> Для AI-first навигации см. [AI Memory / Processes](./memory/processes) — там описаны подключение к процессу, работа с указателями, readers и место pattern scanning в memory workflow.
{.is-info}

## Что такое Pattern Scanning

Pattern scanning — это способ искать в памяти конкретные последовательности байтов. Он полезен, когда нужно найти функции, данные или код, которые во время работы программы не всегда находятся по одному и тому же адресу.

### Зачем это нужно

1. **Динамические адреса**. Программы часто загружают код и данные в разные места при каждом запуске. Pattern scanning помогает находить нужное независимо от того, куда именно всё попало в этот раз.
2. **Уникальные совпадения**. Паттерны работают как отпечатки пальцев — по уникальной последовательности байтов можно определить конкретный участок памяти.

---

## BytePattern

Класс `BytePattern` добавлен для поддержки нескольких способов задания паттернов. Это упрощает работу с разными форматами, которые обычно используются при сканировании памяти.

Pattern scanning доступен для любого типа, реализующего интерфейс `IMemory`, например:

```csharp
using var process = LocalProcess.ByProcessName("pathofexile"); //uses naive RPM under the hood
Log.Info($"Process: {process}");
var modules = process.GetProcessModules(); //enumerate all loaded modules

using var memory = process.MemoryOfModule("pathofexile.exe"); //memory implements IMemory
Log.Info($"Process memory: {memory}, base: {memory.BaseAddress.ToHexadecimal()}");

// will find a singular offset pointing at 4th byte in the sequence
var offset = memory.FindOffset(BytePattern.FromTemplate("55 8B ?? ^ EC 00")); 

// will return dictionary with all found offsets for all given patterns
var playerPattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
var targetPattern = BytePattern.FromTemplate("BB AA ??");
var offsetsByPattern = memory.FindOffset(playerPattern, targetPattern);

// by using Get* instead of Find* the code will throw an exception in case pattern is not found
var criticalOffset = memory.GetOffset(BytePattern.FromTemplate("55 8B ?? ^ EC 00")); 
```

### Поддерживаемые типы паттернов

1. **Массивы байтов**
   - Паттерн задаётся точными значениями байтов.
   - Пример:
   ```csharp
   var pattern = BytePattern.FromPattern(new byte[] {0x55, 0x8B, 0xEC});
   ```
   Совпадёт только с этой последовательностью байтов.

2. **Паттерны в стиле C**
   - Используются escape-последовательности вида `\xAA\xBB\xCC`, как в C-style patterns.
   - Пример:
   ```csharp
   var pattern = BytePattern.FromTemplate("\x55\x8B\xEC");
   ```
   Эквивалентно массиву байтов `[0x55, 0x8B, 0xEC]`.

3. **Шестнадцатеричные строки с wildcard-байтами**
   - Паттерн задаётся как hex-строка, где `??` означает wildcard, то есть любой байт.
   - Пример:
   ```csharp
   var pattern = BytePattern.FromTemplate("55 8B ?? 83");
   ```
   Совпадёт с любой последовательностью, которая начинается с `55 8B`, затем содержит любой байт, а после него — `83`.

4. **Маскированные паттерны**
   - Используется массив байтов и маска, где фиксированные байты помечаются как `x`, а wildcard — как `?`.
   - Пример:
     ```csharp
     var pattern = BytePattern.FromMaskedPattern(new byte[] { 0x55, 0x8B, 0xEC, 0x00, 0x08 }, "xxx??");
     ```
     Совпадёт с любой последовательностью, которая начинается с `55 8B EC`, а затем содержит любые два байта.

5. **Шаблоны со смещением**
   - Паттерн задаётся через template, а позиция итогового смещения отмечается символом `^`.
   - Пример:
   ```csharp
   var pattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
   ```
   Здесь offset ставится прямо перед `EC`, то есть с пропуском `3` байтов. Это значит, что после нахождения паттерна итоговый offset будет `Offset + 3`