---
title: Printing Variables Directly on the Screen
description: 
published: true
date: 2024-08-15T19:50:03.212Z
tags: printing, variables, screen, scripting
editor: markdown
dateCreated: 2024-08-15T19:33:14.411Z
---
### Interesting Points:
- If you reference this aura, the `VariablesOnScreenHelper` class will be available to you anywhere.
- Note that the `VariablesOnScreenHelper` class requires `IOnScreenCanvasScriptingApi` in the constructor, but we don't pass it. `GetService<>` will handle this for us.
- Working with Anchors is a concept that allows linking the lifecycle of different objects. By adding oneself to the ExecutionAnchors list, we essentially say, "I only live as long as ExecutionAnchors are alive."
- Adding the overlay to ExecutionAnchors itself will make it disappear immediately after the script finishes. If we added it just to Anchors, the overlay would live until the script is unloaded.

```csharp
using EyeAuras.Shared.ScreenOverlay;

var onScreenHelper = 
    GetService<VariablesOnScreenHelper>() // create our helper
    .AddTo(ExecutionAnchors); // and bind it to the script's life, the script ends - the helper dies

onScreenHelper.Draw(
    AuraTree.FindAuraByPath("."), // first argument - where to take variables from, in this case, it's ourselves
    "test1", "test4" // second-third-fourth are the variable names to print
    ); 

//onScreenHelper.Draw(AuraTree.FindAuraByPath(".")); //this way will print all variables

// code that pretends to print something
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
          // for example, we will draw directly on the entire screen
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
        // here we will put all traces of activity
        // as soon as the overlay is no longer needed - we pull the anchor and it will take everything with it
        var anchors = new CompositeDisposable();

        // create an overlay to draw on
        var canvas = onScreenCanvas.Create().AddTo(anchors);

        // create an HTML object to be rendered on the overlay
        var textOverlay = canvas
            .AddHtmlObject()
            .WithRect(canvasBounds); // full screen
                                     // position and size of the overlay can be changed at runtime

        // subscribe to any variable changes
        // in terms of performance, this is not ideal, and using WatchCurrentValue would be faster
        // but for code simplification, we'll leave it like this, and the difference will be immeasurable in real conditions
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
}
```