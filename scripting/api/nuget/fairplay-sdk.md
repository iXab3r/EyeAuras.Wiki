---
title: AI NuGet: FairPlay SDK
description: AI-first map for optional FairPlay driver infrastructure.
published: true
date: 2026-05-09T00:00:00.000Z
tags: scripting, api, ai, fairplay, nuget, driver, memory
editor: markdown
dateCreated: 2026-05-09T00:00:00.000Z
---
# FairPlay SDK Discovery Map

Reference map for optional `EyeAuras.Memory.FairPlaySdk` APIs. The SDK provides
driver loading, low-level device connection infrastructure, and a
`FairPlayKDProcess` adapter for the packaged `FairplayKD.sys` kernel driver.

## Important Caveat

`EyeAuras.Memory.FairPlaySdk` loads a kernel driver through normal Windows SCM
APIs. It does not attempt DSE/signature bypasses. Real driver-load tests require
administrator permissions, a compatible host, a valid driver signature/loading
policy, and the correct device identity.

The default device path is based on the current static-analysis pass over the
packaged IDA 9.1 database: the driver creates `\DosDevices\FairplayKD{instance}`
and defaults to instance `0` when no valid registry override is present.

## User Intents

- Add optional FairPlay driver infrastructure to a tool or test project.
- Load/start the packaged `FairplayKD.sys` driver through Windows SCM APIs.
- Open the FairPlay device with `CreateFile`.
- Send raw `DeviceIoControl` requests while protocol mapping is still in
  progress.
- Wrap the current process as an `IProcess` and read pinned buffers through the
  FairPlay driver command `0x78`.
- Use a FairPlay-opened process handle for writes, allocation/protection,
  remote-thread execution, manual mapping, and APC helpers.
- Keep driver setup tests in `EyeAuras.FridaSdk.Tests` without adding protocol
  claims too early.

## Concept Model

- `EyeAuras.Memory.FairPlaySdk` is an optional SDK package.
- `FairPlayDriverManager` owns the default service, device, payload, embedded
  resource, and runtime extraction paths directly. There is no separate
  `FairPlayDriverServiceConfig` object.
- `FairPlayDriverConnection` owns an opened device handle, exposes raw
  `DeviceIoControl`, and exposes command `0x87` as `OpenProcess`.
- `FairPlayKDProcess` implements `IFairPlayProcess`, which extends `IProcess`,
  `IProcessControlApi`, `IProcessSupportsManualMapping`, and
  `IProcessSupportsUserApc`.
- Its memory backend currently enables driver-backed direct reads only for the
  calling process because command `0x78` has not been proven as a generic
  remote-process read.
- `FairPlayKDProcess.EnterOpenProcess()` owns a ref-counted lease for a target
  process handle opened through FairPlay command `0x87`; `WithOpenProcess()`
  keeps that lease alive for the wrapper lifetime.
- `FairPlayKDProcess` writes rent `EnterOpenProcess()`, then call Win32
  `WriteProcessMemory` with that driver-created handle. Command `0x7C` was
  inspected and behaves like a success stub, so it must not be treated as a
  validated FairplayKD write primitive.
- A deeper static pass over commands `0x78..0x8F` found file/object read-write
  helpers (`0x89`/`0x8A`) and registry query/write helpers (`0x8C..0x8F`), but
  no generic process virtual-memory write command.
- The packaged payload is embedded from `Payloads/FairplayKD.sys` in the SDK
  project.
- The runtime copy is extracted under local app data before SCM service
  creation/update.
- Protocol-specific command DTOs and broader remote read/write helpers should
  stay out of the SDK until the protocol is understood.

## API Details

- `FairPlayDriverManager.DefaultServiceName` - default SCM service name,
  currently `FairplayKD`.
- `FairPlayDriverManager.DefaultDevicePath` - default Win32 device path,
  currently `\\.\FairplayKD0`.
- `FairPlayDriverManager.DefaultDriverFileName` - packaged payload name,
  `FairplayKD.sys`.
- `FairPlayDriverManager.Create(loadDriver)` - optionally extracts and starts
  the packaged driver service, then opens the device connection.
- `IFairPlayDriverManager` - factory contract exposing service/device/payload
  names and `Create(loadDriver)`.
- `FairPlayDriverConnection.Open()` - opens the Win32 device path with
  read/write access.
- `FairPlayDriverConnection.DeviceIoControl(...)` - sends a raw IOCTL request.
- `FairPlayDriverConnection.OpenProcess(processId, accessMask)` - opens a
  target process handle through FairPlay command `0x87`.
- `IFairPlayDriverConnection` - device connection contract for open state and
  raw IOCTL calls plus the typed `OpenProcess` helper.
- `FairPlayKDProcess.ByProcessId(processId)` - creates an `IFairPlayProcess`
  for an existing FairPlay device.
- `FairPlayKDProcess.ByProcessName(processName)` - resolves a local process by
  process name and creates an `IFairPlayProcess`.
- `FairPlayKDProcess.WithLoadDriver(loadDriver)` - creates a builder and
  controls whether the packaged driver should be loaded before opening the
  process wrapper.
