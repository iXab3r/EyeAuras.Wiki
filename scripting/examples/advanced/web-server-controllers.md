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

Use a controller when several endpoints belong together. ASP.NET picks the method by route and HTTP verb and binds the query argument. This example returns fixed strings, so you can look at the routing alone.

Start with the prerequisites in the [local web-server example](/en/scripting/examples/advanced/simple-web-server). Both files below belong to **one EyePad C# Script project** with the listed ASP.NET Core assemblies available. The controller must be a public top-level class in a separate C# file, not a class nested inside the generated script type.

## Read three responses

1. Add `InjectController.cs` to the script project and paste the first listing into it.
2. Put the second listing into `Script.csx`. Port `52080` must be free. Click `Run`.
3. Open `http://127.0.0.1:52080/inject`. You get an object with `text` set to `Index page`.
4. Open `/inject/test` on the same address to get `Hello!`, then `/inject/getBaseOffset?moduleName=demo` to get `Base offset for module demo is XxX!`. That is a demo string, **not a real module address**.
5. Click `Stop` to shut down the host.

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

![Controller example with a command-line request](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_Z2i6oRKb8cb4rJ3t.png)

| Setting | What it is for |
| --- | --- |
| `ListenLocalhost(52080)` | Makes the example available only on this computer. A port number alone does not enable HTTPS. |
| `AddControllers()` | Registers MVC controller services in the HTTP host. |
| `AddApplicationPart(typeof(InjectController).Assembly)` | Adds the assembly that contains the controller to discovery. |
| `MapControllers()` | Maps the routes from the controller's attributes. |
| `[FromQuery] string moduleName` | Reads the named argument from the query string. The request body is not read here. |

The `/inject/test` and `/inject/getBaseOffset` methods accept both GET and POST. For example, `curl -X POST http://127.0.0.1:52080/inject/test` returns the same `Hello!`. `/hello` stays a separate `MapGet` route.

## Give classes their own dependencies

`InjectController` is an ordinary C# class. It does not have the script's `Log`, `GetService`, `AuraTree` or `cancellationToken`. Pass your data explicitly: register the dependency in `ConfigureServices` and receive it in the controller constructor. Registering MVC does not copy the EyeAuras root container into the HTTP host. For asynchronous work tied to a request, use the request's `HttpContext.RequestAborted` token.

`RunAsync(cancellationToken)` keeps the script alive, then shuts down and disposes the host on exit. A handler's own work must support cancellation itself. You do not need a second script or a static bridge for controller discovery.

<details>
<summary>Inspect routes and extend the example</summary>

To list the endpoints, add `using Microsoft.AspNetCore.Routing;` above the executable block. Put this fragment inside the existing `Configure` lambda, after `UseEndpoints`. The lambda captures `Log` from the top-level script.

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

You can add controllers with other responsibilities, routes and typed arguments. The [original shared project](https://eyeauras.net/share/S20250302232729tsMgRqVRO6Gr) still uses an earlier network binding. Keep the loopback binding for this exercise. For how controllers are organized in general, see [MVC controllers](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-mvc-app/adding-controller?view=aspnetcore-9.0&tabs=visual-studio).

</details>
