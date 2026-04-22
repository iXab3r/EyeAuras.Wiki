---
title: Карты навигации по API для AI
description: Навигационная карта по scripting API EyeAuras для AI-инструментов.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, discovery, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карты навигации по API EyeAuras

Эта страница — основная AI-ориентированная точка входа для карт навигации по API EyeAuras.

Карты навигации не дублируют полный публичный API. Каноническим источником остаются SDK-assembly, XML-документация и сгенерированные метаданные. Эти файлы дают удобную навигацию: связанные символы, подсказки по пакетам и assembly, терминологию, связи между API и типовые сценарии использования.

## Поддерживайте это в актуальном состоянии

Если вы меняете публичные API, сервисы для скриптов, модели aura, triggers, actions, overlays, API для window/image/input/memory/ML, опциональные SDK-пакеты или точки входа dependency injection, обновите соответствующую карту навигации.

Если подходящей карты ещё нет — создайте её. Предпочтительнее несколько небольших карт по доменам, чем один большой файл.

## Правила формата

- Используйте точные имена типов, методов, namespace, пакетов и assembly.
- Объясняйте, что делает API, а не только где он находится.
- Отделяйте правила host/runtime-контекста от общих правил SDK/API.
- Добавляйте ключевые слова по пользовательскому намерению и англоязычные search synonym.
- Включайте типовые сценарии, которые показывают, как типы связаны между собой.
- Ссылайтесь на связанные карты через wiki-пути относительно папки.
- Не используйте пути, существующие только в репозитории, предположения о build output или tool-specific команды поиска.
- API из опциональных NuGet/package размещайте в `nuget/`, а не смешивайте с core SDK-картами.

## Структура каталогов

- `core/` - структура продукта, runtime-контексты, модули, конфигурация и концепции deployment/distribution.
- `scripting/` - runtime скриптов, script accessors, host context, правила для helper class и script DI.
- `auras/` - сущности aura, actions, triggers, overlays и runtime-инфраструктура aura.
- `windows-subsystems/` - native windows, handles, matching, tracking, Blazor windows, input hooks, hotkeys и send-input infrastructure.
- `osd/` - on-screen user selection и on-screen drawing overlays.
- `memory/` - базовые контракты process/memory и встроенные memory backend.
- `nuget/` - опциональные SDK-пакеты, например ImGui SDK и Frida SDK.
- `computer-vision/` - capture, image search, OCR, OpenCV и сценарии работы с pixel.
- `ml/` - ML-модели, datasets, AI runtime, AI tool plugins, retrieval и model-backed search.
- `reverse-engineering/` - карты для RE workspace и RE tooling.
- `recipes/` - практические recipes, которые собирают несколько областей API в готовую архитектуру проекта.

## В каком порядке изучать

1. Определите контекст продукта: aura, folder, behavior tree, macro, trigger, action, overlay, script или app/plugin code.
2. Определите поверхность выполнения: top-level script, обычный C# class, object-style script executor, Razor component или app/plugin module.
3. Сначала прочитайте `core/eyeauras-structure.md`, затем нужную карту по домену.
4. Ищите точные символы из карты в доступных SDK reference, XML docs, сгенерированных метаданных и подключённых assembly.
5. Проверьте, как текущий контекст предоставляет нужную возможность: через host member, dependency injection, явный parameter, script-facing accessor или только через metadata.
6. И только после этого добавляйте собственный interop, wrappers или новую инфраструктуру.

Не считайте возможности host top-level script, такие как `Log`, `AuraTree`, `Variables`, `Sleep` или `cancellationToken`, глобальными C# API. Обычные C# classes должны получать зависимости через параметры конструктора, framework/Unity property injection, явные параметры или script-owned DI registrations.

Actions, Triggers и Overlays — это stateful runtime-объекты Aura Tree, а не лёгкие API wrapper. В API maps и migration guides для простых операций предпочитайте прямые script API, services, extension methods или helper functions. Упоминайте Actions/Triggers/Overlays, когда пользователь строит настраиваемое поведение Aura Tree или когда компонент несёт важный предметный runtime — например CV, ML, overlay rendering или long-lived trigger state.

## Базовая форма карты

По возможности используйте такую структуру:

```md
# Domain Name Discovery Map

## User Intents
## Concept Model
## Host / Runtime Contexts
## API Details
## Common Flows
## Assembly / Package Hints
## Prefer
## Avoid
## Research Anchors
## Search Synonyms
## Related Maps
```

