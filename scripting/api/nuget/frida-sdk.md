---
title: AI NuGet: Frida SDK
description: AI-first map for optional Frida instrumentation, Frida-backed process readers, and CAgent native process readers.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, frida, nuget, memory, cagent
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Frida SDK Discovery Map

Reference map for optional `EyeAuras.FridaSdk` APIs: Frida devices, sessions,
scripts, Frida Gadget payloads, Frida-backed `IProcess` adapters, and CAgent
native named-pipe process readers.

## What Frida Is

- Frida is a dynamic instrumentation toolkit.
- A host attaches to a target process or to Frida Gadget.
- Frida runs JavaScript inside the target process.
- That JavaScript can inspect modules, hook native functions, read/write memory,
  call native exports, and communicate with the host through messages or RPC.
- Frida concepts are device, process, session, script, message, RPC, and Gadget.

## What This SDK Provides

- Optional NuGet/package layer; do not assume it is part of the base scripting
  SDK.
- The package reference makes Frida SDK types compile; `FridaContainerExtensions`
  makes Frida SDK services available from the script container.
- Managed Frida entry point for devices, processes, sessions, and scripts.
- Frida script wrappers with load/unload, RPC, message streams, debugger support,
  and live script reloading.
- Embedded Frida agent script that exposes process/memory operations through RPC.
- `FridaAgentProcess`: an `IProcess` adapter over an existing Frida session.
- Frida Gadget binary helpers live in the Frida binaries family.
- CAgent native DLL bytes and managed clients live near the Frida SDK, but CAgent
  is a separate native named-pipe process reader, not a Frida script/session.

## Required Setup

For script mini-apps, `EyeAuras.FridaSdk` has two required setup steps when
using Frida SDK services:

1. Reference the package: `EyeAuras.FridaSdk`.
2. Add the container extension before resolving Frida services:

```csharp
AddNewExtension<FridaContainerExtensions>();

var frida = GetService<IFridaExperimentalApi>();
```

Do not assume `IFridaExperimentalApi` or Frida binary helpers are available from
DI just because the package compiles. Without `FridaContainerExtensions`,
service resolution can fail or return an incomplete host setup.

`CAgentProcess.ByProcessId(...)` is a static process-reader factory from the
same package, but any script that also resolves Frida SDK services should still
add `FridaContainerExtensions` first.

## Layer Split

| Layer | Use for | Primary APIs |
| --- | --- | --- |
| Frida session/script | Instrumentation, hooks, custom JavaScript inside target process | `IFridaExperimentalApi`, `IFridaSession`, `IFridaScript`, `IFridaLiveScript` |
| Frida Gadget | Attach to an injected/embedded Frida runtime by local port | `FridaSdkBinaries`, `AttachByLocalPort` |
| Frida-backed process reader | Use Frida session as `IProcess` for memory/reverse-engineering tools | `FridaAgentProcess`, `FridaAgentRpcType`, `FridaMemoryBackend` |
| CAgent process reader | Use native DLL + named-pipe RPC for memory/process-control operations | `CAgentProcess`, `ICAgentProcess`, `IProcessControlApi` |

## User Intents

- Add optional Frida support to a mini-app.
- List Frida devices or processes.
- Attach to a local process by PID or name.
- Attach to Frida Gadget by local port.
- Load a JavaScript Frida script and receive messages from it.
- Reload a Frida script while editing it.
- Wrap an existing Frida session as `IProcess`.
- Connect to an already-loaded CAgent native endpoint.
- Choose between Frida RPC and named-pipe RPC transports.
- Decide whether a task needs Frida instrumentation or only a process reader.

## Frida APIs

