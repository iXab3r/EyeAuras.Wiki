---
title: AI Memory — процессы
description: AI-ориентированная карта API для подключения к процессам и ридеров памяти процессов.
published: true
date: 2026-05-03T00:00:00.000Z
tags: scripting, api, ai, memory, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта памяти и обнаружения процессов

Справочная карта по основным средствам чтения процессов, доступу к памяти процесса, pointer chain, pattern scanning, PE-хелперам, модулям, code cave и выбору backend.

Читатели из опциональных пакетов вынесены в `nuget/`.

## Типовые задачи

- Подключиться к процессу и читать/записывать память.
- Выбрать backend `local`, `native local`, `kernel-driver` или `MPFS`.
- Подключиться по PID, выбранному через window picker.
- Получать модули, imports, exports и PE-метаданные.
- Проходить pointer chain.
- Получать адрес TEB по живому локальному thread id или thread handle.
- Перечислять процессы через kernel `_EPROCESS` list, если backend умеет читать kernel virtual memory.
- Строить простые entity/object-обёртки поверх памяти.
- Сканировать byte/string patterns.
- Перечислять memory regions и их protections.

## Модель понятий

- `IProcess` — верхнеуровневая абстракция целевого процесса.
- `IProcessMemory` — facade для памяти процесса.
- `IMemoryAccessor` — практический API для чтения и записи.
- `IMemoryBackend` — выполняет низкоуровневые операции.
- `RemoteMemoryObject` — небольшая базовая обёртка для объектов, которые представляют известный адрес внутри `IMemory` view.
- `EyeAuras.Memory.Shared` содержит контракты.
- `EyeAuras.Memory` содержит доступ к локальному процессу.
- `EyeAuras.Memory.KD` содержит доступ через kernel driver.
- `EyeAuras.Memory.MPFS` содержит доступ через MemProcFS / LeechCore / VMM.
- У разных backend разные возможности управления процессом.

## Детали API

- `IProcess` — `IsValid`, `ProcessName`, `ProcessId`, `Memory`,
  `GetProcessModules()`, `GetThreads()`, `VirtualQuery(...)`,
  `GetMemoryRegions()`.
- `IProcessMemory` — facade памяти процесса.
- `IMemoryAccessor` — типизированные чтение/запись, чтение pointers и pointer chain.
- `IMemory` — view памяти, часто ограниченное модулем через `MemoryOfModule(...)`.
- `RemoteMemoryObject` — базовый класс для memory object-обёрток, привязанных к адресу.
- `IMemoryBackend` — контракт реализации backend.
- `IProcessControlApi` — allocation, protection, `CreateThread`,
  синхронный `ExecuteCode`, suspend/resume, APC там, где это поддерживается.
- `IProcessSupportsManualMapping` — opt-in marker для backend, которые умеют подготавливать и синхронно выполнять manual mapping code через `IProcess` и `IProcessControlApi`.
- `LocalProcess` — обычный локальный user-mode reader.
- `NativeLocalProcess` — native local backend с настройкой прав и handle.
- `KDProcess` — reader через kernel driver.
- `LCProcess`, `ILCProcessBuilder` — readers на базе MPFS/LeechCore/VMM.
- `MemoryExtensionsForPatterns`, `BytePattern`, `StringPattern` — signature scanning.
- `MemoryExtensionsForCodeCaves`, `CodeCaveEntry` — перечисление code cave в рамках модуля; по умолчанию сканируются readable executable sections, а последовательности `0x00`, `0xCC` и `0x90` считаются допустимым заполнением cave.
- `MemoryExtensionsForImports`, `MemoryExtensionsForExports`,
  `ProcessPEExtensions` — PE-хелперы.
