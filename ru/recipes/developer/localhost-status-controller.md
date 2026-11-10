---
title: "Выдать своё состояние только через loopback GET"
description: "Явно зарегистрируйте неизменяемый снимок и controller, прочитайте локальный GET и остановите хост вместе со скриптом."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Выдать своё состояние только через loopback GET

Прочитайте фиксированное нечувствительное состояние через `http://127.0.0.1:52081/status`. Controller возвращает неизменяемый снимок; команд, изменения аур и удалённого управления здесь нет.

Нужен совместимый настольный хост C# с ASP.NET Core Hosting/MVC/Kestrel из [примера controller](/ru/scripting/examples/advanced/web-server-controllers). Директивы `assemblyName:` разрешают сборки хоста, а не устанавливают пакеты. Владение ниже соответствует контракту .NET 8 `RunAsync`. Порт **52081** на вашей машине должен быть свободен.

1. Создайте редактируемую ауру `RecipeStatus` через **Add new → New Aura → Actions → On Enter → C# Script**. Используйте ручную Run, без автоматической активации.
2. В дереве проекта выберите **Add new file → C# File** для **StatusSnapshot.cs** и **StatusController.cs**. Полностью замените содержимое файлами ниже, сохранив namespace `RecipeStatus`. Полностью замените и **Script.csx**.
3. Дождитесь компиляции, нажмите **Run**, проверьте ошибки запуска в **Event Log**. В своём браузере откройте `http://127.0.0.1:52081/status`. Ожидается JSON с `name = RecipeStatus`, `count = 3`; каждый запрос пишет `Read-only recipe status requested`.
4. Нажмите **Stop**. Ожидаемый `RunAsync(cancellationToken)` запрашивает остановку, дожидается её и освобождает хост, асинхронно при поддержке. После завершения обновление адреса больше не должно получать ответ этого рецепта. Новый Run создаст новый снимок и хост.

| Часть | Назначение |
| --- | --- |
| `IPAddress.Loopback`, порт `52081` | Явная привязка IPv4 `127.0.0.1`, не wildcard и не адрес другой машины. |
| `AddApplicationPart(typeof(StatusController).Assembly)` | Добавляет сборку controller проекта в поиск MVC. |
| Параметры конструктора | Собственный DI-контейнер ASP.NET получает снимок и logger явно из Script.csx. |

В обычном controller нет неявных `Log`, `AuraTree`, `Variables` или token скрипта. Свойства снимка нельзя переназначить через endpoint; значение фиксировано на один Run. Запуск хоста, свободный порт и успешный GET — разные результаты. При ошибке запуска прочтите её, не переходите на wildcard.

Ожидание хоста находится внутри явного блока скрипта. `RunAsync` уже владеет освобождением, поэтому второй конкурирующий путь Dispose не добавлен. Единственный минимальный endpoint без поиска controller показан в [простом сервере](/ru/scripting/examples/advanced/simple-web-server).

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
