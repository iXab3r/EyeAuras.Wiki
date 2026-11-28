---
title: Printing Variables Directly on the Screen
description: 
published: true
date: 2024-08-15T19:50:03.212Z
tags: printing, variables, screen, scripting, ai-translated
editor: markdown
dateCreated: 2024-08-15T19:33:14.411Z
---
# Show a live counter above your desktop

The script shows a table of your aura's variables near the top of the primary screen. **test4** is set once and **test1** changes about once a second. The table is subscribed to the variable container and updates when values are written.

You need desktop EyeAuras with working UI/scripting modules and the WebView2 HTML screen overlay. No external HTML file, Razor component or NuGet package is needed: the code builds the markup. Use a separate aura of your own, because the example writes **test1–test4** into it.

1. Create an aura and add **C# Script** to **On Enter**.
2. Paste the whole program below into top-level **Script.csx**, including the helper class after the main body.
3. Click **Run**. A table with test1 and test4 appears at the top centre of the primary screen. The number in test1 changes about once a second.
4. Click **Stop**. The subscription is removed and the table disappears. The variables stay on the aura.

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
    GetService<VariablesOnScreenHelper>()
    .AddTo(ExecutionAnchors);

var source = AuraTree.GetAuraByPath(".");
var test1 = Variables.Get<int>(source, "test1");
var test2 = Variables.Get<int>(source, "test2");
var test3 = Variables.Get<int>(source, "test3");
var test4 = Variables.Get<string>(source, "test4");
test4.Value = "Watching test1";

onScreenHelper.Draw(
    source,
    "test1", "test4"
    );

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
        var textOverlay = canvas
            .AddHtmlObject()
            .WithRect(canvasBounds);

        var lifetime = Disposable.Create(() =>
        {
            anchors.Dispose();
            textOverlay.Dispose();
            canvas.Clear();
            canvas.Dispose();
        });

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

## Choose the source and displayed rows

| Part | Purpose |
| --- | --- |
| source | The accessor of the current aura. Values are written into it, and the helper reads the collection from it. This does not work in a host without a current aura. |
| Draw(source, "test1", "test4") | Shows only those two names. test2 and test3 update too, but the filter hides them. |
| Draw(source) | No name filter: shows all variables of the owner you pass. |
| Draw(source, canvasBounds, ...) | Uses your own screen rectangle instead of the primary screen. |
| Connect() | Watches changes of the variable container. It is not a subscription to every field change inside a stored object. |

To show values written by another script, [find the aura you need](/en/scripting/examples/basic/find-aura) and use that same owner as the table's source. The [Variables example](/en/scripting/examples/basic/variables) explains how to choose a shared owner and type.

The helper gets **IOnScreenCanvasScriptingApi** through its constructor. `GetService<VariablesOnScreenHelper>()` creates it with that dependency. An ordinary C# class has no global AuraTree, Variables or Log.

**ExecutionAnchors** belongs to the current Run. It disposes the helper when the run completes, is cancelled or fails. The helper's own Anchors hold what it created. First the variable subscription is closed, then the HTML object, then the canvas is cleared and disposed. Do not count on a single canvas Dispose to clean up every child.

**Sleep(1000)** respects cancellation, and the loop checks the token before the next iteration. If you replace the loop with a single write and return from Run right away, the table is released right away too. Ordinary sandbox Anchors would have a different lifetime: until the sandbox is unloaded, not until this run ends.

To use the class in another script you need an explicit reference to the project or aura it lives in. Names and values are escaped with **HtmlEncode**, because **WithHtml** accepts ready, trusted markup.

The screen canvas uses desktop and primary-monitor coordinates. It is not attached to the window the variables come from. More in [script lifetime](/en/scripting/api/scripting/runtime) and the [custom UI guide](/en/overlays/custom-ui).