- `MemoryExtensionsForEprocess` — backend-neutral helpers для чтения высокоуровневой информации о процессе и модулях из `_EPROCESS`, PEB и loader-list records через любой `IMemoryReader`, который умеет читать нужную virtual memory.
- `MemoryExtensionsForTebPeb` — backend-neutral helpers для чтения адреса PEB из TEB, загруженных модулей из PEB loader lists и параметров запуска процесса из `RTL_USER_PROCESS_PARAMETERS` через любой `IMemoryReader`, который умеет читать целевое user-mode address space. Также содержит хелперы для запроса TEB по живой локальной OS thread-to-TEB схеме в сценариях, где старт идёт от Windows thread id или handle.
- `ReadProcessInformation` — читает PID и image-name по адресу `_EPROCESS`, не раскрывая сырые kernel structures.
- `ReadProcessModulesViaEprocess` — читает загруженные модули через PEB, на который ссылается `_EPROCESS`, и возвращает `ProcessModuleInformation`.
- `ReadTebAddressViaThreadHandle` — запрашивает у живой локальной OS значение `ThreadBasicInformation.TebBaseAddress` по уже открытому thread handle.
- `ReadTebAddressViaThreadId` — открывает живой локальный Windows thread по id, получает его TEB address и закрывает временный handle.
- `ReadPebAddressViaTeb` — читает `TEB.ProcessEnvironmentBlock` по переданному адресу TEB и явно указанной архитектуре цели.
- `ReadProcessModulesViaPeb` — читает загруженные модули по переданному адресу PEB и явно указанной архитектуре цели.
- `ReadProcessModulesViaTeb` — объединяет чтение TEB-to-PEB и обход PEB loader-list.
- `ReadProcessParametersViaPeb` — читает command-line, image-path,
  current-directory, desktop/window metadata и environment pointer по переданному адресу PEB.
- `ReadProcessParametersViaTeb` — объединяет чтение TEB-to-PEB и чтение `RTL_USER_PROCESS_PARAMETERS`.
- `ReadArchitectureViaEprocess` — читает архитектуру процесса из полей kernel structure; это лучший путь, если backend умеет читать `_EPROCESS.WoW64Process`.
- `ReadArchitectureViaTeb` — читает архитектуру процесса через self pointer в TEB; это предпочтительный user-mode путь, когда адрес TEB уже известен.
- `ReadArchitectureViaPeb` — читает архитектуру через `PEB.ImageBaseAddress` и тип machine у PE в памяти; используйте этот путь, когда известен только адрес PEB.

## Частые сценарии

- Подключение по выбранному окну:
  - получить или принять `IWindowHandle`;
  - прочитать ожидаемый PID из `ProcessId`;
  - создать reader по PID;
  - проверить `IsValid` и `ProcessId`.

- Чтение pointer chain:
  - получить `IMemoryAccessor`;
  - вызвать `ReadPointerChain` или `ReadPointerChain32`;
  - читать или записывать финальный адрес.

- Сканирование сигнатуры:
  - создать `BytePattern` или `StringPattern`;
  - использовать pattern extension helpers;
  - по возможности ограничивать поиск модулем или region.

- Поиск code cave:
  - создать module-scoped memory через `MemoryOfModule(...)`;
  - вызвать `EnumerateCodeCaves(minBytes, alignment)` для executable caves;
  - передать `sectionFilter` и `acceptedFillBytes`, если cave нужен для размещения данных или допустим только конкретный байт заполнения;
  - для скалярного состояния рядом с внедрённым кодом используйте `Read<T>` и `Write<T>`; запись byte-span оставляйте для machine-code payload или закодированных строк.

- Чтение entity list:
  - создать module-scoped `IMemory`;
  - прочитать pointer на список сущностей и количество сущностей по известным offsets;
  - пройтись по указателям сущностей;
  - обернуть каждый адрес в небольшой memory object или immutable snapshot;
  - выводить/логировать значения и обрабатывать `null` или устаревшие pointers.

- Перечисление процессов из kernel memory:
  - использовать backend, который умеет читать kernel virtual addresses, например `KDProcess` или reader на базе VMM/MPFS. Источником памяти может быть другая машина, dump или live VMM acquisition.
  - получить корректный адрес `_EPROCESS` из backend/driver/acquisition;
  - вызвать `ReadProcessesViaEprocess(eprocessAddress)`;
  - вызвать `ReadProcessInformation(eprocessAddress)` для snapshot одного процесса;
  - вызвать `ReadProcessModulesViaEprocess(eprocessAddress)` для данных о модулях, если backend также умеет читать user-mode address space целевого процесса;
  - вызвать `ReadArchitectureViaEprocess(eprocessAddress)`, если архитектуру нужно определить через `_EPROCESS.WoW64Process`;
  - передать source OS build, если он отличается от текущего host; текущая реализация всё ещё чувствительна к layout, пока resolver offsets по PDB не заменит захардкоженные offsets для `_EPROCESS`, PEB и loader-list.

