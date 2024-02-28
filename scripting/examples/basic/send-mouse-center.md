## Moving the Mouse to the Center of the Screen

> You can import the ready-made example from here: [Mouse Centering Example](https://eu.eyeauras.net/share/S202402240046520BBKcR6QKL07)
{.is-info}

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, in the example `F3`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to `On Enter`.
4. Copy and paste the script itself.
5. Pressing `F3` will move the cursor to the center of the primary screen.

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); // needed for input sending
var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize; // get the primary screen size
Log.Info($"Primary monitor size: {screenSize}");

sendInputApi.MouseMoveTo(screen