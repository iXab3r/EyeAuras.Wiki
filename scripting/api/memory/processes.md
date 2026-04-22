---
title: AI Memory: Processes
description: AI-first map of process attachment and memory process readers.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, memory
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Memory / Process Discovery Map

Reference map for core process readers, process memory access, pointer chains,
pattern scanning, PE helpers, modules, code caves, and backend selection.

Optional package-specific readers belong in `nuget/`.

## User Intents

- Attach to a process and read/write memory.
- Choose local, native local, kernel-driver, or MPFS backend.
- Attach from a PID selected via window picker.
- Resolve modules, imports, exports, PE metadata.
- Follow pointer chains.
- Build simple memory-backed entity/object wrappers.
- Scan byte/string patterns.
- Enumerate memory regions and protections.

## Concept Model

- `IProcess` is the top-level target process abstraction.
- `IProcessMemory` exposes process memory facade.
- `IMemoryAccessor` is the practical read/write API.
- `IMemoryBackend` performs low-level operations.
- `RemoteMemoryObject` is a small helper base for objects that represent a
  known address inside an `IMemory` view.
- `EyeAuras.Memory.Shared` contains contracts.
- `EyeAuras.Memory` contains local process access.
- `EyeAuras.Memory.KD` contains kernel-driver-backed access.
- `EyeAuras.Memory.MPFS` contains MemProcFS / LeechCore / VMM access.
- Backends do not expose identical control capabilities.

## API Details

- `IProcess` - `IsValid`, `ProcessName`, `ProcessId`, `Memory`,
  `GetProcessModules()`, `GetThreads()`, `VirtualQuery(...)`,
  `GetMemoryRegions()`.
- `IProcessMemory` - process memory facade.
- `IMemoryAccessor` - typed reads/writes, pointer reads, pointer-chain reads.
- `IMemory` - memory view, often module-scoped through `MemoryOfModule(...)`.
- `RemoteMemoryObject` - base class for address-backed memory object wrappers.
- `IMemoryBackend` - backend implementation contract.
- `IProcessControlApi` - allocation, protection, threads, suspend/resume, APC
  where supported.
- `LocalProcess` - normal local user-mode reader.
- `NativeLocalProcess` - native local backend with permission tuning.
- `KDProcess` - kernel-driver-backed reader.
- `LCProcess`, `ILCProcessBuilder` - MPFS/LeechCore/VMM readers.
- `MemoryExtensionsForPatterns`, `BytePattern`, `StringPattern` - signature
  scanning.
- `MemoryExtensionsForImports`, `MemoryExtensionsForExports`,
  `ProcessPEExtensions` - PE helpers.

## Common Flows

- Attach from selected window:
  - pick or receive `IWindowHandle`.
  - read expected PID from `ProcessId`.
  - create reader by PID.
  - validate `IsValid` and `ProcessId`.

- Read pointer chain:
  - get `IMemoryAccessor`.
  - call `ReadPointerChain` or `ReadPointerChain32`.
  - read/write final address.

- Scan signature:
  - create `BytePattern` or `StringPattern`.
  - use pattern extension helpers.
  - scope to module/region when possible.

- Read entity list:
  - create module-scoped `IMemory`.
  - read entity-list pointer and entity count from known offsets.
  - iterate entity pointers.
  - wrap each address as a small memory object or immutable snapshot.
  - display/log values and handle null or stale pointers.

## Prefer

- Prefer `IProcess` as target contract.
- Prefer `LocalProcess` for ordinary local access.
- Prefer `NativeLocalProcess` for native handle/permission tuning.
- Prefer `KDProcess` only when driver access is expected.
- Prefer `LCProcess` / `ILCProcessBuilder` for acquisition/VMM scenarios.
- Prefer validating PID before write-capable tooling.

## Avoid

- Avoid starting with KD/MPFS without environment need.
- Avoid assuming every backend supports allocation, APC, remote thread, manual
  mapping, or module enumeration.
- Avoid writing a new scanner before checking pattern extensions.

## Research Anchors

- `IProcess`, `IProcessMemory`, `IMemoryAccessor`, `IMemoryBackend`,
  `IProcessControlApi`, `LocalProcess`, `NativeLocalProcess`, `KDProcess`,
  `LCProcess`, `ILCProcessBuilder`, `ReadPointerChain`, `VirtualQuery`,
  `BytePattern`, `StringPattern`, `MemoryExtensionsForPatterns`,
  `ProcessPEExtensions`, `MemoryOfModule`, `RemoteMemoryObject`, `ReadString`.

## Search Synonyms

- memory
- process memory
- process reader
- local process
- native process
- kernel driver
- KD process
- MemProcFS
- LeechCore
- pointer chain
- signature scan
- memory region
- module
- PE
- code cave
- entity list
- memory object
- remote memory object
- radar
- player list

## Related Maps

- `windows-subsystems/window-handles.md`
- `osd/selection.md`
- `reverse-engineering/reprocess.md`
- `recipes/bot-memory-entity-list-reader.md`
