---
title: AI NuGet: CLink RPC
description: AI-first map for proto-first generated CLink RPC services and the reusable managed CLinkRPC runtime.
published: true
date: 2026-05-22T00:00:00.000Z
tags: scripting, api, ai, clink, rpc, protobuf, nuget, ipc
editor: markdown
dateCreated: 2026-05-22T00:00:00.000Z
---
# CLink RPC Discovery Map

Reference map for optional `EyeAuras.CLink.Rpc` APIs: reusable CLinkRPC
sessions, CLink connection transport adaptation, and proto-first generated
service clients and servers.

## Concept Model

- `EyeAuras.CLink` is still the byte transport and native ABI facade.
- `EyeAuras.CLink.Rpc` is the higher-level managed RPC runtime above that
  transport and the C# build package that wires proto generation into MSBuild.
- Users define a `.proto` service contract and protobuf request/response
  messages, add them as `Protobuf` items with `ClinkServices="Both"`, build
  once, and use the generated clients/servers from ordinary C# code.
- Generated C# clients serialize protobuf request DTOs and send them as
  CLinkRPC frame payloads.
- Generated C# servers parse protobuf request DTOs from CLinkRPC frame payloads
  and write protobuf response DTOs.
- Contract compatibility is checked during the CLinkRPC profile handshake by a
  descriptor/service fingerprint.
- This is not gRPC and does not use HTTP/2. The transport is still CLink and
  the session protocol is still CLinkRPC.
- FridaSdk migration to this proto-first surface is deferred; Frida/CAgent
  operation semantics remain in FridaSdk until that adapter moves.

## API Details

- The C# package provides `buildTransitive` targets. Generated `.clink.cs`
  files are written to
  `$(IntermediateOutputPath)\EyeAuras.CLink.Rpc\Generated` and added to
  `Compile` before `CoreCompile`.
- The package bundles `protoc` and `protoc-gen-clink-csharp` under `tools`.
  Override them with `CLinkRpcProtocPath`, `CLinkRpcCSharpPluginPath`,
  `CLinkRpcGeneratedOutputDir`, or enable `CLinkRpcVerbose=true` for generator
  diagnostics.
- Generated client entrypoints such as `CalculatorClient.Connect(address)` open
  absolute CLink addresses and own a `CLinkRpcSession`.
- Generated server entrypoints such as
  `CalculatorDescriptor.Start(address, implementation)` host service
  implementations over accepted CLink connections and register protobuf method
  handlers.
- `CLinkRpcSession`, `CLinkRpcOptions`, `CLinkRpcHandler`,
  `CLinkRpcResponse`, and `CLinkConnectionRpcTransport` are the reusable lower
  session/runtime primitives.
- Descriptor/profile data in the handshake identifies the generated proto
  service shape and rejects mismatched clients and servers before calls run.
- Protobuf payloads are ordinary method payload bytes inside existing
  CLinkRPC `Call`, `Response`, and `Error` frames.

## Contract Rules

- Prefer `.proto` service definitions over reflection-discovered C# interfaces.
- Keep operation ids stable from generated descriptors; do not infer them from
  runtime reflection ordering.
- Preserve protobuf additive compatibility: new fields with new field numbers
  must be safely ignored by older peers.
- Reject malformed protobuf payloads before invoking service logic.
- Keep generated hot paths free of reflection dispatch, `object[]` argument
  packing, and generic protobuf runtime calls.
- CLinkRPC supports concurrent interleaved calls by correlation id. Use multiple
  CLink channels or generated clients only when the physical transport send path
  is the throughput bottleneck.

## Common Flow

Install the package and add proto files as MSBuild `Protobuf` items:

```xml
<PackageReference Include="EyeAuras.CLink.Rpc" Version="..." />

<ItemGroup>
  <Protobuf Include="Protos\calculator.proto" ClinkServices="Both" />
</ItemGroup>
```

Then build the project once. The generated `.clink.cs` files stay under `obj`
by default rather than next to the `.proto` source files.

