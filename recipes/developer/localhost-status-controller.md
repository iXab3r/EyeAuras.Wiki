---
title: "Expose an owned read-only status on loopback"
description: "Register an immutable snapshot and controller explicitly, serve one local GET and stop the owned host with the script."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Expose an owned read-only status on loopback

Read a fixed, non-sensitive status through `http://127.0.0.1:52081/status`. The controller returns an immutable snapshot; it exposes no command, aura mutation or remote-control route.

Use a compatible desktop C# script host with the ASP.NET Core hosting/MVC/Kestrel assemblies used by the [controller example](/en/scripting/examples/advanced/web-server-controllers). Its `assemblyName:` directives resolve host assemblies; they are not package installation instructions. The hosting lifetime here follows the .NET 8 `RunAsync` contract. Port **52081** must be unused on your machine.

1. Create an editable `RecipeStatus` aura through **Add new → New Aura → Actions → On Enter → C# Script**. Use the action's manual Run, without automatic activation.
2. In the project's file tree choose **Add new file → C# File**, creating **StatusSnapshot.cs** and **StatusController.cs**. Replace their complete contents below, keeping the `RecipeStatus` namespace. Replace the complete **Script.csx** as well.
3. Wait for compilation, click **Run** and inspect the action's **Event Log** for startup errors. In your own browser open `http://127.0.0.1:52081/status`. Expect a JSON object with `name` equal to `RecipeStatus` and `count` equal to `3`; each request logs `Read-only recipe status requested`.
4. Click **Stop**. The awaited `RunAsync(cancellationToken)` requests shutdown, waits for it and disposes the host, using asynchronous disposal when supported. Refreshing the address after shutdown should no longer receive this recipe's response. Run again to create a fresh snapshot and host.

| Part | Responsibility |
| --- | --- |
| `IPAddress.Loopback`, port `52081` | Explicit IPv4 `127.0.0.1` binding, not a wildcard or another machine's address. |
| `AddApplicationPart(typeof(StatusController).Assembly)` | Adds the script project's controller assembly to MVC discovery. |
| Constructor dependencies | ASP.NET's own DI container receives the snapshot and logger explicitly from Script.csx. |

The ordinary controller has no implicit `Log`, `AuraTree`, `Variables` or script token. The snapshot's properties cannot be reassigned through the endpoint; its value is fixed for that Run. Host startup, a free port and a successful GET are separate outcomes. If startup fails, read its error instead of moving to a wildcard binding.

The awaited host lifetime stays inside the script's explicit block. `RunAsync` already owns disposal, so the example does not add a second competing disposal path. For a single minimal endpoint without controller discovery, compare [the simple server](/en/scripting/examples/advanced/simple-web-server).

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