- Перечисление модулей из user-mode memory без OS snapshot API:
  - использовать backend, который умеет читать address space целевого процесса;
  - получить корректный адрес TEB или PEB из backend, thread metadata или другого надёжного способа обнаружения;
  - для живых локальных window/hook сценариев определить owner thread id и вызвать `ReadTebAddressViaThreadId`; если подходящий thread handle уже открыт, используйте `ReadTebAddressViaThreadHandle`;
  - вызвать `ReadPebAddressViaTeb(tebAddress, architecture)`, если старт идёт от TEB;
  - сначала вызвать `ReadArchitectureViaTeb(tebAddress)`, если архитектура неизвестна, а адрес TEB считается надёжным;
  - вызвать `ReadArchitectureViaPeb(pebAddress)`, если архитектура неизвестна и надёжен только адрес PEB;
  - вызвать `ReadProcessModulesViaPeb(pebAddress, architecture)` или `ReadProcessModulesViaTeb(tebAddress, architecture)` для получения модулей;
  - вызвать `ReadProcessParametersViaPeb(pebAddress, architecture)` или `ReadProcessParametersViaTeb(tebAddress, architecture)` для получения startup metadata, например image path, command line и current directory;
  - явно передавать архитектуру target layout; это особенно важно для WOW64 и acquired-memory сценариев.

- Manual map DLL в совместимую цель:
  - нужен `IProcess`, который также реализует `IProcessSupportsManualMapping`;
  - из совместимых локальных backend подходят `LocalProcess` и `NativeLocalProcess`;
  - backend из опциональных пакетов тоже могут поддерживать это; `WHProcess` поддерживает x64 GUI targets, если доступны его WH control prerequisites;
  - используйте `InjectDllViaManualMapping(...)`; mapper опирается на `IProcessControlApi.ExecuteCode(...)`, чтобы дождаться синхронного завершения перед чтением return buffers mapper и освобождением shellcode;
  - не используйте `CreateThread(...)` как примитив ожидания завершения; это асинхронная fire-and-forget surface для запуска thread.

## Что предпочитать

- Предпочитайте `IProcess` как основной контракт цели.
- Предпочитайте `LocalProcess` для обычного локального доступа.
- Предпочитайте `NativeLocalProcess`, если нужна тонкая настройка native handle и permission.
- Предпочитайте `KDProcess` только когда действительно нужен доступ через driver.
- Предпочитайте `LCProcess` / `ILCProcessBuilder` для acquisition/VMM-сценариев.
- Перед инструментами с возможностью записи предпочитайте проверку PID.
- Для kernel/private structures предпочитайте явные versioned layout structs: объявляйте логические поля как auto-properties с `[field: FieldOffset(...)]`, маршрутизируйте доступ через небольшой типизированный интерфейс и держите типизированные static offsets для арифметики list/link pointers.
- При работе с TEB/PEB helpers предпочитайте явно передавать архитектуру цели. Источник памяти может не совпадать с архитектурой текущего процесса.
- Для живых локальных Windows user-mode сценариев, где уже известен thread id или handle, предпочитайте `ReadTebAddressViaThreadId` или `ReadTebAddressViaThreadHandle`, а затем проверяйте результат через `ReadArchitectureViaTeb`.
- Для unmanaged scalar/struct значений в памяти процесса предпочитайте `IMemoryAccessor.Read<T>` и `IMemoryAccessor.Write<T>`. Byte arrays/spans используйте для реальных byte payload, например machine code, строк, file/protocol layouts или bulk buffers.
- Перед тем как писать свой локальный scanner для code cave, сначала попробуйте `MemoryOfModule(...).EnumerateCodeCaves(...)`.

## Чего избегать

