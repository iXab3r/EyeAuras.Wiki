---
title: AI NuGet Frida SDK
description: AI-ориентированная карта по опциональной инструментализации Frida, reader-ам процессов на базе Frida и нативным reader-ам процессов CAgent.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, frida, nuget, memory, cagent, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта API Frida SDK

Справочная карта по optional API из `EyeAuras.FridaSdk`: устройства Frida, сессии,
скрипты, payload'ы Frida Gadget, адаптеры `IProcess` на базе Frida и нативные
ридеры процессов CAgent через named pipe.

## Что такое Frida

- Frida — это toolkit для динамической инструментализации.
- Хост подключается к целевому процессу или к Frida Gadget.
- Frida запускает JavaScript внутри целевого процесса.
- Этот JavaScript может просматривать модули, перехватывать нативные функции,
  читать и писать память, вызывать native exports и обмениваться данными с
  хостом через сообщения или RPC.
- Основные сущности Frida: device, process, session, script, message, RPC и
  Gadget.

## Что дает этот SDK

- Это optional слой NuGet/package. Не считайте, что он входит в базовый
  scripting SDK.
- Ссылка на пакет позволяет компилировать типы Frida SDK, а
  `FridaContainerExtensions` делает сервисы Frida SDK доступными из script
  container.
- Managed entry point для работы с устройствами, процессами, сессиями и
  скриптами Frida.
- Обертки для Frida script с `load`/`unload`, RPC, потоками сообщений, поддержкой
  debugger и live reload скриптов.
- Встроенный Frida agent script, который открывает операции с
  процессом/памятью через RPC.
- `FridaAgentProcess` — адаптер `IProcess` поверх уже существующей Frida session.
- Вспомогательные binary helper'ы для Frida Gadget находятся в семействе Frida
  binaries.
- Байты нативной DLL CAgent и managed-клиенты находятся рядом с Frida SDK, но
  CAgent — это отдельный нативный ридер процесса через named-pipe, а не
  Frida script/session.

## Обязательная настройка

Для script mini-apps у `EyeAuras.FridaSdk` есть два обязательных шага, если вы
используете сервисы Frida SDK:

1. Подключите пакет: `EyeAuras.FridaSdk`.
2. Добавьте container extension до получения Frida-сервисов:

```csharp
AddNewExtension<FridaContainerExtensions>();

var frida = GetService<IFridaExperimentalApi>();
```

Не считайте, что `IFridaExperimentalApi` или helper'ы для Frida binaries будут
доступны из DI только потому, что пакет компилируется. Без
`FridaContainerExtensions` разрешение сервисов может завершиться ошибкой или
вернуть неполную конфигурацию хоста.

`CAgentProcess.ByProcessId(...)` — это статическая фабрика process-reader из того
же пакета, но если скрипт также получает сервисы Frida SDK, сначала все равно
нужно добавить `FridaContainerExtensions`.

## Разделение по слоям

| Слой | Для чего использовать | Основные API |
| --- | --- | --- |
| Frida session/script | Инструментализация, хуки, собственный JavaScript внутри целевого процесса | `IFridaExperimentalApi`, `IFridaSession`, `IFridaScript`, `IFridaLiveScript` |
| Frida Gadget | Подключение к внедренному или встроенному Frida runtime через локальный порт | `FridaSdkBinaries`, `AttachByLocalPort` |
| Ридер процесса на базе Frida | Использовать Frida session как `IProcess` для memory/reverse-engineering tools | `FridaAgentProcess`, `FridaAgentRpcType`, `FridaMemoryBackend` |
| CAgent process reader | Использовать native DLL + named-pipe RPC для операций с памятью и управления процессом | `CAgentProcess`, `ICAgentProcess`, `IProcessControlApi` |

## Типовые задачи

- Добавить optional-поддержку Frida в mini-app.
- Получить список устройств или процессов Frida.
- Подключиться к локальному процессу по PID или имени.
- Подключиться к Frida Gadget по локальному порту.
- Загрузить JavaScript-скрипт Frida и получать сообщения от него.
- Перезагружать Frida script во время редактирования.
- Завернуть существующую Frida session в `IProcess`.
- Подключиться к уже загруженному нативному endpoint CAgent.
- Выбрать между транспортом Frida RPC и named-pipe RPC.
- Понять, нужна ли задаче Frida-инструментализация или достаточно только
  process reader.

