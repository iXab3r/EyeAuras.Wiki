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

## Типовые сценарии

### Простой локальный endpoint

1. Добавьте нужные assembly/package references для ASP.NET Core.
2. Создайте host builder.
3. При необходимости очистите унаследованные sources конфигурации.
4. Настройте порт и протокол Kestrel.
5. Зарегистрируйте minimal routes.
6. Соберите host.
7. Запустите его с `cancellationToken` скрипта.

### API на controllers

1. Вынесите controllers в отдельные `.cs` файлы.
2. Подключите MVC/controller services.
3. Добавьте assembly с controllers как application part.
4. Зарегистрируйте controllers в настройке endpoints.
5. Держите route attributes явными и стабильными.

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