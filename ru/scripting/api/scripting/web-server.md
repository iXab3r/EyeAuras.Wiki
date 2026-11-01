---
title: AI-скриптинг — веб-сервер
description: Карта AI-документации по запуску локальных endpoint'ов ASP.NET Core и Kestrel из мини-приложений на скриптах.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, web-server, aspnet, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта навигации по Web Server

Справочная карта для script mini-app, которые поднимают локальный ASP.NET Core/Kestrel web server и отдают состояние, команды удалённого управления, диагностику или API для бота/инструмента.

## Что обычно хотят сделать

- Запустить локальный HTTP endpoint из скрипта.
- Отдать состояние mini-app в браузер или другой процесс.
- Принимать команды удалённого управления.
- Добавить MVC/API controllers в проект скрипта.
- Держать web host запущенным, пока работает скрипт.
- Избежать конфликтов конфигурации host внутри runtime EyeAuras.

## Как это устроено

- Web server, запущенный из скрипта, — это обычный ASP.NET Core host, который работает внутри процесса скрипта.
- За время жизни сервера отвечает сам скрипт, и останавливать его нужно через отмену скрипта.
- Для простых endpoint'ов состояния и управления обычно достаточно minimal routes.
- Для более крупных API и типизированных аргументов лучше подходят controllers.
- Controllers лучше хранить в обычных `.cs` файлах, а не в верхнеуровневом файле скрипта.
- В среде scripting перед настройкой Kestrel может понадобиться очистить список sources у host configuration.

## Ключевые API и пакеты

- `Host.CreateDefaultBuilder()` — создаёт generic host.
- `ConfigureAppConfiguration((context, config) => config.Sources.Clear())` — не даёт подтянуть лишние sources конфигурации host в runtime скрипта.
- `ConfigureWebHostDefaults(...)` — настраивает ASP.NET Core hosting.
- `KestrelServerOptions` — настройка локальных портов и протоколов.
- `UseRouting()` — включает endpoint routing.
- `UseEndpoints(...)` — регистрирует minimal endpoints и controllers.
- `MapGet(...)`, `MapPost(...)` — обработчики minimal routes.
- `AddControllers()` — включает поддержку MVC/controllers.
- `AddApplicationPart(typeof(SomeController).Assembly)` — подсказывает ASP.NET, где лежат controllers проекта скрипта.
- `MapControllers()` — включает маршруты найденных controllers.
- `RunAsync(cancellationToken)` — держит сервер запущенным до отмены скрипта.

## Отдать локальную страницу состояния

Вставьте код в `Script.csx` C# Script. Нужен свободный порт 52080 и доступные
host сборки ASP.NET Core: `assemblyName` не устанавливает отсутствующий
framework. Пример использует только loopback, без сертификата и удалённого
доступа.

```csharp
#r "assemblyName: Microsoft.AspNetCore"
#r "assemblyName: Microsoft.AspNetCore.Hosting"
#r "assemblyName: Microsoft.AspNetCore.Hosting.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Http.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Routing"
#r "assemblyName: Microsoft.AspNetCore.Routing.Abstractions"
#r "assemblyName: Microsoft.AspNetCore.Server.Kestrel"
#r "assemblyName: Microsoft.AspNetCore.Server.Kestrel.Core"
#r "assemblyName: Microsoft.Extensions.Hosting"
#r "assemblyName: Microsoft.Extensions.Hosting.Abstractions"
#r "assemblyName: Microsoft.Extensions.Configuration.Abstractions"

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Hosting;

var runToken = cancellationToken;
{
    using var host = Host.CreateDefaultBuilder()
        .ConfigureAppConfiguration((_, config) => config.Sources.Clear())
        .ConfigureWebHostDefaults(web => web
            .ConfigureKestrel(options => options.ListenLocalhost(52080,
                endpoint => endpoint.Protocols = HttpProtocols.Http1))
            .Configure(app =>
            {
                app.UseRouting();
                app.UseEndpoints(endpoints =>
                    endpoints.MapGet("/status", async context =>
                        await context.Response.WriteAsync("EyeAuras is running")));
            }))
        .Build();

    Log.Info("Запускаем HTTP на http://localhost:52080/status");
    await host.RunAsync(runToken);
}
```

