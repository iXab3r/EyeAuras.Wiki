---
title: Печатаем переменные прямо на экране
description: 
published: true
date: 2024-08-15T19:50:03.212Z
tags: 
editor: markdown
dateCreated: 2024-08-15T19:33:14.411Z
---

# Показать живой счётчик поверх рабочего стола

Выведем таблицу переменных собственной ауры в верхней части основного экрана. `test4` задаётся один раз, а `test1` меняется каждую секунду. Таблица подписана на контейнер данных и обновляется при записи значений — это живое наблюдение, а не разовый снимок журнала.

Нужен настольный EyeAuras с работающими UI/скриптовым модулем и экранным HTML-оверлеем на WebView2. Внешний HTML-файл, Razor-компонент или NuGet-пакет для этого примера не нужен: разметка создаётся в коде. Используйте отдельную собственную ауру, потому что демонстрация записывает в неё `test1`–`test4`.

1. Создайте ауру и добавьте действие `C# Script` в `On Enter`.
2. Вставьте весь код ниже в верхнеуровневый `Script.csx`, включая класс после основного тела.
3. Нажмите `Run`. Сверху по центру основного экрана должна появиться таблица с `test1` и `test4`; число в `test1` меняется примерно раз в секунду.
4. Нажмите `Stop`: подписка снимется, созданная таблица исчезнет. Записи переменных останутся в ауре — очистка интерфейса не удаляет данные.

```csharp
using System;
using EyeAuras.Shared.ScreenOverlay;
using EyeAuras.Shared.Scripting;
using EyeAuras.Shared.Model;
using EyeAuras.Blazor.Controls.ScreenOverlay;
using PoeShared.Scaffolding;
using System.Drawing;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Linq;
using System.Collections.Generic;
using System.Net;
using DynamicData;

var onScreenHelper =
    GetService<VariablesOnScreenHelper>() // создадим наш хелпер
    .AddTo(ExecutionAnchors); //и привяжем его к жизни скрипта, скрипта закончится - хелпер умрет

var source = AuraTree.GetAuraByPath("."); // явный владелец таблицы и данных
var test1 = Variables.Get<int>(source, "test1");
var test2 = Variables.Get<int>(source, "test2");
var test3 = Variables.Get<int>(source, "test3");
var test4 = Variables.Get<string>(source, "test4");
test4.Value = "Наблюдаем за test1";

onScreenHelper.Draw(
    source, // читаем тот же контейнер, в который записываем значения
    "test1", "test4" // второй-третий-четвертый это имена переменных, которые печатать
    );

//onScreenHelper.Draw(source); // без фильтра показываются все переменные владельца

// код, который изображает, что он что-то печатает
while (!cancellationToken.IsCancellationRequested)
{
    test1.Value = Environment.TickCount + 1;
    test2.Value = Environment.TickCount + 2;
    test3.Value = Environment.TickCount + 2;
    Sleep(1000);
}

public sealed class VariablesOnScreenHelper : DisposableReactiveObject
{
    private readonly IOnScreenCanvasScriptingApi onScreenCanvas;

    public VariablesOnScreenHelper(IOnScreenCanvasScriptingApi onScreenCanvas){
        this.onScreenCanvas = onScreenCanvas;
    }

    public void Draw(
        IHasVariables variablesSource,
        Rectangle canvasBounds,
        params string[] variablesToPrint)
    {
        DrawVariables(
            onScreenCanvas,
            canvasBounds,
            variablesSource,
            variablesToPrint).AddTo(Anchors);
    }

     public void Draw(
        IHasVariables variablesSource,
        params string[] variablesToPrint)
    {
          // для примера будем рисовать прямо на весь экран
        var canvasBounds = new Rectangle(Point.Empty, System.Windows.Forms.SystemInformation.PrimaryMonitorSize);

        DrawVariables(
            onScreenCanvas,
            canvasBounds,
            variablesSource,
            variablesToPrint).AddTo(Anchors);
    }

    private static IDisposable DrawVariables(
        IOnScreenCanvasScriptingApi onScreenCanvas,
        Rectangle canvasBounds,
        IHasVariables variablesSource,
        params string[] variablesToPrint)
    {
        // сюда мы будем помещать все следы жизнедеятельности
        // как только оверлей будет больше не нужен - дергаем якорь и он потянет все за собой
        var anchors = new CompositeDisposable();

        // создаем оверлей, на котором будем рисовать
        var canvas = onScreenCanvas.Create();
        var textOverlay = canvas
            .AddHtmlObject()
            .WithRect(canvasBounds);

        // Сначала отключаем наблюдение, затем снимаем HTML и canvas.
        var lifetime = Disposable.Create(() =>
        {
            anchors.Dispose();
            textOverlay.Dispose();
            canvas.Clear();
            canvas.Dispose();
        });

        // подписываемся на любое изменение переменных
        // Для простоты обновляем таблицу при любом изменении контейнера.
        variablesSource.Variables
             .Connect()
             .Subscribe(_ =>
             {
                 var combined =
                     variablesToPrint.IsEmpty()
                         ? variablesSource.Variables.Items
                         : variablesToPrint.Select(x => variablesSource.Variables.GetOrDefault(x));

                 UpdateOverlay(combined.Where(x => !string.IsNullOrEmpty(x.Name)));
             })
             .AddTo(anchors);

        return lifetime;


        void UpdateOverlay(IEnumerable<AuraVariable> variables)
        {
            string htmlContent = $"""
<div class='w-100 h-100 d-flex' style='align-items: flex-start; justify-content: center; padding-top: 20px;'>
    <div class='alert alert-light' role='alert'>
        <table class='table table-striped'>
            {(variables.Select(x => $"<tr><td>{WebUtility.HtmlEncode(x.Name)}</td><td>{WebUtility.HtmlEncode(x.Value?.ToString())}</td></tr>")).JoinStrings("")}
        </table>
    </div>
</div>""";
            textOverlay.WithHtml(htmlContent);
        }
    }
}
```

