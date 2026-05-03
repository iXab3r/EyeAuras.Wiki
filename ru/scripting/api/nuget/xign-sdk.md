---
title: AI Xign SDK
description: AI-ориентированная карта по XignProcess, Xign driver infrastructure и Memory API.
published: true
date: 2026-05-03T00:00:00.000Z
tags: scripting, api, ai, xign, nuget, driver, memory
editor: markdown
dateCreated: 2026-05-03T00:00:00.000Z
---
# Карта API Xign SDK

Справочная карта по API вокруг `XignProcess`: как открыть процесс через
XignCode3-драйвер, как читать/писать память, когда держать handle процесса
открытым и где заканчивается зона ответственности этого backend'а.

## Важный дисклеймер

`EyeAuras.XignSdk` работает поверх Xign driver, он же XignCode3 driver. Это
практичный backend для сценариев, где такой драйвер уже подходит, но не
универсальная гарантия совместимости на любой пользовательской машине.

На практике Xign/XignCode3 может конфликтовать с другими kernel drivers,
античитами, защитным ПО, Windows Code Integrity/VBS и локальными политиками
загрузки драйверов. Относитесь к `XignProcess` как к временному решению:
пользуйтесь, пока оно работает в вашем контролируемом окружении.

Если вы делаете коммерческий или публичный продукт, лучше смотреть в сторону
своего [custom `IProcess`](/ru/scripting/memory-api/backends/custom-process).
Только собственный backend дает шанс _гарантировать_ пользователям отсутствие
Xign/XignCode3-специфичных проблем.

Сильная сторона Memory API в том, что верхний код закрыт интерфейсами:
`IProcess`, `IProcess.Memory`, `IProcessControlApi` и helper APIs. Поэтому
подмена `XignProcess` на другой process backend обычно остается локальным
изменением в месте создания процесса.

По состоянию на **1 мая 2026** проверенная нами версия XignCode3-драйвера
работает в том числе с защищенными процессами. Это важная практическая причина
смотреть на `XignProcess`, но не вечное обещание совместимости для всех будущих
версий драйвера, Windows и античитов.

## Что обычно хотят сделать

Главная причина брать `XignProcess` вместо `LocalProcess` — работа через
XignCode3-драйвер, а не через обычный user-mode `OpenProcess`. При этом драйвер
подписан и загружается официальным Windows-путем через Service Control Manager,
то есть без самодельных и хрупких трюков вокруг загрузки драйверов.

Поверх этого API позволяет:

- использовать `XignProcess` там, где код ожидает обычный `IProcess`;
- читать/писать память через привычный `process.Memory`;
- выделять память, менять protection, запускать код и создавать remote thread;
- делать manual mapping DLL через общие Memory API helpers;
- удерживать handle процесса открытым на время пачки операций через
  `EnterOpenProcess()`;
- проверить, что драйвер загружен и отвечает на простые запросы вроде ping и
  version.

## Модель API

- Основной API для работы с процессом — `IXignProcess` / `XignProcess`.
- `IXignProcess` реализует:
  - `IProcess`
  - `IProcessControlApi`
  - `IProcessSupportsManualMapping`
  - `IProcessSupportsUserApc`
  - `IDisposableReactiveObject`
- `XignDriverManager` умеет открыть connection к драйверу и, если нужно,
  предварительно загрузить драйвер через Windows SCM.
- `XignDriverConnection` владеет handle к `\\.\xhunter1`, собирает запросы к
  драйверу, читает ответы и умеет временно инициализировать/auth'ить текущий
  процесс.
- Driver loading в SDK — только SCM-путь. Здесь нет DSE bypass, exploit-chain
  или попыток обойти подпись драйвера.

## Обязательная среда

Для реального драйверного сценария нужны:

- Windows x64 процесс, из которого открывается `XignDriverConnection`.
- Совместимый `xhunter1.sys`, если SDK должен сам загрузить драйвер.
- Права и политика ОС, позволяющие стартовать kernel driver через SCM.
- Совместимость с текущими настройками VBS/Code Integrity/driver blacklist.

Если драйвер уже загружен снаружи, можно использовать `loadDriver: false`.
Если SDK должен стартовать драйвер сам, используйте `WithLoadDriver()`.

## Основные API

- `XignProcess.ByProcessId(processId)` — открыть целевой процесс через default
  builder без загрузки драйвера.
