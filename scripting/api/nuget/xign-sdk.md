---
title: AI NuGet: Xign SDK
description: AI-first map for optional Xign driver infrastructure and XignProcess.
published: true
date: 2026-05-03T00:00:00.000Z
tags: scripting, api, ai, xign, nuget, driver, memory
editor: markdown
dateCreated: 2026-05-03T00:00:00.000Z
---
# Xign SDK Discovery Map

Reference map for optional `EyeAuras.XignSdk` APIs. The SDK provides driver
loading and low-level device connection infrastructure for a packaged
Xign kernel driver plus the currently mapped protocol operations for direct
driver access, process memory, synchronous code execution, and driver-backed
process-control flows.

## Important Caveat

`EyeAuras.XignSdk` uses the Xign driver, also known as XignCode3. Treat
`XignProcess` as a pragmatic temporary backend for controlled environments, not
as a universal compatibility guarantee. Xign/XignCode3 may conflict with other
kernel drivers, anti-cheat products, security software, Windows Code
Integrity/VBS, or local driver-loading policy.

For commercial or public products where user-machine compatibility must be
controlled, prefer a custom `IProcess` backend. Memory API keeps that migration
local: most downstream code should depend on `IProcess`, `IProcess.Memory`,
control interfaces, and helpers, so swapping `XignProcess` for another process
backend should usually be a small construction-site change.

## User Intents

- Add optional Xign driver infrastructure to a script or tool project.
- Load/start the packaged Xign driver through normal Windows SCM APIs.
- Open the Xign device with `CreateFile`.
- Represent a target process as `XignProcess`.
- Read and write target memory through `XignProcess.Memory`.
- Use `XignDriverManager` and `XignDriverConnection` directly when a tool needs
  driver commands without wrapping them in `XignProcess`.
- Execute an already-staged target function through `IProcessControlApi.ExecuteCode`.
- Use `XignProcess` for allocation/protection/free, manual mapping, remote
  thread creation, suspend/resume, and User APC flows when the host environment
  supports them.
- Keep the fixed xhunter1 command envelope documented without exposing
  vulnerability/demo primitives as public SDK APIs.

## Concept Model

- `EyeAuras.XignSdk` is an optional SDK package, not part of the core memory SDK.
- `XignProcess` implements `IProcess`, `IProcessControlApi`,
  `IProcessSupportsManualMapping`, and `IProcessSupportsUserApc` so it can be
  passed to APIs that expect a process abstraction with optional control
  capabilities.
- `XignDriverManager` is a public SCM loader/factory for direct driver
  connections.
- `XignDriverConnection` is a public device connection that owns the xhunter1
  command envelope, temporary init/auth session, response buffer, and typed
  command helpers.
- `XignProcess.Memory` uses the Xign driver connection for reads and a
  driver-opened process handle for writes.
- `XignProcess` opens process handles through the driver, then uses those
  handles for several WinAPI-backed control operations such as
  `VirtualAllocEx`, `VirtualProtectEx`, `WriteProcessMemory`,
  `CreateRemoteThread`, and `NtSuspendProcess`.
- `XignDriverServiceConfig` defines the default service/device/payload identity:
  `xhunter1`, `\\.\xhunter1`, and `xhunter1.sys`.
- The driver payload is expected at `Payloads/xhunter1.sys` in the SDK project and
  is embedded when present.
- Driver loading is SCM-only. It does not attempt DSE/signature bypasses.
- The driver connection frames the current xhunter1 packet shape: a 624-byte
  request, a 16-byte-aligned user response buffer, and response status fields at
  offsets `+12` and `+16`.
- Before normal commands, the connection initializes the driver and authenticates
  the current process. If a command fails, the temporary session state is
  invalidated and rebuilt on the next requested operation.

## API Details

- `IXignProcess` - `IProcess`, `IProcessControlApi`,
  `IProcessSupportsManualMapping`, and `IProcessSupportsUserApc` marker for the
  Xign-backed target process.
- `XignProcess.ByProcessId(processId)` - attaches to a PID using the default
  builder without starting the driver.
- `XignProcess.ByProcessName(processName)` - resolves a local process name with
  or without `.exe`, then attaches by PID.
- `XignProcess.WithLoadDriver(loadDriver)` - returns an `IXignProcessBuilder`
  configured to create/start the packaged driver service before opening the
  device when `loadDriver` is true.
- `XignProcess.WithOpenProcess(openProcess)` - returns an `IXignProcessBuilder`
  configured to keep the driver-opened process handle alive for each created
  process lifetime.
- `IXignProcessBuilder` - builder for `ByProcessId`, `ByProcessName`, and
  `WithLoadDriver` / `WithOpenProcess`.
- `XignDriverServiceConfig.Default` - default service/device/payload names.
- `XignDriverManager.Create(loadDriver)` - optionally loads the packaged driver
  and returns an opened `IXignDriverConnection`.
- `XignDriverConnection` / `IXignDriverConnection` - direct device API for raw
  `Call(command, args)` and typed helpers such as `PingEcho`,
  `QueryVersionStatus`, `OpenProcess`, `ReadUserMemory`, `ReadMemory`, and
  `ExecuteCodeByProcessId`.
- `IXignProcess.Memory` - supports byte/scalar read/write through the Xign
  connection and driver-opened process handles.
