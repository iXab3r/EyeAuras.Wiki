```csharp
/// <summary>
/// Provides an interface for simulating user input, including mouse and keyboard actions.
/// </summary>
public interface ISendInputUnstableScriptingApi : IScriptingApi, IInputDeviceStateAdaptor
{
    /// <summary>
    /// Gets or sets the identifier for the input simulator to use.
    /// </summary>
    string InputSimulatorId { get; set; }
    
    /// <summary>
    /// Gets or sets the identifier for the input smoother to use.
    /// </summary>
    string InputSmootherId { get; set; }
    
    /// <summary>
    /// Gets or sets the delay range (in milliseconds) between key presses.
    /// </summary>
    RandomInteger KeyPressDelay { get; set; }
    
    /// <summary>
    /// Gets or sets the delay range (in milliseconds) between mouse clicks.
    /// </summary>
    RandomInteger ClickDelay { get; set; }
    
    /// <summary>
    /// Gets or sets the delay range (in milliseconds) for a double-click action.
    /// </summary>
    RandomInteger DoubleClickDelay { get; set; }
    
    /// <summary>
    /// Gets or sets the current cursor location on the screen. Setting the position is equivalent to MouseMoveTo()
    /// Users current input simulator, specified by InputSimulatorId to get cursor position
    /// </summary>
    WinPoint CursorPosition { get; set; }
    
    /// <summary>
    /// Moves the mouse cursor by a specified offset.
    /// </summary>
    /// <param name="x">The horizontal offset.</param>
    /// <param name="y">The vertical offset.</param>
    void MouseMoveBy(int x, int y);
    
    /// <summary>
    /// Moves the mouse cursor by a specified offset.
    /// </summary>
    /// <param name="offset">The offset as a WinPoint.</param>
    void MouseMoveBy(WinPoint offset);
    
    /// <summary>
    /// Moves the mouse cursor to a specific location on the screen.
    /// </summary>
    /// <param name="x">The X coordinate of the location.</param>
    /// <param name="y">The Y coordinate of the location.</param>
    void MouseMoveTo(int x, int y);
    
    /// <summary>
    /// Moves the mouse cursor to a specific location on the screen.
    /// </summary>
    /// <param name="location">The location as a WinPoint.</param>
    void MouseMoveTo(WinPoint location);
    
    /// <summary>
    /// Simulates a left mouse button click.
    /// </summary>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before the click. Uses <see cref="ClickDelay"/> if not specified.</param>
    void MouseLeftClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Simulates a double-click using the left mouse button.
    /// </summary>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) for each click. Uses <see cref="ClickDelay"/> if not specified.</param>
    /// <param name="dblClickDelayMs">Optional delay (in milliseconds) between the two clicks. Uses <see cref="DoubleClickDelay"/> if not specified.</param>
    void MouseLeftDoubleClick(int? clickDelayMs = default, int? dblClickDelayMs = default);
    
    /// <summary>
    /// Simulates a right mouse button click.
    /// </summary>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before the click. Uses <see cref="ClickDelay"/> if not specified.</param>
    void MouseRightClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Simulates a mouse button click.
    /// </summary>
    /// <param name="button">The mouse button to simulate.</param>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before the click. Uses <see cref="ClickDelay"/> if not specified.</param>
    void MouseClick(MouseButton button = default, int? clickDelayMs = default);
    
    /// <summary>
    /// Simulates pressing down a mouse button.
    /// </summary>
    /// <param name="button">The mouse button to simulate.</param>
    void MouseDown(MouseButton button = default);
    
    /// <summary>
    /// Simulates releasing a mouse button.
    /// </summary>
    /// <param name="button">The mouse button to simulate.</param>
    void MouseUp(MouseButton button = default);
    
    /// <summary>
    /// Simulates pressing and releasing a keyboard key.
    /// </summary>
    /// <param name="key">The key to simulate.</param>
    /// <param name="keyPressDelay">Optional delay (in milliseconds) before the key press. Uses <see cref="KeyPressDelay"/> if not specified.</param>
    void KeyPress(Key key, int? keyPressDelay = default);
    
    /// <summary>
    /// Simulates pressing down a keyboard key.
    /// </summary>
    /// <param name="key">The key to simulate.</param>
    void KeyDown(Key key);
    
    /// <summary>
    /// Simulates releasing a keyboard key.
    /// </summary>
    /// <param name="key">The key to simulate.</param>
    void KeyUp(Key key);
    
    /// <summary>
    /// Simulates a complex gesture involving keyboard keys or mouse buttons.
    /// </summary>
    /// <param name="gesture">The gesture to simulate.</param>
    /// <param name="inputEventType">The type of input event to simulate (e.g., key press, key down, key up).</param>
    /// <param name="keyPressDelay">Optional delay (in milliseconds) before the gesture. Uses <see cref="KeyPressDelay"/> if not specified.</param>
    void Gesture(HotkeyGesture gesture, InputEventType inputEventType, int? keyPressDelay = default);

    /// <summary>
    /// Simulates typing a string of text.
    /// </summary>
    /// <param name="text">The text to type.</param>
    /// <param name="delayMs">Optional delay (in milliseconds) between each character. Uses <see cref="KeyPressDelay"/> if not specified.</param>
    void Text(string text, int? delayMs = default);
    
    /// <summary>Determines whether the specified key is up or down.</summary>
    /// <param name="keyCode">The <see cref="T:WindowsInput.Native.VirtualKeyCode" /> for the key.</param>
    /// <returns>
    /// 	<c>true</c> if the key is down; otherwise, <c>false</c>.
    /// </returns>
    bool IsKeyDown(VirtualKeyCode keyCode);

    /// <summary>Determines whether the specified key is up or down.</summary>
    /// <param name="keyCode">The <see cref="T:WindowsInput.Native.VirtualKeyCode" /> for the key.</param>
    /// <returns>
    /// 	<c>true</c> if the key is up; otherwise, <c>false</c>.
    /// </returns>
    bool IsKeyUp(VirtualKeyCode keyCode);

    /// <summary>
    /// Determines whether the physical key is up or down at the time the function is called regardless of whether the application thread has read the keyboard event from the message pump.
    /// </summary>
    /// <param name="keyCode">The <see cref="T:WindowsInput.Native.VirtualKeyCode" /> for the key.</param>
    /// <returns>
    /// 	<c>true</c> if the key is down; otherwise, <c>false</c>.
    /// </returns>
    bool IsHardwareKeyDown(VirtualKeyCode keyCode);

    /// <summary>
    /// Determines whether the physical key is up or down at the time the function is called regardless of whether the application thread has read the keyboard event from the message pump.
    /// </summary>
    /// <param name="keyCode">The <see cref="T:WindowsInput.Native.VirtualKeyCode" /> for the key.</param>
    /// <returns>
    /// 	<c>true</c> if the key is up; otherwise, <c>false</c>.
    /// </returns>
    bool IsHardwareKeyUp(VirtualKeyCode keyCode);

    /// <summary>
    /// Determines whether the toggling key is toggled on (in-effect) or not.
    /// </summary>
    /// <param name="keyCode">The <see cref="T:WindowsInput.Native.VirtualKeyCode" /> for the key.</param>
    /// <returns>
    /// 	<c>true</c> if the toggling key is toggled on (in-effect); otherwise, <c>false</c>.
    /// </returns>
    bool IsTogglingKeyInEffect(VirtualKeyCode keyCode);
}
```