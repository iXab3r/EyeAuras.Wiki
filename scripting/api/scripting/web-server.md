---
title: AI Scripting: Web Server
description: AI-first map for hosting local ASP.NET Core/Kestrel endpoints from script mini-apps.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, web-server, aspnet
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

## Common Flows

### Minimal Local Endpoint

1. Add the needed ASP.NET Core assembly/package references.
2. Create the host builder.
3. Clear inherited configuration sources if needed.
4. Configure Kestrel port/protocol.
5. Map minimal routes.
6. Build the host.
7. Run with script cancellation token.

### Controller-Based API

1. Put controllers in separate `.cs` files.
2. Add MVC/controller services.
3. Add the controller assembly as an application part.
4. Map controllers in endpoint configuration.
5. Keep route attributes stable and explicit.

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

- `scripting/runtime.md`
- `scripting/references-and-resources.md`
- `scripting/project-workflow.md`
- `scripting/container-extensions.md`
