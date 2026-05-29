---
title: AI NuGet для Xign SDK
description: AI-first обзор опциональной инфраструктуры драйвера Xign и XignProcess.
published: true
date: 2026-05-27T00:00:00.000Z
tags: scripting, api, ai, xign, nuget, driver, memory, ai-translated
editor: markdown
dateCreated: 2026-05-03T00:00:00.000Z
---
# Карта API Xign SDK

Справочная карта по дополнительным API `EyeAuras.XignSdk`. Этот SDK дает инфраструктуру для загрузки драйвера и низкоуровневого подключения к упакованному kernel-драйверу Xign, а также описывает уже замапленные операции протокола для прямого доступа к драйверу, памяти процесса, синхронного выполнения кода и сценариев управления процессом через драйвер.

## Важно

`EyeAuras.XignSdk` использует драйвер Xign, также известный как XignCode3. Рассматривайте `XignProcess` как практичный временный backend для контролируемых окружений, а не как универсальную гарантию совместимости. Xign/XignCode3 может конфликтовать с другими kernel-драйверами, anti-cheat-решениями, защитным ПО, Windows Code Integrity/VBS или локальной политикой загрузки драйверов.

Для коммерческих или публичных продуктов, где важна предсказуемая совместимость на машинах пользователей, лучше использовать собственный backend на основе `IProcess`. Memory API позволяет держать такую миграцию локальной: большая часть кода ниже по стеку должна зависеть от `IProcess`, `IProcess.Memory`, control-интерфейсов и helper-ов, поэтому замена `XignProcess` на другой backend процесса обычно сводится к небольшим изменениям в точке создания.

## Основные сценарии использования

- Добавить в скрипт или tool-проект дополнительную инфраструктуру драйвера Xign.
- Загружать и запускать упакованный драйвер Xign через обычные Windows SCM API.
- Открывать устройство Xign через `CreateFile`.
- Загружать драйвер один раз через `XignDriverManager.Load()`, а затем
  открывать прямые подключения к драйверу без создания `XignProcess`.
- Проверять или останавливать сервис драйвера через
  `XignDriverManager.IsLoaded` и `Unload()` для явных lifecycle-сценариев.
- Представлять целевой процесс как `XignProcess`.
- Читать и писать память цели через `XignProcess.Memory`.
- Использовать `XignDriverManager` и `XignDriverConnection` напрямую, если инструменту нужны команды драйвера без обертки в `XignProcess`.
- Выполнять уже размещенную в процессе функцию через `IProcessControlApi.ExecuteCode`.
- Использовать `XignProcess` для allocation/protection/free, manual mapping, создания remote thread, suspend/resume и User APC, если окружение это поддерживает.
- Сохранять документированную фиксированную оболочку команд xhunter1, не раскрывая vulnerability/demo primitives как публичные API SDK.

## Модель

- `EyeAuras.XignSdk` — это дополнительный пакет SDK, а не часть основного memory SDK.
- `XignProcess` реализует `IProcess`, `IProcessControlApi`, `IProcessSupportsManualMapping` и `IProcessSupportsUserApc`, поэтому его можно передавать в API, которые ожидают абстракцию процесса с дополнительными возможностями управления.
- `XignDriverManager` — публичный SCM loader/factory для прямых подключений к драйверу. Он может отдельно загружать упакованный драйвер через `Load()`, показывать running-состояние через `IsLoaded`, останавливать его через `Unload()` или открывать устройство через `Create(...)`.
- `XignDriverConnection` — публичное подключение к устройству, которое владеет оболочкой команд xhunter1, временной init/auth-сессией, response buffer и типизированными helper-методами команд.
- `XignProcess` можно создать через builder/static helper-ы, которые владеют
  открытым ими подключением, или напрямую из caller-owned
  `IXignDriverConnection`, когда tool совмещает сырые команды драйвера с API
  абстракции процесса.
- `XignProcess.Memory` использует подключение к драйверу Xign для чтения и process handle, открытый драйвером, для записи.
- Информационные операции `XignProcess` теперь structure-backed: целевой `_EPROCESS`
  находится по открытому через Xign process handle через
  `SystemExtendedHandleInformation`, а имя процесса, модули, потоки,
  архитектура и VAD-регионы читаются через `_EPROCESS`, PEB, loader list,
  thread list и VAD-структуры.
