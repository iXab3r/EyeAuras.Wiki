# AHK Migration Docs Authoring Notes

These notes apply to files in `scripting/api/ahk/`.

## File Organization

- Keep `ahk-migration.md` as the compact hub and table of contents. It should
  describe the overall plan, link to domain pages, and keep only a small
  at-a-glance matrix.
- Put detailed mappings, code samples, recommendations, and verification links
  into focused domain files such as `hotkeys.md`, `keyboard-mouse.md`,
  `windows.md`, `cv-pixels-images.md`, `runtime-state.md`, `clipboard.md`, and
  `dll-native.md`.
- Keep the current domain-page format: front matter, short scope paragraph,
  `## Quick Map`, focused conversion sections, standalone
  `**Recommendation:**` paragraphs, then `## Verification Links`.
- Split a domain file further only after it becomes hard to scan. For example,
  `windows.md` can later split into `windows/matching.md`,
  `windows/activation.md`, and `windows/controls.md` if needed.
- Keep `ahk-gaps.md` as the cross-domain backlog. Domain files should link to
  gap IDs instead of duplicating uncertain semantics.

## Research First

- Before writing or changing an AHK migration entry, read the parent discovery
  map at `../AGENTS.md`, then read the relevant domain maps it points to.
- Each AHK API or EyeAuras technology mentioned in the migration guide should
  have a nearby docs/source verification link. Prefer a short verification table
  over uncited claims.
- Check actual implementations before writing code snippets. Do not set
  properties that are already correct by default. Example:
  `IHotkeyTracker.IsEnabled` defaults to `true`, so snippets should not set it
  unless the example first disabled it.

## C# Script Examples

- Before choosing an EyeAuras API shape, inspect the actual source interface and
  implementation, not only the generated wiki page. Prefer the most direct
  overload available in code.
- For example, `ISendInputScriptingApi` has mouse click overloads that accept
  coordinates and `WinPoint` directly, so prefer:

```csharp
SendInput.MouseLeftClick(x, y);
SendInput.MouseLeftClick(point);
```

  over splitting the operation into `MouseMoveTo(...)` followed by
  `MouseLeftClick()` when translating AHK `Click x, y`.
- Prefer property-injected dependencies over inline `GetService<T>()` calls in
  migration examples.

```csharp
ISendInputScriptingApi SendInput { get; init; }
```

- Use readable property names that match the service role, for example
  `SendInput`, `CV`, `Clipboard`, `WindowSelector`.
- Avoid property names that collide with common namespaces or framework types.
  For example, use `IWindowListProvider WindowsProvider { get; init; }`
  instead of naming the property `Windows`.
- Use `CV` as the property name for `IComputerVisionExperimentalScriptingApi`
  examples. The acronym is familiar in this domain and keeps CV snippets
  compact.
- For a single target window, prefer `IWindowSelector.FindWindow(...)` when a
  missing window is a normal branch. Use `IWindowSelector.GetWindow(...)` only
  when absence is exceptional. Use `IWindowSelector.TargetWindow` plus
  `ActiveWindow` when the example needs persistent selector state. Use
  `IWindowMatcher.FindMatches(...)` only when the example needs all matches or
  deliberately matches over a supplied list.
- Follow the EyeAuras API naming convention in examples:
  - `GetSomething(...)` returns the value or throws.
  - `FindSomething(...)` may return `null` when nothing is found.
  - `TryGetSomething(..., out value)` returns `bool` and writes the value to an
    `out` parameter.
  If the implementation does not match this convention, call out the mismatch
  instead of hiding it behind a `try`/`catch` sample.
- For activation examples, verify `WindowHandleExtensions.Activate(...)` and
  `UnsafeNative.ActivateWindow(...)` from source before describing timeout or
  restore behavior.
- Use `GetService<T>()` only when the point of the example is dynamic service
  lookup or service discovery.
- Do not include namespace `using` lines in migration-guide snippets by
  default. EyeAuras script editing usually auto-injects the common scripting,
  input, CV, and shared namespaces.
- Mention namespaces only when an example depends on an unusual external type
  or package and the namespace is part of the migration decision.
- Keep demo snippets focused. Do not end every subscription example with
  `cancellationToken.WaitHandle.WaitOne()` just to keep the sample alive. If the
  snippet is only part of a long-running script, say that in prose.
- Prefer lightweight subscriptions in short docs examples. For example, use
  `.SubscribeSafe(_ => SendInput.Text("hello"))` unless the error handler is
  the point of the example.

## Migration Scope

- Prefer stable APIs in user-facing examples. Use `ISendInputScriptingApi`
  instead of deprecated unstable aliases.
- Keep examples small and AHK-shaped: one primitive AHK behavior, one EyeAuras
  equivalent.
- For direct API migrations, show the direct equivalent first. If a nicer
  EyeAuras abstraction exists, mention it as a rewrite option after the direct
  mapping. Example: an AHK `DllCall` should first show C# P/Invoke
  (`DllImport`/typed signature), then optionally mention an existing
  EyeAuras/PoeShared API.
- Do not present Actions, Triggers, or Overlays as lightweight API equivalents
  for thin operations. They are stateful Aura Tree runtime objects with
  configuration, lifecycle, serialization, and UI concerns. Prefer direct
  script APIs, services, extension methods, or small helpers for migration
  snippets. Mention Actions/Triggers/Overlays only when the user is building a
  configurable aura, or when that component provides substantial domain runtime
  that is not just a thin wrapper, such as image-search or ML pipeline state.
- For every mapping, include a short judgment about which option is better or
  more user-friendly. Do not only say that something is technically possible.
  Call out when the EyeAuras translation is awkward, too low-level, or better
  expressed as an aura trigger/action, Behavior Tree node, helper method, or
  recipe.
- In conversion sections, keep code/explanation separate from judgment. Put the
  verdict in a standalone `**Recommendation:**` paragraph after the code and
  any necessary explanation. Keep it very short: say whether the migration is
  good enough, better in EyeAuras, awkward, or should become a helper/recipe.
- When EyeAuras has multiple credible approaches, show the default/simple path
  first and mention the control-oriented path separately. Example: `[Keybind]`
  is the clean default for simple script hotkeys, while `IHotkeyTracker` with
  Rx subscriptions is better when the script needs runtime registration,
  multiple hotkeys, or custom observable composition.
- For variables/state, plain C# locals, fields, and objects are the primary
  replacement for ordinary AHK variables. `ScriptVariable<T>` and
  `IVariablesScriptingApi` are for shared or persistent state: across launches
  of the same script, between different scripts, or between a script and
  EyeAuras infrastructure outside the script.
- Be honest about unpleasant migrations. For example, a manual
  `while (...) { Sleep(...) }` loop for AHK `KeyWait` is valid but awkward; mark
  it as a candidate helper or prefer a higher-level EyeAuras pattern when one
  exists.
- Put uncertain semantics in `ahk-gaps.md` instead of presenting them as direct
  equivalents.
