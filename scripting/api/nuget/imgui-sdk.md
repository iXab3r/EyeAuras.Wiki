---
title: AI NuGet: ImGui SDK
description: AI-first map for the optional EyeAuras ImGui SDK package.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, imgui, nuget, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# ImGui SDK Discovery Map

Reference map for optional `EyeAuras.ImGuiSdk`: ImGui render loop, managed
ImGui windows, reusable content, images, fonts, and RE-style tool windows.


## Package versions

Packages from the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json) have different surfaces:

| Package | Confirmed surface |
| --- | --- |
| `0.1.17` | Old `DrawFrame`, `DrawBox`, `MeasureText`, `AddFontFromMemoryTTF` |
| `0.1.42` | `AddFont`, `ReplaceFont`, `RemoveFont`, `RunOnce`, FPS settings; no `ImGuiWindowManager` |
| `0.1.47` | Managed windows and `ComboBoxEx`, `DropdownButton`, `ToggleButton`; CTO `11.5.28` |

Use the selected DLL/XML for signatures; behavior below follows source `c8b2304ac`. This map includes newer capabilities, so its entire catalogue is not available in a `0.1.42` project. `TableTabState` belongs to `EyeAuras.AI.Desktop`, not the ImGui package. Symbol availability does not establish a successful native run.

## Show a window for one script Run

In an EyeAuras top-level C# script, reference the package and register its extension before resolving the API. This complete operation displays a frame counter until Stop:

```csharp
#r "nuget: EyeAuras.ImGuiSdk, 0.1.47"
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System;
using System.Threading;
using System.Threading.Tasks;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    var frame = 0;
    using var rendering = imgui.AddRenderer(_ =>
    {
        var visible = ImGui.Begin("Frame counter##operation-demo");
        try
        {
            if (visible)
                ImGui.TextUnformatted($"Frame: {++frame}");
        }
        finally
        {
            ImGui.End();
        }
    });
    try
    {
        await Task.Delay(Timeout.Infinite, cancellationToken);
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
    }
}
```

The callback runs on the render thread. `AddRenderer` returns its own disposable subscription; reverse using order removes it before the API. `GetService` alone does not establish cleanup. An ordinary class receives the API and token explicitly.

Instances rent shared overlay `Main`: settings, fonts and images are shared. Keep waits, process reads and lengthy work outside the frame callback. `RunOnce` schedules one callback and returns a cancellable registration, not a completion Task.

### Read the display size on one frame

After package and extension setup, this top-level block owns its API for the operation:

```csharp
using ImGuiNET;
using EyeAuras.ImGuiSdk;
using System.Threading.Tasks;

{
    using var imgui = GetService<IImGuiExperimentalApi>();
    var done = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    using var once = imgui.RunOnce(_ =>
    {
        var size = ImGui.GetIO().DisplaySize;
        Log.Info($"ImGui display size: {size.X} x {size.Y}");
        done.TrySetResult(true);
    });
    await done.Task.WaitAsync(cancellationToken);
}
```

`DisplaySize` is the main display area in ImGui units, not the current window's `GetContentRegionAvail()`. Multi-viewport work needs the corresponding viewport contract. Stop cancels the wait and disposes the pending registration; disposal does not interrupt a callback already running.

### What two scripts share

`Main` contains the CTO `OsdOverlay` and its native ImGui context. Two API instances or subscriptions do not create independent contexts. Script models and callbacks have their own owners, while the render loop, settings, font atlas and ImGui native dependencies are shared. A managed ImGui window is a region inside that overlay, not a separate Windows native window. A standalone CTO overlay has its own lifecycle and compatibility requirements.

## User Intents

- Add ImGui UI to a script project.
- Render per-frame ImGui content.
- Open managed ImGui tool windows.
- Host reusable content object.
- Use ImGui images/fonts.
- Host `ReProcess` UI.
- Build the root control surface for a large script app or bot.

## Concept Model

- `EyeAuras.ImGuiSdk` is an optional NuGet package.
- Scripts must opt in with a package reference plus
  `ImGuiContainerExtensions`.
- The package reference makes ImGui SDK types compile; the container extension
  makes ImGui SDK services available from the script container.
- `IImGuiExperimentalApi` owns the overlay/render-loop entry point.
- `AddRenderer(...)` subscribes per-frame renderer.
- `RunOnce(...)` schedules one frame callback.
- `ImGuiWindowManager` owns managed tool windows.
- `ICanBeDisplayedInImGui` is reusable content contract.
- `IImGuiWindowContent` receives `ImGuiWindowCtx`.
- ImGui font/image/markdown helpers can use embedded resources through
  `IScriptFileProvider`.