## Что именно наблюдаем

| Часть примера | Назначение |
| --- | --- |
| `source` | Объект доступа к текущей ауре. В него записываются значения, из него вспомогательный класс читает коллекцию. В хосте без текущей ауры этот путь не подходит. |
| `Draw(source, "test1", "test4")` | Показывает только два выбранных имени. `test2` и `test3` обновляются, но скрыты фильтром. |
| `Draw(source)` | Вариант без фильтра имён — показывает все переменные переданного владельца. |
| `Draw(source, canvasBounds, ...)` | Вариант с собственным экранным прямоугольником вместо основного экрана. |
| `Connect()` | Наблюдает за изменениями контейнера переменных. Это не подписка на произвольные изменения полей внутри любого сохранённого объекта. |

Чтобы показать значения из другого скрипта, [найдите нужную ауру](/ru/scripting/examples/basic/find-aura) и используйте того же владельца как источник таблицы. [Пример переменных](/ru/scripting/examples/basic/variables) объясняет выбор общего владельца и типа; согласуйте имена с записывающим скриптом и включите их в список отображаемых строк.

Вспомогательный класс получает `IOnScreenCanvasScriptingApi` через конструктор; `GetService<VariablesOnScreenHelper>()` создаёт его с этой зависимостью. В обычном C#-классе нет глобальных `AuraTree`, `Variables` или `Log`: выбор владельца и службы остаётся в верхнеуровневом коде, в класс передаются аргументы.

`ExecutionAnchors` принадлежит текущему Run. Он освобождает экземпляр класса при завершении, отмене или ошибке. Собственные якоря класса удерживают созданный им срок жизни: сначала закрывается наблюдение за переменными, затем HTML-объект, после него очищается и закрывается canvas. На один `canvas.Dispose()` как на очистку всех дочерних объектов полагаться не нужно.

`Sleep(1000)` учитывает запрос отмены; цикл проверяет токен перед следующей итерацией. Если вместо него сделать разовую запись и сразу выйти из Run, таблица тоже сразу освободится. Привязка к обычным `Anchors` песочницы дала бы другой срок жизни — до её выгрузки, а не до конца этого запуска.

Для повторного использования класса в другом скрипте нужна явная ссылка на содержащий его проект/ауру, а не только одинаковое имя класса. В Razor-компоненте свои зависимости и контекст. Имена и значения экранируются через `HtmlEncode`, поскольку `WithHtml` принимает готовую доверенную разметку.

Экранный canvas использует координаты рабочего стола и основного монитора. Он не привязан к окну источника переменных и не обещает одинаковое покрытие всех мониторов/DPI. Подробности — [экранные объекты](/ru/scripting/api/osd/screen-overlay) и [время жизни скрипта](/ru/scripting/api/scripting/reactive-lifetime).
