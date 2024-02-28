## Tracking the Mouse

> You can import the ready-made example from here: [Mouse Tracking Example](https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX)
{.is-info}

1. Create an aura.
2. Add HotkeyIsActive to it and bind it to a convenient button (this will be our on/off switch). In the example, it's `F1`.
3. Add a **C# Script** action to **WhileActive**.
4. Copy and paste the script itself.
5. Now, when our aura is activated, a small colored square will be rendered near the cursor.

![](https://i.imgur.com/FSSKzJp.gif)

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); // to get cursor coordinates
var overlayApi = GetService<IOnScreenCanvasScriptingApi>(); // for overlay rendering

var canvas = overlayApi.Create() // create a "canvas" to draw the overlay
    .AddTo(ExecutionAnchors); // specify to clear the canvas upon script completion

var rectangle = canvas
    .AddRectangle() // add a rectangle
    .WithBorderColor(Color.Azure) // color
    .WithBorderThickness(1) // border thickness
    .WithSize(new Size(32, 32)); // size

Log.Info("Starting tracking");

// Important! Not while(true), but in this form
// This code will run in a loop until the script is stopped
// It will stop either when the EyeAuras window becomes active or by a hotkey
while (!cancellationToken.IsCancellationRequested){
    // get cursor coordinates and specify that the overlay should be near
    rectangle.Location = sendInputApi.CursorPosition;
}

// This is where we end up when the script is commanded to stop
Log.Info("Completed tracking");
```

> Naturally, the overlay can render not only squares. It can be anything - text, images, even videos.
{.is-info}