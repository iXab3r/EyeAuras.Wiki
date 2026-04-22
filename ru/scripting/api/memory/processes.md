---
title: AI Memory — процессы
description: AI-ориентированная карта подключения к процессам и ридеров памяти процесса.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, memory, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта навигации по памяти и процессам

Справочная карта по основным API для чтения процессов, доступа к памяти процесса, pointer chain, pattern scanning, PE-хелперов, модулей, code cave и выбора backend.

Дополнительные readers, завязанные на конкретные пакеты, находятся в `nuget/`.

## Типовые задачи

- Подключиться к процессу и читать/записывать память.
- Выбрать backend: local, native local, kernel-driver или MPFS.
- Подключиться по PID, выбранному через picker окна.
- Получить модули, imports, exports и PE-метаданные.
- Проходить pointer chain.
- Собрать простые обертки entity/object поверх памяти.
- Сканировать byte/string patterns.
- Перечислять регионы памяти и их protections.

## Модель понятий

- `IProcess` — верхнеуровневая абстракция целевого процесса.
- `IProcessMemory` — facade для памяти процесса.
- `IMemoryAccessor` — основной API для чтения и записи.
- `IMemoryBackend` — низкоуровневый backend, который выполняет операции.
- `RemoteMemoryObject` — небольшая базовая helper-модель для объектов, представляющих известный адрес внутри представления `IMemory`.
- `EyeAuras.Memory.Shared` содержит контракты.
- `EyeAuras.Memory` содержит доступ к локальным процессам.
- `EyeAuras.Memory.KD` содержит доступ через kernel-driver.
- `EyeAuras.Memory.MPFS` содержит доступ через MemProcFS / LeechCore / VMM.
- Разные backends не дают одинаковый набор возможностей управления.

## Ключевые API

- `IProcess` — `IsValid`, `ProcessName`, `ProcessId`, `Memory`, `GetProcessModules()`, `GetThreads()`, `VirtualQuery(...)`, `GetMemoryRegions()`.
- `IProcessMemory` — facade памяти процесса.
- `IMemoryAccessor` — типизированное чтение/запись, чтение указателей и pointer-chain.
- `IMemory` — представление памяти, часто ограниченное модулем через `MemoryOfModule(...)`.
- `RemoteMemoryObject` — базовый класс для memory object wrappers, привязанных к адресу.
- `IMemoryBackend` — контракт реализации backend.
- `IProcessControlApi` — allocation, protection, threads, suspend/resume, APC там, где это поддерживается.
- `LocalProcess` — обычный локальный reader в user-mode.
- `NativeLocalProcess` — локальный native backend с настройкой handle/permissions.
- `KDProcess` — reader с доступом через kernel-driver.
- `LCProcess`, `ILCProcessBuilder` — readers для MPFS/LeechCore/VMM.
- `MemoryExtensionsForPatterns`, `BytePattern`, `StringPattern` — signature scanning.
- `MemoryExtensionsForImports`, `MemoryExtensionsForExports`, `ProcessPEExtensions` — PE-хелперы.

## Частые сценарии

- Подключение по выбранному окну:
  - выбрать или получить `IWindowHandle`;
  - прочитать ожидаемый PID из `ProcessId`;
  - создать reader по PID;
  - проверить `IsValid` и `ProcessId`.

- Чтение pointer chain:
  - получить `IMemoryAccessor`;
  - вызвать `ReadPointerChain` или `ReadPointerChain32`;
  - прочитать или записать итоговый адрес.

- Сканирование сигнатуры:
  - создать `BytePattern` или `StringPattern`;
  - использовать pattern extension helpers;
  - по возможности ограничивать поиск модулем или регионом.

- Чтение списка entity:
  - создать `IMemory`, ограниченный модулем;
  - прочитать указатель на entity list и количество entity по известным offset;
  - пройтись по указателям entity;
  - обернуть каждый адрес в небольшой memory object или immutable snapshot;
  - выводить/логировать значения и обрабатывать `null` или устаревшие указатели.

## Что выбирать по умолчанию

- В качестве целевого контракта обычно используйте `IProcess`.
- Для обычного локального доступа обычно выбирайте `LocalProcess`.
- Для настройки native handle/permissions выбирайте `NativeLocalProcess`.
- `KDProcess` стоит использовать только там, где реально ожидается доступ через driver.
- Для acquisition/VMM-сценариев выбирайте `LCProcess` / `ILCProcessBuilder`.
- Для инструментов с возможностью записи желательно сначала проверять PID.

## Чего лучше избегать

- Не начинайте с KD/MPFS, если для этого нет причины в окружении.
- Не предполагайте, что любой backend поддерживает allocation, APC, remote thread, manual mapping или module enumeration.
- Не пишите новый scanner, пока не проверили существующие pattern extensions.

## Опорные точки для исследования

- `IProcess`, `IProcessMemory`, `IMemoryAccessor`, `IMemoryBackend`, `IProcessControlApi`, `LocalProcess`, `NativeLocalProcess`, `KDProcess`, `LCProcess`, `ILCProcessBuilder`, `ReadPointerChain`, `VirtualQuery`, `BytePattern`, `StringPattern`, `MemoryExtensionsForPatterns`, `ProcessPEExtensions`, `MemoryOfModule`, `RemoteMemoryObject`, `ReadString`.

## Ключевые слова для поиска

- memory
- process memory
- process reader
- local process
- native process
- kernel driver
- KD process
- MemProcFS
- LeechCore
- pointer chain
- signature scan
- memory region
- module
- PE
- code cave
- entity list
- memory object
- remote memory object
- radar
- player list

## Связанные карты

- `windows-subsystems/window-handles.md`
- `osd/selection.md`
- `reverse-engineering/reprocess.md`
- `recipes/bot-memory-entity-list-reader.md`