---
title: Печатаем переменные прямо на экране
description: 
published: true
date: 2024-08-15T19:33:14.411Z
tags: 
editor: markdown
dateCreated: 2024-08-15T19:33:14.411Z
---

```csharp
using EyeAuras.Shared.ScreenOverlay;

DrawVariablesOnScreen(
    AuraTree.FindAuraByPath("."),
    "test1", "test2") // указываем какие именно переменные выводить, можно НЕ указывать их вообще, тогда будет печатать все
    .AddTo(ExecutionAnchors); // не забываем указать, что это все творчество нужно стереть по завершении скрипта

// код, который изображает, что он что-то печатает
while (!cancellationToken.IsCancellationRequested)
{
    Variables["test1"] = Environment.TickCount + 1;
    Variables["test2"] = Environment.TickCount + 2;
    Variables["test3"] = Environment.TickCount + 2;
    Sleep(1000);
}

private IDisposable DrawVariablesOnScreen(IHasVariables variablesSource, params string[] variablesToPrint)
{
    // для примера будем рисовать прямо на весь экран
    var canvasBounds = new Rectangle(Point.Empty, System.Windows.Forms.SystemInformation.PrimaryMonitorSize);

    // это API, который используется для
    var onScreenCanvas = GetService<IOnScreenCanvasScriptingApi>();

    Log.Info($"Drawing variables on the screen({canvasBounds}): {variablesToPrint.DumpToString()}");
    return DrawVariablesOnScreen(
        onScreenCanvas,
        canvasBounds,
        variablesSource,
        variablesToPrint);
}

private static IDisposable DrawVariablesOnScreen(
    IOnScreenCanvasScriptingApi onScreenCanvas,
    Rectangle canvasBounds,
    IHasVariables variablesSource,
    params string[] variablesToPrint)
{
    // сюда мы будем помещать все следы жизнедеятельности
    // как только оверлей будет больше не нужен - дергаем якорь и он потянет все за собой
    var anchors = new CompositeDisposable();

    // создаем оверлей, на котором будем рисовать
    var canvas = onScreenCanvas.Create().AddTo(anchors);

    // создаем HTML объект, который будет отрисовываться на оверлее
    var textOverlay = canvas
        .AddHtmlObject()
        .WithRect(canvasBounds); // на весь экран
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

             UpdateOverlay(combined);
         })
         .AddTo(anchors);

    return anchors;


    void UpdateOverlay(IEnumerable<AuraVariable> variables)
    {
        string htmlContent = $@"""
<div class='w-100 h-100 d-flex' style='align-items: flex-start; justify-content: center; padding-top: 20px;'>
    <div class='alert alert-light' role='alert'>
        <table class='table table-striped'>
            {(variables.Select(x => $"<tr><td>{x.Name}</td><td>{x.Value}</td></tr>")).JoinStrings("")}
        </table>
    </div>
</div>""";
        textOverlay.WithHtml(htmlContent);
    }
}
```