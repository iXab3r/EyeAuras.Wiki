---
title: AI Memory: Processes
description: AI-first map of process attachment and memory process readers.
published: true
date: 2026-05-03T00:00:00.000Z
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
- Resolve a live local thread id or thread handle to its TEB address.
- Enumerate processes through a kernel `_EPROCESS` list when the backend can
  read kernel virtual memory.
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
- `IProcessControlApi` - allocation, protection, `CreateThread`,
  synchronous `ExecuteCode`, suspend/resume, APC where supported.
- `IProcessSupportsManualMapping` - opt-in marker for backends that can stage
  and synchronously execute manual-mapping code through `IProcess` plus
  `IProcessControlApi`.
- `LocalProcess` - normal local user-mode reader.
- `NativeLocalProcess` - native local backend with permission tuning.
- `KDProcess` - kernel-driver-backed reader.
- `LCProcess`, `ILCProcessBuilder` - MPFS/LeechCore/VMM readers.
- `MemoryExtensionsForPatterns`, `BytePattern`, `StringPattern` - signature
  scanning.
- `MemoryExtensionsForCodeCaves`, `CodeCaveEntry` - module-scoped code-cave
  enumeration; default scanning targets readable executable sections and treats
  `0x00`, `0xCC`, and `0x90` runs as valid cave padding.
- `MemoryExtensionsForImports`, `MemoryExtensionsForExports`,
  `ProcessPEExtensions` - PE helpers.
- `MemoryExtensionsForEprocess` - backend-neutral helpers for reading
  high-level process/module facts from `_EPROCESS`, PEB, and loader-list
  records through any `IMemoryReader` that can read the relevant virtual
  memory.
- `MemoryExtensionsForTebPeb` - backend-neutral helpers for reading a PEB
  address from a TEB, loaded modules from PEB loader lists, and process
  startup parameters from `RTL_USER_PROCESS_PARAMETERS` through any
  `IMemoryReader` that can read the target user-mode address space. It also
  contains local live-OS thread-to-TEB query helpers for flows that start from
  a Windows thread id or handle.
- `ReadProcessInformation` - reads PID and image-name information from an
  `_EPROCESS` address without exposing raw kernel structures.
- `ReadProcessModulesViaEprocess` - reads loaded modules through the PEB
  referenced by `_EPROCESS` and returns `ProcessModuleInformation`.
- `ReadTebAddressViaThreadHandle` - queries the live local OS for
  `ThreadBasicInformation.TebBaseAddress` from an already-open thread handle.
- `ReadTebAddressViaThreadId` - opens a live local Windows thread by id,
  queries its TEB address, and closes the temporary handle.
- `ReadPebAddressViaTeb` - reads `TEB.ProcessEnvironmentBlock` from a
  caller-supplied TEB address and explicit target architecture.
- `ReadProcessModulesViaPeb` - reads loaded modules through a caller-supplied
  PEB address and explicit target architecture.
- `ReadProcessModulesViaTeb` - composes TEB-to-PEB reading with PEB loader-list
  walking.
- `ReadProcessParametersViaPeb` - reads command-line, image-path,
  current-directory, desktop/window metadata, and the environment pointer
  through a caller-supplied PEB address.
- `ReadProcessParametersViaTeb` - composes TEB-to-PEB reading with
  `RTL_USER_PROCESS_PARAMETERS` reading.
- `ReadArchitectureViaEprocess` - reads process architecture from kernel
  structure fields; this is the best path when the backend can read
  `_EPROCESS.WoW64Process`.
- `ReadArchitectureViaTeb` - reads process architecture from a TEB self
  pointer; this is the preferred user-mode path when a TEB address is known.
- `ReadArchitectureViaPeb` - reads architecture from `PEB.ImageBaseAddress`
  and the in-memory PE machine type; use when only a PEB address is known.

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

- Find a code cave:
  - create module-scoped memory with `MemoryOfModule(...)`.
  - call `EnumerateCodeCaves(minBytes, alignment)` for executable caves.
  - pass `sectionFilter` and `acceptedFillBytes` when the cave is for data
    placement or when only a specific padding byte is acceptable.
  - for scalar state near injected code, use `Read<T>` and `Write<T>`; use
    byte-span writes only for machine-code payloads or encoded strings.

- Read entity list:
  - create module-scoped `IMemory`.
  - read entity-list pointer and entity count from known offsets.
  - iterate entity pointers.
  - wrap each address as a small memory object or immutable snapshot.
  - display/log values and handle null or stale pointers.