- Для structure-backed чтений kernel-адреса идут через команду Xign 788, а
  user-mode адреса целевого процесса — через команду 787. Если curated layout
  или нужные структуры недоступны, операция падает явно; fallback на PSAPI,
  Toolhelp или `VirtualQueryEx` не используется.
- `XignProcess` открывает handle процесса через драйвер, а затем использует эти handle для ряда операций управления на базе WinAPI, таких как `VirtualAllocEx`, `VirtualProtectEx`, `WriteProcessMemory`, `CreateRemoteThread` и `NtSuspendProcess`.
- `XignDriverServiceConfig` задает identity по умолчанию для service/device/payload: `xhunter1`, `\\.\xhunter1` и `xhunter1.sys`.
- Файл драйвера ожидается по пути `Payloads/xhunter1.sys` в проекте SDK и встраивается в сборку, если присутствует.
- Загрузка драйвера выполняется только через SCM. Попыток DSE/signature bypass нет.
- Подключение к драйверу использует текущую форму пакета xhunter1: request размером 624 байта, user response buffer с выравниванием 16 байт и поля статуса ответа по смещениям `+12` и `+16`.
- Перед обычными командами подключение инициализирует драйвер и аутентифицирует текущий процесс. Если команда завершается ошибкой, временное состояние сессии сбрасывается и пересобирается при следующей запрошенной операции.

## Детали API

- `IXignProcess` — marker-интерфейс `IProcess`, `IProcessControlApi`, `IProcessSupportsManualMapping` и `IProcessSupportsUserApc` для процесса, работающего через Xign.
- `XignProcess.ByProcessId(processId)` — подключается к PID через builder по умолчанию, не запуская драйвер.
- `XignProcess.ByProcessName(processName)` — находит локальный процесс по имени с `.exe` или без него, затем подключается по PID.
- `XignProcess.WithLoadDriver(loadDriver)` — возвращает `IXignProcessBuilder`, настроенный на создание/запуск сервиса упакованного драйвера перед открытием устройства, если `loadDriver` равно true.
- `XignProcess.WithOpenProcess(openProcess)` — возвращает `IXignProcessBuilder`, настроенный на сохранение открытого драйвером process handle на все время жизни каждого созданного процесса.
- `IXignProcessBuilder` — builder для `ByProcessId`, `ByProcessName` и `WithLoadDriver` / `WithOpenProcess`.
- `XignDriverServiceConfig.Default` — имена service/device/payload по умолчанию.
- `XignDriverManager.IsLoaded` — сообщает, запущен ли сейчас настроенный сервис
  драйвера.
- `XignDriverManager.Load()` — извлекает, регистрирует и запускает упакованный
  драйвер через SCM без создания process wrapper; метод идемпотентен и не
  пытается повторно загружать уже запущенный сервис.
- `XignDriverManager.Unload()` — останавливает настроенный сервис драйвера,
  если он запущен; регистрацию сервиса и извлеченный payload он не удаляет.
- `XignDriverManager.EnsureLoaded()` — compatibility alias для `Load()`.
- `XignDriverManager.Create(loadDriver = false)` — при необходимости загружает
  упакованный драйвер и возвращает открытый `IXignDriverConnection`; если
  `loadDriver` равно false и устройство открыть не удалось, диагностика должна
  подсказывать использовать `XignProcess.WithLoadDriver()`, `Load()` или
  `loadDriver: true`.
- `XignDriverConnection` / `IXignDriverConnection` — прямой API устройства для сырого `Call(command, args)` и типизированных helper-методов, таких как `PingEcho`, `QueryVersionStatus`, `OpenProcess`, `ReadUserMemory`, `ReadMemory` и `ExecuteCodeByProcessId`.
- `new XignProcess(connection, processId, openProcess)` — создает
  `IXignProcess`/`IProcess` wrapper поверх уже открытого caller-owned
  `IXignDriverConnection`; disposal process wrapper не закрывает переданное
  подключение.
- `IXignProcess.Memory` — поддерживает чтение/запись байтов и scalar-значений через подключение Xign и process handle, открытые драйвером.
- `IXignProcess.GetProcessModules()` — читает модули через
  `_EPROCESS -> PEB -> PEB.Ldr.InMemoryOrderModuleList`.
