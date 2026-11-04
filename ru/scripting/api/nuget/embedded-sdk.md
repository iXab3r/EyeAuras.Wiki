---
title: AI NuGet — Embedded SDK
description: AI-карта для standalone apps и plugin hosts на EyeAuras.SDK.Runtime или EyeAuras.SDK.Embedded.
published: true
date: 2026-06-16T00:00:00.000Z
tags: scripting, api, ai, nuget, embedded, sdk, ai-translated
editor: markdown
dateCreated: 2026-06-16T00:00:00.000Z
---
# Карта Embedded SDK

## Когда нужен отдельный host

- Заменить `EyeAuras.SDK` на `EyeAuras.SDK.Runtime` плюс feature packages для
  standalone app.
- Использовать `EyeAuras.SDK.Embedded`, когда one-package compatibility bundle
  важнее размера output.
- Запустить EyeAuras services, Blazor windows, input, memory или CV внутри
  другого app/plugin.
- Выбрать, какие EyeAuras modules должны загрузиться в embedded process.
- Не путать embedded host code со script sandbox.

## Как это устроено

- `EyeAuras.SDK` — compile/reference package для кода, который запускается
  внутри EyeAuras.
- `EyeAuras.SDK.Runtime` — standalone host package. Приложение само владеет
  process startup, создаёт bootstrapper, объявляет capabilities и ждёт
  readiness.
- `EyeAuras.SDK.Embedded` — толстый compatibility package. Он зависит от
  Runtime и текущих feature/module packages.
- `EyeAuras.SDK.WebApp` — только BlazorWindow/WebView hosting surface.
- Runtime implementation modules остаются внутри feature packages под
  `modules/**`. Public metadata/shared assemblies дают compile-time API и
  capability extension methods, например `UseMemory()` или `UseRoxy()`.
- Embedded module selection явный. На этом этапе модули не загружаются
  on-demand из sync API вроде `LocalProcess`.
- `modules.config` поставляется как подписанный инвентарь модулей. Он связывает
  requested module names с package payload paths и assembly identity; это не
  означает, что каждый listed module грузится в каждом embedded app. Generated
  hash/size metadata на этом этапе является только inventory data, а не runtime
  integrity check.

## API

- `EyeAurasRuntimeBootstrapper` — базовый класс для host-owned standalone
  startup.
- `EyeAurasEmbeddedBootstrapper` — compatibility subclass из
  `EyeAuras.SDK.Embedded`.
- `ConfigureEmbeddedModules(IEyeAurasModuleSetBuilder modules)` — объявляет
  requested capabilities один раз в bootstrapper subclass.
- `EnsureReadyAsync(CancellationToken)` — инициализирует static web assets,
  requested Prism modules, module payload loading и application readiness.
- `IEyeAurasModuleSetBuilder` — собирает requested module names.
- `IEyeAurasModuleSetBuilder.UseModule(string)` — добавляет одно requested
  module name.
- `IEyeAurasModuleSetBuilder.UseModules(params string[])` — добавляет несколько
  requested module names.
- `IEyeAurasModuleLoadPlan` — app-wide selection plan. Обычные EyeAuras/EyePad
  используют load-all plan; embedded hosts используют явные module names,
  собранные через `ConfigureEmbeddedModules(...)`.
- `UseUiCore()` — core UI/runtime services из runtime/core metadata surface.
- `UseBehaviorTree()` — добавляется пакетом BehaviorTree.
- `UseMemory()` — добавляется пакетом Memory.
- `UseOpenCVAuras()` — добавляется пакетом OpenCVAuras.
- `UseRoxy()` — добавляется пакетом Roxy.

## Подключить локальную память к существующему WPF host

Нужен Windows host с настроенным WPF/Prism startup и UI dispatcher. Подключите
согласованные версии `EyeAuras.SDK.Runtime` и `EyeAuras.Memory` с их runtime
payload; ссылки на metadata вместо модулей недостаточно. Существующий startup
host должен создать Unity container и выполнить bootstrapper через обычный
`Run(runWithDefaultConfiguration: true)`. Код ниже задаёт выбор capabilities,
а не заменяет точку входа вашего WPF приложения:

```csharp
using EyeAuras.Memory;
using EyeAuras.SDK.Runtime;
using Unity;

public sealed class AppBootstrapper : EyeAurasRuntimeBootstrapper
{
    public AppBootstrapper(IUnityContainer container) : base(container) { }

    protected override void ConfigureEmbeddedModules(IEyeAurasModuleSetBuilder modules)
    {
        modules.UseMemory();
    }
}
```