- Не начинайте с KD/MPFS без реальной необходимости в окружении.
- Не предполагайте, что каждый backend поддерживает allocation, APC, remote thread, synchronous execution, manual mapping или module enumeration.
- Не стройте manual mapping напрямую на `CreateThread(...)`; используйте `IProcessControlApi.ExecuteCode(...)` или backend с `IProcessSupportsManualMapping`.
- Не используйте `ReadProcessesViaEprocess` на обычной user-mode памяти процесса; он ожидает kernel virtual addresses и подходящие layout Windows kernel.
- Не завязывайтесь на сырые snapshots `_EPROCESS`, PEB или loader-list из public API. Общие helpers специально возвращают `ProcessInformation`, `ProcessModuleInformation` и `Architecture`; если нужен сырой layout, низкоуровневые readers могут определить собственные struct.
- Не определяйте layout TEB или PEB по bitness host-процесса. Передавайте архитектуру layout, которая соответствует переданному адресу TEB/PEB.
- Не используйте thread-to-TEB OS query helpers для dump, VMM/KD snapshots или cross-machine memory sources. Для этого нужны thread metadata от backend или обход kernel thread-list.
- Не используйте string/reflection-based lookup offsets для layout, которые могут поставляться через obfuscation. Не полагайтесь на `Marshal.OffsetOf<T>(nameof(...))`, имена backing-field у auto-properties или строки с именами членов для pointer math в obfuscated assemblies; храните нужные offsets как типизированные static members рядом с соответствующими объявлениями `[field: FieldOffset(...)]`.
- Не пишите новый scanner, не проверив сначала pattern extensions.
- Не используйте `BinaryPrimitives`, `MemoryMarshal` или ручную упаковку байтов как тонкую обёртку над обычными scalar reads/writes в памяти процесса. Оставляйте эти API для явной работы с byte format.

## Ключевые API для поиска

- `IProcess`, `IProcessMemory`, `IMemoryAccessor`, `IMemoryBackend`,
  `IProcessControlApi`, `IProcessControlApi.ExecuteCode`,
  `IProcessSupportsManualMapping`, `LocalProcess`, `NativeLocalProcess`, `KDProcess`,
  `LCProcess`, `ILCProcessBuilder`, `ReadPointerChain`, `VirtualQuery`,
  `BytePattern`, `StringPattern`, `MemoryExtensionsForPatterns`,
  `ProcessPEExtensions`, `MemoryExtensionsForEprocess`,
  `MemoryExtensionsForTebPeb`, `ReadPebAddressViaTeb`,
  `ReadProcessModulesViaPeb`, `ReadProcessModulesViaTeb`,
  `ReadProcessParametersViaPeb`, `ReadProcessParametersViaTeb`,
  `ReadTebAddressViaThreadHandle`, `ReadTebAddressViaThreadId`,
  `ReadProcessesViaEprocess`, `ReadProcessInformation`,
  `ReadProcessModulesViaEprocess`, `ReadArchitectureViaEprocess`,
  `ReadArchitectureViaTeb`, `ReadArchitectureViaPeb`,
  `MemoryExtensionsForCodeCaves`, `EnumerateCodeCaves`, `CodeCaveEntry`,
  `ModuleSectionEntry`, `MemoryOfModule`, `RemoteMemoryObject`, `ReadString`.

## Синонимы для поиска

- memory
- process memory
- process reader
- local process
- native process
- kernel driver
- KD process
- EPROCESS
- ActiveProcessLinks
- WoW64Process
- ReadArchitectureViaEprocess
- ReadArchitectureViaTeb
- ReadArchitectureViaPeb
- ReadTebAddressViaThreadHandle
- ReadTebAddressViaThreadId
- TebBaseAddress
- ThreadBasicInformation
- ReadProcessInformation
- ReadProcessesViaEprocess
- ReadProcessModulesViaEprocess
- ReadPebAddressViaTeb
- ReadProcessModulesViaPeb
- ReadProcessModulesViaTeb
- ReadProcessParametersViaPeb
- ReadProcessParametersViaTeb
- TEB
- PEB
- ProcessEnvironmentBlock
- RTL_USER_PROCESS_PARAMETERS
- process parameters
- command line
- PEB_LDR_DATA
- LDR_DATA_TABLE_ENTRY
- process list
- kernel process list
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
- manual mapping
- ExecuteCode
- IProcessSupportsManualMapping
- radar
- player list

## Связанные карты

- `pattern-scanning.md`
- `windows-subsystems/window-handles.md`
- `osd/selection.md`
- `reverse-engineering/reprocess.md`
- `recipes/bot-memory-entity-list-reader.md`