## Карты по доменам

- `core/eyeauras-structure.md` - структура продукта, Aura Tree, контексты, lifecycle, variables и места запуска скриптов.
- `core/app-runtime-contexts.md` - контексты выполнения app vs SDK vs top-level script vs ordinary C# class.
- `core/app-modules.md` - Prism modules, загрузка модулей, dynamic modules и module-private assets.
- `core/configuration-persistence.md` - config providers, config serializer, metadata wrappers, migrations и replacements.
- `core/deployment.md` - export/import, packs, portable packs, mini-apps, запуск EyePad, script protection и sublicensing.
- `scripting/runtime.md` - script API, доступ к dependency/capability, accessors, folders, variables, macros, keybinds и правила для helper class.
- `scripting/container-extensions.md` - script DI composition, `ScriptContainerExtension`, регистрация optional SDK и настройка service graph.
- `scripting/logging.md` - `Log`, `IFluentLog`, log levels, передача logger в helper-class, scoped prefixes, exception logs и diagnostic breadcrumbs.
- `scripting/references-and-resources.md` - NuGet/assembly references, embedded resources, `IScriptFileProvider`, DLL/image/font/model assets.
- `scripting/project-workflow.md` - export/import/live-import, IDE workflow, итерация C# Overlay и границы multi-project solution.
- `scripting/variables.md` - `ScriptVariable<T>`, иерархия variables, семантика `Value`/`HasValue`/`TryGetValue`, listeners и переменные `default.*`.
- `scripting/web-server.md` - ASP.NET Core/Kestrel endpoints, размещённые в script host, minimal APIs, controllers и lifetime сервера, привязанный к cancellation.
- `scripting/browser-automation.md` - browser automation через Selenium/WebDriver как альтернатива screen/CV/input automation для web pages.
- `auras/entities.md` - `IAuraRegistrator`, entity mappings, factories, proxies, linked-aura evaluators, event log и lifecycle events.
- `auras/actions.md` - выполнение action, регистрация action, script actions и lifecycle action lists.
- `auras/triggers.md` - trigger event sources, регистрация trigger, script triggers и activation state.
- `auras/overlays.md` - сущности aura overlay и их отличия от OSD, Blazor windows и ImGui windows.
- `auras/overview.md` - общий обзор aura pack и перекрёстные ссылки.
- `windows-subsystems/window-handles.md` - `IWindowHandle`, мосты к raw handle, enumeration, matching, selectors и trackers.
- `windows-subsystems/blazor-windows.md` - native windows на основе Blazor, WebView2 hosts, dialog windows, Razor view resolution и automation.
- `windows-subsystems/input-hooks-hotkeys.md` - keyboard/mouse hooks, hotkeys, send-input API, input simulators, smoothers и redirection.
- `osd/selection.md` - `IOsdSelectionService` и интерактивный выбор window/region/point/color.
- `osd/screen-overlay.md` - Blazor OSD screen overlay canvas, rectangles, HTML/Razor overlay objects и CV debug annotations.
- `memory/processes.md` - базовые process readers, доступ к памяти, modules, pointer chains, pattern scanning, KD и MPFS.
- `nuget/imgui-sdk.md` - опциональный пакет `EyeAuras.ImGuiSdk`, render loop, managed ImGui windows, image/font textures и ImGui content.
- `nuget/frida-sdk.md` - опциональный пакет `EyeAuras.FridaSdk`, Frida sessions/scripts, Frida Gadget payloads, `IProcess` adapters на базе Frida и native named-pipe process readers через CAgent.
- `computer-vision/images.md` - screen/window capture, image search, OCR, OpenCV, color и pixel workflows.
- `computer-vision/profiling.md` - MiniProfiler, `EnableProfiling`, `cv.Profiler.Step`, plain-text reports, warm-up и затраты памяти на profiling.
- `ml/ai.md` - индекс по ML model inference и интеграции AI в приложение.
- `ml/ai-runtime.md` - `AiEngine`, chat sessions, profiles, retrieval, Blazor chat UI, MCP hosting, Responses API и desktop scripting AI.
- `ml/ai-kernel-plugins.md` - `AiKernelPlugin`, инструменты `[KernelFunction]`, plugin host, tool approval, retrieval plugins и правила проектирования tool.
- `ml/script-ai-clients.md` - прямые external AI client NuGet-пакеты из скриптов и их отличия от встроенного runtime `EyeAuras.AI`.
- `reverse-engineering/reprocess.md` - `ReProcess`, RE workspace builder, RE tabs/actions/inspectors и AI RE tools.

