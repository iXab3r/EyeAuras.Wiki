---
title: Simple Web Server
description: 
published: true
date: 2025-03-02T23:37:11.763Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-02T23:25:27.998Z
---

# Simple Web Server

This runs inside a top-level EyeAuras C# Script, not a standalone ASP.NET project.
The host must resolve all listed `assemblyName` references and a compatible ASP.NET
Core runtime. Port 52080 must be free. The example uses HTTP; choosing port 52443
does not enable HTTPS without endpoint/certificate configuration.

You can spin-up and host your own local web-server which will be accessible by anyone and which could allow you to either peek into something that happens inside EA instance atm or control some options remotely. 

Code for creating and booting up the server is quite large, but could be just copy-pasted around if needed. 

## Steps
There are multiple steps to make everything work
- you have to reference needed assemblies containing the actual web-server. This is done by using `assemblyName` type of references
- add namespaces containing classes that you will use to boot up the server
- setup the server itself and, most importantly, `routes` which control what exactly your server will be returning when some page is accessed
- pick some free port, 52080 for HTTP and 52443 for HTTPS could be a good choice, but you can change them to whatever you want

## Example 
> You can import the ready-made example from here: https://eu.eyeauras.net/share/S20250302232655ULHlLljgYANa
{.is-info}

1. Create an aura with a script
2. Copy-paste, run it, there should be a line printed to console `Starting web-server` - this is logged before startup and does not prove the server has opened its port
3. Request `curl http://127.0.0.1:52080/hello`; expect `Hello, world!`.


## How it could be used?
The most obvious examply is controlling what happens in EA remotely OR feeding some informationg gathered by EA, such us results of image searchers, text searcher, etc somewhere, maybe to another instance of EA polling that data... Or some other script.

Another example could be controlling your injection-based bot that way - considering this is a full-blown web-server, you can build any kind of transport on top of it.

![Example](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_gYj4E9YMIQxNRqNe.png)

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

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Routing;

using System;

const int PortNumber = 52080;

{
    Log.Info("Creating web-app builder");

    var builder = Host
       .CreateDefaultBuilder()
       .ConfigureAppConfiguration((context, config) =>
       {
           //Very important line!
           //This is required to run the server in EA infrastructure
           config.Sources.Clear();
       })
       .ConfigureWebHostDefaults(webBuilder =>
       {
           Log.Info("Setting up web-options");
           webBuilder
              .ConfigureKestrel(serverOptions =>
              {
                  serverOptions.ConfigureEndpointDefaults(endpointOptions => { endpointOptions.Protocols = HttpProtocols.Http1; });
                  serverOptions.ListenAnyIP(PortNumber, listenOptions => { listenOptions.Protocols = HttpProtocols.Http1AndHttp2; });
              })
              .Configure((ctx, app) =>
              {
                  app.UseRouting();
                  app.UseEndpoints(endpoints =>
                   {
                       endpoints.MapGet("/hello", () =>
                       {
                           //that could be any kind of code
                           return "Hello, world!";
                       });
                   });
              });
       });

    Log.Info("Building web-server");
    using var host = builder.Build();

    Log.Info("Starting web-server");
    await host.RunAsync(cancellationToken);
    Log.Info("Terminated");
}
```
`ListenAnyIP` binds network interfaces rather than only loopback. Remote access
depends on the network and firewall. `RunAsync(cancellationToken)` connects host
shutdown to the script; request handlers and external operations have their own
completion rules. The HTTP service container is separate from EyeAuras DI.
`config.Sources.Clear()` is explicit configuration for this example, not a guarantee
of compatibility with every ASP.NET version.

See [script context](/en/scripting/api/core/app-runtime-contexts),
[hosting contracts](/en/scripting/api/scripting/web-server) and
[assembly references](/en/scripting/api/scripting/references-and-resources).
Source review does not establish compilation or execution of this script in your
host; check the expected HTTP responses after starting it.
