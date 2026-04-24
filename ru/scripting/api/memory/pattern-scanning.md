---
title: Сканирование сигнатур в памяти
description: Краткая карта helper-методов pattern scanning, сигнатур и работы смещений в memory API.
published: true
date: 2026-04-23T00:00:00.000Z
tags: scripting, api, ai, memory, pattern-scanning, ai-translated
editor: markdown
dateCreated: 2026-04-23T00:00:00.000Z
---
# Карта по сканированию памяти и сигнатур

Краткая справка по хелперам для сигнатур, `BytePattern` / `StringPattern`,
разнице между поиском одной сигнатуры и нескольких сразу, а также по тому,
как `PatternOffset` используется в сценариях работы с памятью.

## Что обычно нужно сделать

- Просканировать модуль по стабильной сигнатуре байтов.
- Собрать сигнатуру с wildcard-символами.
- Отметить нужную позицию внутри совпадения через `^`.
- Найти одну сигнатуру или проверить несколько за один проход.
- Преобразовать смещение относительно модуля в виртуальный адрес.
- Использовать сигнатуры как опорные точки перед чтением pointer chain или структур.

## Модель

- `BytePattern` — основное представление сигнатуры.
- `StringPattern` — совместимый wrapper для сигнатур на основе шаблонов.
- `IMemory` — обычная поверхность для сканирования, чаще всего полученная через
  `MemoryOfModule(...)`.
- `FindOffset(...)` / `GetOffset(...)` возвращают один исходный оффсет начала совпадения.
- `FindOffsets(...)` / `GetOffsets(...)` сканируют несколько сигнатур и возвращают
  оффсеты, привязанные к соответствующим pattern-объектам.
- `PatternOffset` — это метаданные, хранящиеся в самой сигнатуре; не каждый helper
  применяет их автоматически.

## Что есть в API

- `BytePattern.FromPattern(...)` — сигнатура по точной последовательности байтов.
- `BytePattern.FromTemplate(...)` — шаблонная сигнатура с hex-байтами,
  wildcard-символами и необязательным `^`.
- `BytePattern.FromMaskedPattern(...)` — массив байтов с явной маской `x`/`?`.
- `StringPattern` — слой совместимости для шаблонных сигнатур.
- `MemoryExtensionsForPatterns` — helpers для pattern scan поверх `IMemory`.
- `FindOffset(...)` — возвращает исходный оффсет начала совпадения или `-1`.
- `GetOffset(...)` — возвращает исходный оффсет начала совпадения или вызывает исключение.
- `FindOffsets(...)` — возвращает оффсеты всех запрошенных сигнатур с ключом по pattern.
- `GetOffsets(...)` — то же, что `FindOffsets(...)`, но вызывает исключение, если
  какая-то сигнатура не найдена.
- `PatternOffset` — индекс внутри сигнатуры, отмеченный через `^` в шаблоне.

## Типовые сценарии

- Сканирование модуля:
  - создайте reader процесса;
  - сузьте область через `MemoryOfModule(...)`;
  - создайте `BytePattern` или `StringPattern`;
  - вызовите `FindOffset(...)` / `GetOffset(...)`;
  - добавьте `memory.BaseAddress`, если нужен абсолютный адрес.

- Сканирование RIP-relative инструкции:
  - создайте шаблон с `^` на байтах displacement;
  - используйте helper для одиночного поиска, чтобы получить исходный старт совпадения;
  - вручную добавьте `pattern.PatternOffset`, чтобы перейти к отмеченному полю;
  - декодируйте displacement и вычислите итоговый адрес.

- Сканирование нескольких опорных точек:
  - создайте несколько сигнатур;
  - вызовите `FindOffsets(...)` / `GetOffsets(...)`;
  - прочитайте результат из словаря по экземпляру pattern.

## Поведение для одной и нескольких сигнатур

- `FindOffset(...)` и `GetOffset(...)` возвращают исходный старт совпадения.
- `FindOffsets(...)` и `GetOffsets(...)` возвращают оффсеты, где
  `PatternOffset` уже применён.
- Если вы использовали `^` с helper для одиночного поиска, добавьте
  `pattern.PatternOffset` вручную.

```csharp
using var process = LocalProcess.ByProcessName("pathofexile");
using var memory = process.MemoryOfModule("pathofexile.exe");

var playerPattern = BytePattern.FromTemplate("55 8B ?? ^ EC 00");
var targetPattern = BytePattern.FromTemplate("BB AA ??");

var matchOffset = memory.FindOffset(playerPattern);
var displacementOffset = matchOffset >= 0
    ? matchOffset + playerPattern.PatternOffset
    : -1;

var offsetsByPattern = memory.FindOffsets(playerPattern, targetPattern);

var criticalMatchOffset = memory.GetOffset(playerPattern);
var criticalDisplacementOffset =
    criticalMatchOffset + playerPattern.PatternOffset;
```

## Поддерживаемые форматы сигнатур

- точные массивы байтов
- hex-шаблоны вроде `48 8B ?? 74 0A`
- wildcard-символы `?` / `??`
- шаблоны в стиле C, например `\x48\x8B\xC0`
- маскированные byte pattern с `x` и `?`
- шаблоны с `^` для отметки нужной позиции внутри сигнатуры

## Что лучше использовать

- Лучше сканировать конкретный модуль, а не весь процесс.
- Лучше использовать шаблоны с wildcard-символами вместо хрупких точных сигнатур,
  если часть байтов нестабильна.
- Лучше использовать `Get*` helpers, если отсутствие сигнатуры означает, что
  цель несовместима.
- Лучше использовать сигнатуры как опорные точки перед чтением pointer chain
  или структур.

## Чего лучше избегать

- Не предполагайте, что возвращённый оффсет всегда указывает на позицию `^`.
- Не используйте `FindOffset(...)` для нескольких сигнатур; используйте `FindOffsets(...)`.
- Не сканируйте память всего процесса, если знаете нужный модуль.
- Не используйте слишком короткие сигнатуры: они могут совпасть с посторонним кодом или данными.

## Опорные термины для изучения

- `BytePattern`
- `StringPattern`
- `PatternOffset`
- `FromTemplate`
- `FromMaskedPattern`
- `FindOffset`
- `GetOffset`
- `FindOffsets`
- `GetOffsets`
- `MemoryExtensionsForPatterns`
- `MemoryOfModule`

## Синонимы для поиска

- pattern scan
- signature scan
- byte pattern
- byte signature
- wildcard pattern
- masked pattern
- memory signature
- pattern offset
- caret offset
- `BytePattern`
- `StringPattern`

## Связанные карты

- `processes.md`
- `../../memory-api/pattern-scanning.md`
- `../../memory-api/getting-started.md`