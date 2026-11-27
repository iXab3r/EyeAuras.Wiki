---
title: Web Server with Controllers
description: 
published: true
date: 2025-03-03T00:11:41.656Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-02T23:41:52.118Z
---

# Put related HTTP routes in a controller

Use a controller when several endpoints belong together. ASP.NET selects the method from its route and HTTP verb, and binds the query argument. This example returns prepared strings, so you can inspect the routing without connecting it to another application.

Start with the prerequisites in the [local web-server example](/en/scripting/examples/advanced/simple-web-server). Both files below belong to **one EyePad C# Script project** with the listed ASP.NET Core assemblies available. The controller must be a public, top-level class in a separate C# file, rather than a class nested inside the generated script type.

## Read three responses

1. Add `InjectController.cs` to the script project and paste the first listing into it.
2. Put the second listing in `Script.csx`. Port `52080` must be free. Click `Run`.
3. Open `http://127.0.0.1:52080/inject`. Expect an object containing `text` with the value `Index page`.
4. Open `/inject/test` on that same address for `Hello!`, then `/inject/getBaseOffset?moduleName=demo` for `Base offset for module demo is XxX!`.
5. Click `Stop` to shut down the host. The `XxX!` response is a demonstration string, not a module address or a memory read.

**InjectController.cs**

```csharp
using Microsoft.AspNetCore.Mvc;

namespace GameGrit;

[ApiController]
[Route("inject")]
public sealed class InjectController : ControllerBase
{
    [HttpGet]
    public ActionResult Index() => Ok(new { Text = "Index page" });

    [HttpGet("test")]
    [HttpPost("test")]
    public ActionResult Test() => Ok("Hello!");

    [HttpGet("getBaseOffset")]
    [HttpPost("getBaseOffset")]
    public ActionResult GetBaseOffset([FromQuery] string moduleName) =>
        Ok($"Base offset for module {moduleName} is XxX!");
}
```

**Script.csx**

```csharp
#r "assemblyName: Microsoft.AspNetCore"
#r "assemblyName: Microsoft.AspNetCore.Hosting"
#r "assemblyName: Microsoft.Extensions.Hosting"
#r "assemblyName: Microsoft.AspNetCore.Routing"
#r "assemblyName: Microsoft.AspNetCore.Server.Kestrel.Core"
#r "assemblyName: Microsoft.AspNetCore.Http.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Hosting.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Server.Kestrel"
#r "assemblyName: Microsoft.AspNetCore.Mvc.Core"
#r "assemblyName: Microsoft.AspNetCore.Mvc"
#r "assemblyName: Microsoft.Extensions.Configuration.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Routing.Abstractions"

using GameGrit;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

{
    cancellationToken.ThrowIfCancellationRequested();
    var builder = Host.CreateDefaultBuilder()
        .ConfigureAppConfiguration((context, config) => config.Sources.Clear())
        .ConfigureWebHostDefaults(web => web
            .ConfigureKestrel(server => server.ListenLocalhost(52080))
            .ConfigureServices(services =>
            {
                services.AddSingleton(new ApplicationPartManager());
                services.AddControllers()
                    .AddApplicationPart(typeof(InjectController).Assembly);
            })
            .Configure(app =>
            {
                app.UseRouting();
                app.UseEndpoints(endpoints =>
                {
                    endpoints.MapControllers();
                    endpoints.MapGet("/hello", () => "Hello World!");
                });
            }));

    await builder.Build().RunAsync(cancellationToken);
}
```

![Earlier controller example with a command-line request](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_Z2i6oRKb8cb4rJ3t.png)

| Setting | Purpose |
| --- | --- |
| `ListenLocalhost(52080)` | Makes this HTTP example local to the computer. A port number alone does not enable HTTPS. |
| `AddControllers()` | Registers MVC controller services in the HTTP host. |
| `AddApplicationPart(typeof(InjectController).Assembly)` | Adds the assembly containing the script project's controller to discovery. |
| `MapControllers()` | Maps the controller's attributed routes. |
| `[FromQuery] string moduleName` | Reads the named query argument; it does not parse an arbitrary request body. |

The `/inject/test` and `/inject/getBaseOffset` methods accept both GET and POST. For example, `curl -X POST http://127.0.0.1:52080/inject/test` returns the same greeting. `/hello` remains a separate `MapGet` route.

## Give classes their own dependencies

`InjectController` is an ordinary C# class. It does not inherit the script's `Log`, `GetService`, `AuraTree` or `cancellationToken`. Register the dependency you intend to expose in `ConfigureServices`, then receive it through the controller constructor. Registering MVC does not copy the EyeAuras root container into the HTTP host. For request-specific asynchronous work, use the request's `HttpContext.RequestAborted` token.

`RunAsync(cancellationToken)` keeps the script alive, shuts down the host and disposes it on exit. A handler's own work must cooperate with cancellation. There is no need to start a second script or introduce a static bridge for controller discovery.

<details>
<summary>Inspect routes and extend the example</summary>

To list endpoints, add `using Microsoft.AspNetCore.Routing;` above the executable block. Put this fragment inside the existing `Configure` lambda, after `UseEndpoints`. Its `Log` is captured from the enclosing script, not supplied as a global to controller classes.

```csharp
var source = app.ApplicationServices.GetRequiredService<EndpointDataSource>();
foreach (var endpoint in source.Endpoints)
{
    if (endpoint is RouteEndpoint route)
    {
        Log.Info($"Endpoint: {route.DisplayName}, Path: {route.RoutePattern.RawText}, Order: {route.Order}");
    }
    else
    {
        Log.Info($"Endpoint: {endpoint.DisplayName}");
    }
}
```

You can add controllers with different responsibilities, routes and typed arguments. The [original shared project](https://eyeauras.net/share/S20250302232729tsMgRqVRO6Gr) uses an earlier network-binding preset. Keep the loopback binding for this exercise. See [MVC controllers](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-mvc-app/adding-controller?view=aspnetcore-9.0&tabs=visual-studio) for the general organization; that tutorial's framework version is not an instruction to replace your script host's dependencies.

</details>