- `IXignProcess.GetThreads()` — читает `_EPROCESS.ThreadListHead` и
  проецирует ETHREAD entries в `ProcessThreadInformation`.
- `IXignProcess.VirtualQuery(address)` и `GetMemoryRegions()` — читают
  `_EPROCESS.VadRoot` и возвращают только allocated VAD-backed ranges.
- `IXignProcess.ProcessName` — берется из PEB process parameters, если они
  доступны, иначе из `_EPROCESS.ImageFileName`.
- `IXignProcess.ExecuteCode(startAddress, parameter)` — синхронно выполняет уже размещенную x64- или x86-функцию в целевом процессе через команду Xign 820 и возвращает значение размером с указатель, которое сообщил драйвер.
- `IXignProcess.AllocateMemory`, `FreeMemory` и `ProtectMemory` — управление виртуальной памятью через WinAPI поверх process handle, открытого драйвером.
- `IXignProcess.CreateRemoteThread`, `SuspendProcess`, `ResumeProcess`, `SuspendThread` и `ResumeThread` — helper-методы управления процессом/потоком, доступные через общую поверхность process-control API.
- `IXignProcess.InjectDllViaManualMapping(...)` — manual mapping через общий `LibraryMapper` с использованием `XignProcess.Memory` и `ExecuteCode`.
- `IXignProcess.QueueUserApc(...)` — helper для User APC через обычный путь `OpenThread` / `QueueUserAPC`.
- `IXignProcess.EnterOpenProcess()` — явный lease, который удерживает открытый драйвером process handle на время пакета операций.
- Бинарные структуры пакетов команд — это внутренние детали реализации, они не экспортируются как публичная поверхность для составления команд.

## Текущие ограничения

- `XignDriverConnection` требует 64-битный host process.
- `QueueUserApc` зависит от обычного доступа к thread handle и поведения alertable wait у целевого потока; это не отдельная замапленная команда Xign.
- Несколько high-level методов управления используют вызовы WinAPI на handle, открытых драйвером, а не отдельные команды Xign для каждой операции.
- Информационные методы зависят от curated Windows kernel layouts. Неподдержанный
  build, поврежденные списки структур, отсутствующий object pointer в handle
  table или невалидные PEB/VAD-данные приводят к exception вместо тихого
  fallback на старые WinAPI-пути.
- VAD enumeration возвращает allocated ranges из VAD tree. Она не синтезирует
  свободные holes в адресном пространстве и не обязана побайтно совпадать с
  выводом `VirtualQueryEx`.
- Сырой `Call(command, args)` существует для прямой диагностики, но packet DTO и структуры аргументов, специфичные для команд, остаются внутренними. Для уже замапленных команд лучше использовать типизированные helper-методы.
- Реальные smoke-тесты загрузки драйвера требуют прав администратора, совместимого host-окружения и настоящего бинарника `Payloads/xhunter1.sys`.

## Типовые сценарии

- Открыть уже запущенное устройство Xign:
  1. Подключите `EyeAuras.XignSdk`.
  2. Вызовите `XignProcess.ByProcessId(pid)` или `ByProcessName(name)`.
  3. Проверьте `IsValid`.
  4. Используйте `Memory.Read<T>`, `Memory.Write<T>`, чтение/запись через span, управление виртуальной памятью, manual mapping или `ExecuteCode`, если host-драйвер совместим.
  5. Если ошибка открытия устройства говорит, что сервис драйвера не загружен, переключите путь создания на `XignProcess.WithLoadDriver()` или прямой `XignDriverManager.Create(loadDriver: true)`.

- Запустить упакованный драйвер и открыть устройство:
  1. Перед упаковкой или ручными тестами добавьте реальный драйвер как `Payloads/xhunter1.sys`.
  2. Вызовите `XignProcess.WithLoadDriver().ByProcessId(pid)`.
  3. Обрабатывайте ошибки SCM, прав, подписи, VBS и policy как проблемы настройки окружения.

