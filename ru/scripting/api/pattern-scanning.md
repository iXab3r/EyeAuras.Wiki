---
title: Сканирование паттернов
description: Обзор сканирования паттернов и поиска сигнатур.
published: true
date: 2024-12-15T10:56:55.901Z
tags: ai-translated
editor: markdown
dateCreated: 2024-12-15T10:54:50.446Z
---
## Что такое сканирование по паттерну?

Сканирование по паттерну — это способ поиска определённых последовательностей байтов в памяти. Такой подход удобен, когда нужно найти функции, данные или участки кода, которые не всегда находятся по одному и тому же адресу во время работы программы.

### Зачем это нужно?

1. **Динамические адреса**: программы часто загружают код и данные в разные места при каждом запуске. Сканирование по паттерну помогает находить нужные данные независимо от того, куда они были загружены в этот раз.
2. **Уникальные совпадения**: паттерны работают как отпечатки пальцев — они позволяют находить конкретные области памяти по уникальным последовательностям байтов.

---

## `BytePattern`

Класс `BytePattern` был добавлен, чтобы поддерживать несколько способов задания паттернов. Благодаря этому удобнее работать с разными форматами паттернов, которые обычно используются при сканировании памяти.

Сканирование по паттерну доступно для любого типа, реализующего интерфейс `IMemory`, например:

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

1. **Массивы байтов**:
   - Паттерн задаётся точными значениями байтов.
   - Пример:
   ```csharp
   var pattern = BytePattern.FromPattern(new byte[] {0x55, 0x8B, 0xEC});
   ```
   точно совпадает с этими байтами.

2. **Паттерны в стиле C**:
   - Используются escape-последовательности вида `\xAA\xBB\xCC`, как в C-style паттернах.
   - Пример:
   ```csharp
   var pattern = BytePattern.FromTemplate("\x55\x8B\xEC");
   ```
   эквивалентен массиву байтов `[0x55, 0x8B, 0xEC]`.

3. **Шестнадцатеричные строки с wildcard-символами**:
   - Паттерн задаётся как hex-строка, где `??` означает wildcard (любой байт).
   - Пример:
   ```csharp
   var pattern = BytePattern.FromTemplate("55 8B ?? 83");
   ```
   совпадает с любой последовательностью, которая начинается с `55 8B`, затем содержит любой байт, а после него — `83`.

4. **Маскированные паттерны**:
   - Паттерн задаётся комбинацией массива байтов и маски, где фиксированные байты обозначаются как `x`, а wildcard — как `?`.
   - Пример:
     ```csharp
     var pattern = BytePattern.FromMaskedPattern(new byte[] { 0x55, 0x8B, 0xEC, 0x00, 0x08 }, "xxx??");
     ```
     Совпадает с любой последовательностью, которая начинается с `55 8B EC`, после чего идут любые два байта.

5. **Шаблоны со смещением**:
   - Паттерн задаётся через шаблон, а символ `^` отмечает смещение внутри найденного совпадения.
   - Пример:
   ```csharp
   var pattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
   ```
   задаёт смещение прямо перед `EC` (то есть пропускает `3` байта). Это значит, что после нахождения паттерна итоговый offset будет `Offset + 3`