---
title: AI NuGet для FairPlay SDK
description: AI-ориентированная карта для дополнительной инфраструктуры драйвера FairPlay
published: true
date: 2026-05-09T00:00:00.000Z
tags: scripting, api, ai, fairplay, nuget, driver, memory, ai-translated
editor: markdown
dateCreated: 2026-05-09T00:00:00.000Z
---
# Карта API FairPlay SDK

Справочная карта для необязательных API из `EyeAuras.Memory.FairPlaySdk`. Этот SDK даёт загрузку драйвера, низкоуровневую инфраструктуру подключения к устройству и адаптер `FairPlayKDProcess` для встроенного драйвера ядра `FairplayKD.sys`.

## Важное ограничение

`EyeAuras.Memory.FairPlaySdk` загружает драйвер ядра через обычные Windows SCM API. Он не пытается обходить DSE/проверку подписи. Для реальных тестов загрузки драйвера нужны права администратора, совместимый хост, корректная политика подписи/загрузки драйверов и правильная идентичность устройства.

Путь к устройству по умолчанию основан на текущем проходе статического анализа по упакованной базе IDA 9.1: драйвер создаёт `\DosDevices\FairplayKD{instance}` и использует instance `0`, если в реестре нет корректного переопределения.

## Для чего это используют

- Добавить необязательную инфраструктуру драйвера FairPlay в инструмент или тестовый проект.
- Загружать и запускать встроенный драйвер `FairplayKD.sys` через Windows SCM API.
- Открывать устройство FairPlay через `CreateFile`.
- Отправлять сырые запросы `DeviceIoControl`, пока протокол ещё исследуется.
- Оборачивать текущий процесс как `IProcess` и читать закреплённые буферы через команду драйвера FairPlay `0x78`.
- Использовать дескриптор процесса, открытый через FairPlay, для записи, выделения памяти/смены защиты, запуска удалённого потока, manual mapping и APC-хелперов.
- Держать тесты настройки драйвера в `EyeAuras.FridaSdk.Tests`, не закрепляя слишком рано предположения о протоколе.

## Модель

- `EyeAuras.Memory.FairPlaySdk` — это необязательный SDK-пакет.
- `FairPlayDriverManager` напрямую хранит имя службы по умолчанию, устройство, payload, встроенный ресурс и пути runtime-извлечения. Отдельного объекта `FairPlayDriverServiceConfig` нет.
- `FairPlayDriverConnection` владеет открытым дескриптором устройства, даёт доступ к сырому `DeviceIoControl` и представляет команду `0x87` как `OpenProcess`.
- `FairPlayKDProcess` реализует `IFairPlayProcess`, который расширяет `IProcess`, `IProcessControlApi`, `IProcessSupportsManualMapping` и `IProcessSupportsUserApc`.
- Его backend памяти сейчас включает прямое чтение через драйвер только для вызывающего процесса, потому что команда `0x78` пока не подтверждена как универсальное чтение удалённых процессов.
- `FairPlayKDProcess.EnterOpenProcess()` владеет lease со счётчиком ссылок для дескриптора целевого процесса, открытого через команду FairPlay `0x87`; `WithOpenProcess()` держит этот lease активным всё время жизни обёртки.
- Для записи `FairPlayKDProcess` использует `EnterOpenProcess()`, а затем вызывает Win32 `WriteProcessMemory` с этим дескриптором, созданным драйвером. Команда `0x7C` была исследована и ведёт себя как stub с успешным результатом, поэтому её нельзя считать подтверждённым примитивом записи FairplayKD.
- Более глубокий статический проход по командам `0x78..0x8F` обнаружил хелперы чтения/записи файлов и объектов (`0x89`/`0x8A`) и хелперы запроса/записи реестра (`0x8C..0x8F`), но не выявил универсальной команды записи в виртуальную память процесса.
- Упакованный payload встраивается из `Payloads/FairplayKD.sys` в проекте SDK.
- Runtime-копия извлекается в local app data перед созданием или обновлением SCM-службы.
- DTO для команд конкретного протокола и более широкие хелперы удалённого чтения/записи не должны попадать в SDK, пока протокол не понятен.