- `XignProcess.ByProcessName(processName)` — найти локальный процесс по имени и
  открыть его через default builder.
- `XignProcess.WithLoadDriver(loadDriver = true)` — настроить builder, который
  перед открытием device попытается создать/запустить service драйвера.
- `XignProcess.WithOpenProcess(openProcess = true)` — настроить builder, чтобы
  `XignProcess` держал handle целевого процесса открытым весь lifetime.
- `IXignProcess.EnterOpenProcess()` — вручную удержать открытый handle процесса
  на время пачки операций. Вложенные scope'ы переиспользуют один handle, а
  закрытие происходит после выхода из последнего scope.
- `IXignProcess.Memory` — `IProcessMemory` для чтения и записи памяти.
- `IXignProcess.ExecuteCode(startAddress, parameter)` — синхронно вызвать
  уже размещенную функцию в целевом процессе.
- `IXignProcess.InjectDllViaManualMapping(...)` — manual mapping DLL из path или
  bytes.
- `IXignProcess.QueueUserApc(...)` — поставить user APC через обычный
  thread-handle путь.
- `XignDriverManager.Create(loadDriver)` — открыть connection к драйверу, при
  необходимости предварительно загрузив service.
- `IXignDriverConnection` — прямой доступ к драйверу для низкоуровневых
  операций: `PingEcho`, `QueryVersionStatus`, `OpenProcess`, `ReadUserMemory`,
  `ReadMemory`, `ExecuteCodeByProcessId`, `ExecuteCodeByProcessHandle`, `Call`.

## Что умеет XignProcess сейчас

`XignProcess` уже закрывает основные Memory API сценарии:

- `ProcessId`, `ProcessName`, `IsValid`, `Log`
- `Memory.Read<T>`, `Memory.Write<T>`, span/byte read-write через
  `process.Memory`
- `GetProcessModules()`
- `GetThreads()`
- `VirtualQuery(address)`
- `GetMemoryRegions()`
- `AllocateMemory(...)`
- `FreeMemory(address)`
- `ProtectMemory(...)`
- `ExecuteCode(startAddress, parameter)`
- `CreateRemoteThread(startAddress, parameter)`
- `SuspendProcess()` / `ResumeProcess()`
- `SuspendThread(threadId)` / `ResumeThread(threadId)`
- `InjectDllViaManualMapping(...)`
- `QueueUserApc(...)`

Практически это значит, что `XignProcess` можно передавать в код, который
работает с обычным `IProcess` и умеет проверять дополнительные capability
interfaces.

## Важные нюансы реализации

- Чтение памяти `XignProcess.Memory` идет через Xign-драйвер и handle процесса.
- Запись памяти выполняется через `WriteProcessMemory`, но handle к процессу
  открывается через драйвер.
- `AllocateMemory`, `FreeMemory`, `ProtectMemory`, `CreateRemoteThread` и
  suspend/resume операции используют handle процесса, который открыл драйвер.
- `GetThreads` использует обычный snapshot потоков.
- `QueueUserApc` использует обычный `OpenThread`/`QueueUserAPC` путь, а не
  отдельную команду Xign-драйвера.
- `ExecuteCode` поддерживает x64 и x86 процессы. Передаваемая функция должна
  уже находиться в памяти целевого процесса и принимать один аргумент размером с
  указатель.
- Manual mapping строится поверх общего `LibraryMapper`, поэтому использует
  `IProcess.Memory` + `IProcessControlApi.ExecuteCode`.

## Init/Auth session

Перед рабочими операциями `XignDriverConnection` временно инициализирует драйвер
и помечает текущий процесс как доверенный. Это нужно, чтобы драйвер принимал
запросы именно от нашего процесса.

Это состояние считается временным. Если операция возвращает ошибку или падает
исключением, SDK сбрасывает session и повторит init/auth перед следующей
операцией.

После этого драйвер следит за нашим PID и unload'ится, когда процесс больше не
жив.

## Примеры

Открыть процесс через уже запущенный драйвер:

```csharp
using EyeAuras.XignSdk;

using var process = XignProcess.ByProcessId(pid);

var value = process.Memory.Read<int>(address);
process.Memory.Write(address, value + 1);
```

Загрузить драйвер и удерживать handle процесса на время пачки операций:

```csharp
using EyeAuras.XignSdk;

using var process = XignProcess
    .WithLoadDriver()
    .ByProcessName("game.exe");

using (process.EnterOpenProcess())
{
    var regions = process.GetMemoryRegions();
    var modules = process.GetProcessModules();
}
```

