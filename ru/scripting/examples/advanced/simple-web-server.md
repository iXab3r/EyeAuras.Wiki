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

Оставьте скрипт работающим и откройте `http://127.0.0.1:52080/hello` на том же компьютере. Браузер получит `Hello, world!` от вашего скрипта. Так можно сделать локальную страницу состояния, прежде чем добавлять команды или контроллеры.

Нужен проект **C# Script** в [EyePad](/ru/features/eyepad). Это `Script.csx` внутри EyeAuras: `Log` и `cancellationToken` предоставляет его хост. В обычном C#-проекте они сами не появляются. Сборка EyeAuras должна содержать совместимые сборки ASP.NET Core; `#r "assemblyName: ..."` подключает доступную сборку, а не устанавливает серверный .NET. Для подключения пакетов и проектов см. [NuGet](/ru/scripting/nuget).

## Запустить ответ на /hello

1. Создайте отдельную вкладку **C# Script**. Убедитесь, что порт `52080` не занят вашим другим сервером.
2. Замените содержимое `Script.csx` программой ниже и нажмите `Run`.
3. На этом же компьютере откройте `http://127.0.0.1:52080/hello`. Ожидаемый ответ — `Hello, world!`. Вместо браузера можно выполнить `curl http://127.0.0.1:52080/hello`.
4. Нажмите `Stop` в EyePad. Работа хоста завершается, слушающий порт освобождается; новые запросы к нему больше не обслуживаются.

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

`RunAsync` удерживает скрипт работающим и освобождает хост при выходе, в том числе при ошибке запуска. Отмена передаётся через `cancellationToken`; она не обрывает произвольный код обработчика принудительно. Долгой операции внутри обработчика нужна собственная поддержка отмены.

На иллюстрации показан прежний пример с запросом из командной строки: ответ следует читать в клиенте, а сообщения запуска — в журнале EyePad.

![Запрос к серверу, запущенному в EyePad](https://s3.eyeauras.net/media/2025/03/NVIDIA_Overlay_gYj4E9YMIQxNRqNe.png)

| Что изменить | Что это означает |
|---|---|
| `52080` | Свободный локальный порт. При изменении исправьте и адрес в браузере. |
| `/hello` | Путь обработчика `MapGet`; другой путь сам по себе не создаётся. |
| `ListenLocalhost` | Прослушивание петлевого адреса этого компьютера; это не публикация для других устройств. |
| `config.Sources.Clear()` | Сервер не подхватывает стандартные источники конфигурации приложения. |

<details>
<summary>Расширение примера и граница доступа</summary>

В проекте можно добавить другие HTTP-обработчики и получать данные скрипта через явно переданные зависимости. Для нескольких маршрутов в отдельных файлах удобнее [контроллеры](/ru/scripting/examples/advanced/web-server-controllers).

`ListenAnyIP` меняет область прослушивания на сетевые интерфейсы. Это уже отдельная настройка доступа: приведённый сервер не реализует авторизацию. Не открывайте через него команды управления приложением без собственной проверки доступа. Номер порта `52443` сам по себе не включает HTTPS: для него отдельно настраиваются TLS и сертификат.

[Исходный пример для импорта](https://eu.eyeauras.net/share/S20250302232655ULHlLljgYANa) содержит прежнюю сетевую настройку; для первого опыта используйте локальный вариант выше. Контракт остановки описан в [исходнике .NET Hosting 8.0.19](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/HostingAbstractionsHostExtensions.cs).

</details>
