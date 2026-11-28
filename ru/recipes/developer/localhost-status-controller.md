---
title: "Выдать своё состояние только через loopback GET"
description: "Скрипт отдаёт неизменяемый снимок через controller на 127.0.0.1 и останавливает веб-хост вместе с собой."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Выдать своё состояние только через loopback GET

Скрипт поднимает маленький веб-хост и отдаёт фиксированные несекретные данные по адресу `http://127.0.0.1:52081/status`. Controller возвращает неизменяемый снимок.

Нужен настольный EyeAuras, в хосте C# которого есть ASP.NET Core Hosting/MVC/Kestrel, как в [примере с controller](/ru/scripting/examples/advanced/web-server-controllers). Директивы `assemblyName:` подключают сборки хоста, а не устанавливают пакеты. Порт **52081** на вашей машине должен быть свободен.

1. Создайте редактируемую ауру `RecipeStatus` через **Add new → New Aura → Actions → On Enter → C# Script**. Запускать будете вручную кнопкой Run, автоматическая активация не нужна.
2. В дереве проекта через **Add new file → C# File** добавьте **StatusSnapshot.cs** и **StatusController.cs**. Целиком замените их содержимое кодом ниже, namespace `RecipeStatus` оставьте. Так же целиком замените **Script.csx**.
3. Дождитесь компиляции, нажмите **Run** и проверьте, нет ли ошибок запуска в **Event Log**. Откройте в браузере `http://127.0.0.1:52081/status`. Должен прийти JSON с `name = RecipeStatus`, `count = 3`. Каждый запрос пишет в журнал `Read-only recipe status requested`.
4. Нажмите **Stop**. В .NET 8 `RunAsync(cancellationToken)` запросит остановку, дождётся её и освободит хост — асинхронно, если это поддерживается. После этого при обновлении страницы ответа от рецепта быть не должно.

| Часть | Назначение |
| --- | --- |
| `IPAddress.Loopback`, порт `52081` | Хост слушает только IPv4 `127.0.0.1`. |
| `AddApplicationPart(typeof(StatusController).Assembly)` | Добавляет сборку проекта туда, где MVC ищет controller. |
| Параметры конструктора | У ASP.NET свой DI-контейнер. Снимок и logger он получает явно из Script.csx. |

В обычном controller нет неявных `Log`, `AuraTree`, `Variables` и token скрипта. Поменять свойства снимка через endpoint нельзя: значение задаётся один раз на Run. Если запуск упал, прочитайте ошибку и не переходите на wildcard.

Вариант с одним endpoint и без поиска controller показан в [простом сервере](/ru/scripting/examples/advanced/simple-web-server).

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