- ImGui is process-global in practice: the native ImGui/ImGui.NET runtime is a
  singleton-style integration inside the host process and does not support
  multiple independent ImGui contexts or multiple library versions in one app.

## Required Setup

For script mini-apps, `EyeAuras.ImGuiSdk` has two required setup steps:

1. Reference the package: `EyeAuras.ImGuiSdk`.
2. Add the container extension before resolving ImGui services:

```csharp
AddNewExtension<ImGuiContainerExtensions>();

var imgui = GetService<IImGuiExperimentalApi>();
```

Do not assume `IImGuiExperimentalApi` or other resolved ImGui SDK
services are available just because the package compiles. Without
`ImGuiContainerExtensions`, service resolution can fail or return an incomplete
host setup.

## Process-Global Runtime

Treat ImGui as a shared host capability, not as an isolated per-script library.

- There is one ImGui integration inside the process.
- Do not reference or load multiple versions of ImGui.NET or the ImGui SDK in
  the same EyeAuras process.
- Do not create independent ImGui contexts from script code.
- Do not assume a script mini-app can upgrade/downgrade ImGui separately from
  the running host.
- Rendering failures are high impact: a bad native call, invalid texture/font
  usage, or unhandled exception in a render callback can destabilize or crash
  the whole app.
- Keep render callbacks defensive: validate input, avoid blocking work, catch
  and log exceptions around risky sections, and dispose renderer/window
  subscriptions with the owning script lifetime.

## API Details

- `IImGuiExperimentalApi` - render loop, settings, fonts, images.
- `ImGuiContainerExtensions` - registers ImGui SDK services in script DI.
- `WhenRender`, `AddRenderer`, `RunOnce` - frame integration.
- `NoActivate`, `ShowInTaskbar`, `VSync`, `MaxFramesPerSecond` - overlay/window
  behavior and frame pacing.
- `ImGuiWindowManager.OpenNew(...)` - managed windows.
- `ImGuiNewWindowArgs` - window creation options.
- `ImGuiWindowHost` - hosted window lifetime.
- `ICanBeDisplayedInImGui` - `ToImGui()`.
- `IImGuiWindowContent` - window-aware content.
- `IImGuiWindowContentPreBegin` - pre-`Begin` hook.
- `ImGuiWindowCtx` - title, focus, close request.
- `ImGuiEx` - helper controls and utilities.
- `IImGuiExperimentalApi.AddFont(...)` - add font bytes and get an
  `ImGuiFontSpec`.
- `IImGuiExperimentalApi.ReplaceFont(...)` - make a font the default font.
- `IImGuiExperimentalApi.RemoveFont(...)` - remove a registered font.
- `IImGuiExperimentalApi.GetOrAddImage(...)` / `RemoveImage(...)` - explicit
  texture/image registration.

## Package / Extension Shape

- Package reference: `EyeAuras.ImGuiSdk`.
- Main namespaces: `EyeAuras.ImGuiSdk`, `ImGuiNET`, and often
  `System.Numerics`.
- In script mini-apps, always add `ImGuiContainerExtensions` before resolving
  ImGui SDK services from the script container.
- In ordinary app/plugin code, use the host's DI/composition pattern rather than
  assuming script-only helpers are present.
- Add the created API/window/render subscription to the owner lifetime.
- The render callback runs every frame; it must be fast and non-blocking.

## Built-In Helpers / Controls

`ImGuiEx` is the first place to check before writing custom widgets.

- Selection controls:
  - `EnumCombo<TEnum>` for enum selection.
  - `ComboBoxEx<T>` for single or multi selection with filtering, preview text,
    and checked-state callbacks.
  - `DropdownButton<T>` for button-triggered filtered pickers.
- Boolean and confirmation controls:
  - `Checkbox(label, getter, setter)` for property-backed checkboxes.
  - `ToggleButton(...)` for on/off buttons with active styling.
  - `ConfirmButton(...)` for destructive or high-risk commands that need an
    explicit second click, Enter confirmation, Escape cancel, or auto-revert.
- Text and hotkey inputs:
  - `TextField(...)` for label + stretched text input rows.
  - `TextFieldWithConfirmButtons(...)` for edit/save/cancel flows.
  - `HotkeyEditor(...)` for recording an `ImGuiKey`; overloads exist for WPF
    `Key` and WinForms `Keys`.
