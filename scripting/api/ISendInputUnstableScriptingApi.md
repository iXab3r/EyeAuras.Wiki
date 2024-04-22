---
title: ISendInputUnstableScriptingApi
description: 
published: true
date: 2024-03-17T16:28:37.270Z
tags: user input, simulation, mouse actions, keyboard actions, scripting API
editor: markdown
dateCreated: 2024-02-23T21:58:16.489Z
---
```csharp
/// <summary>
/// Provides an interface for simulating user input, including mouse and keyboard actions.
/// </summary>
public interface ISendInputUnstableScriptingApi : IScriptingApi
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
    /// Gets or sets the delay range (in milliseconds) between key down and up event.
    /// </summary>
    RandomInteger KeyPressDelay { get; set; }
    
    /// <summary>
    /// Gets or sets the delay range (in milliseconds) before releasing mouse button.
    /// </summary>
    RandomInteger ClickDelay { get; set; }
    
    /// <summary>
    /// Gets or sets the delay range (in milliseconds) for a mouse double-click action.
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
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before releasing the button. Uses ClickDelay if not specified.</param>
    void MouseLeftClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Simulates a double-click using the left mouse button.
    /// </summary>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before releasing the button. Uses ClickDelay if not specified.</param>
    /// <param name="dblClickDelayMs">Optional delay (in milliseconds) between the two clicks. Uses DoubleClickDelay if not specified.</param>
    void MouseLeftDoubleClick(int? clickDelayMs = default, int? dblClickDelayMs = default);
    
    /// <summary>
    /// Simulates a right mouse button click.
    /// </summary>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before releasing the button. Uses ClickDelay if not specified.</param>
    void MouseRightClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Simulates a mouse button click.
    /// </summary>
    /// <param name="button">The mouse button to simulate.</param>
    /// <param name="clickDelayMs">Optional delay (in milliseconds) before releasing the button. Uses ClickDelay if not specified.</param>
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
    /// <param name="keyPressDelay">Optional delay (in milliseconds) before releasing the button. Uses KeyPressDelay if not specified.</param>
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
    /// <param name="keyPressDelay">Optional delay (in milliseconds) before releasing the button, works only for KeyPress events. Uses KeyPressDelay if not specified.</param>
    void Gesture(HotkeyGesture gesture, InputEventType inputEventType, int? keyPressDelay = default);

    /// <summary>
    /// Simulates typing a string of text.
    /// </summary>
    /// <param name="text">The text to type.</param>
    /// <param name="delayMs">Optional delay (in milliseconds) between each character. Uses KeyPressDelay if not specified.</param>
    void Text(string text, int? delayMs = default);

    /// <summary>
    /// Returns status of a mouse button - whether it is pressed (down) or not
    /// </summary>
    /// <param name="button">The button which has to be checked</param>
    bool IsMouseDown(MouseButton button = default);

    /// <summary>
    /// Returns status of a key - whether it is pressed (down) or not
    /// </summary>
    /// <param name="key">The key which has to be checked</param>
    bool IsKeyDown(Key key);
}
```