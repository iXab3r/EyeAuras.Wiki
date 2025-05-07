---
title: IBlazorWindow
description: 
published: true
date: 2025-05-07T20:56:27.448Z
tags: 
editor: markdown
dateCreated: 2025-05-07T20:56:27.448Z
---

```csharp
/// <summary>
/// Defines the contract for a Blazor window with configurable UI properties, event-driven lifecycle, and window state operations.
/// </summary>
public interface IBlazorWindow : IBlazorWindowController, IDisposableReactiveObject, IBlazorWindowNativeController
{
    /// <summary>
    /// Gets or sets type of View which will be displayed within the window.
    /// </summary>
    Type ViewType { get; set; }
    
    /// <summary>
    /// Gets or sets type of View which will be displayed inside title bar
    /// </summary>
    Type ViewTypeForTitleBar { get; set; }
    
    /// <summary>
    /// Gets or sets the data context which will be assigned to View.
    /// This property is a legacy one, will be removed in future versions and is replaced with DataContext
    /// </summary>
    object DataContext { get; set; }
    
    /// <summary>
    /// Gets or sets the data context which will be assigned to View.
    /// </summary>
    [Obsolete($"Replaced with {nameof(DataContext)} - to be removed in future versions")]
    [Browsable(false)]
    object ViewDataContext { get; set; }
    
    /// <summary>
    /// Gets or sets container which will be used by window to resolve the View
    /// </summary>
    IUnityContainer Container { get; set; }
    
    /// <summary>
    /// Gets or sets list of additional files which will be included into browser
    /// </summary>
    ImmutableArray<IFileInfo> AdditionalFiles { get; set; }

    /// <summary>
    /// Gets or sets the startup location of the window.
    /// </summary>
    WindowStartupLocation WindowStartupLocation { get; set; }
        
    /// <summary>
    /// Gets or sets additional file provider which will be used by Blazor
    /// </summary>
    IFileProvider AdditionalFileProvider { get; set; }

    /// <summary>
    /// Adds additional file provider which will be used by Blazor. Added to the end of the list.
    /// Removed on disposal
    /// </summary>
    IDisposable RegisterFileProvider(IFileProvider fileProvider);

    /// <summary>
    /// Shows Chromium DevTools
    /// </summary>
    void ShowDevTools();
}

/// <summary>
/// Defines the contract for a Blazor window with configurable UI properties, event-driven lifecycle, and window state operations.
/// </summary>
public interface IBlazorWindowController
{
    /// <summary>
    /// Gets logger which could be used to produce messages on behalf of the window
    /// </summary>
    IFluentLog Log { get; }
    
    /// <summary>
    /// Gets or sets the window resize mode, defining how the user can resize the window.
    /// </summary>
    ResizeMode ResizeMode { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the title bar is visible and how it is displayed. 
    /// </summary>
    TitleBarDisplayMode TitleBarDisplayMode { get; set; }

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
    /// Gets or sets a value indicating whether the window is visible
    /// </summary>
    bool IsVisible { get; set; }

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
    /// Gets or sets a value indicating whether the window should NOT be activated when clicked
    /// </summary>
    bool NoActivate { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether the window should have close button.
    /// </summary>
    bool ShowCloseButton { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether the window should have minimize button.
    /// </summary>
    bool ShowMinButton { get; set; }
    
    /// <summary>
    /// Gets or sets a value indicating whether the window should have maximize button.
    /// </summary>
    bool ShowMaxButton { get; set; }

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
    /// Gets or sets border color of the window. 
    /// </summary>
    Color BorderColor { get; set; }
    
    /// <summary>
    /// Gets or sets border thickness of the window. 
    /// </summary>
    Thickness BorderThickness { get; set; }
    
    /// <summary>
    /// Gets or sets state of the window - minimized/maximized/normal. 
    /// </summary>
    WindowState WindowState { get; set; }

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
    /// Observable sequence for when a mouse button is pressed while the window has focus.
    /// </summary>
    IObservable<MouseButtonEventArgs> WhenMouseDown { get; }

    /// <summary>
    /// Observable sequence for when a mouse button is released while the window has focus.
    /// </summary>
    IObservable<MouseButtonEventArgs> WhenMouseUp { get; }

    /// <summary>
    /// Observable sequence for when a mouse button is pressed before other event handlers process the input.
    /// </summary>
    IObservable<MouseButtonEventArgs> WhenPreviewMouseDown { get; }

    /// <summary>
    /// Observable sequence for when a mouse button is released before other event handlers process the input.
    /// </summary>
    IObservable<MouseButtonEventArgs> WhenPreviewMouseUp { get; }
    
    /// <summary>
    /// Observable sequence for when mouse is moved and the window is in focus.
    /// </summary>
    IObservable<MouseEventArgs> WhenMouseMove { get; }
    
    /// <summary>
    /// Observable before any other events for when mouse is moved and the window is in focus.
    /// </summary>
    IObservable<MouseEventArgs> WhenPreviewMouseMove { get; }

    /// <summary>
    /// Observable sequence for when the window is fully loaded and rendered.
    /// </summary>
    IObservable<EventArgs> WhenLoaded { get; }
    
    /// <summary>
    /// Observable sequence for when the window is unloaded
    /// </summary>
    IObservable<EventArgs> WhenUnloaded { get; }

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
    /// Occurs when a mouse button is pressed while the window has focus.
    /// </summary>
    event MouseButtonEventHandler MouseDown;

    /// <summary>
    /// Occurs when a mouse button is released while the window has focus.
    /// </summary>
    event MouseButtonEventHandler MouseUp;
    
    /// <summary>
    /// Occurs when mouse is moved and the window is in focus.
    /// </summary>
    event MouseEventHandler MouseMove;

    /// <summary>
    /// Occurs before any other event handlers for a mouse-down event.
    /// </summary>
    event MouseButtonEventHandler PreviewMouseDown;

    /// <summary>
    /// Occurs before any other event handlers for a mouse-up event.
    /// </summary>
    event MouseButtonEventHandler PreviewMouseUp;
    
    /// <summary>
    /// Occurs  before any other event handlers when mouse is moved and the window is in focus.
    /// </summary>
    event MouseEventHandler PreviewMouseMove;

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
    /// Schedules specific operation for execution as a part of Window message processing
    /// </summary>
    void BeginInvoke(Action action);

    /// <summary>
    /// Waits until all Window messages are processed
    /// </summary>
    void WaitForIdle(TimeSpan timeout = default);
    
    /// <summary>
    /// Minimizes the window
    /// </summary>
    void Minimize();
    
    /// <summary>
    /// Maximizes the window
    /// </summary>
    void Maximize();
    
    /// <summary>
    /// Restores the window from Maximized state to Normal
    /// </summary>
    void Restore();

    /// <summary>
    /// Hides the window, making it invisible without closing it.
    /// </summary>
    void Hide();

    /// <summary>
    /// Shows the window, making it visible.
    /// </summary>
    void Show();
    
    /// <summary>
    /// Activates the window, bringing it to front and giving focus.
    /// </summary>
    void Activate();

    /// <summary>
    /// Shows the window as a modal dialog, blocking other interactions until closed.
    /// </summary>
    void ShowDialog(CancellationToken cancellationToken = default);

    /// <summary>
    /// Closes the window, releasing all associated resources.
    /// </summary>
    void Close();

    /// <summary>
    /// Enables the ability to drag the current window using the mouse.
    /// </summary>
    /// <remarks>
    /// - When this method is called, the window captures the mouse input.
    /// - As the mouse moves, the window's position updates, effectively dragging the window.
    /// - The drag operation stops when:
    ///   1. The left mouse button is released.
    ///   2. The returned <see cref="IDisposable"/> is disposed.
    /// 
    /// This method is useful for implementing custom window dragging behavior, such as for frameless windows or 
    /// custom title bars that do not use the default window drag functionality.
    /// </remarks>
    /// <returns>
    /// An <see cref="IDisposable"/> instance that can be used to programmatically stop the dragging operation. 
    /// Disposing this object will immediately stop the drag operation and release mouse capture.
    /// </returns>
    /// <example>
    /// Example usage:
    /// <code>
    /// var dragDisposable = window.EnableDragMove();
    /// // Dragging will continue until:
    /// // 1. The left mouse button is released.
    /// // 2. dragDisposable.Dispose() is called.
    /// </code>
    /// </example>
    IDisposable EnableDragMove();
}

/// <summary>
/// Defines a contract for managing native window properties and operations within the Blazor environment,
/// providing direct control over window positioning, sizing, and retrieval of window handles.
/// </summary>
public interface IBlazorWindowNativeController
{
    /// <summary>
    /// Retrieves the handle (HWND) of the native window associated with this Blazor window instance.
    /// </summary>
    /// <returns>An <see cref="IntPtr"/> representing the native window handle.</returns>
    IntPtr GetWindowHandle();

    /// <summary>
    /// Gets the rectangular bounds of the native window, including position and size.
    /// </summary>
    /// <returns></returns>
    System.Drawing.Rectangle GetWindowRect();
    
    /// <summary>
    /// Sets the rectangular bounds of the native window, including position and size.
    /// </summary>
    /// <param name="windowRect">A <see cref="System.Drawing.Rectangle"/> specifying the new position and size of the window.</param>
    void SetWindowRect(System.Drawing.Rectangle windowRect);

    /// <summary>
    /// Sets the size dimensions of the native window without altering its current position.
    /// </summary>
    /// <param name="windowSize">A <see cref="System.Drawing.Size"/> specifying the new width and height of the window.</param>
    void SetWindowSize(System.Drawing.Size windowSize);

    /// <summary>
    /// Updates the position of the native window without changing its size.
    /// </summary>
    /// <param name="windowPos">A <see cref="System.Drawing.Point"/> specifying the new top-left corner position of the window.</param>
    void SetWindowPos(System.Drawing.Point windowPos);
}

/// <summary>
/// This interface could be used to access current Blazor Window from inside its context
/// </summary>
public interface IBlazorWindowAccessor
{
    IBlazorWindow Window { get; }
}
```