Manual mapping DLL из bytes:

```csharp
using EyeAuras.XignSdk;

using var process = XignProcess
    .WithLoadDriver()
    .WithOpenProcess()
    .ByProcessId(pid);

var mapped = process.InjectDllViaManualMapping(dllBytes);
Log.Info($"Mapped @ {mapped.BaseAddress:X}, entry={mapped.EntryPoint:X}");
```

Прямой запрос версии драйвера:

```csharp
using EyeAuras.XignSdk;

var manager = new XignDriverManager(XignDriverServiceConfig.Default);
using var connection = manager.Create(loadDriver: true);

var version = connection.QueryVersionStatus();
Log.Info($"Xign status=0x{version.RawResponse.Status:X8}, extra=0x{version.VersionStatus:X8}");
```

## Что предпочесть

- Для обычных локальных процессов начинайте с `LocalProcess`.
- Для Xign-сценариев предпочитайте `XignProcess`, а не ручные вызовы команд
  драйвера.
- Для публичных/коммерческих продуктов предпочитайте свой `IProcess` backend,
  если нужно контролировать совместимость и поддержку пользователей.
- Для проверки самого драйвера используйте готовые методы `XignDriverConnection`
  вроде `PingEcho()` и `QueryVersionStatus()`.
- Для пачки операций используйте `WithOpenProcess()` или
  `EnterOpenProcess()`, чтобы не открывать/закрывать handle процесса на каждый
  мелкий вызов.
- Для scalar reads/writes используйте `process.Memory.Read<T>` и
  `process.Memory.Write<T>`.

## Чего избегать

- Не считайте Xign заменой `KDProcess`, `LCProcess` или Frida. Это отдельный
  backend со своим драйвером и протоколом.
- Не воспринимайте Xign/XignCode3 как гарантированно бесконфликтный драйвер:
  на host machine могут быть другие драйверы, античиты и security policy.
- Не полагайтесь на Xign SDK как на механизм обхода политики загрузки драйверов.
- Не ожидайте, что все операции являются отдельными командами драйвера. Часть
  верхнего API использует WinAPI поверх handle, который открыл драйвер.
- Не используйте `Call(command, args)` как стабильный публичный API для
  production-сценариев, если для команды уже есть готовый метод.
- Не смешивайте Xign driver loading, CAgent named-pipe reader и Frida session в
  один слой. Эти части могут работать вместе, но отвечают за разные вещи.

## Ограничения

- Нужен совместимый `xhunter1.sys`; исходники драйвера хранятся
  отдельно и рассматриваются как third-party binary dependency.
- Реальные integration tests требуют admin/host setup и должны быть помечены
  `Integration`.
- `XignDriverConnection` рассчитан на x64 процесс.
- Поддерживаются только те команды драйвера, семантика которых уже
  восстановлена и закреплена нормальным методом SDK.
- Успех `QueueUserApc` зависит от состояния целевого потока: APC выполнится только
  когда поток войдет в alertable wait.

## Опорные идентификаторы для поиска

- `EyeAuras.XignSdk`
- `IXignProcess`
- `XignProcess`
- `IXignProcessBuilder`
- `XignDriverServiceConfig`
- `XignDriverManager`
- `IXignDriverConnection`
- `XignDriverConnection`
- `XignCommandResponse`
- `XignCommandResponseDumper`
- `IProcess`
- `IProcessControlApi`
- `IProcessSupportsManualMapping`
- `IProcessSupportsUserApc`
- `ExecuteCode`
- `InjectDllViaManualMapping`
- `EnterOpenProcess`
- `ReadUserMemory`
- `ReadMemory`
- `xhunter1`
- `\\.\xhunter1`
- `xhunter1.sys`

## Search synonyms

- Xign
- XignSdk
- XignProcess
- xhunter1
- Xign driver
- driver-backed memory
- kernel driver process backend
- SCM driver loading
- manual mapping through driver
- execute code through Xign

## Что читать дальше

- [XignProcess backend](/ru/scripting/memory-api/backends/xign-process)
- [Memory API](/ru/scripting/api/memory)
- [Frida SDK](/ru/scripting/api/nuget/frida-sdk)
- [LocalProcess](/ru/scripting/memory-api/backends/local-process)
- [LCProcess](/ru/scripting/memory-api/backends/lc-process)
