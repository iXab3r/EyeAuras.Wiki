---
title: Веб-сервер с контроллерами
description: 
published: true
date: 2025-03-03T00:11:41.656Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-02T23:41:52.118Z
---
# Веб-сервер с контроллерами

Это сервер внутри верхнеуровневого `C# Script` EyeAuras, а не отдельный ASP.NET-проект. Хост должен уметь загрузить все перечисленные `assemblyName` и совместимый ASP.NET Core runtime. Порт `52080` должен быть свободен. В примере используется HTTP; номер `52443` сам по себе не включает HTTPS — для него нужны отдельные настройки сертификата и endpoint.

Мы уже разбирали, как создать [простой web-server](/ru/scripting/examples/advanced/simple-web-server). Теперь перейдём к более удобному и масштабируемому варианту.

Когда вы вручную создаёте маршруты и сами парсите аргументы, всё работает — но довольно быстро код становится перегруженным и неудобным в поддержке.

Именно для этого и используют [MVC](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-mvc-app/adding-controller?view=aspnetcore-9.0&tabs=visual-studio) — один из подходов к организации приложения, который делает код понятнее и проще в сопровождении.

Идея простая: вы `описываете`, откуда и в каком виде должны приходить данные, а AspNet сам разбирает запрос, преобразует всё в удобные типы C# и вызывает нужный метод. То есть вместо ручного чтения query string вы просто создаёте метод с обычными C#-параметрами.

## Что меняется по сравнению с простым вариантом

В целом шаги похожи на пример с простым сервером, но есть важное отличие: вместо ручной сборки `Routes` вы создаёте Controller, добавляете к нему Attributes, а AspNet сам строит маршруты и связывает запросы с методами.

- Важно: AspNet нужно явно указать, где находятся ваши Controllers — в примере ниже это уже настроено
- Controllers **обязательно** должны быть объявлены в отдельных файлах. Определять их прямо в `Script.csx` **не получится**
- У вас может быть несколько Controllers с разными Routes, Methods и Arguments — AspNet сам разберётся с маршрутизацией и выберет подходящий метод

## Пример

> Готовый пример можно импортировать отсюда: https://eyeauras.net/share/S20250302232729tsMgRqVRO6Gr
{.is-info}

1. Создайте ауру со скриптом
2. Скопируйте код, запустите его и проверьте консоль — там должна появиться строка `Starting web-server`, это сообщение перед запуском, а не подтверждение занятого порта
3. Откройте страницу через CURL или браузер

## Где это может пригодиться

Использовать можно так же, как и простой вариант. Но такой подход даёт гораздо больше возможностей: можно разделять логику по нескольким Controllers, назначать им отдельные зоны ответственности, использовать Dependency Injection и другие более высокоуровневые возможности AspNet.

![Example](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_Z2i6oRKb8cb4rJ3t.png)

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

    using var host = await Task.Run(() =>
    {
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
               .ConfigureKestrel(options => ConfigureKestrel(options))
               .Configure((ctx, app) => { ConfigureAppAndEnvironment(Log, app, ctx.HostingEnvironment); });

            webBuilder.ConfigureServices(services => {
                var manager = new ApplicationPartManager();
                services.AddSingleton<ApplicationPartManager>(manager);
                services
                    .AddControllers()
                    .AddApplicationPart(typeof(InjectController).Assembly); //that line will ensure that Controllers are properly detected
            });
        });

        Log.Info("Building web-server");
        return builder.Build();
    }, cancellationToken);

    Log.Info("Starting web-server");
    await host.RunAsync(cancellationToken);
    Log.Info("Terminated");
}

private static void ConfigureAppAndEnvironment(
    IFluentLog log,
    IApplicationBuilder app,
    IWebHostEnvironment env)
{
    app.UseRouting();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers(); //will build up routes and make your Controllers available for invocation
        endpoints.MapGet("/hello", () => "Hello World!");
    });

    EnumerateEndpoints(log, app);
}

private static void ConfigureKestrel(KestrelServerOptions serverOptions)
{
    serverOptions.ConfigureEndpointDefaults(endpointOptions => { endpointOptions.Protocols = HttpProtocols.Http1; });
    serverOptions.ListenAnyIP(PortNumber, listenOptions => { listenOptions.Protocols = HttpProtocols.Http1AndHttp2; });
}


private static void EnumerateEndpoints(IFluentLog log, IApplicationBuilder app)
{
    var endpointDataSource = app.ApplicationServices.GetRequiredService<EndpointDataSource>();

    var endpoints = endpointDataSource.Endpoints
        .Select(x => x is RouteEndpoint routeEndpoint ? $"Endpoint: {routeEndpoint.DisplayName}, Path: {routeEndpoint.RoutePattern.RawText}, Order: {routeEndpoint.Order}" : "Unknown endpoint: {x}")
        .ToArray();
    log.Info(endpoints.DumpToNamedTable("Endpoints"));
}
```

**InjectController.cs**
```csharp
namespace GameGrit;

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

[ApiController]
[Route("inject")]
public sealed class InjectController : ControllerBase
{
    [HttpGet]
    public ActionResult Index()
    {
        return new OkObjectResult(new { Text = "Index page" });
    }

    [HttpGet]
    [HttpPost]
    [Route("test")]
    public async Task<ActionResult> Test()
    {
        return new OkObjectResult($"Hello!");
    }

    [HttpGet]
    [HttpPost]
    [Route("getBaseOffset")]
    public async Task<ActionResult> GetBaseOffset(string moduleName)
    {
        return new OkObjectResult($"Base offset for module {moduleName} is XxX!");
    }
}
```

`ListenAnyIP` слушает доступные сетевые интерфейсы, а не только loopback. Доступ с другой машины зависит от сети и firewall. `RunAsync(cancellationToken)` связывает работу хоста с остановкой скрипта; уже запущенные обработчики и внешние операции имеют собственные правила завершения. HTTP-контейнер `services` создаётся отдельно от контейнера EyeAuras: сервисы скрипта не появляются в контроллерах автоматически. `config.Sources.Clear()` оставляет явную настройку этого примера; оно не гарантирует совместимость любой версии ASP.NET.

Создайте оба файла в одном скриптовом проекте: `Script.csx` и отдельный `InjectController.cs` с namespace `GameGrit`. `AddApplicationPart(typeof(InjectController).Assembly)` указывает MVC сборку контроллера. Проверки: `/inject` возвращает объект с `Text = "Index page"`, `/inject/test` — приветствие, `/inject/getBaseOffset?moduleName=kernel32.dll` — демонстрационную строку `XxX!`. Последний endpoint не читает адрес модуля; это явная заглушка прикладной операции, а не пример готового сервиса чтения памяти.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Хостинг HTTP](/ru/scripting/api/scripting/web-server) · [Ссылки на сборки](/ru/scripting/api/scripting/references-and-resources)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
