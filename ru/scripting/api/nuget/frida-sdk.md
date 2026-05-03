---
title: AI NuGet для Frida SDK
description: AI-карта по дополнительным пакетам для инструментирования через Frida, ридерам процессов на базе Frida и нативным ридерам процессов CAgent.
published: true
date: 2026-05-03T00:00:00.000Z
tags: scripting, api, ai, frida, nuget, memory, cagent, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта Frida SDK

Справочная карта по необязательным API `EyeAuras.FridaSdk`: устройства Frida, сессии, скрипты, payload'ы Frida Gadget, адаптеры `IProcess` поверх Frida и нативные named-pipe readers процессов через CAgent.

## Что такое Frida

- Frida — это toolkit для динамической инструментации.
- Хост подключается к целевому процессу или к Frida Gadget.
- Frida выполняет JavaScript внутри целевого процесса.
- Этот JavaScript может проверять модули, хукать нативные функции, читать и писать память, вызывать нативные exports и обмениваться данными с хостом через сообщения или RPC.
- Основные сущности Frida: device, process, session, script, message, RPC и Gadget.

## Что дает этот SDK

- Это необязательный слой NuGet/package. Не считайте, что он входит в базовый scripting SDK.
- Ссылка на пакет позволяет компилировать типы Frida SDK, а `FridaContainerExtensions` делает сервисы Frida SDK доступными из script container.
- Управляемая точка входа Frida для устройств, процессов, сессий и скриптов.
- Обертки для Frida scripts с `Load`/`Unload`, RPC, потоками сообщений, поддержкой debugger и живой перезагрузкой скриптов.
- Встроенный Frida agent script, который отдает операции с процессом и памятью через RPC.
- `FridaAgentProcess` — адаптер `IProcess` поверх уже существующей Frida session.
- Вспомогательные бинарники Frida Gadget находятся в семействе Frida binaries.
- Байты нативной DLL CAgent и managed-клиенты находятся рядом с Frida SDK, но CAgent — это отдельный нативный reader процесса через named pipe, а не Frida script/session.
- `WHProcess` — экспериментальный backend `IProcess` для x64 GUI-процессов, который использует Windows hook transport для чтения/записи памяти с низкими правами и небольших операций удаленного управления.

## Обязательная настройка

Для script mini-apps у `EyeAuras.FridaSdk` есть два обязательных шага настройки, если вы используете сервисы Frida SDK:

1. Подключите пакет: `EyeAuras.FridaSdk`.
2. Добавьте container extension до получения сервисов Frida:

```csharp
AddNewExtension<FridaContainerExtensions>();

var frida = GetService<IFridaExperimentalApi>();
```

Не считайте, что `IFridaExperimentalApi` или Frida binary helpers автоматически доступны из DI только потому, что пакет компилируется. Без `FridaContainerExtensions` получение сервиса может завершиться ошибкой или вернуть неполную конфигурацию хоста.

`CAgentProcess.ByProcessId(...)` — это статическая фабрика process-reader'ов из того же пакета, но если скрипт также получает сервисы Frida SDK, `FridaContainerExtensions` все равно нужно добавить заранее.

## Разделение по слоям

| Слой | Для чего использовать | Основные API |
| --- | --- | --- |
| Frida session/script | Инструментация, хуки, свой JavaScript внутри целевого процесса | `IFridaExperimentalApi`, `IFridaSession`, `IFridaScript`, `IFridaLiveScript` |
| Frida Gadget | Подключение к внедренному или встроенному runtime Frida по локальному порту | `FridaSdkBinaries`, `AttachByLocalPort` |
| Process reader на базе Frida | Использовать Frida session как `IProcess` для memory/reverse-engineering инструментов | `FridaAgentProcess`, `FridaAgentRpcType`, `FridaMemoryBackend` |
| CAgent process reader | Использовать нативную DLL + named-pipe RPC для операций с памятью и управлением процессом | `CAgentProcess`, `ICAgentProcess`, `IProcessControlApi` |
| WH process reader | Использовать GUI window thread и Windows hook transport для экспериментальных low-permission probes памяти/процесса и x64 manual mapping | `WHProcess`, `WHProcess.ByWindowHandle`, `WHProcess.ExecuteCode`, `IProcessSupportsManualMapping` |

