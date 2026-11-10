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

Display your own aura's variables near the top of the primary screen. **test4** is set once and **test1** changes about once a second. The table observes the variable container, so this is a live view rather than a log snapshot.

You need desktop EyeAuras with its UI/scripting modules and WebView2 HTML screen overlay available. No external HTML file, Razor component or NuGet package is required: the program builds the markup. Use a separate aura you own because it writes **test1–test4** there.

1. Create your aura and add **C# Script** to **On Enter**.
2. Put the entire program below in top-level **Script.csx**, including the helper class after the executable body.
3. Click **Run**. A table with test1 and test4 should appear near the primary screen's top centre; test1 should update about once a second.
4. Click **Stop**. The subscription and created table are released. Variable entries remain on the aura; closing the UI does not delete its data.

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
| source | The current aura accessor. The program writes into that same owner whose collection the helper observes. A host without a current aura cannot use this path as-is. |
| Draw(source, "test1", "test4") | Displays those two names. test2 and test3 update but are filtered out. |
| Draw(source) | Displays all variables on the supplied owner. |
| Draw(source, canvasBounds, ...) | Uses your own screen rectangle instead of the primary-screen rectangle. |
| Connect() | Observes container changes, not arbitrary internal property changes on every stored object. |

To display values written by another script, [find the intended aura](/en/scripting/examples/basic/find-aura) and use that same owner as the table’s source. The [Variables example](/en/scripting/examples/basic/variables) explains selecting a shared owner and type; agree the variable names with the writer and include them in the displayed rows.

The helper takes **IOnScreenCanvasScriptingApi** through its constructor; `GetService<VariablesOnScreenHelper>()` resolves it with that dependency. An ordinary class has no global AuraTree, Variables or Log: the top-level program selects the source and services, then passes them as arguments. Reusing the class in another script requires an explicit reference to its project/aura, not merely a matching class name.

**ExecutionAnchors** owns the helper for this Run and disposes it on completion, cancellation or error. The helper's Anchors owns each drawing lifetime: first unsubscribe, then dispose the HTML object, clear the canvas and dispose it. A canvas's Dispose alone is not a substitute for disposing every child.

**Sleep(1000)** cooperates with cancellation and the loop checks the token before its next iteration. If you replace the loop with a single write and return, the table is released immediately. Sandbox Anchors would instead live until that sandbox is unloaded.

The provided canvas service owns its Blazor/window scheduling. This helper updates an HTML model, not a Razor component with implicit script globals. A Razor implementation needs its own dependencies and component lifecycle. Names and values are **HtmlEncode**d because **WithHtml** accepts trusted markup.

Coordinates describe the desktop and primary monitor, not a window attached to the variable source. They do not guarantee all-monitor coverage or identical behaviour across DPI settings. See [script lifetime](/en/scripting/api/scripting/runtime) and the [custom UI guide](/en/overlays/custom-ui) for the separate host concerns.