- Enumerate processes from kernel memory:
  - use a backend that can read kernel virtual addresses, such as `KDProcess`
    or a VMM/MPFS-backed reader. The memory source can be another machine, a
    dump, or a live VMM acquisition.
  - obtain a valid `_EPROCESS` address from the backend/driver/acquisition.
  - call `ReadProcessesViaEprocess(eprocessAddress)`.
  - call `ReadProcessInformation(eprocessAddress)` for a single process
    snapshot.
  - call `ReadProcessModulesViaEprocess(eprocessAddress)` for module data when
    the backend can also read the target process user-mode address space.
  - call `ReadArchitectureViaEprocess(eprocessAddress)` when architecture
    should be inferred from `_EPROCESS.WoW64Process`.
  - pass the source OS build when it differs from the current host; the current
    implementation is still layout-sensitive until the PDB offset resolver
    replaces hardcoded `_EPROCESS`, PEB, and loader-list offsets.

- Enumerate modules from user-mode memory without OS snapshot APIs:
  - use a backend that can read the target process address space.
  - obtain a valid TEB or PEB address from the backend, thread metadata, or
    another trusted discovery path.
  - for live local window/hook flows, resolve the owner thread id and call
    `ReadTebAddressViaThreadId`; use `ReadTebAddressViaThreadHandle` when a
    suitable thread handle is already open.
  - call `ReadPebAddressViaTeb(tebAddress, architecture)` when starting from a
    TEB.
  - call `ReadArchitectureViaTeb(tebAddress)` first when the architecture is
    unknown and a TEB address is trusted.
  - call `ReadArchitectureViaPeb(pebAddress)` when the architecture is unknown
    and only a PEB address is trusted.
  - call `ReadProcessModulesViaPeb(pebAddress, architecture)` or
    `ReadProcessModulesViaTeb(tebAddress, architecture)` for module data.
  - call `ReadProcessParametersViaPeb(pebAddress, architecture)` or
    `ReadProcessParametersViaTeb(tebAddress, architecture)` for startup
    metadata such as image path, command line, and current directory.
  - pass the target layout architecture explicitly; this is especially
    important for WOW64 and acquired-memory scenarios.

- Manual-map a DLL into a compatible target:
  - require an `IProcess` that also implements `IProcessSupportsManualMapping`.
  - compatible local backends include `LocalProcess` and `NativeLocalProcess`.
  - optional package backends may opt in; `WHProcess` supports x64 GUI targets
    when its WH control prerequisites are available.
  - use `InjectDllViaManualMapping(...)`; the mapper relies on
    `IProcessControlApi.ExecuteCode(...)` for synchronous completion before it
    reads mapper return buffers or frees shellcode.
  - do not treat `CreateThread(...)` as a waitable completion primitive; it is
    the async/fire-and-forget thread start surface.

## Prefer

- Prefer `IProcess` as target contract.
- Prefer `LocalProcess` for ordinary local access.
- Prefer `NativeLocalProcess` for native handle/permission tuning.
- Prefer `KDProcess` only when driver access is expected.
- Prefer `LCProcess` / `ILCProcessBuilder` for acquisition/VMM scenarios.
- Prefer validating PID before write-capable tooling.
- Prefer explicit versioned layout structs for kernel/private structures:
  declare logical fields as `[field: FieldOffset(...)]` auto-properties,
  dispatch through a small typed interface, and use typed static offsets for
  list/link pointer arithmetic.
- Prefer explicit target architecture when using TEB/PEB helpers. The memory
  source may not match the current process architecture.
- Prefer `ReadTebAddressViaThreadId` or `ReadTebAddressViaThreadHandle` for
  live local Windows user-mode flows where a thread id/handle is already known,
  then validate the result with `ReadArchitectureViaTeb`.
- Prefer `IMemoryAccessor.Read<T>` and `IMemoryAccessor.Write<T>` for
  unmanaged scalar/struct values in process memory. Use byte arrays/spans for
  actual byte payloads such as machine code, strings, file/protocol layouts, or
  bulk buffers.
- Prefer `MemoryOfModule(...).EnumerateCodeCaves(...)` before writing local
  ad hoc code-cave scanners.

## Avoid

- Avoid starting with KD/MPFS without environment need.
- Avoid assuming every backend supports allocation, APC, remote thread,
  synchronous execution, manual mapping, or module enumeration.