- Выполнить уже размещенный код:
  1. Разместите в адресном пространстве целевого процесса x64- или x86-функцию.
  2. Вызовите `((IProcessControlApi)xignProcess).ExecuteCode(startAddress, parameter)` или `xignProcess.ExecuteCode(startAddress, parameter)`.
  3. Рассматривайте возвращаемый `ulong` как сырое return value размером с указатель, полученное от backend-а.

- Замапить DLL через manual mapping:
  1. Создайте `XignProcess`, обычно с `WithLoadDriver().WithOpenProcess()` для integration-style сценариев.
  2. Вызовите `InjectDllViaManualMapping(pathOrBytes)`.
  3. Architecture и process directory берутся из того же `_EPROCESS`/PEB-backed
     информационного пути, что и module enumeration.
  4. При необходимости используйте возвращаемый `ManualMappedLibraryDescriptor`, чтобы посмотреть base address и entry point.

- Использовать прямые команды драйвера:
  1. Создайте `new XignDriverManager(XignDriverServiceConfig.Default)`.
  2. Проверьте `IsLoaded`, если tool должен показать текущее состояние сервиса.
  3. Вызовите `Load()`, если tool должен стартовать упакованный
     драйвер, или пропустите этот шаг, если драйвер уже запущен.
  4. Вызовите `Create()`, чтобы открыть `IXignDriverConnection`.
  5. Используйте типизированные helper-методы команд. `ReadUserMemory` — это команда 787 с handle процесса; `ReadMemory` — команда 788 и копирует байты через путь драйвера, ограниченный `MmIsAddressValid`.
  6. Если этому же tool нужен `IProcess`, создайте
     `new XignProcess(connection, pid, openProcess: true)` и удерживайте
     подключение живым на все время жизни wrapper-а.
  7. Вызывайте `Unload()` только когда tool владеет lifetime-ом драйвера и
     действительно должен остановить сервис.

## Когда это предпочтительно

- Используйте `XignProcess` только тогда, когда наличие драйвера Xign ожидаемо.
- Предпочитайте обычную загрузку через SCM и понятную диагностику ошибок настройки драйвера.
- Предпочитайте high-level API `IProcess.Memory` и `IProcessControlApi.ExecuteCode`, а не публичное раскрытие ID команд.
- Для пакетов операций с памятью и управлением лучше использовать `WithOpenProcess()` или `EnterOpenProcess()`.
- Рассматривайте `GetProcessModules`, `GetThreads`, `VirtualQuery` и
  `GetMemoryRegions` как fail-fast structure-backed операции.
- Для downstream API, которые могут жить с разницей в возможностях конкретных backend-ов, лучше опираться на `IProcess`.

## Чего стоит избегать

- Не рассматривайте Xign как backend уровня KD/DBK; у него своя identity service/device.
- Не позиционируйте Xign/XignCode3 как бесконфликтную инфраструктуру для публичных пользовательских машин.
- Не добавляйте в XignSdk поведение, связанное с DSE bypass.
- Не размещайте временные файлы драйвера в директориях проектов репозитория.
- Не предполагайте, что каждая доступная операция управления процессом — это отдельная команда драйвера; часть операций идет через WinAPI поверх handle, открытых драйвером.
- Не ожидайте, что мигрированные информационные методы будут fallback-иться на
  PSAPI, Toolhelp или `VirtualQueryEx`.

## Опорные термины для поиска

- `EyeAuras.XignSdk`
- `IXignProcess`
- `XignProcess`
- `IXignProcessBuilder`
- `XignDriverServiceConfig`
- `XignDriverManager`
- `XignDriverConnection`
- `IXignDriverConnection`
- `IProcess`
- `IMemoryBackend`
- `IProcessControlApi`
- `IProcessSupportsManualMapping`
- `IProcessSupportsUserApc`
- `ExecuteCode`
- `InjectDllViaManualMapping`
- `EnterOpenProcess`
- `ReadMemory`
- `ReadUserMemory`
- `CreateFile`
- `WriteFile`
- `xhunter1`
- `\\.\xhunter1`
- `xhunter1.sys`

## Синонимы для поиска

- Xign
- XignSdk
- XignProcess
- Xign driver
- driver service
- kernel driver
- SCM driver loading
- CreateFile driver
- WriteFile driver
- packaged driver
- process reader

## Связанные карты

- `memory/processes.md`
- `nuget/frida-sdk.md`