- `IXignProcess.ExecuteCode(startAddress, parameter)` - synchronously executes
  an already-staged x64 or x86 function in the target process through Xign
  command 820 and returns the pointer-sized value reported by the driver.
- `IXignProcess.AllocateMemory`, `FreeMemory`, and `ProtectMemory` - WinAPI
  virtual-memory control through the driver-opened process handle.
- `IXignProcess.CreateRemoteThread`, `SuspendProcess`, `ResumeProcess`,
  `SuspendThread`, and `ResumeThread` - process/thread control helpers exposed
  through the common process-control surface.
- `IXignProcess.InjectDllViaManualMapping(...)` - manual mapping through the
  shared `LibraryMapper` using `XignProcess.Memory` and `ExecuteCode`.
- `IXignProcess.QueueUserApc(...)` - User APC helper using the regular
  `OpenThread` / `QueueUserAPC` path.
- `IXignProcess.EnterOpenProcess()` - explicit lease that keeps the
  driver-opened process handle alive for a batch of operations.
- The binary command packet structs are internal implementation details and are
  not exposed as a public command-authoring surface.

## Current Limitations

- `XignDriverConnection` requires a 64-bit host process.
- `QueueUserApc` depends on regular thread-handle access and target-thread
  alertable wait behavior; it is not a separate mapped Xign command.
- Several high-level control methods use WinAPI calls on driver-opened handles,
  not separate Xign commands for every operation.
- Raw `Call(command, args)` exists for direct diagnostics, but packet DTOs and
  command-specific argument structs remain internal. Prefer typed helpers for
  mapped commands.
- Real driver-load smoke tests require admin rights, a compatible host, and the
  actual `Payloads/xhunter1.sys` binary.

## Common Flows

- Open an already-running Xign device:
  1. Reference `EyeAuras.XignSdk`.
  2. Call `XignProcess.ByProcessId(pid)` or `ByProcessName(name)`.
  3. Validate `IsValid`.
  4. Use `Memory.Read<T>`, `Memory.Write<T>`, span reads/writes,
     virtual-memory control, manual mapping, or `ExecuteCode` when the host
     driver is compatible.

- Start the packaged driver and open the device:
  1. Add the real driver as `Payloads/xhunter1.sys` before packaging or manual tests.
  2. Call `XignProcess.WithLoadDriver().ByProcessId(pid)`.
  3. Handle SCM, permission, signature, VBS, and policy failures as environment
     setup issues.

- Execute staged code:
  1. Stage a target x64 or x86 function in the target process address space.
  2. Call `((IProcessControlApi)xignProcess).ExecuteCode(startAddress, parameter)`
     or `xignProcess.ExecuteCode(startAddress, parameter)`.
  3. Treat the returned `ulong` as the raw pointer-sized return value from the
     backend.

- Manual-map a DLL:
  1. Create a `XignProcess`, usually with `WithLoadDriver().WithOpenProcess()`
     for integration-style flows.
  2. Call `InjectDllViaManualMapping(pathOrBytes)`.
  3. Use the returned `ManualMappedLibraryDescriptor` to inspect base address
     and entry point if needed.

- Use direct driver commands:
  1. Create `new XignDriverManager(XignDriverServiceConfig.Default)`.
  2. Call `Create(loadDriver: true)` for tests/manual tools, or `false` for an
     already-running driver.
  3. Use typed command helpers. `ReadUserMemory` is command 787 with a process
     handle; `ReadMemory` is command 788 and copies bytes through the driver's
     `MmIsAddressValid`-gated path.

## Prefer

- Prefer `XignProcess` only when the Xign driver is expected to be available.
- Prefer normal SCM loading and clear diagnostics for driver setup failures.
- Prefer high-level `IProcess.Memory` and `IProcessControlApi.ExecuteCode`
  instead of exposing command IDs publicly.
- Prefer `WithOpenProcess()` or `EnterOpenProcess()` around batches of
  memory/control operations.
- Prefer `IProcess` for downstream APIs that can tolerate backend-specific
  capability differences.

## Avoid

- Avoid treating Xign as a KD/DBK backend; it has its own service/device identity.
- Avoid positioning Xign/XignCode3 as conflict-free infrastructure for public
  end-user machines.
- Avoid DSE bypass behavior in XignSdk.
- Avoid placing temporary driver files in repo project directories.
- Avoid assuming every exposed process-control operation is a dedicated driver
  command; some operations use WinAPI over driver-opened handles.

## Research Anchors

- `EyeAuras.XignSdk`
- `IXignProcess`
- `XignProcess`
- `IXignProcessBuilder`
- `XignDriverServiceConfig`
- `XignDriverManager`
- `XignDriverConnection`
- `IXignDriverConnection`
- `IProcess`
- `IMemoryBackend`
- `IProcessControlApi`
- `IProcessSupportsManualMapping`
- `IProcessSupportsUserApc`
- `ExecuteCode`
- `InjectDllViaManualMapping`
- `EnterOpenProcess`
- `ReadMemory`
- `ReadUserMemory`
- `CreateFile`
- `WriteFile`
- `xhunter1`
- `\\.\xhunter1`
- `xhunter1.sys`

## Search Synonyms

- Xign
- XignSdk
- XignProcess
- Xign driver
- driver service
- kernel driver
- SCM driver loading
- CreateFile driver
- WriteFile driver
- packaged driver
- process reader

## Related Maps

- `memory/processes.md`
- `nuget/frida-sdk.md`