После запуска откройте `http://localhost:52080/status` или выполните
`curl http://localhost:52080/status`. Ожидаемый ответ — `EyeAuras is running`.
Сообщение перед `RunAsync` ещё не доказывает, что порт удалось открыть:
это проверяется ответом HTTP и диагностикой host.

`RunAsync(runToken)` ожидается в теле скрипта. При отмене Run host получает
сигнал остановки; выход из блока освобождает host. Не заменяйте этот токен
предположением о времени жизни sandbox. Обработчик HTTP работает в контексте
ASP.NET, поэтому desktop UI требует отдельного перехода на UI scheduler.
Очистка `config.Sources` убирает унаследованные источники конфигурации; если
нужна своя конфигурация сервера, добавьте её явно после очистки.

## Добавить controllers к тому же серверу

Для API из нескольких маршрутов разместите класс в обычном файле
`StatusController.cs` проекта:

```csharp
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/status")]
public sealed class StatusController : ControllerBase
{
    [HttpGet]
    public string Get() => "EyeAuras is running";
}
```

В предыдущем `Script.csx` добавьте ссылки и пространства имён:

```csharp
#r "assemblyName: Microsoft.AspNetCore.Mvc"
#r "assemblyName: Microsoft.AspNetCore.Mvc.Core"
#r "assemblyName: Microsoft.Extensions.DependencyInjection.Abstractions"
using Microsoft.Extensions.DependencyInjection;
```

В цепочке `web` перед `.Configure(...)` добавьте
`.ConfigureServices(services => services.AddControllers().AddApplicationPart(typeof(StatusController).Assembly))`.
В существующем `UseEndpoints` замените лямбду на блок, сохранив `/status`,
и добавьте `endpoints.MapControllers();`. Теперь `GET /api/status` вернёт тот
же текст через MVC. Полный разнесённый проект есть в
[примере controllers](/ru/scripting/examples/advanced/web-server-controllers).

Это дополнение к подготовленному серверу, а не самостоятельное тело скрипта.
Для прикладных сервисов нужны отдельные регистрации ASP.NET DI и явная
передача нужных зависимостей из скрипта. Unity-контейнер EyeAuras не становится
контейнером HTTP host автоматически.

## Что предпочтительно

- Используйте web endpoints, когда нужен нативный доступ из браузера или связь между процессами.
- Используйте controllers, если endpoint'ам нужны типизированные аргументы или несколько групп маршрутов.
- Предпочитайте `RunAsync`, привязанный к `cancellationToken`.
- Используйте явные порты и локальный доступ по умолчанию, если удалённый доступ не нужен специально.
- Бизнес-логику лучше выносить в отдельные service classes; controllers должны обращаться к сервисам mini-app.

## Чего избегать

- Не запускайте сервер без понятного владельца времени жизни и отмены.
- Не открывайте управляющие endpoint'ы на публичных интерфейсах, если это не задумано.
- Не размещайте controllers прямо в `Script.csx`.
- Не полагайтесь на глобальные sources конфигурации приложения, не очистив или не проверив их.
- Не блокируйте UI/render loops во время работы web server.

## Опорные API для поиска

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

## Синонимы для поиска

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

## Связанные карты

- `scripting/runtime.md`
- `scripting/references-and-resources.md`
- `scripting/project-workflow.md`
- `scripting/container-extensions.md`
Срез EyeAuras `20fd3d4`, PoeEye `0e02c98`; свойства сборки указывают ASP.NET Core 7.0.0. Реализация ASP.NET поставляется внешними сборками: точные контракты смотрите в reference своей версии, а доступность порта проверяйте запуском.