- `IFridaExperimentalApi` - managed entry point for Frida operations.
- `FridaExperimentalApi` - default implementation.
- `GetDevices()` - list available Frida devices.
- `GetLocalDevice()` - get local Frida device.
- `GetLocalProcesses()` - list local processes visible to Frida.
- `GetRemoteDevice(...)` - connect to remote Frida server/device.
- `AttachByLocalProcessId(...)` - attach Frida session to a local process.
- `AttachByLocalProcessName(...)` - resolve and attach by process name.
- `AttachByLocalPort(...)` - connect to Frida Gadget/server on local port.
- `IFridaDevice` - Frida device abstraction.
- `IFridaProcess` - Frida-visible process info.
- `IFridaSession` - attached process session, owns scripts, detaches on disposal.
- `IFridaScript` - loaded Frida JavaScript with `Load`, `Unload`, `Post`,
  `PostWithData`, `Rpc`, `Rpc<T>`, `Eternalize`, debugger controls, and message
  observables.
- `IBasicFridaScript` - smaller script surface used by agent wrappers.
- `IFridaLiveScript` - file/observable-backed script that reloads when content
  changes.
- `FridaContainerExtensions` - optional DI/container registration for the SDK.

## Frida Gadget / Binaries

- `FridaSdkBinaries` provides embedded Frida Gadget DLL bytes.
- `GetLibraryForX86(...)`, `GetLibraryForX64(...)` - full Gadget payloads.
- `GetSlimLibraryForX86(...)`, `GetSlimLibraryForX64(...)` - slim payloads.
- Patch helpers can change the default Gadget port before loading the payload.
- After Gadget is running, connect through `AttachByLocalPort(...)`.
- Frida Gadget is Frida runtime payload. It is not CAgent.

## Frida-Backed IProcess

- `FridaAgentProcess.BySession(...)` adapts an existing `IFridaSession` to
  `IProcess`.
- It loads the embedded Frida agent script into the target process.
- It exposes process id/name, modules, threads, memory regions, and a memory
  backend.
- `FridaMemoryBackend` performs reads/writes through the agent RPC.
- `FridaAgentRpcType` selects transport:
  - `Default` / `Frida` - Frida built-in RPC.
  - `NamedPipeAsServer` / `NamedPipeAsClient` - managed/TypeScript named-pipe
    bridge around the Frida agent script.
  - `NativeNamedPipeAsClient` / `NativeCompositeNamedPipeAsClient` - native-style
    named-pipe client modes.
- This layer is appropriate when a Frida session already exists and other APIs
  expect `IProcess`.

## CAgent APIs

- CAgent is a native DLL/payload that runs inside the target process.
- CAgent starts a named-pipe RPC server named from the target process id.
- The usual pipe name pattern is `EAF_RPC_C_{pid}`.
- `CAgentProcess.ByProcessId(processId, composite = false)` connects to that
  endpoint.
- `CAgentProcess.ByPipeName(pipeName, composite = false)` connects by explicit
  pipe name.
- `CAgentProcess` implements `ICAgentProcess`, `IProcess`, and process-control
  operations.
- `IFridaExperimentalApi.GetCAgentLibraryForX64()` and
  `GetCAgentLibraryForX86()` return embedded CAgent DLL bytes.
- CAgent supports process id/name, modules, threads, memory regions, memory
  reads/writes, allocation/free, `LoadLibrary`, `FreeLibrary`, remote thread
  creation, and handle duplication.
- Some process-control methods are intentionally unsupported or not implemented;
  verify the exact method before relying on suspend/resume behavior.
- CAgent is useful when the native endpoint is already loaded or when the
  mini-app explicitly controls native agent loading.

## CAgent Family Projects

- `EyeAuras.FridaSdk.CAgent` - native C++ DLL that exposes named-pipe RPC.
- `EyeAuras.FridaSdk.CAgent.Trampoline` - native loader/trampoline/proxy payload
  helpers.
- `EyeAuras.FridaSdk.SimpleAgent` - simple native agent/sample/test project.
- These projects are related to the SDK repository layout, but they are not the
  same thing as Frida sessions or Frida JavaScript scripts.

## Common Flows

### Attach And Run Frida Script