- Layout helpers:
  - `FlexHorizontal(...)` for table-based horizontal rows.
  - `Stretched(...)` for value + fixed-width action layouts.
  - `ImGuiListClipper()` for large repeated lists.
- Filterable tables:
  - `TableTabState<T>` in `EyeAuras.AI.Desktop` is a reusable base for
    ImGui tables with refresh, text/regex filtering, sorting, row selection,
    and row context menus.
  - Use `SelectedItem`, `HasSelectedItem`, and `SelectedRowKey` when external
    controls such as an `Attach`, `Open`, or `Inspect` button need the current
    row selection.
  - Use it when a mini-app needs a searchable process/window/entity/module/
    artifact list instead of hand-rolling table state.
  - It is an `EyeAuras.AI.Desktop` helper, not a core ImGui.NET primitive.
- Display helpers:
  - `DisplayPropertyGrid(...)` for object or dictionary inspection.
  - `DisplayErrors(...)` for `IHasErrorProvider`.
  - `RenderToImGui(...)` for common values, `ICanBeDisplayedInImGui`, paths,
    matrices, and copy-on-click fallback values.
  - `MarkdownBox(...)` for markdown text with optional custom link rendering.
- Images and fonts:
  - `ImageRgba32(...)` for `Image<Rgba32>` textures.
  - `ImageFromUrl(...)` for URL/data image rendering.
  - `AddFont`, `ReplaceFont`, `PushFont`, `PopFont`, `GetAwesomeFont`, and
    `AwesomeIcon(...)` for custom fonts and built-in Font Awesome icons.
- Drawing helpers:
  - `TextUnformattedOutlined(...)` and `TextOutline(...)` for readable overlay
    labels.
  - `ColorExtensions` convert `System.Drawing.Color`,
    `System.Windows.Media.Color`, and `Vector4` into ImGui color formats.
  - `ImGuiExtensions` add draw-list helpers such as rectangles, dashed lines,
    dashed circles, and filled circles.
  - `ImDrawListWorldExtensions` contains W2S/world-space helpers for ESP-style
    drawing: lines, 2D/3D boxes, spheres, cylinders, and world text.

## Assets, Fonts, And Resources

- Fonts can be loaded from embedded resource bytes, generated static byte
  arrays, files, or other byte sources.
- Use `IImGuiExperimentalApi.AddFont(...)` to register a font and
  `ReplaceFont(...)` to make it default.
- Older examples may mention `AddFontFromMemoryTTF`; current SDK surface is
  `AddFont(...)` plus optional `ReplaceFont(...)`.
- Use `ImGuiEx.PushFont(fontSpec)` / `PopFont(fontSpec)` for scoped font use.
- Use `ImGuiFontRangeType` when the font must include non-default glyph ranges
  such as Cyrillic, Greek, Japanese, Korean, Thai, Vietnamese, or Chinese.
- Use `IScriptFileProvider` to read embedded font/image/markdown bytes from a
  script project.
- Use `ImageRgba32(...)` when the mini-app already has an `Image<Rgba32>`.
- Use `ImageFromUrl(...)` for URL or data-image sources; embedded/local assets
  are usually better read through `IScriptFileProvider`.
- Use stable image labels because `ImGuiEx` image helpers cache loading,
  texture, and preview state by ImGui ID.

## Control State And IDs

ImGui is immediate-mode, but controls still keep short-lived UI state. The key
is the ImGui ID.

- An ID is derived from the current ImGui ID stack plus the control label.
- `ImGuiEx` uses `ImGui.GetID(label)` and an internal state dictionary for many
  controls.
- If the ID stays stable across frames, state is preserved.
- If the ID changes, state is reset.
- If two controls share the same ID, their state collides.
- If two different `ImGuiEx` control types share the same ID, one can overwrite
  the other's cached state.

Stateful `ImGuiEx` examples:

- `ComboBoxEx` keeps filter text, open/closed tracking, pinned popup width, and
  filtered item indices.
- `DropdownButton` keeps filter text, pending multi-select edits, popup width,
  and item snapshots.
- `ConfirmButton` keeps whether the button is armed and when it should
  auto-revert.
- `TextFieldWithConfirmButtons` keeps edit mode, buffer text, and focus request.
- `HotkeyEditor` keeps recording state, pending key, original key, and focus
  request.
- `ImageRgba32` / `ImageFromUrl` keep texture/loading/preview state.
- `MarkdownBox` keeps parsed/rendering state and image/copy tooltip state.

ID rules for generated UI:

- Use stable labels for stable controls: `ImGuiEx.ComboBoxEx("Reader", ...)`.
- Use hidden suffixes when visible labels repeat: `Reader##local`,
  `Reader##kernel`.
- Use `##id` when the visible label is drawn separately and the widget itself
  should have no text label.
- Use `###id` when the visible text changes but the same control state must be
  preserved.
- Wrap repeated rows with `ImGui.PushID(stableItemId)` / `ImGui.PopID()`.
- Prefer domain IDs over list indexes when the list can be sorted, filtered, or
  reordered.
- Do not generate IDs from `Guid.NewGuid()`, timestamps, random values, or
  changing display text.
- Do not create unbounded new IDs every frame; `ImGuiEx` state is cached by ID.

## Custom Controls

- For script projects and mini-apps, build reusable controls as ordinary static
  helper methods or small classes that call `ImGui` and `ImGuiEx`.
- Do not try to extend `ImGuiEx` with a `partial` class from a script project;
  `ImGuiEx` partial files belong to the ImGui SDK assembly itself.
- A control should usually take a stable `label`, current value, and setter or
  `ref` value, then return `true` when the user changed something.
- For multi-frame state, prefer fields on a content object that implements
  `ICanBeDisplayedInImGui` or `IImGuiWindowContent`.
- For reusable static controls, use the caller-provided label as the root ID and
  isolate child widgets with `PushID` plus hidden labels.
- If the custom control must keep its own static state, key that state by
  `ImGui.GetID(label)` in the current ID stack.
- Use `IImGuiWindowContent` when a control/panel needs access to
  `ImGuiWindowCtx` to change title, request focus, or request close.
- Use `IImGuiWindowContentPreBegin` only when the content must call
  `ImGui.SetNextWindow*` before the managed window calls `ImGui.Begin`.

Example shape:

```csharp
public sealed record ReaderOption(string Name);

static bool ReaderPicker(
    string label,
    IReadOnlyList<ReaderOption> readers,
    ref ReaderOption selected)
{
    return ImGuiEx.ComboBoxEx(label, readers, ref selected,
        new ImGuiEx.ComboBoxExOptions<ReaderOption>
        {
            ItemTextGetter = x => x.Name,
            ShowFilter = true,
            FilterHint = "Filter readers..."
        });
}
```

For a larger panel, put the state into a class and implement
`ICanBeDisplayedInImGui.ToImGui()`. The panel can call the helper above every
frame and react only when it returns `true`.

Stateful custom control shape:

```csharp
private sealed class SearchBoxState
{
    public bool FocusNext;
}

private static readonly Dictionary<uint, SearchBoxState> SearchBoxStates = new();

static SearchBoxState GetSearchBoxState(string label)
{
    var id = ImGui.GetID(label);
    if (!SearchBoxStates.TryGetValue(id, out var state))
    {
        state = new SearchBoxState();
        SearchBoxStates[id] = state;
    }

    return state;
}

static bool SearchBox(string label, ref string filter)
{
    var state = GetSearchBoxState(label);

    ImGui.PushID(label);
    try
    {
        if (state.FocusNext)
        {
            ImGui.SetKeyboardFocusHere();
            state.FocusNext = false;
        }

        ImGui.SetNextItemWidth(-1);
        return ImGui.InputTextWithHint("##input", "Filter...", ref filter, 256);
    }
    finally
    {
        ImGui.PopID();
    }
}
```

## Prefer

- Prefer this package map for ImGui APIs.
- Prefer `AddNewExtension<ImGuiContainerExtensions>()` as the first ImGui setup
  step in scripts.
- Prefer `AddRenderer` for root overlay rendering.
- Prefer `ImGuiWindowManager.OpenNew` for tool windows.
- Prefer `ICanBeDisplayedInImGui` for reusable panels.
- Prefer [recipes/bot-memory-imgui-interface.md](/en/scripting/api/recipes/bot-memory-imgui-interface) for root-window,
  bot-loop, and ImGui-plus-Blazor architecture.
- Prefer [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows) for Razor UI.
- Prefer [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay) for screen annotations.
- Prefer stable ImGui IDs for every stateful or repeated control.
- Prefer [scripting/references-and-resources.md](/en/scripting/api/scripting/references-and-resources) for package/resource and
  embedded file rules.

## Avoid

- Avoid assuming ImGui APIs are in base SDK.
- Avoid assuming the package reference alone registers ImGui services in script
  DI.
- Avoid resolving `IImGuiExperimentalApi` before adding
  `ImGuiContainerExtensions`.