## Детали API

- `FairPlayDriverManager.DefaultServiceName` — имя SCM-службы по умолчанию, сейчас `FairplayKD`.
- `FairPlayDriverManager.DefaultDevicePath` — Win32-путь к устройству по умолчанию, сейчас `\\.\FairplayKD0`.
- `FairPlayDriverManager.DefaultDriverFileName` — имя упакованного payload, `FairplayKD.sys`.
- `FairPlayDriverManager.Create(loadDriver)` — при необходимости извлекает и запускает встроенную службу драйвера, затем открывает подключение к устройству.
- `IFairPlayDriverManager` — контракт фабрики, который предоставляет имена службы/устройства/payload и `Create(loadDriver)`.
- `FairPlayDriverConnection.Open()` — открывает Win32-путь устройства с правами на чтение и запись.
- `FairPlayDriverConnection.DeviceIoControl(...)` — отправляет сырой IOCTL-запрос.
- `FairPlayDriverConnection.OpenProcess(processId, accessMask)` — открывает дескриптор целевого процесса через команду FairPlay `0x87`.
- `IFairPlayDriverConnection` — контракт подключения к устройству для состояния открытия и сырых вызовов IOCTL, плюс типизированный хелпер `OpenProcess`.
- `FairPlayKDProcess.ByProcessId(processId)` — создаёт `IFairPlayProcess` для уже существующего устройства FairPlay.
- `FairPlayKDProcess.ByProcessName(processName)` — находит локальный процесс по имени и создаёт `IFairPlayProcess`.
- `FairPlayKDProcess.WithLoadDriver(loadDriver)` — создаёт builder и управляет тем, нужно ли загружать встроенный драйвер перед открытием обёртки процесса.
- `FairPlayKDProcess.WithOpenProcess(openProcess)` — создаёт builder и управляет тем, должна ли обёртка процесса держать открытый через FairPlay дескриптор процесса в течение всего своего срока жизни.
- `IFairPlayProcess.EnterOpenProcess()` — открывает дескриптор целевого процесса через команду FairPlay `0x87` и держит его активным, пока не будет освобождён возвращённый lease.
- `IFairPlayProcess` — контракт процесса FairPlay; расширяет базовые `IProcess`, `IProcessControlApi`, `IProcessSupportsManualMapping` и `IProcessSupportsUserApc`.
- `IFairPlayProcess.AllocateMemory(...)`, `FreeMemory(...)`, `ProtectMemory(...)`, `CreateThread(...)`, `ExecuteCode(...)`, `InjectDllViaManualMapping(...)` и `QueueUserApc(...)` используют дескриптор процесса, открытый через FairPlay, вместе с обычными Win32 API процесса/потока.
- `IFairPlayProcessBuilder` — контракт builder для выбора PID/имени процесса и настроек загрузки драйвера/открытия процесса.

## Текущие ограничения

- Вживую подтверждены только команда `1` и форма прямого чтения у команды `0x78`.
- `FairPlayKDProcess.Memory.TryReadMemory(...)` сейчас ограничен вызывающим процессом.
- `FairPlayKDProcess.Memory.TryWriteMemory(...)` использует лениво открываемый через FairPlay дескриптор процесса и Win32 `WriteProcessMemory`; ни одна команда FairplayKD для копирования памяти процесса не подтверждена.
- Пока нельзя считать, что пакет поддерживает универсальное удалённое чтение. Универсальная запись и хелперы управления процессом используют дескриптор процесса, открытый через FairPlay, вместе с обычными Win32 API, а не команды FairplayKD для копирования памяти или управления.
- Остальная часть командного протокола пока статична и предварительна; восстановленные в IDA имена вроде `WriteMemoryToThread` и `ReadMemoryFromProcess` в этом payload уже показали себя как вводящие в заблуждение, поэтому не воспринимайте неподтверждённые ID команд или layout пакетов как публичный контракт, пока это не будет подтверждено живыми трассами `DeviceIoControl`.

