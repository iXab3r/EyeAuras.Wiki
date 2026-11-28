---
title: "Expose an owned read-only status on loopback"
description: "A script serves an immutable snapshot through a controller on 127.0.0.1 and stops the web host when it stops."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Expose an owned read-only status on loopback

The script starts a small web host and serves fixed, non-sensitive data at `http://127.0.0.1:52081/status`. The controller returns an immutable snapshot.

You need desktop EyeAuras whose C# host includes the ASP.NET Core hosting/MVC/Kestrel assemblies, as in the [controller example](/en/scripting/examples/advanced/web-server-controllers). The `assemblyName:` directives load host assemblies. They do not install packages. Port **52081** must be free on your machine.

1. Create an editable `RecipeStatus` aura through **Add new → New Aura → Actions → On Enter → C# Script**. You will start it by hand with Run. No automatic activation is needed.
2. In the project's file tree, use **Add new file → C# File** to add **StatusSnapshot.cs** and **StatusController.cs**. Replace their whole contents with the code below and keep the `RecipeStatus` namespace. Replace the whole **Script.csx** too.
3. Wait for compilation, click **Run** and check the action's **Event Log** for startup errors. Open `http://127.0.0.1:52081/status` in your browser. You should get a JSON object with `name` equal to `RecipeStatus` and `count` equal to `3`. Each request logs `Read-only recipe status requested`.
4. Click **Stop**. In .NET 8, `RunAsync(cancellationToken)` requests shutdown, waits for it and disposes the host, asynchronously when that is supported. After that, refreshing the page should get no response from this recipe.

| Part | What it does |
| --- | --- |
| `IPAddress.Loopback`, port `52081` | The host listens only on IPv4 `127.0.0.1`. |
| `AddApplicationPart(typeof(StatusController).Assembly)` | Adds the script project's assembly to the place where MVC looks for controllers. |
| Constructor dependencies | ASP.NET has its own DI container. It gets the snapshot and the logger explicitly from Script.csx. |

An ordinary controller has no implicit `Log`, `AuraTree`, `Variables` or script token. The endpoint cannot change the snapshot's properties: the value is set once per Run. If startup fails, read the error and do not switch to a wildcard binding.

For a single endpoint without controller discovery, see [the simple server](/en/scripting/examples/advanced/simple-web-server).

## StatusSnapshot.cs

```csharp
namespace RecipeStatus;

public sealed class StatusSnapshot
{
    public StatusSnapshot(string name, int count)
    {
        Name = name;
        Count = count;
    }

    public string Name { get; }
    public int Count { get; }
}
```

## StatusController.cs

```csharp
using Microsoft.AspNetCore.Mvc;
using PoeShared.Logging;

namespace RecipeStatus;

[ApiController]
[Route("status")]
public sealed class StatusController : ControllerBase
{
    private readonly StatusSnapshot snapshot;
    private readonly IFluentLog log;

    public StatusController(StatusSnapshot snapshot, IFluentLog log)
    {
        this.snapshot = snapshot;
        this.log = log;
    }

    [HttpGet]
    public ActionResult<StatusSnapshot> Get()
    {
        log.Info("Read-only recipe status requested");
        return Ok(snapshot);
    }
}
```

## Script.csx

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

using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PoeShared.Logging;
using RecipeStatus;

{
    cancellationToken.ThrowIfCancellationRequested();
    var snapshot = new StatusSnapshot("RecipeStatus", 3);
    var builder = Host.CreateDefaultBuilder()
        .ConfigureAppConfiguration((context, config) => config.Sources.Clear())
        .ConfigureWebHostDefaults(web => web
            .ConfigureKestrel(server => server.Listen(IPAddress.Loopback, 52081))
            .ConfigureServices(services =>
            {
                services.AddSingleton(snapshot);
                services.AddSingleton<IFluentLog>(Log);
                services.AddSingleton(new ApplicationPartManager());
                services.AddControllers().AddApplicationPart(typeof(StatusController).Assembly);
            })
            .Configure(app =>
            {
                app.UseRouting();
                app.UseEndpoints(endpoints => endpoints.MapControllers());
            }));
    await builder.Build().RunAsync(cancellationToken);
}
```
