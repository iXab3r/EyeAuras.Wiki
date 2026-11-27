---
title: Простой веб-сервер
description: Настройка простого веб-сервера
published: true
date: 2025-03-02T23:37:11.763Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-02T23:25:27.998Z
---

# Ответить на локальный HTTP-запрос из скрипта

Запустите скрипт и откройте на том же компьютере `http://127.0.0.1:52080/hello` — браузер получит от скрипта `Hello, world!`. Так можно сделать локальную страницу состояния, а команды и контроллеры добавить потом.

Нужен проект **C# Script** в [EyePad](/ru/features/eyepad). Это `Script.csx` внутри EyeAuras: `Log` и `cancellationToken` даёт его хост, в обычном C#-проекте их нет. В сборке EyeAuras должны быть совместимые сборки ASP.NET Core. `#r "assemblyName: ..."` подключает уже имеющуюся сборку, а не устанавливает серверный .NET. Как подключать пакеты и проекты — в разделе [NuGet](/ru/scripting/nuget).

## Запустить ответ на /hello

1. Создайте отдельную вкладку **C# Script**. Проверьте, что порт `52080` не занят другим вашим сервером.
2. Замените содержимое `Script.csx` кодом ниже и нажмите `Run`.
3. На этом же компьютере откройте `http://127.0.0.1:52080/hello`. Должно прийти `Hello, world!`. Вместо браузера можно выполнить `curl http://127.0.0.1:52080/hello`.
4. Нажмите `Stop` в EyePad. Хост завершится, порт освободится, новые запросы обслуживаться не будут.

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

    Log.Info("Запускается локальный сервер: http://127.0.0.1:52080/hello");
    await builder.Build().RunAsync(cancellationToken);
}
```

`RunAsync` не даёт скрипту завершиться и освобождает хост при выходе, в том числе если запуск закончился ошибкой. Отмена приходит через `cancellationToken`, но код обработчика она принудительно не обрывает. Долгая операция в обработчике должна сама поддерживать отмену.

На снимке — прежний пример с запросом из командной строки. Ответ смотрите в клиенте, а сообщения запуска — в журнале EyePad.

![Запрос к серверу, запущенному в EyePad](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_gYj4E9YMIQxNRqNe.png)

| Что изменить | Что это означает |
|---|---|
| `52080` | Свободный локальный порт. Если меняете, поправьте и адрес в браузере. |
| `/hello` | Путь обработчика `MapGet`. Другие пути сами не появятся. |
| `ListenLocalhost` | Слушает петлевой адрес этого компьютера. Для других устройств сервер так не публикуется. |
| `config.Sources.Clear()` | Сервер не читает стандартные источники конфигурации приложения. |

<details>
<summary>Расширение примера и граница доступа</summary>

В проект можно добавить другие HTTP-обработчики, а данные скрипта передавать им явно, через зависимости. Если маршрутов несколько и они в разных файлах, удобнее [контроллеры](/ru/scripting/examples/advanced/web-server-controllers).

`ListenAnyIP` открывает сервер на сетевых интерфейсах. Это уже вопрос доступа: авторизации в этом сервере нет. Не открывайте через него команды управления приложением без своей проверки доступа. Порт `52443` сам HTTPS не включает: TLS и сертификат настраиваются отдельно.

В [исходном примере для импорта](https://eu.eyeauras.net/share/S20250302232655ULHlLljgYANa) осталась прежняя сетевая настройка, для первого раза берите локальный вариант выше. Как работает остановка, видно в [исходнике .NET Hosting 8.0.19](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/HostingAbstractionsHostExtensions.cs).

</details>
