---
title: AI Discovery Maps
description: AI-first routing map for EyeAuras scripting APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, discovery
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# EyeAuras Discovery Maps

This page is the AI-first entry point for EyeAuras API discovery maps.

Discovery maps do not duplicate the full public API. SDK assemblies, XML docs,
and generated metadata remain the canonical reference. These files provide
portable routing information: relevant symbols, package or assembly hints,
terminology, relationships between APIs, and common flows.

## Keep This Updated

When changing public APIs, script-facing services, aura models, triggers,
actions, overlays, window/image/input/memory/ML APIs, optional SDK packages, or
dependency-injection entry points, update the relevant discovery map.

If no relevant map exists yet, create one. Prefer small domain maps over a
single large file.

## Format Rules

- Use exact type names, method names, namespaces, package names, and assembly
  names.
- Explain what the API does, not only where it lives.
- Separate host/runtime context rules from general SDK/API rules.
- Include user-intent keywords and English-only search synonyms.
- Include common flows that show how types connect.
- Link related maps by their folder-relative wiki paths.
- Avoid repository-only paths, build-output assumptions, or tool-specific search
  commands.
- Keep optional NuGet/package APIs in `nuget/` instead of mixing them into core
  SDK maps.

## Directory Layout

- `core/` - product structure, runtime contexts, modules, configuration, and
  deployment/distribution concepts.
- `scripting/` - script runtime, script accessors, host context, helper class
  rules, and script DI.
- `auras/` - aura entities, actions, triggers, overlays, and aura runtime
  infrastructure.
- `windows-subsystems/` - native windows, handles, matching, tracking, Blazor
  windows, input hooks, hotkeys, and send-input infrastructure.
- `osd/` - on-screen user selection and on-screen drawing overlays.
- `memory/` - core memory/process contracts and built-in memory backends.
- `nuget/` - optional SDK packages such as ImGui SDK and Frida SDK.
- `computer-vision/` - capture, image search, OCR, OpenCV, and pixel workflows.
- `ml/` - ML models, datasets, AI runtime, AI tool plugins, retrieval, and
  model-backed search.
- `reverse-engineering/` - RE workspace and RE tooling maps.
- `recipes/` - concrete implementation recipes that assemble multiple API
  areas into project architectures.

## Research Order

1. Identify the product context: aura, folder, behavior tree, macro, trigger,
   action, overlay, script, or app/plugin code.
2. Identify the execution surface: top-level script, ordinary C# class,
   object-style script executor, Razor component, or app/plugin module.
3. Read `core/eyeauras-structure.md`, then the relevant domain map.
4. Search available SDK references, XML docs, generated metadata, and referenced
   assemblies for exact symbols from the map.
5. Check how the current context exposes the needed capability: host member,
   dependency injection, explicit parameter, script-facing accessor, or metadata
   only.
6. Only then add custom interop, wrappers, or new infrastructure.

Do not assume top-level script host capabilities such as `Log`, `AuraTree`,
`Variables`, `Sleep`, or `cancellationToken` are global C# APIs. Ordinary C#
classes must receive dependencies through constructor parameters,
framework/Unity property injection, explicit parameters, or script-owned DI
registrations.

Actions, Triggers, and Overlays are stateful Aura Tree runtime objects, not
lightweight API wrappers. In API maps and migration guides, prefer direct
script APIs, services, extension methods, or helper functions for thin
operations. Mention Actions/Triggers/Overlays when the user is building
configurable Aura Tree behavior, or when the component carries meaningful
domain runtime such as CV, ML, overlay rendering, or long-lived trigger state.

## Map Shape

Use this shape when practical:

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

## Domain Maps

- `core/eyeauras-structure.md` - product structure, Aura Tree, contexts,
  lifecycle, variables, and where scripts run.
- `core/app-runtime-contexts.md` - app vs SDK vs top-level script vs ordinary
  C# class execution contexts.
- `core/app-modules.md` - Prism modules, module loading, dynamic modules, and
  module-private assets.
- `core/blazor.md` - PoeShared.Blazor reactive components, `ReactiveSection`,
  dynamic view resolution, content repository, and JS utilities.
- `core/reactivity.md` - PropertyBinder, Rx/ReactiveUI, DynamicData,
  `SourceList`/`SourceCache`, reactive bindings, and collection
  synchronization.
- `core/configuration-persistence.md` - config providers, config serializer,
  metadata wrappers, migrations, and replacements.
- `core/deployment.md` - export/import, packs, portable packs, mini-apps,
  EyePad launch, script protection, and sublicensing.
- `scripting/runtime.md` - script APIs, dependency/capability access,
  accessors, folders, variables, macros, keybinds, and helper class rules.
- `scripting/async.md` - top-level `await`, background task safety,
  cancellation, fire-and-forget hazards, and coroutine-style script loops.
- `scripting/container-extensions.md` - script DI composition,
  `ScriptContainerExtension`, optional SDK registration, and service graph
  setup.