## Типовые задачи

- Добавить необязательную поддержку Frida в mini-app.
- Получить список устройств Frida или процессов.
- Подключиться к локальному процессу по PID или имени.
- Подключиться к Frida Gadget по локальному порту.
- Загрузить JavaScript Frida script и получать из него сообщения.
- Перезагружать Frida script во время редактирования.
- Завернуть существующую Frida session в `IProcess`.
- Подключиться к уже загруженному нативному endpoint CAgent.
- Подключиться к x64 GUI-процессу через `WHProcess`.
- Выполнить manual mapping x64 CAgent payload через `WHProcess`, если цель соответствует требованиям WH control.
- Выбрать между транспортом Frida RPC и named-pipe RPC.
- Понять, нужна ли задаче именно инструментация Frida или достаточно обычного process reader.

## API Frida

- `IFridaExperimentalApi` — управляемая точка входа для операций Frida.
- `FridaExperimentalApi` — реализация по умолчанию.
- `GetDevices()` — список доступных устройств Frida.
- `GetLocalDevice()` — получить локальное устройство Frida.
- `GetLocalProcesses()` — список локальных процессов, видимых Frida.
- `GetRemoteDevice(...)` — подключиться к удаленному серверу/устройству Frida.
- `AttachByLocalProcessId(...)` — прикрепить Frida session к локальному процессу.
- `AttachByLocalProcessName(...)` — найти и подключиться по имени процесса.
- `AttachByLocalPort(...)` — подключиться к Frida Gadget/server на локальном порту.
- `IFridaDevice` — абстракция устройства Frida.
- `IFridaProcess` — информация о процессе, видимом Frida.
- `IFridaSession` — сессия подключенного процесса, владеет скриптами, при `Dispose` отключается.
- `IFridaScript` — загруженный Frida JavaScript с `Load`, `Unload`, `Post`, `PostWithData`, `Rpc`, `Rpc<T>`, `Eternalize`, debugger controls и observables сообщений.
- `IBasicFridaScript` — упрощенная поверхность script API, используемая agent wrappers.
- `IFridaLiveScript` — script, привязанный к файлу или observable, который перезагружается при изменении содержимого.
- `FridaContainerExtensions` — необязательная DI/container-регистрация для SDK.

## Frida Gadget и бинарники

- `FridaSdkBinaries` предоставляет встроенные байты DLL Frida Gadget.
- `GetLibraryForX86(...)`, `GetLibraryForX64(...)` — полные payload'ы Gadget.
- `GetSlimLibraryForX86(...)`, `GetSlimLibraryForX64(...)` — облегченные payload'ы.
- Patch helpers могут менять стандартный порт Gadget до загрузки payload'а.
- После запуска Gadget подключайтесь через `AttachByLocalPort(...)`.
- Frida Gadget — это runtime payload Frida. Это не CAgent.

## IProcess на базе Frida

- `FridaAgentProcess.BySession(...)` адаптирует существующую `IFridaSession` к `IProcess`.
- Он загружает встроенный Frida agent script в целевой процесс.
- Он предоставляет id/имя процесса, модули, потоки, регионы памяти и memory backend.
- `FridaMemoryBackend` выполняет чтение и запись через agent RPC.
- `FridaAgentRpcType` выбирает транспорт:
  - `Default` / `Frida` — встроенный RPC Frida.
  - `NamedPipeAsServer` / `NamedPipeAsClient` — managed/TypeScript named-pipe bridge вокруг Frida agent script.
  - `NativeNamedPipeAsClient` / `NativeCompositeNamedPipeAsClient` — client-режимы named pipe в нативном стиле.
- Этот слой подходит, когда Frida session уже существует, а следующему API нужен `IProcess`.

## API CAgent

