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
- Generated C# streaming methods follow the gRPC C# object shape without
  `async/await`: generated call objects expose `RequestStream`,
  `ResponseStream`, `MoveNext(CancellationToken)`, `Current`,
  `Write(in T, CancellationToken)`, `Complete(CancellationToken)`, and
  `Response` for client-streaming final replies.
- Contract compatibility is checked during the CLinkRPC profile handshake by a
  descriptor/service fingerprint.
- This is not gRPC and does not use HTTP/2. The transport is still CLink and
  the session protocol is still CLinkRPC.
- FridaSdk CAgent process communication uses this proto-first surface through
  `Sources/EyeAuras.FridaSdk/Api/cagent.proto`; Frida/CAgent operation
  semantics remain in FridaSdk rather than `EyeAuras.CLink`.

## API Details

- The C# package provides `buildTransitive` targets. Generated `.clink.cs`
  files are written beside each proto input under a `generated` subfolder
  relative to `CLinkRpcGeneratedOutputDir`, which defaults to the project
  directory. For example, `Api\calculator.proto` emits
  `Api\generated\calculator.clink.cs`.
- C# namespace rules mirror protoc/gRPC C#: `option csharp_namespace` wins when
  present; otherwise the proto `package` is converted to a C# namespace. Files
  with no package emit into the global namespace.
- The package bundles `protoc` and `protoc-gen-clink-csharp` under `tools`.
  Override them with `CLinkRpcProtocPath`, `CLinkRpcCSharpPluginPath`,
  `CLinkRpcGeneratedOutputDir`, or enable `CLinkRpcVerbose=true` for generator
  diagnostics.
- JavaScript integration is manual in phase 1 through the
  `protoc-gen-clink-js` tool package. It emits dependency-free `.clink.js`
  files under the same `generated` subfolder convention, with message codecs
  (`measure`, `write`, `encode`, `read`), operation-id constants, and CLinkRPC
  service descriptor/profile data. It does not provide a JavaScript
  transport/session runtime yet.
- Generated client entrypoints such as `CalculatorClient.Connect(address)` open
  absolute CLink addresses and own a `CLinkRpcSession`.
- Generated server entrypoints such as
  `CalculatorDescriptor.Start(address, implementation)` host service
  implementations over accepted CLink connections and register protobuf method
  handlers.
- `CLinkRpcSession`, `CLinkRpcOptions`, `CLinkRpcHandler`,
  `CLinkRpcResponse`, `CLinkRpcResponseStream`, `CLinkRpcRequestStream`,
  `CLinkRpcStreamReader`, `CLinkRpcServerStreamWriter`, and
  `CLinkConnectionRpcTransport` are the reusable lower session/runtime
  primitives.
- Descriptor/profile data in the handshake identifies the generated proto
  service shape, including stream flags, and rejects mismatched clients and
  servers before calls run.
- Protobuf payloads are ordinary method payload bytes inside existing
  CLinkRPC `Call`, `Response`, `Error`, `StreamItem`, `StreamComplete`, and
  `StreamCancel` frames.

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
  <Protobuf Include="Api\calculator.proto" ClinkServices="Both" />
</ItemGroup>
```

Then build the project once. The generated `.clink.cs` files are produced under
`Api\generated` by default.

```proto
syntax = "proto3";
package EyeAuras.Example;

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
using EyeAuras.Example;

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

Server-streaming generated clients look like synchronous gRPC C#:

```csharp
using var call = client.SubscribeEvents(new SubscribeEventsRequest());
while (call.ResponseStream.MoveNext(cancellationToken))
{
    var item = call.ResponseStream.Current;
    Process(item);
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
  --clink-c_out=. ^
  --proto_path=. ^
  Api\calculator.proto
```

Compile the emitted `Api\generated\*.clink_rpc.h` and
`Api\generated\*.clink_rpc.c` files with the CLink native SDK and the rest of
the C application.

JavaScript codec/descriptor generation is manual in phase 1:

```bat
protoc ^
  --plugin=protoc-gen-clink-js=path\protoc-gen-clink-js.exe ^
  --clink-js_out=. ^
  --proto_path=. ^
  Api\calculator.proto
```

Consume the emitted `Api\generated\*.clink.js` module from the JavaScript host
and wire the exported descriptors into the host-specific CLinkRPC session layer
when that runtime exists.

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
- Prefer generated pull streams for span-backed streaming payloads. Observable
  adapters, when used, must own/copy payloads because normal observables cannot
  carry `ref struct` span views safely. Generated server-streaming clients expose
  `ObserveX(...)` methods that emit `{Message}Owned` DTOs and run synchronously
  on the subscribing thread unless the caller explicitly applies Rx scheduling.
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
