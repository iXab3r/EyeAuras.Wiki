---
title: Начало работы
description: Краткое руководство по началу работы.
published: true
date: 2025-08-23T00:13:57.665Z
tags: c#, .net, roslyn, blazor, webui, dependency injection, nuget, scripts, ai-translated
editor: markdown
dateCreated: 2024-02-20T14:01:34.128Z
---

# Запустить первый C# Script

Скрипт нужен, когда готового действия недостаточно: например, вы хотите вычислить значение и записать его в журнал. В EyeAuras код C# компилируется внутри программы; для первой записи не нужны IDE, SDK-пакет или внешняя библиотека.

1. Создайте собственную ауру и откройте её список `On Enter`.
2. Добавьте действие `C# Script`, откройте `Script.csx` и замените начальный код строкой ниже.
3. Нажмите `Run` в редакторе действия. Для этого ручного запуска триггер не нужен.
4. Откройте журнал скрипта: появится `Привет, мир!`. Если вместо этого показана ошибка компиляции, исправьте её до настройки автоматического запуска.

```csharp
Log.Info("Привет, мир!");
```

`Log` здесь предоставляет хост EyeAuras — [песочница](/ru/scripting/sandbox), которая запускает скрипт. Так же предоставляются `AuraTree`, `Variables`, `GetService` и `cancellationToken`. В обычном `.cs`-классе или Razor-компоненте эти имена не становятся глобальными: нужные зависимости передают явно. Подробности — в [контекстах выполнения](/ru/scripting/api/core/app-runtime-contexts) и [карте runtime](/ru/scripting/api/scripting/runtime).

Чтобы сообщение появлялось по клавише, нужен отдельный триггер [Hotkey Is Active](https://wiki.eyeauras.net/en/triggers/hotkey-is-active) и переход ауры в активное состояние. Этот законченный путь разобран в [Hello, world](/ru/scripting/examples/basic/hello-world); повторное нажатие `Run` проверяет только сам скрипт.

## Где должен выполняться код

| Поверхность | Когда её выбрать |
| --- | --- |
| Действие `C# Script` | Выполнить работу по запуску действия: вручную, при входе или выходе из состояния ауры, в макросе. Автоматический запуск подчиняется правилам списка действий. |
| Триггер `C# Script` | Периодически вычислять условие. Результат `true` или `false` задаёт состояние; результат, который нельзя преобразовать в Boolean, даёт неопределённое состояние. Проверяйте период опроса и [условия включения](/ru/features/enabling-conditions). |
| `C# Overlay` / WebUI | Показать свой интерфейс на Blazor: кнопки, поля и отображаемые данные. Его время жизни связано с оверлеем. |
| [EyePad](/ru/features/eyepad) | Открыть отдельный файл или решение и запускать его в специальной оболочке EyeAuras. |

Для длительной работы учитывайте отмену через `cancellationToken` и освобождение ресурсов. Подписка на события сама по себе не объясняет, сколько должен жить скрипт: это нужно задать в коде. Ошибочный код всё ещё может расходовать память или управлять вводом, поэтому сначала проверяйте короткий безопасный результат.

## Что добавить после первого запуска

EyeAuras использует [.NET](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview) и компилятор [Roslyn](https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/). Версию языка и доступные сборки определяет ваша поставка программы и настройки проекта.

![](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)

Для JSON, изображений и других задач можно подключать библиотеки. Например, этот отдельный `Script.csx` запрашивает конкретную версию `Newtonsoft.Json` и после восстановления пакета выводит JSON:

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"
using Newtonsoft.Json;

Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

[![](https://learn.microsoft.com/de-de/dotnet/standard/library-guidance/media/nuget/nuget-logo.png =x100)](https://www.nuget.org/)

Порядок установки через `Properties` и ограничения зависимостей — в [NuGet](/ru/scripting/nuget) и [ресурсах и ссылках](/ru/scripting/api/scripting/references-and-resources). [Подборка .NET-библиотек](https://github.com/quozd/awesome-dotnet) помогает найти пакет, но совместимость каждого пакета с EyeAuras проверяется отдельно.

Для работы с программой запрашивают службы через [Dependency Injection](/ru/scripting/dependency-injection) — [внедрение зависимостей](https://en.wikipedia.org/wiki/Dependency_injection). Например, [ISendInputScriptingApi](/ru/scripting/api/ISendInputScriptingApi) отвечает за ввод, а `IPlaySoundScriptingApi` — за звук. `EyeAuras.SDK` описывает контракты; ссылка на SDK не создаёт живую службу и не подключает автоматически необязательный модуль.

<details>
<summary>Свой интерфейс и следующие примеры</summary>

[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) позволяет собирать формы из компонентов. Для окна нужен маршрут [пользовательского интерфейса](/ru/overlays/custom-ui), а не только код действия. Ниже сохранены примеры оформления из прежних версий; они показывают формы, но не входят в первый скрипт этой статьи.

![](https://i.imgur.com/iaKm2Br.png =x500)

![](https://cdn.discordapp.com/attachments/1170312651621023755/1197134740906577981/image.png?ex=65ba299b&is=65a7b49b&hm=40f31b17035b500a9973b6bbc5e6e25a882a9a7fd76961cd26e730481bd0c28a& =x300)

![](https://telegra.ph/file/d83bcbeeac554d2e9b939.png =x300)

![](https://cdn.discordapp.com/attachments/846848467795836969/1168590651798069379/image.png?ex=655251da&is=653fdcda&hm=260bde6f1673493c9ec42573c205716289afdd032c2cc710ba8146fbec1e2793 =x200)

![](https://i.imgur.com/D7Nxmv7.png =x200)

После журнала можно перейти к [поиску изображения](/ru/scripting/examples/basic/image-search). Возможности старых поколений скриптинга отличаются от текущего окружения: переносите пример вместе с его зависимостями и контекстом.

</details>