- `scripting/logging.md` - `Log`, `IFluentLog`, log levels, helper-class
  logger passing, scoped prefixes, exception logs, and diagnostic breadcrumbs.
- `scripting/reactive-lifetime.md` - `DisposableReactiveObject`, `Anchors`,
  `AddTo`, `INotifyPropertyChanged`, and script/runtime NPC weaving.
- `scripting/references-and-resources.md` - NuGet/assembly references,
  embedded resources, `IScriptFileProvider`, DLL/image/font/model assets.
- `scripting/project-workflow.md` - export/import/live-import, IDE workflow,
  C# Overlay iteration, and multi-project solution boundaries.
- `scripting/variables.md` - `ScriptVariable<T>`, variable hierarchy,
  `Value`/`HasValue`/`TryGetValue` semantics, listeners, and `default.*`
  variables.
- `scripting/web-server.md` - script-hosted ASP.NET Core/Kestrel endpoints,
  minimal APIs, controllers, and cancellation-bound server lifetime.
- `scripting/browser-automation.md` - Selenium/WebDriver browser automation as
  an alternative to screen/CV/input automation for web pages.
- `auras/entities.md` - `IAuraRegistrator`, entity mappings, factories,
  proxies, linked-aura evaluators, event log, and lifecycle events.
- `auras/actions.md` - action execution, action registration, script actions,
  and lifecycle action lists.
- `auras/triggers.md` - trigger event sources, trigger registration, script
  triggers, and activation state.
- `auras/overlays.md` - aura overlay entities and how they differ from OSD,
  Blazor windows, and ImGui windows.
- `auras/overview.md` - broad aura pack overview and cross-links.
- `windows-subsystems/window-handles.md` - `IWindowHandle`, raw handle bridges,
  enumeration, matching, selectors, and trackers.
- `windows-subsystems/blazor-windows.md` - Blazor-backed native windows,
  WebView2 hosts, dialog windows, Razor view resolution, and automation.
- `windows-subsystems/input-hooks-hotkeys.md` - keyboard/mouse hooks, hotkeys,
  send-input APIs, input simulators, smoothers, and redirection.
- `osd/selection.md` - `IOsdSelectionService` and interactive window/region/
  point/color picking.
- `osd/screen-overlay.md` - Blazor OSD screen overlay canvas, rectangles,
  HTML/Razor overlay objects, and CV debug annotations.
- `memory/processes.md` - core process readers, memory access, modules, pointer
  chains, pattern scanning, KD, and MPFS.
- `nuget/imgui-sdk.md` - optional `EyeAuras.ImGuiSdk` package, render loop,
  managed ImGui windows, image/font textures, and ImGui content.
- `nuget/frida-sdk.md` - optional `EyeAuras.FridaSdk` package, Frida
  sessions/scripts, Frida Gadget payloads, Frida-backed `IProcess` adapters,
  and CAgent native named-pipe process readers.
- `computer-vision/images.md` - screen/window capture, image search, OCR,
  OpenCV, color, and pixel workflows.
- `computer-vision/profiling.md` - MiniProfiler, `EnableProfiling`,
  `cv.Profiler.Step`, plain-text reports, warm-up, and profiling memory costs.
- `ml/ai.md` - index for ML model inference and app AI integration.
- `ml/ai-runtime.md` - `AiEngine`, chat sessions, profiles, retrieval,
  Blazor chat UI, MCP hosting, Responses API, and desktop scripting AI.
- `ml/ai-kernel-plugins.md` - `AiKernelPlugin`, `[KernelFunction]` tools,
  plugin host, tool approval, retrieval plugins, and tool design rules.
- `ml/script-ai-clients.md` - direct external AI client NuGets from scripts and
  how they differ from built-in `EyeAuras.AI` runtime.
- `reverse-engineering/reprocess.md` - `ReProcess`, RE workspace builder,
  RE tabs/actions/inspectors, and AI RE tools.

## Recipes

- `recipes/recipe.md` - required shape and writing rules for recipes.
- `recipes/bot-memory-imgui-interface.md` - recipe for a memory-reading bot
  with ImGui UI and optional in-app scripting.
- `recipes/bot-memory-behavior-tree.md` - recipe for reading memory and feeding
  Behavior Tree automation.
- `recipes/bot-memory-entity-list-reader.md` - recipe for a primitive
  memory-backed entity list, radar, or debug table.
- `recipes/tool-embedded-eyeauras-host.md` - recipe for adding EyeAuras-powered
  tools to another app/plugin host.
- `recipes/script-ai-editor-assistant.md` - recipe for adding AI chat to script
  editors or mini-apps.

## Known Starting Points

- Product structure:
  `IEyeContext`, `IAuraContext`, `IFolderContext`, `IEyeItem`,
  `IAuraTreeScriptingApi`.

