---
title: Нестабильный API скриптинга окна диалога
description: 
published: true
date: 2025-10-19T16:05:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-11-03T23:15:54.436Z
---
```csharp

/// <summary>
/// Предоставляет нестабильный scripting API для создания и управления диалоговыми окнами в окружении на базе Blazor.
/// </summary>
public interface IDialogWindowUnstableScriptingApi : IScriptingApi
{
    /// <summary>
    /// Создает новый экземпляр диалогового окна для указанного компонента Blazor.
    /// </summary>
    /// <typeparam name="T">
    /// Тип компонента Blazor, который будет отображаться в диалоговом окне. Должен реализовывать <see cref="IComponent"/>.
    /// </typeparam>
    /// <returns>
    /// <see cref="IBlazorWindow"/>, представляющий созданное диалоговое окно.
    /// </returns>
    /// <example>
    /// <code>
    /// // Создаем новый экземпляр диалогового окна с пользовательским компонентом Blazor
    /// var dialogApi = GetService<IDialogWindowUnstableScriptingApi>();
    /// var myWindow = dialogApi.CreateWindow<MyCustomComponent>();
    /// 
    /// // Задаем свойства окна (например, заголовок и размер)
    /// myWindow.Title = "Custom Dialog";
    /// myWindow.Width = 400;
    /// myWindow.Height = 300;
    /// 
    /// // Показываем окно модально
    /// myWindow.ShowDialog();
    /// </code>
    /// </example>
    IBlazorWindow CreateWindow<T>(object dataContext = default) where T : IComponent;
}

/// <summary>
/// Определяет контракт окна Blazor с настраиваемыми UI-свойствами, событийным жизненным циклом и операциями управления состоянием окна.
/// </summary>
public interface IBlazorWindow : IBlazorWindowController, IDisposableReactiveObject
{
    /// <summary>
    /// Возвращает или задает тип View, который будет отображаться внутри окна.
    /// </summary>
    Type ViewType { get; set; }
    
    /// <summary>
    /// Возвращает или задает data context, который будет назначен для View.
    /// </summary>
    object ViewDataContext { get; set; }

    /// <summary>
    /// Возвращает или задает стартовую позицию окна.
    /// </summary>
    WindowStartupLocation WindowStartupLocation { get; set; }
}

/// <summary>
/// Определяет контракт окна Blazor с настраиваемыми UI-свойствами, событийным жизненным циклом и операциями управления состоянием окна.
/// </summary>
public interface IBlazorWindowController
{
    /// <summary>
    /// Возвращает или задает режим изменения размера окна, определяющий, как пользователь может менять его размер.
    /// </summary>
    ResizeMode ResizeMode { get; set; }

    /// <summary>
    /// Возвращает или задает значение, указывающее, отображается ли строка заголовка.
    /// </summary>
    bool ShowTitleBar { get; set; }

    /// <summary>
    /// Возвращает или задает значение, указывающее, показывается ли иконка в строке заголовка.
    /// </summary>
    bool ShowIconOnTitleBar { get; set; }

    /// <summary>
    /// Возвращает или задает значение, указывающее, должно ли окно отображаться на панели задач.
    /// </summary>
    bool ShowInTaskbar { get; set; }

    /// <summary>
    /// Возвращает или задает отступы вокруг содержимого окна.
    /// </summary>
    Thickness Padding { get; set; }

    /// <summary>
    /// Возвращает или задает значение, указывающее, должно ли окно быть click-through (то есть недоступным для взаимодействия).
    /// </summary>
    bool IsClickThrough { get; set; }

    /// <summary>
    /// Возвращает или задает значение, указывающее, находится ли окно в режиме отладки.
    /// </summary>
    bool IsDebugMode { get; set; }

    /// <summary>
    /// Возвращает или задает прозрачность окна.
    /// </summary>
    double Opacity { get; set; }

    /// <summary>
    /// Возвращает или задает текст заголовка окна.
    /// </summary>
    string Title { get; set; }

    /// <summary>
    /// Возвращает или задает значение, указывающее, должно ли окно оставаться поверх остальных окон.
    /// </summary>
    bool Topmost { get; set; }

    /// <summary>
    /// Возвращает или задает горизонтальную позицию окна.
    /// </summary>
    int Left { get; set; }

    /// <summary>
    /// Возвращает или задает вертикальную позицию окна.
    /// </summary>
    int Top { get; set; }

    /// <summary>
    /// Возвращает или задает ширину окна.
    /// </summary>
    int Width { get; set; }

    /// <summary>
    /// Возвращает или задает высоту окна.
    /// </summary>
    int Height { get; set; }

    /// <summary>
    /// Возвращает или задает минимальную ширину окна.
    /// </summary>
    int MinWidth { get; set; }

    /// <summary>
    /// Возвращает или задает минимальную высоту окна.
    /// </summary>
    int MinHeight { get; set; }

    /// <summary>
    /// Возвращает или задает максимальную ширину окна.
    /// </summary>
    int MaxWidth { get; set; }

    /// <summary>
    /// Возвращает или задает максимальную высоту окна.
    /// </summary>
    int MaxHeight { get; set; }  
    
    /// <summary>
    /// Возвращает или задает цвет фона окна. Можно использовать transparent, чтобы полностью скрыть фон.
    /// </summary>
    Color BackgroundColor { get; set; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при нажатии клавиши, когда окно находится в фокусе.
    /// </summary>
    IObservable<KeyEventArgs> WhenKeyDown { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при отпускании клавиши, когда окно находится в фокусе.
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
    /// Observable-последовательность, срабатывающая, когда окно полностью загружено и отрисовано.
    /// </summary>
    IObservable<EventArgs> WhenLoaded { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая при закрытии окна.
    /// </summary>
    IObservable<EventArgs> WhenClosed { get; }

    /// <summary>
    /// Observable-последовательность, срабатывающая перед закрытием окна и позволяющая отменить это действие.
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
    /// Возникает при нажатии клавиши, когда окно находится в фокусе.
    /// </summary>
    event KeyEventHandler KeyDown;

    /// <summary>
    /// Возникает при отпускании клавиши, когда окно находится в фокусе.
    /// </summary>
    event KeyEventHandler KeyUp;

    /// <summary>
    /// Возникает до любых других обработчиков события нажатия клавиши.
    /// </summary>
    event KeyEventHandler PreviewKeyDown;

    /// <summary>
    /// Возникает до любых других обработчиков события отпускания клавиши.
    /// </summary>
    event KeyEventHandler PreviewKeyUp;

    /// <summary>
    /// Возникает перед закрытием окна и дает возможность отменить это действие.
    /// </summary>
    event CancelEventHandler Closing;

    /// <summary>
    /// Возникает при активации окна.
    /// </summary>
    event EventHandler Activated;

    /// <summary>
    /// Возникает при деактивации окна.
    /// </summary>
    event EventHandler Deactivated;

    /// <summary>
    /// Возникает, когда окно полностью загружено и отрисовано.
    /// </summary>
    event EventHandler Loaded;

    /// <summary>
    /// Возникает при закрытии окна.
    /// </summary>
    event EventHandler Closed;

    /// <summary>
    /// Скрывает окно, делая его невидимым без закрытия.
    /// </summary>
    void Hide();

    /// <summary>
    /// Показывает окно, делая его видимым.
    /// </summary>
    void Show();

    /// <summary>
    /// Показывает окно как модальный диалог, блокируя другие взаимодействия до его закрытия.
    /// </summary>
    void ShowDialog(CancellationToken cancellationToken = default);

    /// <summary>
    /// Закрывает окно и освобождает все связанные ресурсы.
    /// </summary>
    void Close();
}
```