## API Frida

- `IFridaExperimentalApi` — managed entry point для операций Frida.
- `FridaExperimentalApi` — реализация по умолчанию.
- `GetDevices()` — получить список доступных устройств Frida.
- `GetLocalDevice()` — получить локальное устройство Frida.
- `GetLocalProcesses()` — получить список локальных процессов, видимых Frida.
- `GetRemoteDevice(...)` — подключиться к удаленному Frida server/device.
- `AttachByLocalProcessId(...)` — подключить Frida session к локальному процессу.
- `AttachByLocalProcessName(...)` — найти и подключиться по имени процесса.
- `AttachByLocalPort(...)` — подключиться к Frida Gadget/server на локальном
  порту.
- `IFridaDevice` — абстракция устройства Frida.
- `IFridaProcess` — информация о процессе, видимом Frida.
- `IFridaSession` — сессия подключенного процесса; владеет скриптами,
  отключается при disposal.
- `IFridaScript` — загруженный Frida JavaScript с `Load`, `Unload`, `Post`,
  `PostWithData`, `Rpc`, `Rpc<T>`, `Eternalize`, управлением debugger и
  observables для сообщений.
- `IBasicFridaScript` — упрощенная поверхность script API, используемая
  обертками агентов.
- `IFridaLiveScript` — script на базе файла/observable, который
  перезагружается при изменении содержимого.
- `FridaContainerExtensions` — optional-регистрация SDK в DI/container.

## Frida Gadget и binaries

- `FridaSdkBinaries` предоставляет встроенные байты DLL для Frida Gadget.
- `GetLibraryForX86(...)`, `GetLibraryForX64(...)` — полные payload'ы Gadget.
- `GetSlimLibraryForX86(...)`, `GetSlimLibraryForX64(...)` — slim payload'ы.
- Patch helper'ы могут изменить порт Gadget по умолчанию перед загрузкой
  payload'а.
- После запуска Gadget подключайтесь через `AttachByLocalPort(...)`.
- Frida Gadget — это runtime payload Frida. Это не CAgent.

## IProcess на базе Frida

- `FridaAgentProcess.BySession(...)` адаптирует существующую `IFridaSession` к
  `IProcess`.
- Он загружает встроенный Frida agent script в целевой процесс.
- Он открывает доступ к id/имени процесса, модулям, потокам, регионам памяти и
  memory backend.
- `FridaMemoryBackend` выполняет чтение и запись через agent RPC.
- `FridaAgentRpcType` выбирает транспорт:
  - `Default` / `Frida` — встроенный RPC Frida.
  - `NamedPipeAsServer` / `NamedPipeAsClient` — managed/TypeScript bridge через
    named pipe поверх Frida agent script.
  - `NativeNamedPipeAsClient` / `NativeCompositeNamedPipeAsClient` — client-mode
    режимы named pipe в нативном стиле.
- Этот слой подходит, когда Frida session уже существует, а следующий API
  ожидает `IProcess`.

## API CAgent

- CAgent — это нативная DLL/payload, которая запускается внутри целевого
  процесса.
- CAgent поднимает named-pipe RPC server с именем, зависящим от id целевого
  процесса.
- Обычный шаблон имени pipe: `EAF_RPC_C_{pid}`.
- `CAgentProcess.ByProcessId(processId, composite = false)` подключается к этому
  endpoint.
- `CAgentProcess.ByPipeName(pipeName, composite = false)` подключается по
  явному имени pipe.
- `CAgentProcess` реализует `ICAgentProcess`, `IProcess` и операции управления
  процессом.
- `IFridaExperimentalApi.GetCAgentLibraryForX64()` и
  `GetCAgentLibraryForX86()` возвращают встроенные байты DLL CAgent.
- CAgent поддерживает id/имя процесса, модули, потоки, регионы памяти, чтение и
  запись памяти, `allocation/free`, `LoadLibrary`, `FreeLibrary`, создание
  remote thread и дублирование handle.
- Некоторые методы управления процессом намеренно не поддерживаются или не
  реализованы. Проверяйте конкретный метод, прежде чем полагаться на поведение
  suspend/resume.
