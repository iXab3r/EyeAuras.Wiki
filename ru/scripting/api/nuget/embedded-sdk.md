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

## Что обычно нужно

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

## Типовой сценарий

Минимальный embedded host:

```csharp
using EyeAuras.BehaviorTree;
using EyeAuras.Memory;
using EyeAuras.SDK.Runtime;

public sealed class AppBootstrapper : EyeAurasRuntimeBootstrapper
{
    public AppBootstrapper(IUnityContainer container) : base(container)
    {
    }

    protected override void ConfigureEmbeddedModules(IEyeAurasModuleSetBuilder modules)
    {
        modules.UseUiCore();
        modules.UseBehaviorTree();
        modules.UseMemory();
    }
}

var container = new UnityContainer();
var bootstrapper = new AppBootstrapper(container);
bootstrapper.Run(runWithDefaultConfiguration: true);
await bootstrapper.EnsureReadyAsync(cancellationToken);
```

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