- CAgent — это нативная DLL/payload, которая работает внутри целевого процесса.
- CAgent поднимает named-pipe RPC server, имя которого формируется из id целевого процесса.
- Обычный шаблон имени pipe: `EAF_RPC_C_{pid}`.
- `CAgentProcess.ByProcessId(processId, composite = false)` подключается к этому endpoint.
- `CAgentProcess.ByPipeName(pipeName, composite = false)` подключается по явному имени pipe.
- `CAgentProcess` реализует `ICAgentProcess`, `IProcess` и операции управления процессом.
- `IFridaExperimentalApi.GetCAgentLibraryForX64()` и `GetCAgentLibraryForX86()` возвращают встроенные байты DLL CAgent.
- CAgent поддерживает id/имя процесса, модули, потоки, регионы памяти, чтение/запись памяти, `allocation/free`, `LoadLibrary`, `FreeLibrary`, создание remote thread и дублирование handle'ов.
- Некоторые методы управления процессом намеренно не поддерживаются или не реализованы. Перед использованием проверяйте конкретный метод, если вам важно поведение suspend/resume.
- CAgent полезен, когда нативный endpoint уже загружен или когда mini-app явно управляет загрузкой нативного агента.

## Проекты семейства CAgent

- `EyeAuras.FridaSdk.CAgent` — нативная C++ DLL, которая предоставляет named-pipe RPC.
- `EyeAuras.FridaSdk.CAgent.Trampoline` — вспомогательные нативные payload'ы для loader/trampoline/proxy.
- `EyeAuras.FridaSdk.SimpleAgent` — простой нативный agent/sample/test project.
- Эти проекты относятся к структуре репозитория SDK, но это не то же самое, что Frida sessions или Frida JavaScript scripts.

## API WHProcess

- `WHProcess.ByWindowHandle(hwnd)` — основной способ подключения. Требует x64 GUI-цель с рабочим window thread.
- `WHProcess.ByProcessId(pid)` и `WHProcess.ByThreadId(tid)` — вспомогательные discovery wrappers, которые по возможности переходят к window handle.
- `WHProcess` реализует `IProcess` для чтения/записи памяти, модулей, потоков и перечисления регионов памяти.
- `WHProcess.ExecuteCode(startAddress, parameter)` синхронно вызывает уже подготовленный указатель на x64-код в выбранном GUI thread и передает `parameter` через `RCX`. Используйте только для очень маленьких процедур, которые сразу завершаются.
- `IProcessControlApi` в `WHProcess` поддерживает базовые примитивы управления: выделение памяти, изменение protection, освобождение и `CreateThread`, если WH transport может занять уже существующую RWX trampoline page.
- `WHProcess` реализует `IProcessSupportsManualMapping` для x64-целей. WH manual mapping использует `IProcessControlApi.ExecuteCode(...)` для синхронного выполнения mapper'а и по-прежнему требует тех же условий WH control, включая доступную существующую RWX trampoline page.

## Частые сценарии

### Подключиться и запустить Frida script

1. Убедитесь, что доступен необязательный пакет/reference Frida SDK.
2. Добавьте `FridaContainerExtensions`.
3. Создайте или получите `IFridaExperimentalApi`.
4. Подключитесь через `AttachByLocalProcessId`, `AttachByLocalProcessName` или `AttachByLocalPort`.
5. Создайте script из исходника или файла.
6. Подпишитесь на потоки логов, ошибок и сообщений.
7. Загрузите script.
8. При остановке mini-app выгрузите его или вызовите `Dispose`.

### Использовать Frida session как IProcess

1. Подключите Frida session.
2. Создайте `FridaAgentProcess.BySession(session, rpcType)`.
3. Проверьте `ProcessId` и `IsValid`.
4. Передайте этот `IProcess` в код памяти, ReProcess или reverse-engineering UI.

### Использовать Frida Gadget

1. Загрузите или внедрите байты Frida Gadget для нужной архитектуры цели.
2. Используйте известный или пропатченный локальный порт.
3. Подключитесь через `AttachByLocalPort(port)`.
4. Дальше работайте с результатом как с обычной Frida session.

### Использовать CAgent process reader

1. Убедитесь, что доступен необязательный пакет/reference Frida SDK.
2. Добавьте `FridaContainerExtensions`, если скрипт получает `IFridaExperimentalApi`, чтобы взять байты DLL CAgent или другие сервисы SDK.
3. Загрузите или внедрите подходящие байты DLL CAgent в целевой процесс.
4. Подключитесь через `CAgentProcess.ByProcessId(pid)` или `ByPipeName(...)`.
5. Проверьте, что возвращаемый `ProcessId` совпадает с ожидаемым процессом.
6. Используйте полученную поверхность `IProcess`/`IProcessControlApi`.

