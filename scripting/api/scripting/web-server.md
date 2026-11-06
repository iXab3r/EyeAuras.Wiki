---
title: AI Scripting: Web Server
description: AI-first map for hosting local ASP.NET Core/Kestrel endpoints from script mini-apps.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, web-server, aspnet, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Web Server Discovery Map

Reference map for script mini-apps that host a local ASP.NET Core/Kestrel web
server to expose state, remote controls, diagnostics, or bot/tool endpoints.

## User Intents

- Start a local HTTP endpoint from a script.
- Expose mini-app state to a browser or another process.
- Receive remote control commands.
- Add MVC/API controllers to a script project.
- Keep a web host alive until the script stops.
- Avoid host configuration conflicts inside the EyeAuras runtime.

## Concept Model

- Script-hosted web servers are ordinary ASP.NET Core hosts running inside the
  script process.
- The script owns server lifetime and should stop it with script cancellation.
- Minimal routes are enough for simple status/control endpoints.
- Controllers are better for larger APIs and typed arguments.
- Controllers should live in normal `.cs` files, not inside the top-level script
  file.
- The host configuration source list may need to be cleared before configuring
  Kestrel inside the scripting environment.

## API / Package Details

- `Host.CreateDefaultBuilder()` - creates the generic host.
- `ConfigureAppConfiguration((context, config) => config.Sources.Clear())` -
  avoids importing unwanted host configuration sources in the script runtime.
- `ConfigureWebHostDefaults(...)` - configures ASP.NET Core hosting.
- `KestrelServerOptions` - configure local ports/protocols.
- `UseRouting()` - enables endpoint routing.
- `UseEndpoints(...)` - maps minimal endpoints and controllers.
- `MapGet(...)`, `MapPost(...)` - minimal route handlers.
- `AddControllers()` - MVC/controller support.
- `AddApplicationPart(typeof(SomeController).Assembly)` - tells ASP.NET where
  script project controllers live.
- `MapControllers()` - enables discovered controller routes.
- `RunAsync(cancellationToken)` - runs the server until script cancellation.

## Serve a local status page

Run this in `Script.csx`. Port 52080 must be free and the host must be able to
resolve the listed ASP.NET Core assemblies. `assemblyName` does not install a
missing framework. This example uses loopback HTTP without a certificate or
remote access:

```csharp
#r "assemblyName: Microsoft.AspNetCore"
#r "assemblyName: Microsoft.AspNetCore.Hosting"
#r "assemblyName: Microsoft.AspNetCore.Hosting.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Http.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Routing"
#r "assemblyName: Microsoft.AspNetCore.Routing.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Server.Kestrel"
#r "assemblyName: Microsoft.AspNetCore.Server.Kestrel.Core"
#r "assemblyName: Microsoft.Extensions.Hosting"
#r "assemblyName: Microsoft.Extensions.Hosting.Abstractions"
#r "assemblyName: Microsoft.Extensions.Configuration.Abstractions"

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Hosting;

var runToken = cancellationToken;
{
    using var host = Host.CreateDefaultBuilder()
        .ConfigureAppConfiguration((_, config) => config.Sources.Clear())
        .ConfigureWebHostDefaults(web => web
            .ConfigureKestrel(options => options.ListenLocalhost(52080,
                endpoint => endpoint.Protocols = HttpProtocols.Http1))
            .Configure(app =>
            {
                app.UseRouting();
                app.UseEndpoints(endpoints =>
                    endpoints.MapGet("/status", async context =>
                        await context.Response.WriteAsync("EyeAuras is running")));
            }))
        .Build();

    Log.Info("Starting HTTP at http://localhost:52080/status");
    await host.RunAsync(runToken);
}
```

Open `http://localhost:52080/status` or run `curl http://localhost:52080/status`.
The expected response is `EyeAuras is running`. The message before `RunAsync`
does not prove that the port opened; check the HTTP response and host diagnostics.

Await `RunAsync(runToken)` in the script body. Run cancellation requests server
shutdown; do not substitute an assumption about sandbox lifetime. HTTP handlers
run in ASP.NET context, so desktop UI work needs a separate UI-scheduler hop.
Clearing `config.Sources` removes inherited configuration sources; add any desired
server configuration explicitly afterward.

## Add controllers to that server

Put this public class in a separate `StatusController.cs` file:

```csharp
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/status")]
public sealed class StatusController : ControllerBase
{
    [HttpGet]
    public string Get() => "EyeAuras is running";
}
```

