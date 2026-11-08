---
title: Printing Variables Directly on the Screen
description: 
published: true
date: 2024-08-15T19:50:03.212Z
tags: printing, variables, screen, scripting, ai-translated
editor: markdown
dateCreated: 2024-08-15T19:33:14.411Z
---
# Show aura variables on screen

Run the complete code in a top-level EyeAuras C# Script with the HTML screen overlay and WebView2 available. It updates the current aura’s variables once per second and displays `test1` and `test4`. Stop ends the loop and releases the helper’s owned resources.

### Dependencies and ownership
- If you reference this aura, the `VariablesOnScreenHelper` class will be available to you anywhere.
- Note that the `VariablesOnScreenHelper` class requires `IOnScreenCanvasScriptingApi` in the constructor, but we don't pass it. `GetService<>` will handle this for us.
- Working with Anchors is a concept that allows linking the lifecycle of different objects. By adding oneself to the ExecutionAnchors list, we essentially say, "I only live as long as ExecutionAnchors are alive."
- Adding the overlay to ExecutionAnchors itself will make it disappear immediately after the script finishes. If we added it just to Anchors, the overlay would live until the script is unloaded.

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
    GetService<VariablesOnScreenHelper>()
    .AddTo(ExecutionAnchors);

Variables["test4"] = "Watching test1";

onScreenHelper.Draw(
    AuraTree.FindAuraByPath("."),
    "test1", "test4"
    );




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


        var anchors = new CompositeDisposable();


        var canvas = onScreenCanvas.Create();

        var lifetime = Disposable.Create(() =>
        {
            anchors.Dispose();
            canvas.Clear();
            canvas.Dispose();
        });


        var textOverlay = canvas
            .AddHtmlObject()
            .WithRect(canvasBounds)
            .AddTo(anchors);





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

`Connect()` observes the supplied aura’s variable collection, and the name filter selects table rows. `test4` is initialized once; `test1` changes in the loop. The helper receives dependencies through its constructor and arguments. Its disposal releases the HTML object and subscription, then clears and disposes its canvas; disposing a canvas alone is not a promise to dispose its children. Variable values remain on their owning aura. See [OSD ownership](/en/scripting/api/osd/screen-overlay) and [script lifetime](/en/scripting/api/scripting/reactive-lifetime).