- CAgent полезен, когда нативный endpoint уже загружен или mini-app сама
  управляет загрузкой/инжектом нативного агента.

## Проекты семейства CAgent

- `EyeAuras.FridaSdk.CAgent` — нативная C++ DLL, которая открывает named-pipe
  RPC.
- `EyeAuras.FridaSdk.CAgent.Trampoline` — вспомогательные native
  loader/trampoline/proxy payload'ы.
- `EyeAuras.FridaSdk.SimpleAgent` — простой нативный agent/sample/test project.
- Эти проекты связаны со структурой SDK-репозитория, но это не то же самое, что
  Frida sessions или Frida JavaScript scripts.

## Типовые сценарии

### Подключиться и запустить Frida script

1. Убедитесь, что optional-пакет/ссылка на Frida SDK доступен.
2. Добавьте `FridaContainerExtensions`.
3. Создайте или получите `IFridaExperimentalApi`.
4. Подключитесь через `AttachByLocalProcessId`, `AttachByLocalProcessName` или
   `AttachByLocalPort`.
5. Создайте script из исходника или файла.
6. Подпишитесь на потоки логов, ошибок и сообщений.
7. Загрузите script.
8. При остановке mini-app выполните `dispose`/`unload`.

### Использовать Frida session как IProcess

1. Подключите Frida session.
2. Создайте `FridaAgentProcess.BySession(session, rpcType)`.
3. Проверьте `ProcessId` и `IsValid`.
4. Передайте `IProcess` в memory, ReProcess или reverse-engineering UI code.

### Использовать Frida Gadget

1. Загрузите или внедрите байты Frida Gadget для нужной архитектуры.
2. Используйте известный или пропатченный локальный порт.
3. Подключитесь через `AttachByLocalPort(port)`.
4. Дальше работайте с результатом как с обычной Frida session.

### Использовать CAgent process reader

1. Убедитесь, что optional-пакет/ссылка на Frida SDK доступен.
2. Добавьте `FridaContainerExtensions`, если скрипт получает
   `IFridaExperimentalApi`, чтобы взять байты DLL CAgent или другие сервисы
   SDK.
3. Загрузите или внедрите подходящие байты DLL CAgent в целевой процесс.
4. Подключитесь через `CAgentProcess.ByProcessId(pid)` или `ByPipeName(...)`.
5. Проверьте, что сообщаемый `ProcessId` совпадает с ожидаемым процессом.
6. Используйте полученную поверхность `IProcess`/`IProcessControlApi`.

## Что предпочесть

- В скриптах лучше начинать настройку Frida SDK с
  `AddNewExtension<FridaContainerExtensions>()`.
- Для инструментализации, хуков и собственного JS предпочитайте API
  Frida session/script.
- Выбирайте `FridaAgentProcess`, если Frida session уже есть, а следующий API
  ожидает `IProcess`.
- Используйте CAgent только когда точно известно, что совместимый нативный
  endpoint уже загружен, или mini-app сама управляет загрузкой/инжектом.
- Для `CAgentProcess` предпочитайте явные вызовы фабрик, а не reflection; у
  фабрики есть optional-параметры.
- Перед инструментами, которые умеют писать в процесс, проверяйте id процесса,
  архитектуру и то, что процесс все еще жив.

## Чего избегать

- Не называйте любой named-pipe process reader словом "Frida".
- Не считайте PID доказательством того, что CAgent загружен.
- Не смешивайте Frida Gadget, Frida session, Frida agent script и DLL CAgent в
  один и тот же payload.
- Не рассчитывайте, что этот пакет доступен без явного package/reference и
  настройки SDK.
- Не получайте `IFridaExperimentalApi` до добавления
  `FridaContainerExtensions`.
- Не оставляйте неясной ответственность за сессии, скрипты, process wrapper'ы и
  внедренные payload'ы.

## Опорные идентификаторы для поиска

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
- `FridaAgentScriptViaNamedPipe`
- `FridaCompositeNamedPipeRpc`
- `FridaContainerExtensions`

## Ключевые слова для поиска

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

## Связанные карты

- `memory/processes.md`
- `reverse-engineering/reprocess.md`
- `scripting/runtime.md`