- Avoid building manual mapping directly on `CreateThread(...)`; use
  `IProcessControlApi.ExecuteCode(...)` or a backend that exposes
  `IProcessSupportsManualMapping`.
- Avoid using `ReadProcessesViaEprocess` on ordinary user-mode process memory;
  it expects kernel virtual addresses and matching Windows kernel layouts.
- Avoid depending on raw `_EPROCESS`, PEB, or loader-list snapshots from the
  public API. The shared helpers intentionally return `ProcessInformation`,
  `ProcessModuleInformation`, and `Architecture`; low-level readers can define
  their own structs when they need raw layout work.
- Avoid inferring TEB or PEB layout from host bitness. Pass the layout
  architecture that matches the supplied TEB/PEB address.
- Avoid using thread-to-TEB OS query helpers for dumps, VMM/KD snapshots, or
  cross-machine memory sources. Those need backend-supplied thread metadata or
  kernel thread-list walking.
- Avoid string/reflection-based offset lookup for layouts that may ship through
  obfuscation. Do not rely on `Marshal.OffsetOf<T>(nameof(...))`, auto-property
  backing-field names, or member-name strings for pointer math in obfuscated
  assemblies; keep needed offsets as typed static members near matching
  `[field: FieldOffset(...)]` declarations.
- Avoid writing a new scanner before checking pattern extensions.
- Avoid `BinaryPrimitives`, `MemoryMarshal`, or manual byte packing as a thin
  wrapper around ordinary scalar process-memory reads/writes. Reserve those APIs
  for explicit byte-format work.

## Research Anchors

- `IProcess`, `IProcessMemory`, `IMemoryAccessor`, `IMemoryBackend`,
  `IProcessControlApi`, `IProcessControlApi.ExecuteCode`,
  `IProcessSupportsManualMapping`, `LocalProcess`, `NativeLocalProcess`, `KDProcess`,
  `LCProcess`, `ILCProcessBuilder`, `ReadPointerChain`, `VirtualQuery`,
  `BytePattern`, `StringPattern`, `MemoryExtensionsForPatterns`,
  `ProcessPEExtensions`, `MemoryExtensionsForEprocess`,
  `MemoryExtensionsForTebPeb`, `ReadPebAddressViaTeb`,
  `ReadProcessModulesViaPeb`, `ReadProcessModulesViaTeb`,
  `ReadProcessParametersViaPeb`, `ReadProcessParametersViaTeb`,
  `ReadTebAddressViaThreadHandle`, `ReadTebAddressViaThreadId`,
  `ReadProcessesViaEprocess`, `ReadProcessInformation`,
  `ReadProcessModulesViaEprocess`, `ReadArchitectureViaEprocess`,
  `ReadArchitectureViaTeb`, `ReadArchitectureViaPeb`,
  `MemoryExtensionsForCodeCaves`, `EnumerateCodeCaves`, `CodeCaveEntry`,
  `ModuleSectionEntry`, `MemoryOfModule`, `RemoteMemoryObject`, `ReadString`.

## Search Synonyms

- memory
- process memory
- process reader
- local process
- native process
- kernel driver
- KD process
- EPROCESS
- ActiveProcessLinks
- WoW64Process
- ReadArchitectureViaEprocess
- ReadArchitectureViaTeb
- ReadArchitectureViaPeb
- ReadTebAddressViaThreadHandle
- ReadTebAddressViaThreadId
- TebBaseAddress
- ThreadBasicInformation
- ReadProcessInformation
- ReadProcessesViaEprocess
- ReadProcessModulesViaEprocess
- ReadPebAddressViaTeb
- ReadProcessModulesViaPeb
- ReadProcessModulesViaTeb
- ReadProcessParametersViaPeb
- ReadProcessParametersViaTeb
- TEB
- PEB
- ProcessEnvironmentBlock
- RTL_USER_PROCESS_PARAMETERS
- process parameters
- command line
- PEB_LDR_DATA
- LDR_DATA_TABLE_ENTRY
- process list
- kernel process list
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
- manual mapping
- ExecuteCode
- IProcessSupportsManualMapping
- radar
- player list

## Related Maps

- `pattern-scanning.md`
- `windows-subsystems/window-handles.md`
- `osd/selection.md`
- `reverse-engineering/reprocess.md`
- `recipes/bot-memory-entity-list-reader.md`
