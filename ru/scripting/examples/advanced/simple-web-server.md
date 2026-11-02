---
title: Простой веб-сервер
description: Настройка простого веб-сервера
published: true
date: 2025-03-02T23:37:11.763Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-02T23:25:27.998Z
---
# Простой веб-сервер

Это сервер внутри верхнеуровневого `C# Script` EyeAuras, а не отдельный ASP.NET-проект. Хост должен уметь загрузить все перечисленные `assemblyName` и совместимый ASP.NET Core runtime. Порт `52080` должен быть свободен. В примере используется HTTP; номер `52443` сам по себе не включает HTTPS — для него нужны отдельные настройки сертификата и endpoint.

Вы можете поднять и запустить собственный локальный веб-сервер, который будет доступен другим пользователям. Это может быть полезно, если нужно посмотреть, что сейчас происходит внутри экземпляра EA, или удалённо управлять какими-то параметрами.

Код для создания и запуска сервера довольно объёмный, но при необходимости его можно просто скопировать и использовать как основу.

## Что нужно сделать

Чтобы всё заработало, потребуется несколько шагов:

- подключить нужные сборки, в которых находится сам веб-сервер. Для этого используются ссылки типа `assemblyName`
- добавить пространства имён с классами, которые понадобятся для запуска сервера
- настроить сам сервер и, что особенно важно, `routes` — именно они определяют, что сервер будет возвращать при обращении к конкретным страницам
- выбрать свободный порт. Для HTTP подойдёт `52080`, для HTTPS — `52443`, но при желании вы можете использовать любые другие

## Пример

> Готовый пример можно импортировать отсюда: https://eu.eyeauras.net/share/S20250302232655ULHlLljgYANa
{.is-info}

1. Создайте ауру со скриптом.
2. Скопируйте код ниже, вставьте и запустите его. В консоли должна появиться строка `Starting web-server` — после неё ещё может произойти ошибка запуска.
3. Проверьте ответ `curl http://127.0.0.1:52080/hello` — ожидается `Hello, world!` (в варианте с контроллерами — `Hello World!`).



## Как это можно использовать?

Самый очевидный вариант — удалённо управлять тем, что происходит в EA, или отдавать куда-то данные, которые собирает EA: например, результаты image searchers, text searcher и т. д. Эти данные может опрашивать другой экземпляр EA или какой-нибудь внешний скрипт.

Ещё один вариант — управление вашим injection-based ботом через такой сервер. Поскольку это полноценный веб-сервер, поверх него можно построить практически любой транспорт.

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

`ListenAnyIP` слушает доступные сетевые интерфейсы, а не только loopback. Доступ с другой машины зависит от сети и firewall. `RunAsync(cancellationToken)` связывает работу хоста с остановкой скрипта; уже запущенные обработчики и внешние операции имеют собственные правила завершения. HTTP-контейнер `services` создаётся отдельно от контейнера EyeAuras: сервисы скрипта не появляются в контроллерах автоматически. `config.Sources.Clear()` оставляет явную настройку этого примера; оно не гарантирует совместимость любой версии ASP.NET.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Хостинг HTTP](/ru/scripting/api/scripting/web-server) · [Ссылки на сборки](/ru/scripting/api/scripting/references-and-resources)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
