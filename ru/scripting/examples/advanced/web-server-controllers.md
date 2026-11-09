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

Если локальному серверу нужны несколько связанных адресов, вынесите их в обычный C#-класс. В этом примере `Script.csx` запускает сервер, а `InjectController.cs` отвечает на три учебных маршрута. Они возвращают подготовленный текст и не читают память процессов.

Нужен проект **C# Script** в [EyePad](/ru/features/eyepad) с доступными сборками ASP.NET Core. Сначала полезно запустить [один локальный обработчик](/ru/scripting/examples/advanced/simple-web-server). Файлы ниже должны принадлежать **одному** проекту скрипта; файл контроллера добавляется как C#-файл проекта, а не как вторая вкладка с независимым скриптом.

## Создать два файла

1. Создайте `InjectController.cs` в проекте и вставьте класс ниже. Это публичный класс верхнего уровня: MVC не обнаруживает вложенный класс контроллера внутри сгенерированного класса скрипта.
2. Поместите второй листинг в `Script.csx` и нажмите `Run`.
3. Откройте `http://127.0.0.1:52080/inject`. В ответе JSON поле `text` содержит `Index page`.
4. Проверьте `/inject/test`: ответ — `Hello!`. Адрес `/inject/getBaseOffset?moduleName=demo` вернёт учебную строку с `demo` и `XxX`, **не настоящий адрес модуля**.
5. Нажмите `Stop`. Отмена завершает хост и освобождает порт.

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

`#r "assemblyName: ..."` подключает сборки из окружения хоста, а не загружает недостающую серверную платформу. При несовместимых или отсутствующих сборках сначала исправьте состав проекта и установки; случайное смешивание версий NuGet с загруженными сборками EyeAuras не заменяет подготовку окружения.

На прежней иллюстрации клиент получает строку от контроллера. Название `getBaseOffset` в этом учебном проекте не означает интеграцию с памятью игры.

![Ответ контроллера из проекта EyePad](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_Z2i6oRKb8cb4rJ3t.png)

| Настройка | Зачем нужна |
|---|---|
| `ListenLocalhost(52080)` | Все примеры доступны только на этом компьютере. |
| `AddControllers()` | Регистрирует службы MVC в контейнере HTTP-хоста. |
| `AddApplicationPart(...)` | Указывает сборку с контроллером; одного наличия `.cs`-файла недостаточно. |
| `MapControllers()` | Подключает маршруты атрибутов контроллера. |
| `[FromQuery] string moduleName` | Читает параметр строки запроса; GET и POST здесь не читают произвольное тело запроса. |

У контроллера нет глобальных `Log`, `GetService`, `AuraTree` или `cancellationToken` скрипта. Свои данные передавайте явно: зарегистрируйте зависимость в `ConfigureServices` и получите её через конструктор контроллера. Контейнер ASP.NET Core не становится контейнером EyeAuras автоматически. Для отмены работы с HTTP-запросом у контроллера есть `HttpContext.RequestAborted`.

<details>
<summary>Дополнительные проверки маршрутов</summary>

Оба учебных метода `test` и `getBaseOffset` допускают GET и POST. Например, локальная команда `curl -X POST http://127.0.0.1:52080/inject/test` получает тот же `Hello!`. Обработчик `/hello` остаётся обычным `MapGet` рядом с контроллерами.

Для просмотра зарегистрированных маршрутов добавьте `using Microsoft.AspNetCore.Routing;` к директивам и вставьте следующий **фрагмент внутрь `Configure(app => ...)`, после `UseEndpoints`**:

```csharp
var source = app.ApplicationServices.GetRequiredService<EndpointDataSource>();
foreach (var endpoint in source.Endpoints)
    Log.Info(endpoint.DisplayName);
```

Здесь лямбда явно захватывает журнал верхнеуровневого скрипта. Это список маршрутов HTTP-хоста, а не список аур.

[Исходный проект для импорта](https://eyeauras.net/share/S20250302232729tsMgRqVRO6Gr) использует прежнюю сетевую настройку. Для первого опыта оставьте `ListenLocalhost`. Требования к обнаружению класса определяет [MVC ControllerFeatureProvider](https://github.com/dotnet/aspnetcore/blob/v8.0.19/src/Mvc/Mvc.Core/src/Controllers/ControllerFeatureProvider.cs).

</details>
