---
title: AI Scripting: Variables
description: AI-first map for script, aura, folder, and tree variables.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, variables, state
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Variables Discovery Map

Reference map for script-visible variables, typed variable handles, aura/folder
variable hierarchy, default variables, and reactive variable subscriptions.

## User Intents

- Store small settings outside local C# variables.
- Share values between scripts, auras, folders, and behavior.
- Read or write typed variable values safely.
- Listen to variable changes.
- Use folder-level defaults for nested auras.
- Understand why a variable read returned default value.
- Distinguish per-run script fields from persistent aura/folder variables.

## Concept Model

- Local C# variables live only inside one method/run.
- Script class fields/properties live until the script is recompiled or the
  sandbox is recreated.
- Aura/folder/script variables live in EyeAuras variable containers.
- Variables can be visible in the UI on the owning aura/folder.
- `IVariablesScriptingApi` is the script-facing variable API.
- `ScriptVariable<T>` is a typed handle over a named variable.
- Auras and folders implement variable containers through `IHasVariables`.
- Folder variables can act as inherited defaults for nested items.
- `default.*` variables are commonly used to configure default subsystem
  behavior down an aura tree.

## API Details

- `IVariablesScriptingApi` - main script variable API.
- `Variables["name"]` - raw object indexer access.
- `Variables.Get<T>("name")` - typed variable for current script/context.
- `Variables.Get<T>(path, "name")` - typed variable from another aura/folder.
- `Variables.Get<T>(IHasVariables, "name")` - typed variable from known source.
- `ScriptVariable<T>` - typed variable handle.
- `ScriptVariable<T>.Value` - safe read/write; returns `default(T)` on missing,
  null, or incompatible value.
- `ScriptVariable<T>.HasValue` - true when a record exists in the store.
- `ScriptVariable<T>.TryGetValue(out T value)` - strict non-throwing read.
- `ScriptVariable<T>.GetOrThrow()` - strict throwing read for required values.
- `ScriptVariable<T>.Set(value)` - fluent write helper.
- `ScriptVariable<T>.Remove()` - deletes the record.
- `ScriptVariable<T>.Listen()` - observable stream of typed values.
- `IBindingValueConverterRepository` - conversion support behind typed reads.

## Value Semantics

- `Value` never throws.
- `Value` returns `default(T)` when the variable does not exist.
- `Value` returns `default(T)` when the stored value cannot be converted.
- `HasValue` means a record exists, even if the stored value is `null`.
- `TryGetValue` returns false for absent, null, or incompatible values.
- `GetOrThrow` is for required values where absence/type mismatch is an error.
- `Remove` deletes the record and listeners see a reset to `default(T)`.
- `Listen` emits the current value first, then distinct changes.

## Hierarchy

- Aura/folder variables form a tree-like configuration hierarchy.
- A child can read inherited values from parent folders.
- A child can override a parent value locally.
- Folder-level variables are useful for target windows, input mode, shared
  profile names, delays, and other group settings.
- `default.WindowSelector.TargetWindow` and similar `default.*` names can affect
  subsystem defaults for nested items.

## Common Flows

### Optional Setting

1. Get `ScriptVariable<T>`.
2. Use `TryGetValue`.
3. Fall back to a local default when false.

### Required Setting

1. Get `ScriptVariable<T>`.
2. Use `GetOrThrow`.
3. Fail early when a value is missing or invalid.

### Shared Configuration

1. Write a value on a folder or config aura.
2. Read it from worker scripts using path or `IHasVariables`.
3. Override closer to a child aura when needed.

### Reactive UI

1. Get a `ScriptVariable<T>`.
2. Subscribe with `Listen()`.
3. Add the subscription to the current owner lifetime.
4. Update UI or local state when values change.

## Prefer

- Prefer `ScriptVariable<T>` over raw object indexer access.
- Prefer `TryGetValue` for optional values.
- Prefer `GetOrThrow` for required configuration.
- Prefer folder variables for shared configuration across related auras.
- Prefer clear names with a consistent prefix/style.
- Prefer disposing `Listen()` subscriptions with the owning lifetime.

## Avoid

- Avoid treating `Value == default(T)` as proof that a variable is absent.
- Avoid using raw indexer access when type safety matters.
- Avoid storing live handles, windows, processes, or disposable objects in
  variables.
- Avoid overusing global/shared variables for values that belong in local state.
- Avoid assuming `default.*` names are harmless; they may affect nested systems.

## Research Anchors

- `IVariablesScriptingApi`
- `ScriptVariable<T>`
- `IScriptVariable`
- `IHasVariables`
- `IBindingValueConverterRepository`
- `Variables.Get`
- `Variables.Item`
- `HasValue`
- `TryGetValue`
- `GetOrThrow`
- `Listen`
- `Remove`
- `default.WindowSelector.TargetWindow`

## Search Synonyms

- script variables
- aura variables
- folder variables
- tree variables
- blackboard
- shared state
- typed variable
- persistent setting
- default variable
- inherited variable
- variable hierarchy
- reactive variable

## Related Maps

- `scripting/runtime.md`
- `core/eyeauras-structure.md`
- `auras/entities.md`
- `windows-subsystems/window-handles.md`
- `windows-subsystems/input-hooks-hotkeys.md`
