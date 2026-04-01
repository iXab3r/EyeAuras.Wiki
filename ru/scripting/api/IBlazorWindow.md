---
title: Интерфейс IBlazorWindow
description: Интерфейс для работы с окнами Blazor в EyeAuras
published: true
date: 2025-05-07T20:56:27.448Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-07T20:56:27.448Z
---
```csharp
/// <summary>
/// Определяет контракт для окна Blazor с настраиваемыми свойствами UI, событийным жизненным циклом и операциями управления состоянием окна.
/// </summary>
public interface IBlazorWindow : IBlazorWindowController, IDisposableReactiveObject, IBlazorWindowNativeController
{
    /// <summary>
    /// Возвращает или задаёт тип View, который будет отображаться внутри окна.
    /// </summary>
    Type ViewType { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт тип View, который будет отображаться в заголовке окна.
    /// </summary>
    Type ViewTypeForTitleBar { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт data context, который будет назначен View.
    /// Это устаревшее свойство, в будущих версиях будет удалено и заменено на DataContext
    /// </summary>
    object DataContext { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт data context, который будет назначен View.
    /// </summary>
    [Obsolete($"Replaced with {nameof(DataContext)} - to be removed in future versions")]
    [Browsable(false)]
    object ViewDataContext { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт контейнер, который окно будет использовать для разрешения View.
    /// </summary>
    IUnityContainer Container { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт список дополнительных файлов, которые будут подключены в браузере.
    /// </summary>
    ImmutableArray<IFileInfo> AdditionalFiles { get; set; }

    /// <summary>
    /// Возвращает или задаёт стартовое расположение окна.
    /// </summary>
    WindowStartupLocation WindowStartupLocation { get; set; }
        
    /// <summary>
    /// Возвращает или задаёт дополнительный file provider, который будет использоваться Blazor.
    /// </summary>
    IFileProvider AdditionalFileProvider { get; set; }

    /// <summary>
    /// Добавляет дополнительный file provider, который будет использоваться Blazor. Добавляется в конец списка.
    /// Удаляется при disposal
    /// </summary>
    IDisposable RegisterFileProvider(IFileProvider fileProvider);

    /// <summary>
    /// Открывает Chromium DevTools.
    /// </summary>
    void ShowDevTools();
}

/// <summary>
/// Определяет контракт для окна Blazor с настраиваемыми свойствами UI, событийным жизненным циклом и операциями управления состоянием окна.
/// </summary>
public interface IBlazorWindowController
{
    /// <summary>
    /// Возвращает логгер, который можно использовать для записи сообщений от имени окна.
    /// </summary>
    IFluentLog Log { get; }
    
    /// <summary>
    /// Возвращает или задаёт режим изменения размера окна, определяющий, как пользователь может менять размер окна.
    /// </summary>
    ResizeMode ResizeMode { get; set; }

    /// <summary>
    /// Возвращает или задаёт значение, указывающее, отображается ли заголовок окна и каким образом.
    /// </summary>
    TitleBarDisplayMode TitleBarDisplayMode { get; set; }

    /// <summary>
    /// Возвращает или задаёт значение, указывающее, должно ли окно отображаться на панели задач.
    /// </summary>
    bool ShowInTaskbar { get; set; }

    /// <summary>
    /// Возвращает или задаёт отступы вокруг содержимого окна.
    /// </summary>
    Thickness Padding { get; set; }

    /// <summary>
    /// Возвращает или задаёт значение, указывающее, должно ли окно быть click-through (то есть без возможности взаимодействия).
    /// </summary>
    bool IsClickThrough { get; set; }

    /// <summary>
    /// Возвращает или задаёт значение, указывающее, включён ли режим отладки окна.
    /// </summary>
    bool IsDebugMode { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт значение, указывающее, видимо ли окно.
    /// </summary>
    bool IsVisible { get; set; }

    /// <summary>
    /// Возвращает или задаёт прозрачность окна.
    /// </summary>
    double Opacity { get; set; }

    /// <summary>
    /// Возвращает или задаёт текст заголовка окна.
    /// </summary>
    string Title { get; set; }

    /// <summary>
    /// Возвращает или задаёт значение, указывающее, должно ли окно оставаться поверх остальных окон.
    /// </summary>
    bool Topmost { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт значение, указывающее, что окно НЕ должно активироваться при клике.
    /// </summary>
    bool NoActivate { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт значение, указывающее, должна ли у окна быть кнопка закрытия.
    /// </summary>
    bool ShowCloseButton { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт значение, указывающее, должна ли у окна быть кнопка сворачивания.
    /// </summary>
    bool ShowMinButton { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт значение, указывающее, должна ли у окна быть кнопка разворачивания.
    /// </summary>
    bool ShowMaxButton { get; set; }

    /// <summary>
    /// Возвращает или задаёт горизонтальную позицию окна.
    /// </summary>
    int Left { get; set; }

    /// <summary>
    /// Возвращает или задаёт вертикальную позицию окна.
    /// </summary>
    int Top { get; set; }

    /// <summary>
    /// Возвращает или задаёт ширину окна.
    /// </summary>
    int Width { get; set; }

    /// <summary>
    /// Возвращает или задаёт высоту окна.
    /// </summary>
    int Height { get; set; }

    /// <summary>
    /// Возвращает или задаёт минимальную ширину окна.
    /// </summary>
    int MinWidth { get; set; }

    /// <summary>
    /// Возвращает или задаёт минимальную высоту окна.
    /// </summary>
    int MinHeight { get; set; }

    /// <summary>
    /// Возвращает или задаёт максимальную ширину окна.
    /// </summary>
    int MaxWidth { get; set; }

    /// <summary>
    /// Возвращает или задаёт максимальную высоту окна.
    /// </summary>
    int MaxHeight { get; set; }  
    
    /// <summary>
    /// Возвращает или задаёт цвет фона окна. Можно использовать transparent, чтобы полностью скрыть фон.
    /// </summary>
    Color BackgroundColor { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт цвет рамки окна.
    /// </summary>
    Color BorderColor { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт толщину рамки окна.
    /// </summary>
    Thickness BorderThickness { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт состояние окна — minimized/maximized/normal.
    /// </summary>
    WindowState WindowState { get; set; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при нажатии клавиши, когда окно в фокусе.
    /// </summary>
    IObservable<KeyEventArgs> WhenKeyDown { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при отпускании клавиши, когда окно в фокусе.
    /// </summary>
    IObservable<KeyEventArgs> WhenKeyUp { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при нажатии клавиши до того, как ввод будет обработан другими обработчиками событий.
    /// </summary>
    IObservable<KeyEventArgs> WhenPreviewKeyDown { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при отпускании клавиши до того, как ввод будет обработан другими обработчиками событий.
    /// </summary>
    IObservable<KeyEventArgs> WhenPreviewKeyUp { get; }
    
    /// <summary>
    /// Observable-последовательность, срабатывающая при нажатии кнопки мыши, когда окно в фокусе.
    /// </summary>
    IObservable<MouseButtonEventArgs> WhenMouseDown { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при отпускании кнопки мыши, когда окно в фокусе.
    /// </summary>
    IObservable<MouseButtonEventArgs> WhenMouseUp { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при нажатии кнопки мыши до того, как ввод будет обработан другими обработчиками событий.
    /// </summary>
    IObservable<MouseButtonEventArgs> WhenPreviewMouseDown { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при отпускании кнопки мыши до того, как ввод будет обработан другими обработчиками событий.
    /// </summary>
    IObservable<MouseButtonEventArgs> WhenPreviewMouseUp { get; }
    
    /// <summary>
    /// Observable-последовательность, срабатывающая при движении мыши, когда окно в фокусе.
    /// </summary>
    IObservable<MouseEventArgs> WhenMouseMove { get; }
    
    /// <summary>
    /// Observable, срабатывающая до любых других событий при движении мыши, когда окно в фокусе.
    /// </summary>
    IObservable<MouseEventArgs> WhenPreviewMouseMove { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая, когда окно полностью загружено и отрисовано.
    /// </summary>
    IObservable<EventArgs> WhenLoaded { get; }
    
    /// <summary>
    /// Observable-последовательность, срабатывающая при выгрузке окна.
    /// </summary>
    IObservable<EventArgs> WhenUnloaded { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при закрытии окна.
    /// </summary>
    IObservable<EventArgs> WhenClosed { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая перед закрытием окна и позволяющая отменить его.
    /// </summary>
    IObservable<CancelEventArgs> WhenClosing { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при активации окна.
    /// </summary>
    IObservable<EventArgs> WhenActivated { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при деактивации окна.
    /// </summary>
    IObservable<EventArgs> WhenDeactivated { get; }

    /// <summary>
    /// Событие возникает при нажатии клавиши, когда окно в фокусе.
    /// </summary>
    event KeyEventHandler KeyDown;

    /// <summary>
    /// Событие возникает при отпускании клавиши, когда окно в фокусе.
    /// </summary>
    event KeyEventHandler KeyUp;

    /// <summary>
    /// Событие возникает до любых других обработчиков для события нажатия клавиши.
    /// </summary>
    event KeyEventHandler PreviewKeyDown;

    /// <summary>
    /// Событие возникает до любых других обработчиков для события отпускания клавиши.
    /// </summary>
    event KeyEventHandler PreviewKeyUp;
    
    /// <summary>
    /// Событие возникает при нажатии кнопки мыши, когда окно в фокусе.
    /// </summary>
    event MouseButtonEventHandler MouseDown;

    /// <summary>
    /// Событие возникает при отпускании кнопки мыши, когда окно в фокусе.
    /// </summary>
    event MouseButtonEventHandler MouseUp;
    
    /// <summary>
    /// Событие возникает при движении мыши, когда окно в фокусе.
    /// </summary>
    event MouseEventHandler MouseMove;

    /// <summary>
    /// Событие возникает до любых других обработчиков для события нажатия кнопки мыши.
    /// </summary>
    event MouseButtonEventHandler PreviewMouseDown;

    /// <summary>
    /// Событие возникает до любых других обработчиков для события отпускания кнопки мыши.
    /// </summary>
    event MouseButtonEventHandler PreviewMouseUp;
    
    /// <summary>
    /// Событие возникает до любых других обработчиков при движении мыши, когда окно в фокусе.
    /// </summary>
    event MouseEventHandler PreviewMouseMove;

    /// <summary>
    /// Событие возникает перед закрытием окна и позволяет отменить закрытие.
    /// </summary>
    event CancelEventHandler Closing;

    /// <summary>
    /// Событие возникает при активации окна.
    /// </summary>
    event EventHandler Activated;

    /// <summary>
    /// Событие возникает при деактивации окна.
    /// </summary>
    event EventHandler Deactivated;

    /// <summary>
    /// Событие возникает, когда окно полностью загружено и отрисовано.
    /// </summary>
    event EventHandler Loaded;

    /// <summary>
    /// Событие возникает при закрытии окна.
    /// </summary>
    event EventHandler Closed;

    /// <summary>
    /// Планирует выполнение указанной операции в рамках обработки сообщений окна.
    /// </summary>
    void BeginInvoke(Action action);

    /// <summary>
    /// Ожидает, пока не будут обработаны все сообщения окна.
    /// </summary>
    void WaitForIdle(TimeSpan timeout = default);
    
    /// <summary>
    /// Сворачивает окно.
    /// </summary>
    void Minimize();
    
    /// <summary>
    /// Разворачивает окно.
    /// </summary>
    void Maximize();
    
    /// <summary>
    /// Возвращает окно из состояния Maximized в состояние Normal.
    /// </summary>
    void Restore();

    /// <summary>
    /// Скрывает окно, делая его невидимым без закрытия.
    /// </summary>
    void Hide();

    /// <summary>
    /// Показывает окно, делая его видимым.
    /// </summary>
    void Show();
    
    /// <summary>
    /// Активирует окно, выводя его на передний план и передавая ему фокус.
    /// </summary>
    void Activate();

    /// <summary>
    /// Показывает окно как модальный диалог, блокируя другие взаимодействия до его закрытия.
    /// </summary>
    void ShowDialog(CancellationToken cancellationToken = default);

    /// <summary>
    /// Закрывает окно, освобождая все связанные ресурсы.
    /// </summary>
    void Close();

    /// <summary>
    /// Включает возможность перетаскивать текущее окно мышью.
    /// </summary>
    /// <remarks>
    /// - При вызове этого метода окно захватывает ввод мыши.
    /// - Пока мышь перемещается, позиция окна обновляется, что фактически позволяет перетаскивать окно.
    /// - Операция перетаскивания прекращается, когда:
    ///   1. Отпускается левая кнопка мыши.
    ///   2. У возвращённого <see cref="IDisposable"/> вызывается Dispose.
    /// 
    /// Этот метод полезен для реализации пользовательского поведения перетаскивания окна, например для окон без рамки
    /// или кастомных заголовков, которые не используют стандартную функциональность перетаскивания окна.
    /// </remarks>
    /// <returns>
    /// Экземпляр <see cref="IDisposable"/>, который можно использовать, чтобы программно остановить перетаскивание.
    /// При Dispose этого объекта операция перетаскивания немедленно прекращается, а захват мыши освобождается.
    /// </returns>
    /// <example>
    /// Пример использования:
    /// <code>
    /// var dragDisposable = window.EnableDragMove();
    /// // Перетаскивание будет продолжаться, пока:
    /// // 1. Не будет отпущена левая кнопка мыши.
    /// // 2. Не будет вызван dragDisposable.Dispose().
    /// </code>
    /// </example>
    IDisposable EnableDragMove();
}

/// <summary>
/// Определяет контракт для управления нативными свойствами и операциями окна в среде Blazor,
/// предоставляя прямой контроль над позиционированием, размерами и получением дескрипторов окна.
/// </summary>
public interface IBlazorWindowNativeController
{
    /// <summary>
    /// Возвращает дескриптор (HWND) нативного окна, связанного с этим экземпляром окна Blazor.
    /// </summary>
    /// <returns><see cref="IntPtr"/>, представляющий дескриптор нативного окна.</returns>
    IntPtr GetWindowHandle();

    /// <summary>
    /// Возвращает прямоугольные границы нативного окна, включая позицию и размеры.
    /// </summary>
    /// <returns></returns>
    System.Drawing.Rectangle GetWindowRect();
    
    /// <summary>
    /// Задаёт прямоугольные границы нативного окна, включая позицию и размеры.
    /// </summary>
    /// <param name="windowRect">Объект <see cref="System.Drawing.Rectangle"/>, задающий новую позицию и размеры окна.</param>
    void SetWindowRect(System.Drawing.Rectangle windowRect);

    /// <summary>
    /// Задаёт размеры нативного окна без изменения его текущей позиции.
    /// </summary>
    /// <param name="windowSize">Объект <see cref="System.Drawing.Size"/>, задающий новую ширину и высоту окна.</param>
    void SetWindowSize(System.Drawing.Size windowSize);

    /// <summary>
    /// Обновляет позицию нативного окна без изменения его размеров.
    /// </summary>
    /// <param name="windowPos">Объект <see cref="System.Drawing.Point"/>, задающий новую позицию левого верхнего угла окна.</param>
    void SetWindowPos(System.Drawing.Point windowPos);
}

/// <summary>
/// Этот интерфейс можно использовать для доступа к текущему окну Blazor из его контекста.
/// </summary>
public interface IBlazorWindowAccessor
{
    IBlazorWindow Window { get; }
}
```