- `FairPlayKDProcess.WithOpenProcess(openProcess)` - creates a builder and
  controls whether the process wrapper keeps a FairPlay-opened process handle
  alive for its lifetime.
- `IFairPlayProcess.EnterOpenProcess()` - opens a target process handle through
  FairPlay command `0x87` and keeps it alive until the returned lease is
  disposed.
- `IFairPlayProcess` - FairPlay process contract; extends core `IProcess`,
  `IProcessControlApi`, `IProcessSupportsManualMapping`, and
  `IProcessSupportsUserApc`.
- `IFairPlayProcess.AllocateMemory(...)`, `FreeMemory(...)`,
  `ProtectMemory(...)`, `CreateThread(...)`, `ExecuteCode(...)`,
  `InjectDllViaManualMapping(...)`, and `QueueUserApc(...)` use the
  FairPlay-opened process handle plus normal Win32 process/thread APIs.
- `IFairPlayProcessBuilder` - builder contract for PID/name resolution and
  driver-loading/open-process choices.

## Current Limitations

- Only command `1` and the direct-read shape of command `0x78` have been
  validated live.
- `FairPlayKDProcess.Memory.TryReadMemory(...)` is currently restricted to the
  calling process.
- `FairPlayKDProcess.Memory.TryWriteMemory(...)` uses a lazy FairPlay-opened
  process handle and Win32 `WriteProcessMemory`; no FairplayKD
  process-memory-copy command is validated.
- Generic remote reads should not be assumed from this package yet. Generic
  writes and process-control helpers use a FairPlay-opened process handle plus
  normal Win32 APIs, not FairplayKD memory-copy/control commands.
- The rest of the command protocol is static/provisional; recovered IDA names
  such as `WriteMemoryToThread` and `ReadMemoryFromProcess` are known to be
  misleading in this payload, so do not treat unvalidated command IDs or packet
  layouts as public contracts until live `DeviceIoControl` traces confirm them.

## Common Flows

- Open an already-running FairPlay device:
  1. Reference `EyeAuras.Memory.FairPlaySdk`.
  2. Create `new FairPlayDriverManager()`.
  3. Call `Create(loadDriver: false)`.
  4. Use `FairPlayDriverConnection.DeviceIoControl(...)` only for understood or
     exploratory protocol work.

- Start the packaged driver and open the device:
  1. Ensure `Payloads/FairplayKD.sys` is present in the SDK project payload.
  2. Create `new FairPlayDriverManager()`.
  3. Call `Create(loadDriver: true)`.
  4. Treat SCM, permission, signature, VBS, and policy failures as environment
     setup issues.

- Read a pinned current-process buffer through `IProcess`:
  1. Reference `EyeAuras.Memory.FairPlaySdk`.
  2. Pin or otherwise own the target buffer in the current process.
  3. Create `using var process = FairPlayKDProcess.WithLoadDriver().ByProcessId(Environment.ProcessId)`.
  4. Call `process.Memory.TryReadMemory(address, target)`.
  5. Treat writes as `OpenProcess` plus `WriteProcessMemory` behavior until a
     real driver copy/write command is recovered.

- Keep the FairPlay-opened process handle alive across several operations:
  1. Create `using var process = FairPlayKDProcess.WithLoadDriver().WithOpenProcess().ByProcessId(processId)`.
  2. Or call `using var lease = process.EnterOpenProcess()` around a shorter
     operation group.
  3. Writes and handle-based metadata calls reuse the leased handle while the
     lease is active.

## Prefer

- Prefer keeping driver identity constants on `FairPlayDriverManager`.
- Prefer normal SCM loading and clear diagnostics for setup failures.
- Prefer raw `DeviceIoControl` only while the protocol is being discovered.
- Prefer adding typed helpers only after packet layout, status semantics, and
  response ownership are verified.
- Prefer documenting whether a memory operation is driver-backed or a fallback.
- Prefer `[Category("Integration")]` plus `[Explicit]` for real driver-load
  tests.

## Avoid

- Avoid adding a `FairPlayDriverServiceConfig` object unless multiple real
  configurations appear.
- Avoid exposing protocol guesses as public SDK APIs.
- Avoid claiming generic remote-process reads or driver-backed writes until
  those semantics are mapped and tested.
- Avoid placing temporary driver files in repository project directories.
- Avoid assuming the Xign command envelope applies to FairPlay.

## Research Anchors

- `EyeAuras.Memory.FairPlaySdk`
- `FairPlayDriverManager`
- `IFairPlayDriverManager`
- `FairPlayDriverConnection`
- `IFairPlayDriverConnection`
- `FairPlayKDProcess`
- `IFairPlayProcess`
- `IFairPlayProcessBuilder`
- `FairplayKD.sys`
- `FairplayKD0`
- `CreateFile`
- `DeviceIoControl`
- `SCM driver loading`

## Search Synonyms

- FairPlay
- FairplayKD
- FairPlay SDK
- FairPlay driver
- kernel driver
- SCM driver loading
- CreateFile driver
- DeviceIoControl
- packaged driver
- raw IOCTL
- process reader

## Related Maps

- `memory/processes.md`
- `nuget/xign-sdk.md`
- `nuget/frida-sdk.md`