## Recipes

- `recipes/recipe.md` - обязательная форма и правила написания recipes.
- `recipes/bot-memory-imgui-interface.md` - recipe для бота, который читает память, с ImGui UI и опциональным scripting внутри приложения.
- `recipes/bot-memory-behavior-tree.md` - recipe для чтения памяти и передачи данных в automation через Behavior Tree.
- `recipes/bot-memory-entity-list-reader.md` - recipe для примитивного списка сущностей, radar или debug table на основе памяти.
- `recipes/tool-embedded-eyeauras-host.md` - recipe по добавлению инструментов на базе EyeAuras в другой app/plugin host.
- `recipes/script-ai-editor-assistant.md` - recipe по добавлению AI-чата в script editor или mini-app.

## Известные стартовые точки

- Структура продукта:
  `IEyeContext`, `IAuraContext`, `IFolderContext`, `IEyeItem`,
  `IAuraTreeScriptingApi`.

- Runtime скриптов:
  `AuraScriptSandbox`, `IAuraScriptSandbox`, `IFluentLog`,
  `ScriptContainerExtension`, `CsharpScriptActionExecutor`,
  `CsharpScriptTriggerExecutor`.

- Логирование в скриптах:
  top-level scripts могут вызывать `Log` напрямую; обычным классам нужно
  передавать `IFluentLog` через конструкторы/параметры или использовать
  независимый logger из `typeof(MyType).PrepareLogger()`; применяйте levels,
  prefixes, lazy messages и exception overloads, чтобы оставлять полезные
  diagnostic breadcrumbs.

- Script DI / composition:
  `ScriptContainerExtension` регистрирует сервисы, принадлежащие скрипту;
  `AddNewExtension<T>` подключает extensions из кода top-level script;
  `Container.AddNewExtensionIfNotExists<T>` собирает зависимости между
  extensions; optional SDK, такие как ImGui/Frida, используют именно этот
  opt-in pattern.

- References / resources:
  `#r "nuget:"` добавляет пакеты; `#r "assemblyName:"` подключает уже
  загружаемые assembly; `#r "assemblyPath:"` ссылается на локальные/embedded DLL;
  `IScriptFileProvider` предоставляет embedded script files и resources.

- Workflow проекта:
  экспортированные скрипты — это обычные собираемые C# projects; import/live-import
  возвращают script payload обратно в EyeAuras; solution может включать
  helper/test/tool projects, которые не входят в runtime payload.

- Variables:
  `IVariablesScriptingApi` создаёт типизированные handles `ScriptVariable<T>`;
  `Value` безопасен и возвращает default, `TryGetValue` — строгий и не бросает
  исключение, `GetOrThrow` — строгий и бросает исключение, `Listen` отслеживает изменения.

- Web API внутри script host:
  `Host.CreateDefaultBuilder`, Kestrel, minimal endpoints, controllers,
  `AddApplicationPart` и привязанный к cancellation `RunAsync` — это стартовые
  точки для локальных HTTP endpoint для управления и диагностики.

- Browser automation:
  Selenium/WebDriver напрямую управляет DOM браузера и состоянием session, и
  для web pages обычно предпочтительнее, чем image search или глобальная
  симуляция ввода.

- Крупные script projects:
  `IHostedService`, `ScriptContainerExtension`, `AuraScriptRunner<TSandbox>`,
  `AuraScriptSandbox`, `IImGuiExperimentalApi`, `IBlazorWindow`,
  `IConfigProvider<TConfig>`, `CompositeDisposable`, `Anchors`.

- Регистрация aura entities:
  `IAuraRegistrator`, `IAuraRepository`, `IAuraObjectFactory`,
  `IEyeEntityFactory`.

- Actions:
  `AuraActionBase<TProperties>`, `ExecuteInternal`,
  `CsharpScriptAction`, `CsharpScriptActionExecutor`.

- Triggers:
  `AuraTriggerBase<TProperties>`, `CreateTriggerEventSource`,
  `CsharpScriptTrigger`, `CsharpScriptTriggerExecutor`.