`UseMemory()` сам добавляет `UseUiCore()` и `MemoryModule`. После `Run` host
может выполнить следующую законченную операцию: дождаться модулей и получить
список доступных процессов. `bootstrapper` — тот же экземпляр, которым владеет
host, `cancellationToken` передаётся вызывающим приложением:

```csharp
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.Memory;

static async Task<IReadOnlyList<ProcessInformation>> GetReadyProcesses(
    AppBootstrapper bootstrapper, CancellationToken cancellationToken)
{
    await bootstrapper.EnsureReadyAsync(cancellationToken);
    return LocalProcess.GetProcesses();
}
```

Результат — descriptors с `Id` и `ProcessName`. Здесь используется статический
facade `LocalProcess`, чей builder регистрирует `MemoryModule`; универсальный
`GetService<T>` для любого контекста не требуется. Из выбранного PID можно
[открыть reader и прочитать память](../memory/processes).

`ConfigureEmbeddedModules` собирается один раз; имена модулей дедуплицируются
без учёта регистра. `EnsureReadyAsync` настраивает assets и resolver, запускает
загрузку, сообщает приложению о загрузке, затем ждёт и проверяет инициализацию
запрошенных модулей. Ошибка readiness — ошибка startup, а не пустой успешный
список. Token участвует в проверке/ожидании; он не обещает откатить уже загруженные
модули или прервать каждую внутреннюю синхронную операцию.

Host владеет bootstrapper, container и dispatcher; не освобождайте их сразу
после чтения списка, если приложение продолжает пользоваться сервисами.
Пример не является полным `Program.cs` для произвольной console app и не
создаёт script sandbox с `Log`, `AuraTree` или `Variables`.

## Версия контракта и пределы проверки

Сверено по исходному API EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`:
`EyeAurasRuntimeBootstrapper`, `EyeAurasEmbeddedBootstrapper`,
`IEyeAurasModuleSetBuilder`, `UseMemory()` и регистрация local process builder.
`EyeAurasEmbeddedBootstrapper` — совместимый наследник Runtime bootstrapper.
Пакетные номера в проектных metadata не доказывают доступность или бинарную
совместимость опубликованных NuGet. Сверяйте target framework, payload и
SDK/XML согласованной версии; startup и Windows runtime здесь не запускались.

## Сборки и пакеты

- Host package: `EyeAuras.SDK.Runtime`
- Fat compatibility package: `EyeAuras.SDK.Embedded`
- BlazorWindow-only package: `EyeAuras.SDK.WebApp`
- Feature packages: `EyeAuras.BehaviorTree`, `EyeAuras.Memory`,
  `EyeAuras.OpenCVAuras`, `EyeAuras.Roxy`
- Namespace для runtime module declarations: `EyeAuras.SDK.Runtime`
- Feature capability extension namespaces совпадают с пакетами: например
  `EyeAuras.Memory` для `UseMemory()` и `EyeAuras.Roxy` для `UseRoxy()`.
- Runtime module compatibility map: `modules.config`

## Что предпочесть

- Держите embedded startup glue в `Program.cs` и bootstrapper subclass.
- Не меняйте exported/generated script files при переходе в standalone.
- Используйте capability methods `UseX()`, а не прямые Prism module class names
  в consumer code.
- Считайте readiness failure startup failure, если requested module не удалось
  загрузить.

## Чего избегать

- Не сканируйте static web asset manifests вручную из consumer app.
- Не вызывайте `IDynamicModule.RegisterTypes` / `OnInitialized` напрямую из
  consumer app.
- Не вызывайте `IApplicationAccessor.ReportIsLoaded()` вручную из consumer app.
- Не предполагайте, что REPL или scripting services существуют, если requested
  module их не зарегистрировал.
- Не ссылайтесь напрямую на runtime implementation modules.

## Поисковые синонимы

- runtime SDK
- embedded SDK
- standalone SDK
- bootstrapper readiness
- module-name selection
- module load plan
- package capabilities
- `UseMemory`
- `UseRoxy`
- `UseOpenCVAuras`

## Связанные карты

- `core/app-runtime-contexts.md`
- `core/app-modules.md`
- `core/login-and-licensing.md`
- `windows-subsystems/blazor-windows.md`
- `recipes/tool-embedded-eyeauras-host.md`