- Script runtime:
  `AuraScriptSandbox`, `IAuraScriptSandbox`, `IFluentLog`,
  `ScriptContainerExtension`, `CsharpScriptActionExecutor`,
  `CsharpScriptTriggerExecutor`.

- Script logging:
  top-level scripts can call `Log` directly; ordinary classes need
  `IFluentLog` passed through constructors/parameters or an independent logger
  from `typeof(MyType).PrepareLogger()`; use levels, prefixes, lazy messages,
  and exception overloads to leave useful diagnostic breadcrumbs.

- Script async:
  top-level scripts support `async`/`await`; pass `cancellationToken` into
  async APIs, catch/log every fire-and-forget boundary, avoid `async void`,
  and prefer the `Coroutine` NuGet package for long-running step-based loops.

- Reactive lifetime:
  `DisposableReactiveObject` is the default base class for helper objects that
  need `IDisposable`, `INotifyPropertyChanged`, or both; put owned resources in
  `Anchors` with `.AddTo(Anchors)` instead of hand-writing trivial `Dispose`
  methods. Normal app projects use `PropertyChanged.Fody`; script projects can
  get NPC behavior from the runtime code weaver.

- Script DI / composition:
  `ScriptContainerExtension` registers script-owned services;
  `AddNewExtension<T>` attaches extensions from top-level script code;
  `Container.AddNewExtensionIfNotExists<T>` composes dependencies between
  extensions; optional SDKs such as ImGui/Frida use this opt-in pattern.

- References / resources:
  `#r "nuget:"` adds packages; `#r "assemblyName:"` references already
  loadable assemblies; `#r "assemblyPath:"` references local/embedded DLLs;
  `IScriptFileProvider` exposes embedded script files and resources.

- Project workflow:
  exported scripts are normal buildable C# projects; import/live-import pull
  the script payload back into EyeAuras; solutions may include helper/test/tool
  projects that are not runtime payload.

- Variables:
  `IVariablesScriptingApi` creates typed `ScriptVariable<T>` handles;
  `Value` is safe/defaulting, `TryGetValue` is strict non-throwing,
  `GetOrThrow` is strict throwing, `Listen` observes changes.

- Script-hosted web APIs:
  `Host.CreateDefaultBuilder`, Kestrel, minimal endpoints, controllers,
  `AddApplicationPart`, and cancellation-bound `RunAsync` are the starting
  points for local HTTP control/diagnostic endpoints.

- Browser automation:
  Selenium/WebDriver controls browser DOM/session state directly and is usually
  preferable to image search or global input simulation for web pages.

- Blazor foundation:
  `BlazorReactiveComponent`, `BlazorReactiveComponent<TContext>`,
  `ReactiveSection`, `ReactiveTrackerList`, `BlazorContentPresenter`,
  `IBlazorViewRepository`, `IBlazorContentRepository`, `IJsPoeBlazorUtils`.

- Reactivity:
  `Binder<TContext>`, `Bind`, `BindIf`, `WhenAnyValue`, `ReactiveCommand`,
  `ObservableAsPropertyHelper`, `SourceList<T>`, `SourceCache<T, TKey>`,
  `Connect`, `BindToCollection`, `SourceListEx<T>`, `SourceCacheEx<T, TKey>`.

- Large script projects:
  `IHostedService`, `ScriptContainerExtension`, `AuraScriptRunner<TSandbox>`,
  `AuraScriptSandbox`, `IImGuiExperimentalApi`, `IBlazorWindow`,
  `IConfigProvider<TConfig>`, `DisposableReactiveObject`, `CompositeDisposable`,
  `Anchors`.

- Aura entity registration:
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
  `AiEngine` creates chat, MCP, and coding-agent sessions; `IAiChatSession`
  owns chat history, active profile, plugin host, retrieval, artifact store,
  and conversation engine; `IAiProfileRepository` stores configured
  `AiModelProfile` entries; `AiChatViewModel` and `AiChatComponent` provide the
  reusable Blazor chat UI.

- AI tools:
  `AiKernelPlugin` is the base class for AI-callable tool plugins;
  `[KernelFunction]` marks methods exposed as tools; `IAiPluginHost` stores and
  invokes plugin tools; `AiFunctionInvocationPolicy` controls approval;
  `AiDocsKnowledgeBasePlugin` adds BM25-backed `doc_*` documentation tools.

- External AI clients:
  direct NuGet clients such as the OpenAI .NET client are ordinary script
  dependencies and are separate from the built-in `EyeAuras.AI` runtime.

- Reverse engineering:
  `ReProcess`, `ReProcessBuilder`, `IReProcess`, `IReFacade`,
  `ReToolsPlugin`.

## XML Comments

Discovery maps work best when public script-facing types have XML comments.

When updating public APIs:

- add or improve XML summaries on public interfaces, classes, methods,
  properties, and attributes;
- prefer concise behavior-oriented comments over marketing text;
- mention related types when they are important for discovery;
- avoid documenting private implementation details as public contracts.
