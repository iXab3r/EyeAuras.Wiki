## Typing Text

> You can import the ready-made example from here: [Text Typing Example](https://eu.eyeauras.net/share/S20240224004118uKKy4R0wIpLd)
{.is-info}

1. Create an aura.
2. Add `HotkeyIsActive` to it and bind it to a convenient button (this will be our on/off switch, in the example `F2`), change the activation type to `Click/Hold`.
3. Add a `C# Script` action to `On Enter`.
4. Copy and paste the script itself.
5. Pressing `F2` will type several lines of text.

![](https://i.imgur.com/mwIxxsL.gif)

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); 
sendInputApi.Text("Hello, world!"); // types with the default interval (random, 1-5ms)

sendInputApi.KeyPressDelay = new RandomInteger(5, 15); // changes the interval to 5-15ms
sendInputApi.Text("\nthis one is a bit slower"); 

sendInputApi.Text("\nand this one is very slow!", delayMs: 30); // types with a 30ms interval
```

> In the example, the special character `\n` at the beginning of the lines indicates a line break.
{.is-info}