## Типовые сценарии

- Открыть уже запущенное устройство FairPlay:
  1. Подключите `EyeAuras.Memory.FairPlaySdk`.
  2. Создайте `new FairPlayDriverManager()`.
  3. Вызовите `Create(loadDriver: false)`.
  4. Используйте `FairPlayDriverConnection.DeviceIoControl(...)` только для уже понятных частей протокола или исследовательской работы.

- Запустить встроенный драйвер и открыть устройство:
  1. Убедитесь, что `Payloads/FairplayKD.sys` присутствует в payload проекта SDK.
  2. Создайте `new FairPlayDriverManager()`.
  3. Вызовите `Create(loadDriver: true)`.
  4. Считайте ошибки SCM, прав, подписи, VBS и политики проблемами настройки окружения.

- Читать закреплённый буфер текущего процесса через `IProcess`:
  1. Подключите `EyeAuras.Memory.FairPlaySdk`.
  2. Закрепите целевой буфер в текущем процессе или иным способом обеспечьте владение им.
  3. Создайте `using var process = FairPlayKDProcess.WithLoadDriver().ByProcessId(Environment.ProcessId)`.
  4. Вызовите `process.Memory.TryReadMemory(address, target)`.
  5. Пока не будет восстановлена настоящая команда драйвера для копирования/записи, считайте запись поведением уровня `OpenProcess` плюс `WriteProcessMemory`.

- Держать дескриптор процесса, открытый через FairPlay, активным между несколькими операциями:
  1. Создайте `using var process = FairPlayKDProcess.WithLoadDriver().WithOpenProcess().ByProcessId(processId)`.
  2. Либо вызовите `using var lease = process.EnterOpenProcess()` вокруг более короткой группы операций.
  3. Пока lease активен, операции записи и вызовы метаданных на основе дескриптора повторно используют этот дескриптор.

## Что предпочтительно

- Держать константы идентичности драйвера в `FairPlayDriverManager`.
- Использовать обычную загрузку через SCM и понятную диагностику ошибок настройки.
- Использовать сырой `DeviceIoControl` только на этапе исследования протокола.
- Добавлять типизированные хелперы только после проверки layout пакетов, семантики статусов и владения ответом.
- Явно документировать, работает ли операция памяти через драйвер или через fallback.
- Для реальных тестов загрузки драйвера использовать `[Category("Integration")]` вместе с `[Explicit]`.

## Чего избегать

- Не добавляйте объект `FairPlayDriverServiceConfig`, пока не появится несколько реальных конфигураций.
- Не выносите догадки о протоколе в публичные API SDK.
- Не заявляйте о поддержке универсального чтения удалённых процессов или записи через драйвер, пока эта семантика не будет разобрана и проверена.
- Не размещайте временные файлы драйвера в каталогах проектов репозитория.
- Не предполагайте, что командная оболочка Xign применима к FairPlay.

## Опорные термины для исследования

- `EyeAuras.Memory.FairPlaySdk`
- `FairPlayDriverManager`
- `IFairPlayDriverManager`
- `FairPlayDriverConnection`
- `IFairPlayDriverConnection`
- `FairPlayKDProcess`
- `IFairPlayProcess`
- `IFairPlayProcessBuilder`
- `FairplayKD.sys`
- `FairplayKD0`
- `CreateFile`
- `DeviceIoControl`
- `SCM driver loading`

## Синонимы для поиска

- FairPlay
- FairplayKD
- FairPlay SDK
- FairPlay driver
- kernel driver
- SCM driver loading
- CreateFile driver
- DeviceIoControl
- packaged driver
- raw IOCTL
- process reader

## Связанные карты

- `memory/processes.md`
- `nuget/xign-sdk.md`
- `nuget/frida-sdk.md`