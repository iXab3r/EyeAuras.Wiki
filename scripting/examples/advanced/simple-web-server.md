---
title: Simple Web Server
description: 
published: true
date: 2025-03-02T23:37:11.763Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-02T23:25:27.998Z
---

# Serve a local HTTP response from EyePad

Run the script and open `http://127.0.0.1:52080/hello` on the same computer: the browser gets `Hello, world!` from a handler in the script. This is a way to make a local status page. Commands and controllers can come later.

You need a **C# Script** project in [EyePad](/en/features/eyepad) and a free local port `52080`. The host must be able to load the listed ASP.NET Core assemblies and their compatible runtime dependencies. An `assemblyName` reference picks an assembly that is already there. It does not install ASP.NET Core. If a reference cannot be resolved, see [assembly and package references](/en/scripting/nuget).

## Make one local request

1. Create a C# Script project and put the whole code below into `Script.csx`.
2. Click `Run` and keep the script running while you make the request.
3. Open `http://127.0.0.1:52080/hello` on the same computer or run the command below. The response should be `Hello, world!`.
4. Click `Stop` in EyePad. The host shuts down and releases the port.

```csharp
#r "assemblyName: Microsoft.AspNetCore"
#r "assemblyName: Microsoft.AspNetCore.Hosting"
#r "assemblyName: Microsoft.Extensions.Hosting"
#r "assemblyName: Microsoft.AspNetCore.Routing"
#r "assemblyName: Microsoft.AspNetCore.Server.Kestrel.Core"
#r "assemblyName: Microsoft.AspNetCore.Http.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Hosting.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Server.Kestrel"
#r "assemblyName: Microsoft.Extensions.Configuration.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Routing.Abstractions"

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

{
    cancellationToken.ThrowIfCancellationRequested();
    var builder = Host.CreateDefaultBuilder()
        .ConfigureAppConfiguration((context, config) => config.Sources.Clear())
        .ConfigureWebHostDefaults(web => web
            .ConfigureKestrel(server => server.ListenLocalhost(52080))
            .Configure(app =>
            {
                app.UseRouting();
                app.UseEndpoints(endpoints =>
                    endpoints.MapGet("/hello", () => "Hello, world!"));
            }));

    Log.Info("Starting local server: http://127.0.0.1:52080/hello");
    await builder.Build().RunAsync(cancellationToken);
}
```

```text
curl http://127.0.0.1:52080/hello
```

The explicit block owns this run. `RunAsync(cancellationToken)` keeps the script alive and disposes the host on exit, including after a startup failure. Cancellation comes through the token, but it does not forcibly stop handler code. A long operation in a handler must support cancellation itself.

![A request to a web server hosted by an EyePad script](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_gYj4E9YMIQxNRqNe.png)

| Setting | What it changes |
| --- | --- |
| `52080` | Local port. If you change it, update the request address too. |
| `/hello` | Route registered by `MapGet`. Other paths need their own handlers. |
| `ListenLocalhost` | Listens on the loopback address of this computer. The server is not published to other devices. |
| `config.Sources.Clear()` | Removes the host's default configuration sources for this embedded example. |

<details>
<summary>Add routes or make dependencies explicit</summary>

You can add more handlers for your own data, or move related routes into [controllers](/en/scripting/examples/advanced/web-server-controllers). `Log` and `cancellationToken` belong to the top-level script. Pass dependencies to ordinary classes explicitly. The HTTP service container is separate from the EyeAuras container.

`ListenAnyIP` opens the server on network interfaces. The example has no authentication, so do not expose commands through it without your own access check. Port `52443` does not enable HTTPS by itself: TLS and a certificate are set up separately.

The [original shared example](https://eu.eyeauras.net/share/S20250302232655ULHlLljgYANa) still uses the earlier network binding. For the first try, use the local version above. You can see how shutdown and disposal work in the [.NET Hosting 8.0.19 source](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/HostingAbstractionsHostExtensions.cs).

</details>
