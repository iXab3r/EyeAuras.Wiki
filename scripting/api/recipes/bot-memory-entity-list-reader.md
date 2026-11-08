---
title: AI Recipe: Bot Reading Entity List From Memory
description: Short recommendation recipe for a primitive memory reader that shows entities from another process.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, memory, bot, entities, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Bot Reading Entity List From Memory

| Field | Value |
| --- | --- |
| Complexity | Medium |
| Example | Assault Cube radar demo that reads entity data from memory and displays it in a Blazor window. |
| End Goal | Show a live list of entities from another process with names, positions, health, or similar fields. |
| Key Technologies | Memory API, `RemoteMemoryObject`, module memory, Blazor window |

## Use When

- You already know the target process and module.
- You have offsets for player pointer, entity list pointer, count, and fields.
- The entity list is small enough to refresh on a timer.
- The goal is inspection, radar, debugging, or a simple helper UI.

## Example Illustration

[Assault Cube 1.3.0.2 Radar](https://eyeauras.net/share/S20241111183049Hs524Q7FisJ1)
is a historical Memory API and BlazorWindow demonstration. Its public page identifies revision 1, built with EyeAuras 1.5.7733.0 for Assault Cube 1.3.0.2. That page is not proof that its offsets or radar work with another version.

![Assault Cube radar demo](https://s3.eyeauras.net/media/2024/11/ac_client_OCl6NDHXWXR9G0aC.jpg)

## Read one entity-address snapshot

Inputs are an already-open `IProcess`, an absolute address of a pointer array, a count, and the entity layout for the exact target version. Bound the count for your application before reading; a value from target memory must not determine unlimited work. For an x64 target:

```csharp
static ulong[] ReadEntityAddresses(
    EyeAuras.Memory.IProcess process, long arrayAddress, int count)
{
    return process.Memory.Read<ulong>(arrayAddress, count);
}
```

The result contains `count` values, not `count` bytes. Use `uint` for x86 addresses rather than host-sized `nint`. Add the module base to an RVA. If the field stores a pointer to the array, read that pointer first: the field address and array address are different inputs.

For each nonzero address, read known fields with `Read<T>` or read an unmanaged structure. Specify the real encoding and byte budget for strings; structures with managed string fields and `MarshalAs` require `ReadManaged<T>`. `RemoteMemoryObject` wraps an address; it does not discover a layout or make changing memory atomic.

Publish the values with the PID/connection generation and read time as one snapshot to Blazor. The UI renders it without further memory reads and can show stale/error state after a failed refresh. A walk through live memory is not guaranteed consistent from its first read to its last. Keep the process alive through the walk and stop refreshing before disposing it. The `Read<T>(address, size)` contract was checked at EyeAuras `20fd3d4`; the historical pack's concrete offsets and live radar behavior are not validated by this generic operation.

## Shape

- Open the target process and create module-scoped memory.
- Model the game root, local player, entity list, and entity objects as memory
  wrapper classes.
- Read entity count and entity-list pointer from known module offsets.
- Iterate entity pointers and read simple fields such as name, position, health,
  armor, team, or type.
- Show the current snapshot in a small Blazor window, table, radar, or log.

## Choices

- Which process backend to use: local process, MPFS/LC, KD, or custom backend.
- Whether entities are represented as live memory objects or immutable
  snapshots.
- How often the list should refresh.
- Whether invalid/null pointers are skipped, shown as errors, or stop refresh.
- Whether the UI is a table, radar, map, or debug-only log.

## APIs To Look Up

- `IProcess`
- `LocalProcess`
- `LCProcess`
- `KDProcess`
- `IMemory`
- `MemoryOfModule`
- `RemoteMemoryObject`
- `Read<T>`
- `ReadString`
- `IDialogWindowUnstableScriptingApi`
- `BlazorReactiveComponent`
- `BlazorReactiveComponent<T>`

## Avoid

- Treating offsets as stable across game versions.
- Reading every field every frame when only a few fields are displayed.
- Letting UI code own pointer math.
- Crashing on null, stale, or invalid entity pointers.
- Turning a quick entity reader into a full bot framework too early.

## Related Maps

- [memory/processes.md](/en/scripting/api/memory/processes)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [reverse-engineering/reprocess.md](/en/scripting/api/reverse-engineering/reprocess)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
