---
title: IDialogWindowUnstableScriptingApi
description: 
published: true
date: 2025-10-19T16:05:00.000Z
tags: 
editor: markdown
dateCreated: 2024-11-03T23:15:54.436Z
---

```csharp

/// <summary>
/// Provides an unstable scripting API for creating and managing dialog windows in a Blazor-based environment.
/// </summary>
public interface IDialogWindowUnstableScriptingApi : IScriptingApi
{
    /// <summary>
    /// Creates a new dialog window instance for a specified Blazor component.
    /// </summary>
    /// <typeparam name="T">
    /// The type of the Blazor component to be displayed in the dialog window. Must implement <see cref="IComponent"/>.
    /// </typeparam>
    /// <returns>
    /// An <see cref="IBlazorWindow"/> representing the created dialog window.
    /// </returns>
    /// <example>
    /// <code>
    /// // Create a new instance of a dialog window containing a custom Blazor component
    /// var dialogApi = GetService<IDialogWindowUnstableScriptingApi>();
    /// var myWindow = dialogApi.CreateWindow<MyCustomComponent>();
    /// 
    /// // Set properties on the window (e.g., title and size)
    /// myWindow.Title = "Custom Dialog";
    /// myWindow.Width = 400;
    /// myWindow.Height = 300;
    /// 
    /// // Show the window modally
    /// myWindow.ShowDialog();
    /// </code>
    /// </example>
    IBlazorWindow CreateWindow<T>(object dataContext = default) where T : IComponent;
}

/// <summary>
/// Defines the contract for a Blazor window with configurable UI properties, event-driven lifecycle, and window state operations.
/// </summary>
public interface IBlazorWindow : IBlazorWindowController, IDisposableReactiveObject
{
    /// <summary>
    /// Gets or sets type of View which will be displayed within the window.
    /// </summary>
    Type ViewType { get; set; }
    
    /// <summary>
    /// Gets or sets the data context which will be assigned to View.
    /// </summary>
    object ViewDataContext { get; set; }

    /// <summary>
    /// Gets or sets the startup location of the window.
    /// </summary>
    WindowStartupLocation WindowStartupLocation { get; set; }
}

/// <summary>
/// Defines the contract for a Blazor window with configurable UI properties, event-driven lifecycle, and window state operations.
/// </summary>
public interface IBlazorWindowController
{
    /// <summary>
    /// Gets or sets the window resize mode, defining how the user can resize the window.
    /// </summary>
    ResizeMode ResizeMode { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the title bar is visible.
    /// </summary>
    bool ShowTitleBar { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the icon is shown in the title bar.
    /// </summary>
    bool ShowIconOnTitleBar { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the window should appear in the taskbar.
    /// </summary>
    bool ShowInTaskbar { get; set; }

    /// <summary>
    /// Gets or sets the padding around the window content.
    /// </summary>
    Thickness Padding { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the window should be click-through (i.e., not interactable).
    /// </summary>
    bool IsClickThrough { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the window is in debug mode.
    /// </summary>
    bool IsDebugMode { get; set; }

    /// <summary>
    /// Gets or sets the opacity of the window.
    /// </summary>
    double Opacity { get; set; }

    /// <summary>
    /// Gets or sets the title text of the window.
    /// </summary>
    string Title { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the window should remain on top of other windows.
    /// </summary>
    bool Topmost { get; set; }

    /// <summary>
    /// Gets or sets the horizontal position of the window.
    /// </summary>
    int Left { get; set; }

    /// <summary>
    /// Gets or sets the vertical position of the window.
    /// </summary>
    int Top { get; set; }

    /// <summary>
    /// Gets or sets the width of the window.
    /// </summary>
    int Width { get; set; }

    /// <summary>
    /// Gets or sets the height of the window.
    /// </summary>
    int Height { get; set; }

    /// <summary>
    /// Gets or sets the minimum width of the window.
    /// </summary>
    int MinWidth { get; set; }

    /// <summary>
    /// Gets or sets the minimum height of the window.
    /// </summary>
    int MinHeight { get; set; }

    /// <summary>
    /// Gets or sets the maximum width of the window.
    /// </summary>
    int MaxWidth { get; set; }

    /// <summary>
    /// Gets or sets the maximum height of the window.
    /// </summary>
    int MaxHeight { get; set; }  
    
    /// <summary>
    /// Gets or sets background color of the window. Can use transparent to hide bg entirely.
    /// </summary>
    Color BackgroundColor { get; set; }

    /// <summary>
    /// Observable sequence for when a key is pressed while the window has focus.
    /// </summary>
    IObservable<KeyEventArgs> WhenKeyDown { get; }

    /// <summary>
    /// Observable sequence for when a key is released while the window has focus.
    /// </summary>
    IObservable<KeyEventArgs> WhenKeyUp { get; }

    /// <summary>
    /// Observable sequence for when a key is pressed before other event handlers process the input.
    /// </summary>
    IObservable<KeyEventArgs> WhenPreviewKeyDown { get; }

    /// <summary>
    /// Observable sequence for when a key is released before other event handlers process the input.
    /// </summary>
    IObservable<KeyEventArgs> WhenPreviewKeyUp { get; }

    /// <summary>
    /// Observable sequence for when the window is fully loaded and rendered.
    /// </summary>
    IObservable<EventArgs> WhenLoaded { get; }

    /// <summary>
    /// Observable sequence for when the window is closed.
    /// </summary>
    IObservable<EventArgs> WhenClosed { get; }

    /// <summary>
    /// Observable sequence for when the window is about to close, allowing cancellation.
    /// </summary>
    IObservable<CancelEventArgs> WhenClosing { get; }

    /// <summary>
    /// Observable sequence for when the window is activated.
    /// </summary>
    IObservable<EventArgs> WhenActivated { get; }

    /// <summary>
    /// Observable sequence for when the window is deactivated.
    /// </summary>
    IObservable<EventArgs> WhenDeactivated { get; }

    /// <summary>
    /// Occurs when a key is pressed while the window has focus.
    /// </summary>
    event KeyEventHandler KeyDown;

    /// <summary>
    /// Occurs when a key is released while the window has focus.
    /// </summary>
    event KeyEventHandler KeyUp;

    /// <summary>
    /// Occurs before any other event handlers for a key-down event.
    /// </summary>
    event KeyEventHandler PreviewKeyDown;

    /// <summary>
    /// Occurs before any other event handlers for a key-up event.
    /// </summary>
    event KeyEventHandler PreviewKeyUp;

    /// <summary>
    /// Occurs when the window is about to close, providing the option to cancel.
    /// </summary>
    event CancelEventHandler Closing;

    /// <summary>
    /// Occurs when the window is activated.
    /// </summary>
    event EventHandler Activated;

    /// <summary>
    /// Occurs when the window is deactivated.
    /// </summary>
    event EventHandler Deactivated;

    /// <summary>
    /// Occurs when the window is fully loaded and rendered.
    /// </summary>
    event EventHandler Loaded;

    /// <summary>
    /// Occurs when the window is closed.
    /// </summary>
    event EventHandler Closed;

    /// <summary>
    /// Hides the window, making it invisible without closing it.
    /// </summary>
    void Hide();

    /// <summary>
    /// Shows the window, making it visible.
    /// </summary>
    void Show();

    /// <summary>
    /// Shows the window as a modal dialog, blocking other interactions until closed.
    /// </summary>
    void ShowDialog(CancellationToken cancellationToken = default);

    /// <summary>
    /// Closes the window, releasing all associated resources.
    /// </summary>
    void Close();
}
```