### Выполнить manual mapping CAgent через WHProcess

1. Подключитесь к x64 GUI-цели через `WHProcess.ByWindowHandle(...)`, `ByProcessId(...)` или `ByThreadId(...)`.
2. Убедитесь, что цель соответствует требованиям WH control, особенно что у `WHProcess` есть доступ к существующей RWX trampoline page.
3. Получите подходящие x64-байты CAgent через `IFridaExperimentalApi.GetCAgentLibraryForX64()`.
4. Вызовите `WHProcess.InjectDllViaManualMapping(bytes)`.
5. Подключитесь через `CAgentProcess.ByProcessId(pid)` и проверьте возвращаемые PID и имя процесса.

## Что лучше использовать

- В скриптах начинайте настройку Frida SDK с `AddNewExtension<FridaContainerExtensions>()`.
- Для инструментации, хуков и кастомного JS предпочитайте Frida session/script API.
- Используйте `FridaAgentProcess`, если Frida session уже есть, а следующему API нужен `IProcess`.
- Используйте CAgent только если известно, что совместимый нативный endpoint уже загружен, или если mini-app сам отвечает за загрузку/инъекцию.
- Используйте WH manual mapping только для x64 GUI-целей, где WH transport уже доказал, что умеет allocation, protection, freeing и синхронное выполнение.
- Для `CAgentProcess` предпочитайте явные вызовы фабрик вместо reflection — у фабрики есть необязательные параметры.
- Перед любыми инструментами с записью проверяйте id процесса, архитектуру и состояние процесса.

## Чего избегать

- Не называйте каждый named-pipe process reader словом "Frida".
- Не считайте PID доказательством того, что CAgent загружен.
- Не используйте WH manual mapping на x86, на не-GUI целях или если у цели нет существующей RWX trampoline page для вызовов WH control.
- Не заменяйте WH manual mapping на `CreateThread(...)` — mapper'у нужно синхронное завершение `ExecuteCode(...)` до чтения return buffers и освобождения shellcode.
- Не считайте Frida Gadget, Frida session, Frida agent script и DLL CAgent одним и тем же payload'ом.
- Не предполагайте, что пакет доступен без явного package/reference и настройки SDK.
- Не получайте `IFridaExperimentalApi` до добавления `FridaContainerExtensions`.
- Не оставляйте неясной ответственность за сессии, скрипты, process wrappers и внедренные payload'ы.

## Опорные точки для исследования

- `EyeAuras.FridaSdk`
- `EyeAuras.FridaSdk.Binaries`
- `EyeAuras.FridaSdk.CAgent`
- `EyeAuras.FridaSdk.CAgent.Trampoline`
- `IFridaExperimentalApi`
- `FridaExperimentalApi`
- `IFridaDevice`
- `IFridaProcess`
- `IFridaSession`
- `IFridaScript`
- `IBasicFridaScript`
- `IFridaLiveScript`
- `FridaAgentProcess`
- `IFridaAgentProcess`
- `FridaAgentRpcType`
- `FridaMemoryBackend`
- `FridaSessionExtensions`
- `FridaSdkBinaries`
- `CAgentProcess`
- `ICAgentProcess`
- `IProcessControlApi`
- `IProcessSupportsManualMapping`
- `WHProcess`
- `WHProcess.ExecuteCode`
- `WHProcess.InjectDllViaManualMapping`
- `FridaAgentScriptViaNamedPipe`
- `FridaCompositeNamedPipeRpc`
- `FridaContainerExtensions`

## Синонимы для поиска

- Frida
- dynamic instrumentation
- Frida device
- Frida session
- Frida script
- Frida live script
- Frida Gadget
- Gadget port
- JavaScript agent
- Frida RPC
- Frida memory backend
- Frida process adapter
- CAgent
- CAgent process
- native agent
- named pipe agent
- process reader
- memory reader
- remote thread
- native payload
- Windows hook process
- WHProcess
- WH manual mapping
- execute code
- synchronous execution
- GUI thread call

## Связанные карты

- `memory/processes.md`
- `reverse-engineering/reprocess.md`
- `scripting/runtime.md`