- Avoid render subscriptions without owner lifetime.
- Avoid managing many ad hoc `ImGui.Begin` windows when manager exists.
- Avoid duplicating widgets already provided by `ImGuiEx`.
- Avoid unstable labels for stateful/repeated controls; unstable ids cause
  lost focus, mixed state, and wrong selection.
- Avoid blocking or sleeping inside render callbacks.
- Avoid bringing another ImGui.NET or ImGui SDK version into the same process.
- Avoid unhandled exceptions escaping render callbacks; log and degrade the UI
  instead.

## Research Anchors

- `EyeAuras.ImGuiSdk`, `IImGuiExperimentalApi`, `ImGuiWindowManager`,
  `ImGuiWindowHost`, `ImGuiNewWindowArgs`, `ImGuiWindowCtx`,
  `ICanBeDisplayedInImGui`, `IImGuiWindowContent`,
  `IImGuiWindowContentPreBegin`, `ImGuiEx`, `ImGuiModule`,
  `ImGuiContainerExtensions`, `ImGuiExperimentalApi`, `ImGuiFontSpec`,
  `ImGuiFontRangeType`, `AddFont`, `ReplaceFont`, `RemoveFont`,
  `AddFontFromMemoryTTF`, `IScriptFileProvider`,
  `ImGui.GetID`, `ImGui.PushID`, `ImGui.PopID`, `GetOrAddState`,
  `ComboBoxEx`, `DropdownButton`, `ConfirmButton`, `TextField`,
  `TextFieldWithConfirmButtons`, `HotkeyEditor`, `ToggleButton`,
  `TableTabState<T>`, `SelectedItem`, `HasSelectedItem`, `SelectedRowKey`,
  `DisplayPropertyGrid`, `MarkdownBox`, `ImageRgba32`, `ImageFromUrl`,
  `AwesomeIcon`, `TextUnformattedOutlined`, `ImGuiExtensions`,
  `ImDrawListWorldExtensions`, `ColorExtensions`, `ImGui context`,
  `ImGui.NET`, `render callback exception`, `process-global singleton`.

## ImGui window cleanup and operation selection

For immediate mode UI, reference `EyeAuras.ImGuiSdk`, register
`ImGuiContainerExtensions`, and obtain `IImGuiExperimentalApi` in the script.
`AddRenderer` adds a callback to the render loop and returns a separate
subscription. The tool window / ImGui overlay owner disposes that subscription
**before** the API; obtaining a service through `GetService` does not define its
cleanup. Await Run cancellation outside the callback, as in the
[complete window example](/en/scripting/imgui/getting-started).

| Operation | Contract and material condition |
| --- | --- |
| One-time reading in an ImGui context | `RunOnce` schedules a callback without awaiting a frame; separately await the result with cancellation |
| ImGui image or embedded image | Use image helpers and `IScriptFileProvider`; retain the resource ownership contract |
| ImGui font, embedded font, font range | Use SDK font registration; direct `AddFontFromMemoryTTF` requires the correct render context and backing-memory lifetime |
| Stateful control and custom ImGui control | Stable ImGui ID, `PushID`, hidden label / stable label separate control state from displayed text |
| Filterable table, sortable table and row context menu | Use the documented table helpers and `TableTabState`; preserve stable row identity |
| Property grid, hotkey editor, markdown and Font Awesome | Start with the existing `ImGuiEx` and SDK controls described above |
| World to screen and ESP drawing | Convert coordinates explicitly before drawing; screen and world coordinates are not interchangeable |

The `Main` overlay, settings and resources are shared by its users. Changing
one API's settings does not create an independent ImGui singleton. Compatibility
between multiple ImGui.NET versions and a native render loop does not follow
from a successful script compilation. Handle render callback exceptions at the
callback boundary rather than expecting an outer script catch to own that thread.

## Related Maps

- [auras/overlays.md](/en/scripting/api/auras/overlays)
- [recipes/bot-memory-imgui-interface.md](/en/scripting/api/recipes/bot-memory-imgui-interface)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [osd/screen-overlay.md](/en/scripting/api/osd/screen-overlay)
- [reverse-engineering/reprocess.md](/en/scripting/api/reverse-engineering/reprocess)
- [scripting/async.md](/en/scripting/api/scripting/async)
- [scripting/container-extensions.md](/en/scripting/api/scripting/container-extensions)
- [scripting/references-and-resources.md](/en/scripting/api/scripting/references-and-resources)

ID rules: [Dear ImGui FAQ](https://github.com/ocornut/imgui/blob/v1.91.6/docs/FAQ.md#q-about-the-id-stack-system).
