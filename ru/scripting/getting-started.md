---
title: Начало работы
description: Как запустить первый C#-скрипт в EyeAuras и что изучить после него.
published: true
date: 2025-08-23T00:13:57.665Z
tags: c#, .net, roslyn, blazor, webui, dependency injection, nuget, scripts, ai-translated
editor: markdown
dateCreated: 2024-02-20T14:01:34.128Z
---

# Запустить первый C# Script

Скрипт нужен, когда готовых действий не хватает: например, надо что-то посчитать и записать в журнал. EyeAuras сам компилирует C#-код. Для первого скрипта не нужны IDE, SDK-пакет или внешняя библиотека.

1. Создайте ауру и откройте её список `On Enter`.
2. Добавьте действие `C# Script`, откройте `Script.csx` и замените начальный код строкой ниже.
3. Нажмите `Run` в редакторе действия. Триггер для ручного запуска не нужен.
4. Откройте журнал скрипта: там появится `Привет, мир!`. Если вместо этого показана ошибка компиляции, сначала исправьте её, а потом настраивайте автоматический запуск.

```csharp
Log.Info("Привет, мир!");
```

`Log` даёт [песочница](/ru/scripting/sandbox) — среда, в которой EyeAuras запускает скрипт. Она же даёт `AuraTree`, `Variables`, `GetService` и `cancellationToken`. В обычном `.cs`-классе или Razor-компоненте этих имён нет: туда нужное передают явно. Подробнее — в [контекстах выполнения](/ru/scripting/api/core/app-runtime-contexts) и [карте runtime](/ru/scripting/api/scripting/runtime).

Кнопка `Run` проверяет только сам скрипт. Чтобы сообщение появлялось по клавише, нужен отдельный триггер [Hotkey Is Active](/ru/triggers/hotkey-is-active), и аура должна стать активной. Весь путь разобран в [Hello, world](/ru/scripting/examples/basic/hello-world).

## Где должен выполняться код

| Поверхность | Когда её выбрать |
| --- | --- |
| Действие `C# Script` | Код выполняется при запуске действия: вручную, при входе в состояние ауры или выходе из него, в макросе. Автоматический запуск идёт по правилам списка действий. |
| Триггер `C# Script` | Код периодически проверяет условие. `true` или `false` задаёт состояние триггера. Если результат нельзя привести к Boolean, состояние не определено. Проверьте период опроса и [условия включения](/ru/features/enabling-conditions). |
| `C# Overlay` / WebUI | Свой интерфейс на Blazor: кнопки, поля, данные на экране. Время жизни зависит от оверлея. |
| [EyePad](/ru/features/eyepad) | Открыть отдельный файл или решение и запускать его в специальной оболочке EyeAuras. |

Если скрипт работает долго, проверяйте отмену через `cancellationToken` и освобождайте ресурсы. Подписка на события не решает, сколько живёт скрипт: это задаётся в коде. Скрипт с ошибкой может съесть память или начать нажимать клавиши. Поэтому сначала проверяйте его на чём-то коротком и безопасном.

## Что добавить после первого запуска

EyeAuras работает на [.NET](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) и компилирует код через [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/). Версия языка и доступные сборки зависят от вашей версии программы и настроек проекта.

![](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)

Для JSON, картинок и других задач можно подключать библиотеки. Этот отдельный `Script.csx` запрашивает конкретную версию `Newtonsoft.Json` и, когда пакет восстановится, выводит JSON:

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"
using Newtonsoft.Json;

Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

[![](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

Как ставить пакеты через `Properties` и какие есть ограничения — в статьях [NuGet](/ru/scripting/nuget) и [ресурсы и ссылки](/ru/scripting/api/scripting/references-and-resources). Искать библиотеки удобно в [подборке для .NET](https://github.com/quozd/awesome-dotnet), но совместимость с EyeAuras у каждого пакета нужно проверять отдельно.

Чтобы управлять программой из скрипта, запрашивайте её службы через [Dependency Injection](/ru/scripting/dependency-injection) — [внедрение зависимостей](https://en.wikipedia.org/wiki/Dependency_injection). Например, [ISendInputScriptingApi](/ru/scripting/api/ISendInputScriptingApi) отвечает за ввод, а `IPlaySoundScriptingApi` — за звук. `EyeAuras.SDK` только описывает контракты. Ссылка на SDK не создаёт работающую службу и не подключает необязательный модуль.

<details>
<summary>Свой интерфейс и следующие примеры</summary>

На [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) формы собирают из компонентов. Для окна одного кода действия мало: нужен [пользовательский интерфейс](/ru/overlays/custom-ui). Ниже пример такой формы. К первому скрипту из этой статьи он не относится.

![](https://s3.eyeauras.net/media/wiki/faq/d83bcbeeac554d2e9b939.png =x300)

После журнала можно перейти к [поиску изображения](/ru/scripting/examples/basic/image-search). Старые поколения скриптинга умели не то же самое, что текущее. Старый пример переносите вместе с его зависимостями и контекстом.

</details>
