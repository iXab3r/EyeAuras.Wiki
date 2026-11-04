---
title: Печатаем переменные прямо на экране
description: 
published: true
date: 2024-08-15T19:50:03.212Z
tags: 
editor: markdown
dateCreated: 2024-08-15T19:33:14.411Z
---

# Показать переменные текущей ауры на экране

Вставьте весь код в верхнеуровневый файл действия `C# Script` в EyeAuras. Нужен работающий экранный HTML-оверлей с WebView2. Скрипт создаёт переменные текущей ауры и раз в секунду меняет значения; таблица показывает `test1` и `test4`. Остановите выполнение, чтобы снять подписку и убрать созданные объекты.

Из интересного:
- Если вы зареференсите эту ауру, то класс `VariablesOnScreenHelper` будет вам доступен где угодно
- Обратите внимание, что класс `VariablesOnScreenHelper` в конструкторе хочет `IOnScreenCanvasScriptingApi`, а мы его не передаем. GetService<> сделает это за нас
- Работа с Anchors (якорями) - это концепт, который позволяет связывать жизненный цикл разных объектов, в этом случае, добавляя себя в список ExecutionAnchors как бы говорим "Я живу только пока живы ExecutionAnchors"
- Добавление в ExecutionAnchors самого оверлея - так он исчезнет сразу же после того, как скрипт завершится. Если бы мы добавили просто в Anchors, то оверлей жил бы пока скрипт не выгружен

```csharp
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

Variables["test4"] = "Наблюдаем за test1";

onScreenHelper.Draw(
    AuraTree.FindAuraByPath("."), // первый аргумент - откуда брать переменные, в этом случае это мы сами
    "test1", "test4" // второй-третий-четвертый это имена переменных, которые печатать
    );

//onScreenHelper.Draw(AuraTree.FindAuraByPath(".")); //а вот так будет печатать вообще все переменные

// код, который изображает, что он что-то печатает
while (!cancellationToken.IsCancellationRequested)
{
    Variables["test1"] = Environment.TickCount + 1;
    Variables["test2"] = Environment.TickCount + 2;
    Variables["test3"] = Environment.TickCount + 2;
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
        // Освободить подписку/дочерние объекты до отключения proxy canvas.
        var lifetime = Disposable.Create(() =>
        {
            anchors.Dispose();
            canvas.Clear();
            canvas.Dispose();
        });

        // создаем HTML объект, который будет отрисовываться на оверлее
        var textOverlay = canvas
            .AddHtmlObject()
            .WithRect(canvasBounds)
            .AddTo(anchors); // дочерний объект снимается с canvas при Dispose
                                     // позицию и размеры оверлея можно менять в рантайме

        // подписываемся на любое изменение переменных
        // с точки зрения производительности это не идеально и быстрее было бы WatchCurrentValue
        // но для упрощения кода оставим такой вариант, да и разница будет вообще неизмерима в реальных условиях
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

`Connect()` наблюдает за коллекцией переменных переданной ауры, а фильтр выбирает имена для таблицы. `test4` задан один раз, `test1` обновляется в цикле. Не передавайте в этот helper чужие глобальные `Variables`: обычный класс получает зависимости через конструктор и аргументы.

У helper есть собственные якоря для canvas, HTML-объекта и подписки. Само по себе уничтожение canvas не обещает уничтожить все его дочерние объекты; поэтому `textOverlay` добавлен в `anchors` отдельно. `Sleep(1000)` учитывает отмену выполнения. Подробнее — [экранные объекты](/ru/scripting/api/osd/screen-overlay) и [время жизни скрипта](/ru/scripting/api/scripting/reactive-lifetime).
