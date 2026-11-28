---
title: Веб-сервер с контроллерами
description: 
published: true
date: 2025-03-03T00:11:41.656Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-02T23:41:52.118Z
---

# Разнести HTTP-маршруты по контроллерам

Если локальному серверу нужно несколько связанных адресов, вынесите их в обычный C#-класс. Здесь `Script.csx` запускает сервер, а `InjectController.cs` отвечает на три учебных маршрута.

Нужен проект **C# Script** в [EyePad](/ru/features/eyepad) со сборками ASP.NET Core. Сначала стоит запустить [пример с одним обработчиком](/ru/scripting/examples/advanced/simple-web-server). Оба файла должны лежать в **одном** проекте скрипта: контроллер добавляется как C#-файл проекта, а не как вторая вкладка с отдельным скриптом.

## Создать два файла

1. Создайте в проекте `InjectController.cs` и вставьте класс ниже. Класс должен быть публичным и верхнего уровня: контроллер, вложенный в сгенерированный класс скрипта, MVC не найдёт.
2. Вставьте второй листинг в `Script.csx` и нажмите `Run`.
3. Откройте `http://127.0.0.1:52080/inject`. Придёт JSON, в поле `text` будет `Index page`.
4. Проверьте `/inject/test` — ответ `Hello!`. Адрес `/inject/getBaseOffset?moduleName=demo` вернёт учебную строку с `demo` и `XxX`, **не настоящий адрес модуля**.
5. Нажмите `Stop`. Хост завершится и освободит порт.

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

`#r "assemblyName: ..."` подключает сборки, которые уже есть у хоста, а не скачивает недостающую серверную платформу. Если сборок нет или они несовместимы, сначала поправьте состав проекта и установку. Подмешивать случайные версии из NuGet к загруженным сборкам EyeAuras — не решение.

![Ответ контроллера из проекта EyePad](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_Z2i6oRKb8cb4rJ3t.png)

| Настройка | Зачем нужна |
|---|---|
| `ListenLocalhost(52080)` | Все примеры доступны только на этом компьютере. |
| `AddControllers()` | Регистрирует службы MVC в контейнере HTTP-хоста. |
| `AddApplicationPart(...)` | Указывает сборку с контроллером. Одного `.cs`-файла в проекте мало. |
| `MapControllers()` | Подключает маршруты из атрибутов контроллера. |
| `[FromQuery] string moduleName` | Читает параметр из строки запроса. Произвольное тело запроса здесь не читается ни при GET, ни при POST. |

У контроллера нет глобальных `Log`, `GetService`, `AuraTree` и `cancellationToken` скрипта. Свои данные передавайте явно: зарегистрируйте зависимость в `ConfigureServices` и получите её в конструкторе контроллера. Отмену HTTP-запроса контроллер видит через `HttpContext.RequestAborted`.

<details>
<summary>Дополнительные проверки маршрутов</summary>

Методы `test` и `getBaseOffset` принимают и GET, и POST. Например, `curl -X POST http://127.0.0.1:52080/inject/test` вернёт тот же `Hello!`. Обработчик `/hello` остаётся обычным `MapGet` рядом с контроллерами.

Чтобы посмотреть зарегистрированные маршруты, добавьте к директивам `using Microsoft.AspNetCore.Routing;` и вставьте **фрагмент внутрь `Configure(app => ...)`, после `UseEndpoints`**:

```csharp
var source = app.ApplicationServices.GetRequiredService<EndpointDataSource>();
foreach (var endpoint in source.Endpoints)
    Log.Info(endpoint.DisplayName);
```

Лямбда здесь явно захватывает журнал верхнеуровневого скрипта.

В [исходном проекте для импорта](https://eyeauras.net/share/S20250302232729tsMgRqVRO6Gr) осталась прежняя сетевая настройка. Для первого раза оставьте `ListenLocalhost`. Какой класс считается контроллером, определяет [MVC ControllerFeatureProvider](https://github.com/dotnet/aspnetcore/blob/v8.0.19/src/Mvc/Mvc.Core/src/Controllers/ControllerFeatureProvider.cs).

</details>