1. Ensure optional Frida SDK package/reference is available.
2. Add `FridaContainerExtensions`.
3. Create or resolve `IFridaExperimentalApi`.
4. Attach with `AttachByLocalProcessId`, `AttachByLocalProcessName`, or
   `AttachByLocalPort`.
5. Create script from source or file.
6. Subscribe to log/error/message streams.
7. Load the script.
8. Dispose/unload when the mini-app stops.

### Use Frida Session As IProcess

1. Attach a Frida session.
2. Create `FridaAgentProcess.BySession(session, rpcType)`.
3. Validate `ProcessId` and `IsValid`.
4. Pass the `IProcess` to memory, ReProcess, or reverse-engineering UI code.

### Use Frida Gadget

1. Load or inject Frida Gadget bytes for the target architecture.
2. Use a known or patched local port.
3. Connect with `AttachByLocalPort(port)`.
4. Treat the result as a normal Frida session.

### Use CAgent Process Reader

1. Ensure optional Frida SDK package/reference is available.
2. Add `FridaContainerExtensions` if the script resolves
   `IFridaExperimentalApi` to obtain CAgent DLL bytes or other SDK services.
3. Load/inject matching CAgent DLL bytes into the target process.
4. Connect with `CAgentProcess.ByProcessId(pid)` or `ByPipeName(...)`.
5. Validate that reported `ProcessId` matches the expected process.
6. Use the resulting `IProcess`/`IProcessControlApi` surface.

## Prefer

- Prefer `AddNewExtension<FridaContainerExtensions>()` as the first Frida SDK
  setup step in scripts.
- Prefer Frida session/script APIs for instrumentation, hooks, and custom JS.
- Prefer `FridaAgentProcess` when there is already a Frida session and the next
  API expects `IProcess`.
- Prefer CAgent only when a compatible native endpoint is known to be loaded or
  the mini-app owns the load/inject step.
- Prefer explicit factory calls over reflection for `CAgentProcess`; the factory
  has optional parameters.
- Validate process id, architecture, and liveness before write-capable tooling.

## Avoid

- Avoid calling every named-pipe process reader "Frida".
- Avoid treating a PID as proof that CAgent is loaded.
- Avoid treating Frida Gadget, Frida session, Frida agent script, and CAgent DLL
  as the same payload.
- Avoid assuming this package is available without explicit package/reference and
  SDK setup.
- Avoid resolving `IFridaExperimentalApi` before adding
  `FridaContainerExtensions`.
- Avoid unclear ownership of sessions, scripts, process wrappers, and injected
  payloads.

## Research Anchors

- `EyeAuras.FridaSdk`
- `EyeAuras.FridaSdk.Binaries`
- `EyeAuras.FridaSdk.CAgent`
- `EyeAuras.FridaSdk.CAgent.Trampoline`
- `IFridaExperimentalApi`
- `FridaExperimentalApi`
- `IFridaDevice`
- `IFridaProcess`
- `IFridaSession`
- `IFridaScript`
- `IBasicFridaScript`
- `IFridaLiveScript`
- `FridaAgentProcess`
- `IFridaAgentProcess`
- `FridaAgentRpcType`
- `FridaMemoryBackend`
- `FridaSessionExtensions`
- `FridaSdkBinaries`
- `CAgentProcess`
- `ICAgentProcess`
- `IProcessControlApi`
- `FridaAgentScriptViaNamedPipe`
- `FridaCompositeNamedPipeRpc`
- `FridaContainerExtensions`

## Search Synonyms

- Frida
- dynamic instrumentation
- Frida device
- Frida session
- Frida script
- Frida live script
- Frida Gadget
- Gadget port
- JavaScript agent
- Frida RPC
- Frida memory backend
- Frida process adapter
- CAgent
- CAgent process
- native agent
- named pipe agent
- process reader
- memory reader
- remote thread
- native payload

## Related Maps

- `memory/processes.md`
- `reverse-engineering/reprocess.md`
- `scripting/runtime.md`
