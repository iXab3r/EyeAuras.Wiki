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

Run a small HTTP endpoint from your own script and read `Hello, world!` in a browser. The response comes from a handler in the script; it does not read another application's data.

You need a **C# Script** in [EyePad](/en/features/eyepad), a free local port `52080`, and a host that can load the listed ASP.NET Core assemblies and their compatible runtime dependencies. `assemblyName` references select available assemblies; they do not install ASP.NET Core. See [assembly and package references](/en/scripting/nuget) if a reference cannot be resolved.

## Make one local request

1. Create a C# Script project and put the complete program below in `Script.csx`.
2. Click `Run`. Keep the script running while making the request. A startup log line alone does not mean the port is listening.
3. Open `http://127.0.0.1:52080/hello` on the same computer, or use the command below. The response should be `Hello, world!`.
4. Click `Stop` in EyePad. The token starts host shutdown; after shutdown and disposal, the server releases its listener.

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

The explicit block owns this run. `RunAsync(cancellationToken)` keeps it alive and disposes the host on exit, using asynchronous disposal when supported, including after a startup failure. Cancellation is cooperative: a long-running request handler must also support cancellation; it is not forcibly interrupted by stopping the listener.

The earlier illustration shows a command-line request. Read the response in the client and startup messages in the EyePad log.

![A request to a web server hosted by an EyePad script](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_gYj4E9YMIQxNRqNe.png)

| Setting | What it changes |
| --- | --- |
| `52080` | Local port. If you change it, update the request address too. |
| `/hello` | Route registered by `MapGet`. Other paths need their own handlers. |
| `ListenLocalhost` | Binds loopback on this computer, rather than publishing to other devices. |
| `config.Sources.Clear()` | Removes the host's default configuration sources for this embedded example. |

<details>
<summary>Add routes or make dependencies explicit</summary>

Add more handlers for your own data, or move related routes into [controllers](/en/scripting/examples/advanced/web-server-controllers). `Log` and `cancellationToken` belong to the top-level script. Pass dependencies to ordinary classes explicitly; the HTTP service container is separate from the EyeAuras container.

`ListenAnyIP` changes the listening scope to network interfaces. The example supplies no authentication. Remote commands require a separate access design; changing the port to `52443` does not configure HTTPS, TLS or a certificate.

The [original shared example](https://eu.eyeauras.net/share/S20250302232655ULHlLljgYANa) uses the earlier network binding. The local version above is the first exercise. Host shutdown and disposal follow the [.NET Hosting 8.0.19 implementation](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/HostingAbstractionsHostExtensions.cs); having a reference to that library does not establish that every ASP.NET dependency is deployed in your host.

</details>