```proto
syntax = "proto3";
package eyeauras.example;

option csharp_namespace = "EyeAuras.Example.Generated";

service Calculator {
  rpc Add(AddRequest) returns (AddReply);
}

message AddRequest {
  int32 left = 1;
  int32 right = 2;
}

message AddReply {
  int32 value = 1;
}
```

```csharp
using EyeAuras.Example.Generated;

using var server = CalculatorDescriptor.Start(address, new CalculatorService());
using var client = CalculatorClient.Connect(address);
using var result = client.Add(new AddRequest { Left = 2, Right = 3 });
Console.WriteLine(result.Response.Value);

sealed class CalculatorService : CalculatorServerBase
{
    public override AddReply Add(in AddRequest request)
    {
        return new AddReply { Value = request.Left + request.Right };
    }
}
```

Use absolute CLink addresses such as `file://`, same-process `mem://`,
concrete `shared-mem://`, or `pipe://` addresses. Address semantics still
belong to `EyeAuras.CLink`.

C integration is manual in phase 1. Download/install the C generator package and
wire `protoc` into the native build:

```bat
protoc ^
  --plugin=protoc-gen-clink-c=path\protoc-gen-clink-c.exe ^
  --clink-c_out=generated ^
  --proto_path=proto ^
  proto\calculator.proto
```

Compile the emitted `.clink_rpc.h` and `.clink_rpc.c` files with the CLink
native SDK and the rest of the C application.

## Performance Notes

- Protobuf encode/decode and CLinkRPC frame round trips should be measured
  separately.
- Generated client/server methods should call concrete message parsers and
  writers.
- Reflection, descriptor loading, and generator cost are cold-start work.
- Hot CLinkRPC packet paths must not do per-packet formatting, text decoding,
  logging, UI updates, diagnostic previews, or avoidable allocation.
- `EyeAuras.CLink.Rpc.Benchmarks` is the dedicated benchmark project for this
  proto-generated path.
- Benchmark classes in that project are tagged with the `generated-protocol`
  layer category, with narrower categories such as `proto-first`,
  `grpc`, `http2-loopback`, `generated-csharp`, `raw-session-baseline`,
  `serializer`, `dispatch`, `round-trip`, `peer-matrix`, `c-to-c`,
  `csharp-to-csharp`, `csharp-to-c`, `c-to-csharp`, `c`, `csharp`, and `cold`
  for filtered runs.
- The generated peer matrix measures generated protocol codec and dispatch
  paths for `C->C`, `C#->C#`, `C#->C`, and `C->C#`. These rows are separate
  from raw CLink byte-transport benchmarks and hand-written CLinkRPC session
  benchmarks.
- The `grpc` rows use the same calculator service/message shape through
  Grpc.Tools-generated code and ASP.NET Core gRPC over HTTP/2 loopback, so they
  are comparison rows rather than CLink transport rows.

## Prefer

- Prefer proto-first generated contracts when peers need stable cross-language
  request/response DTOs.
- Prefer protobuf additive fields for compatible request/response evolution.
- Prefer raw `CLinkRpcSession` benchmarks as a baseline next to generated
  client/server benchmarks.

## Avoid

- Avoid describing this as full gRPC, HTTP/2, or ASP.NET transport.
- Avoid putting Frida, CAgent, or domain-specific operation semantics in
  `EyeAuras.CLink`.
- Avoid reviving interface reflection or `Reflection.Emit` contract discovery
  for the product contract path.
- Avoid broad DTO graphs until the proto generator and compatibility tests
  intentionally cover them.

## Research Anchors

- `EyeAuras.CLink.Rpc`
- `CLinkRpcSession`
- `CLinkConnectionRpcTransport`
- `CLinkRpcOptions`
- generated CLink RPC client
- generated CLink RPC server
- protobuf request
- protobuf response
- descriptor fingerprint

## Search Synonyms

- CLink RPC
- proto-first RPC
- protobuf CLink
- generated service
- generated CLink client
- CLinkRPC session
- IPC contract
- CLink service

## Related Maps

- `nuget/frida-sdk.md`
- `memory/processes.md`
