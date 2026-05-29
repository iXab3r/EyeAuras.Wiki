---
title: AI NuGet: Xign SDK
description: AI-first map for optional Xign driver infrastructure and XignProcess.
published: true
date: 2026-05-27T00:00:00.000Z
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
- Load the driver once through `XignDriverManager.Load()`, then open
  direct driver connections without creating `XignProcess`.
- Query or stop the driver service through `XignDriverManager.IsLoaded` and
  `Unload()` for explicit tooling/lifecycle flows.
- Represent a target process as `XignProcess`.
- Read and write target memory through `XignProcess.Memory`.
- Use `XignDriverManager` and `XignDriverConnection` directly when a tool needs
  driver commands without wrapping them in `XignProcess`.
- Run the Xign-local process test pack to validate an `IProcess` backend or
  benchmark read/write throughput against bundled x86/x64 NetHost processes.
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
  connections. It can load the packaged driver independently through
  `Load()`, report running state through `IsLoaded`, unload it through
  `Unload()`, or open the device through `Create(...)`.
- `XignDriverConnection` is a public device connection that owns the xhunter1
  command envelope, temporary init/auth session, response buffer, and typed
  command helpers.
- `XignProcess` can be created by the builder/static helpers, which own the
  connection they open, or directly from a caller-owned `IXignDriverConnection`
  when a tool wants to mix raw driver commands with process abstraction APIs.
- `XignProcess.Memory` uses the Xign driver connection for reads and a
  driver-opened process handle for writes.
- `XignProcess` process-information reads are structure-backed: it resolves the
  target `_EPROCESS` from the Xign-opened process handle through
  `SystemExtendedHandleInformation`, then reads process name, modules, threads,
  architecture, and VAD-backed regions through `_EPROCESS`, PEB, loader lists,
  thread lists, and VAD structures.
- Structure-backed information reads use Xign command 788 for kernel addresses
  and command 787 for target user-mode addresses. They fail fast when the
  curated layout or required structure data is unavailable; they do not fall
  back to PSAPI, Toolhelp, or `VirtualQueryEx`.
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
- `XignProcessTestPack` is a temporary diagnostics surface in the Xign SDK. It
  validates arbitrary `IProcess` wrappers directly or starts bundled x86/x64
  NetHost processes and asks the caller's factory to open each PID.

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
- `XignDriverManager.IsLoaded` - reports whether the configured driver service
  is currently running.
- `XignDriverManager.Load()` - extracts, registers, and starts the packaged
  driver through SCM without creating a process wrapper; it is idempotent and
  returns without reloading when the service is already running.
- `XignDriverManager.Unload()` - stops the configured driver service when it is
  running; it does not delete the service registration or extracted payload.
- `XignDriverManager.EnsureLoaded()` - compatibility alias for `Load()`.
- `XignDriverManager.Create(loadDriver = false)` - optionally loads the
  packaged driver and returns an opened `IXignDriverConnection`; when
  `loadDriver` is false and the device cannot be opened, the diagnostic should
  point callers toward `XignProcess.WithLoadDriver()`, `Load()`, or
  `loadDriver: true`.
- `XignDriverConnection` / `IXignDriverConnection` - direct device API for raw
  `Call(command, args)` and typed helpers such as `PingEcho`,
  `QueryVersionStatus`, `OpenProcess`, `ReadUserMemory`, `ReadMemory`, and
  `ExecuteCodeByProcessId`.
- `new XignProcess(connection, processId, openProcess)` - creates an
  `IXignProcess`/`IProcess` wrapper over an already-open caller-owned
  `IXignDriverConnection`; disposing the process wrapper does not dispose the
  supplied connection.
- `IXignProcess.Memory` - supports byte/scalar read/write through the Xign
  connection and driver-opened process handles.
- `IXignProcess.GetProcessModules()` - reads modules via
  `_EPROCESS -> PEB -> PEB.Ldr.InMemoryOrderModuleList`.
- `IXignProcess.GetThreads()` - reads `_EPROCESS.ThreadListHead` and projects
  ETHREAD entries to `ProcessThreadInformation`.
- `IXignProcess.VirtualQuery(address)` and `GetMemoryRegions()` - read
  `_EPROCESS.VadRoot` and return allocated VAD-backed ranges only.