- Overlays:
  `CsharpScriptOverlay`, `AuraOverlayPropertiesBase`,
  `AuraOverlayContentBase`, `IOnScreenCanvas`, `IBlazorWindow`,
  `IImGuiExperimentalApi`.

- OSD selection:
  `IOsdSelectionService`, `PickWindow`, `PickRegion`, `PickPoint`,
  `PickColor`.

- Screen overlay:
  `IOnScreenCanvasScriptingApi`, `IOnScreenService`, `IOnScreenCanvas`,
  `IOnScreenRectangle`, `IOnScreenHtml`, `IOnScreenRazor`,
  `OnScreenCanvasExtensions`.

- Window handles:
  `IWindowHandle`, `IWindowHandleProvider`, `IWindowListProvider`,
  `IWindowSelector`, `IWindowMatcher`, `IForegroundWindowTracker`,
  `IWindowBoundsTrackerFactory`.

- Blazor windows:
  `IBlazorWindow`, `IDialogWindowUnstableScriptingApi`,
  `IBlazorWindowAccessor`, `IBlazorViewRepository`, `BlazorViewAttribute`.

- Input:
  `ISendInputScriptingApi`, `IKeyboardEventsSource`,
  `KeybindAttribute`, `HotkeyGesture`, `IInputSimulatorProvider`,
  `IUserInputSmootherProvider`, `KeybindActivationType`.

- Memory:
  `IProcess`, `IProcessMemory`, `IMemoryAccessor`, `LocalProcess`,
  `NativeLocalProcess`, `KDProcess`, `LCProcess`.

- Deployment:
  `PackAurasConfig`, `PackDistributionPolicy`, `PackScriptCompilationMode`,
  `PackScriptProtectionMode`, `IShareProvider`, `AuraShareId`,
  `ISublicenseManager`, `ISublicenseLease`, `IEyeHubService`, `LoginWidget`.

- Optional ImGui SDK:
  `IImGuiExperimentalApi`, `ImGuiWindowManager`,
  `ICanBeDisplayedInImGui`, `IImGuiWindowContent`,
  `ImGuiContainerExtensions`, `ImGuiEx`, `ImGui.GetID`,
  `ImGuiFontSpec`.

- Optional Frida SDK:
  `IFridaExperimentalApi`, `IFridaSession`, `IFridaScript`,
  `FridaAgentProcess`, `CAgentProcess`, `FridaAgentRpcType`.

- Computer vision:
  `IComputerVisionExperimentalScriptingApi`, `ICvAccessor`,
  `ImageSearchTrigger`, `TextSearchTrigger`, `ColorSearchTrigger`,
  `EnableProfiling`, `MiniProfiler`, `RenderPlainText`.

- AI runtime:
  `AiEngine` создаёт chat-, MCP- и coding-agent sessions; `IAiChatSession`
  хранит chat history, active profile, plugin host, retrieval, artifact store
  и conversation engine; `IAiProfileRepository` хранит настроенные записи
  `AiModelProfile`; `AiChatViewModel` и `AiChatComponent` дают готовый
  переиспользуемый Blazor chat UI.

- AI tools:
  `AiKernelPlugin` — базовый класс для tool plugins, вызываемых AI;
  `[KernelFunction]` помечает методы, доступные как tools; `IAiPluginHost`
  хранит и вызывает plugin tools; `AiFunctionInvocationPolicy` управляет
  approval; `AiDocsKnowledgeBasePlugin` добавляет documentation tools `doc_*`
  на базе BM25.

- External AI clients:
  прямые NuGet-клиенты, например OpenAI .NET client, — это обычные зависимости
  скрипта и они отделены от встроенного runtime `EyeAuras.AI`.

- Reverse engineering:
  `ReProcess`, `ReProcessBuilder`, `IReProcess`, `IReFacade`,
  `ReToolsPlugin`.

## XML comments

Карты навигации работают лучше всего, когда у публичных типов, доступных скриптам, есть XML comments.

При обновлении публичных API:

- добавляйте или улучшайте XML summary у публичных interface, class, method,
  property и attribute;
- предпочитайте короткие комментарии про поведение, а не маркетинговый текст;
- упоминайте связанные типы, если это важно для навигации;
- не описывайте приватные детали реализации как часть публичного контракта.