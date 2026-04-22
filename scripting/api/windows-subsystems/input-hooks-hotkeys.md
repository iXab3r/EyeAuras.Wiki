---
title: AI Windows: Input, Hooks, Hotkeys
description: AI-first map of input sending, hooks, interception, and hotkey services.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, input, hotkeys
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Input Hooks / Hotkeys / Send Input Discovery Map

Reference map for keyboard/mouse hooks, hotkeys, script keybinds, send-input
APIs, input simulators, smoothers, redirection, and native detours.

## User Intents

- Bind script methods to hotkeys.
- Detect hotkey state as aura trigger.
- Send keyboard/mouse/text input.
- Select input simulator or smoother backend.
- Track raw keyboard/mouse events.
- Redirect or suppress input.

## Concept Model

- `[Keybind]` is script method metadata.
- `HotkeyIsActiveTrigger` is the aura hotkey condition.
- `ISendInputScriptingApi` is the script-facing input output surface.
- `IKeyboardEventsSource` exposes host keyboard/mouse event streams.
- `IInputSimulatorProvider` selects send-input backend.
- `IUserInputSmootherProvider` selects mouse movement smoother.
- Low-level hook/detour APIs are infrastructure, not the first script API.

## API Details

- `KeybindAttribute` - script hotkey binding metadata.
- `KeybindAttribute.Hotkey` - string gesture such as `F5` or
  `Ctrl+Shift+P`.
- `KeybindAttribute.SuppressKey` - when true, marks the original key event as
  handled/suppressed for both key-down and key-up handling.
- `KeybindAttribute.IgnoreModifiers` - when true, required modifiers must be
  present but extra modifiers are allowed.
- `KeybindAttribute.ActivationType` - selects `KeyDown` or `KeyUp` invocation.
- `KeybindActivationType` - key-down/key-up enum used by `[Keybind]`.
- `HotkeyGesture` - code-friendly hotkey value. Prefer constructors/enums when
  the hotkey is known in code.
- `IHotkeyConverter` - string-to-`HotkeyGesture` conversion. Mostly useful for
  persisted user settings, editor input, or config text.
- `IHotkeyTracker` - runtime hotkey tracking. `IsEnabled` defaults to `true`;
  set it only when intentionally disabling/re-enabling a tracker.
- `HotkeyIsActiveTrigger` - aura trigger for hotkey state.
- `ISendInputScriptingApi` - script send-input API.
- `IInputSimulatorProvider`, `IInputSimulatorEx` - simulator discovery/backend.
- `IUserInputSmootherProvider`, `IUserInputSmoother` - mouse smoothing.
- `IKeyboardEventsSource` - keyboard/mouse event streams.
- `IUserInputRedirectService` - input redirection.
- `HookEngine` - advanced native function detour engine.

## Prefer

- Prefer `[Keybind]` for simple script keyboard shortcuts.
- Prefer `HotkeyIsActiveTrigger` for user-authored aura hotkey conditions.
- Prefer `new HotkeyGesture(...)` in code when the key/modifiers are known.
- Prefer `IHotkeyConverter` when reading a hotkey from persisted text or user
  input.
- Prefer `ISendInputScriptingApi` for script input output.
- Prefer provider-discovered simulator/smoother ids.
- Prefer `osd/selection.md` for selecting a target window first.

## Avoid

- Avoid raw global hook subscriptions for simple hotkeys.
- Avoid parsing hard-coded hotkey strings through `IHotkeyConverter` when a
  `HotkeyGesture` constructor would be clearer.
- Avoid setting `IHotkeyTracker.IsEnabled = true` in examples unless the example
  first disabled it; `true` is already the default.
- Avoid assuming simulator ids are installed on every machine.
- Avoid using native detours for normal keyboard/mouse hooks.

## Common Flows

- Runtime hotkey with Rx:
  - create `IHotkeyTracker` through `IFactory<IHotkeyTracker>`.
  - set `Hotkey` with `new HotkeyGesture(...)` for code-defined hotkeys, or
    `IHotkeyConverter` for persisted/user-entered strings.
  - set `HotkeyMode`, `SuppressKey`, `IgnoreModifiers`, or
    `HandleApplicationKeys` only when the defaults are not right.
  - subscribe to `WhenAnyValue(x => x.IsActive)` and filter for `true`.
  - dispose the tracker and subscription with the owner lifetime; in top-level
    scripts, use `ExecutionAnchors` for per-run resources.

- Script method `[Keybind]`:
  - decorate instance methods on the script object.
  - methods can be public or non-public.
  - multiple `[Keybind]` attributes can be placed on one method.
  - the runtime parses the string with `IHotkeyConverter`.
  - handler invocation is scheduled on the background scheduler.
  - method parameters are resolved from the script DI container before invoke.
  - if the method returns `Task`, runtime waits for task completion.
  - exceptions are written to aura event log as failed keybind events.
  - registration is active only while the script execution tracker is in the
    running state.

## Research Anchors

- `KeybindAttribute`, `KeybindActivationType`,
  `HotkeyTrackerRuntimeVisitor`, `HotkeyGesture`, `IHotkeyConverter`,
  `IHotkeyTracker`, `HotkeyIsActiveTrigger`, `ISendInputScriptingApi`,
  `IInputSimulatorProvider`, `IUserInputSmootherProvider`,
  `IKeyboardEventsSource`, `IUserInputRedirectService`, `HookEngine`.

## Search Synonyms

- hotkey
- keybind
- keyboard hook
- mouse hook
- send input
- input simulator
- input smoother
- target window input
- input redirect
- suppress key
- ignore modifiers
- key down
- key up
- keybind activation type
- method parameter injection
- native detour

## Related Maps

- `scripting/runtime.md`
- `auras/triggers.md`
- `auras/actions.md`
- `osd/selection.md`
- `windows-subsystems/window-handles.md`