- `IXignProcess.ProcessName` - resolves from PEB process parameters when
  available, otherwise from `_EPROCESS.ImageFileName`.
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
- `XignProcessTestPack.Validate(process)` - runs safe capability checks against
  an arbitrary `IProcess`.
- `XignProcessTestPack.ValidateBundledHosts(factory)` - starts packaged x86/x64
  NetHost processes and passes PID, architecture, and host path to the caller's
  process factory. Probe memory is allocated through the opened `IProcess` when
  `IProcessControlApi` is available.
- `XignProcessTestPack.MeasurePerformance(process)` and
  `MeasurePerformanceBundledHosts(factory)` - measure read/write throughput over
  configurable block sizes and worker counts.
- The binary command packet structs are internal implementation details and are
  not exposed as a public command-authoring surface.

## Current Limitations

- `XignDriverConnection` requires a 64-bit host process.
- `QueueUserApc` depends on regular thread-handle access and target-thread
  alertable wait behavior; it is not a separate mapped Xign command.
- Several high-level control methods use WinAPI calls on driver-opened handles,
  not separate Xign commands for every operation.
- Process-information methods depend on curated Windows kernel layout support.
  Unsupported builds, corrupt structure lists, missing handle-table object
  pointers, or invalid PEB/VAD data throw instead of silently using old WinAPI
  information paths.
- VAD-backed region enumeration reports allocated ranges from the VAD tree. It
  does not synthesize free address-space holes and may not split every
  per-page state the way `VirtualQueryEx` can.
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
  5. If the device-open error says the driver service is not loaded, switch the
     construction path to `XignProcess.WithLoadDriver()` or direct
     `XignDriverManager.Create(loadDriver: true)`.

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
  3. Architecture and process-directory discovery come from the same
     `_EPROCESS`/PEB-backed information path used by module enumeration.
  4. Use the returned `ManualMappedLibraryDescriptor` to inspect base address
     and entry point if needed.

- Use direct driver commands:
  1. Create `new XignDriverManager(XignDriverServiceConfig.Default)`.
  2. Check `IsLoaded` if the tool wants to report current service state.
  3. Call `Load()` when the tool should start the packaged driver, or
     skip it when the driver is already running.
  4. Call `Create()` to open an `IXignDriverConnection`.
  5. Use typed command helpers. `ReadUserMemory` is command 787 with a process
     handle; `ReadMemory` is command 788 and copies bytes through the driver's
     `MmIsAddressValid`-gated path.
  6. If the same tool also needs `IProcess`, construct
     `new XignProcess(connection, pid, openProcess: true)` and keep the
     connection alive for the wrapper lifetime.
  7. Call `Unload()` only when the tool owns the driver lifetime and wants to
     stop the service.

- Validate an Xign-compatible process implementation:
  1. Use `XignProcessTestPack.Validate(process)` for an already-open `IProcess`.
  2. Use `ValidateBundledHosts(context => OpenProcess(context.ProcessId))` when
     the test pack should launch x86/x64 NetHost processes.
  3. Pass `Options.Log` or `Options.ProgressReporter` for live diagnostics.
  4. Enable opt-in checks such as `XignScopedOpenProcess`, `ExecuteCode`, or
     dispose-during-read only when the target backend and host are prepared for
     those scenarios.

## Prefer

- Prefer `XignProcess` only when the Xign driver is expected to be available.
- Prefer normal SCM loading and clear diagnostics for driver setup failures.
- Prefer high-level `IProcess.Memory` and `IProcessControlApi.ExecuteCode`
  instead of exposing command IDs publicly.
- Prefer `WithOpenProcess()` or `EnterOpenProcess()` around batches of
  memory/control operations.
- Prefer treating `GetProcessModules`, `GetThreads`, `VirtualQuery`, and
  `GetMemoryRegions` as fail-fast structure-backed operations.
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
- Avoid expecting migrated information methods to fall back to PSAPI, Toolhelp,
  or `VirtualQueryEx`.

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
- `XignProcessTestPack`
- `ValidateBundledHosts`
- `MeasurePerformanceBundledHosts`
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