Add these references and imports to the preceding `Script.csx`:

```csharp
#r "assemblyName: Microsoft.AspNetCore.Mvc"
#r "assemblyName: Microsoft.AspNetCore.Mvc.Core"
#r "assemblyName: Microsoft.Extensions.DependencyInjection.Abstractions"
using Microsoft.Extensions.DependencyInjection;
```

Before `.Configure(...)` in the `web` chain, add
`.ConfigureServices(services => services.AddControllers().AddApplicationPart(typeof(StatusController).Assembly))`.
Change the `UseEndpoints` lambda to a block, retain `/status`, and add
`endpoints.MapControllers();`. `GET /api/status` then returns the same text through
MVC. See the [complete controller project](/en/scripting/examples/advanced/web-server-controllers).

This is an addition to the prepared host, not a standalone script. Register
application services explicitly with ASP.NET DI and pass the dependencies needed
from the script. EyeAuras's Unity container does not automatically become the HTTP
host's container.

## Prefer

- Prefer web endpoints for browser-native or process-to-process control.
- Prefer controllers when endpoints need typed arguments or multiple route
  groups.
- Prefer cancellation-token-bound `RunAsync`.
- Prefer explicit ports and local-only exposure unless remote access is
  intentional.
- Prefer separate service classes for business logic; controllers should call
  mini-app services.

## Avoid

- Avoid starting a server without a clear cancellation/lifetime owner.
- Avoid exposing control endpoints on public interfaces unless intended.
- Avoid putting controllers directly inside `Script.csx`.
- Avoid relying on app-global configuration sources without clearing/checking
  them.
- Avoid blocking UI/render loops while running the web server.

## Research Anchors

- `Host.CreateDefaultBuilder`
- `ConfigureAppConfiguration`
- `config.Sources.Clear`
- `ConfigureWebHostDefaults`
- `KestrelServerOptions`
- `HttpProtocols`
- `UseRouting`
- `UseEndpoints`
- `MapGet`
- `MapPost`
- `AddControllers`
- `ApplicationPartManager`
- `AddApplicationPart`
- `MapControllers`
- `ControllerBase`
- `ApiControllerAttribute`
- `RouteAttribute`
- `RunAsync`

## Search Synonyms

- local web server
- ASP.NET Core
- Kestrel
- HTTP endpoint
- minimal API
- controller
- MVC controller
- remote control
- bot API
- status endpoint
- application part

## Related Maps

- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [scripting/references-and-resources.md](/en/scripting/api/scripting/references-and-resources)
- [scripting/project-workflow.md](/en/scripting/api/scripting/project-workflow)
- [scripting/container-extensions.md](/en/scripting/api/scripting/container-extensions)

## Hosting source contract

The desktop project at `c8b2304` references `Microsoft.Extensions.Hosting 8.0.19`.
The unused `AspNetCoreVersion=7.0.0` property alone does not identify loaded runtime
assemblies. Match deployment assemblies to your host version.

In [.NET 8.0.19 RunAsync](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/HostingAbstractionsHostExtensions.cs),
shutdown cancellation calls `StopApplication`, waits for stopping, and calls
`StopAsync` without the already-canceled token. `RunAsync` disposes the host in
`finally`, including failed startup. It does not forcibly cancel arbitrary work
started by request handlers.

[Kestrel](https://github.com/dotnet/aspnetcore/blob/v8.0.19/src/Servers/Kestrel/Core/src/KestrelServerOptions.cs)
distinguishes `ListenLocalhost` from `ListenAnyIP`; the port number does not enable TLS.
[MVC discovery](https://github.com/dotnet/aspnetcore/blob/v8.0.19/src/Mvc/Mvc.Core/src/Controllers/ControllerFeatureProvider.cs)
requires public, nonabstract, nongeneric top-level controller types.
[AddApplicationPart](https://github.com/dotnet/aspnetcore/blob/v8.0.19/src/Mvc/Mvc.Core/src/DependencyInjection/MvcCoreMvcBuilderExtensions.cs)
adds the assembly's parts; [MapControllers](https://github.com/dotnet/aspnetcore/blob/v8.0.19/src/Mvc/Mvc.Core/src/Builder/ControllerEndpointRouteBuilderExtensions.cs)
requires controller services and maps their endpoints. These source checks do not
establish successful EyeAuras script execution or external client connectivity.
