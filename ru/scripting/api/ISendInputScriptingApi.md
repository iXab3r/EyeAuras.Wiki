---
title: Скриптовый API ISendInput
description: 
published: true
date: 2025-03-21T23:36:13.915Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-21T23:36:13.915Z
---
```csharp
/// <summary>
/// Предоставляет интерфейс для эмуляции пользовательского ввода, включая действия мыши и клавиатуры.
/// </summary>
public interface ISendInputScriptingApi : IScriptingApi
{
    /// <summary>
    /// Возвращает или задаёт идентификатор симулятора ввода, который будет использоваться.
    /// </summary>
    string InputSimulatorId { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт идентификатор сглаживателя ввода, который будет использоваться.
    /// </summary>
    string InputSmootherId { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт идентификатор окна, которое будет получать ввод.
    /// </summary>
    IWindowHandle TargetWindow { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт диапазон задержки (в миллисекундах) между событиями нажатия и отпускания клавиши.
    /// </summary>
    RandomInteger KeyPressDelay { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт диапазон задержки (в миллисекундах) перед отпусканием кнопки мыши.
    /// </summary>
    RandomInteger ClickDelay { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт диапазон задержки (в миллисекундах) для двойного щелчка мышью.
    /// </summary>
    RandomInteger DoubleClickDelay { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт текущее положение курсора на экране. Установка позиции эквивалентна вызову MouseMoveTo()
    /// Использует текущий симулятор ввода, указанный в InputSimulatorId, для получения позиции курсора
    /// </summary>
    WinPoint CursorPosition { get; set; }
    
    /// <summary>
    /// Перемещает курсор мыши на указанный сдвиг.
    /// </summary>
    /// <param name="x">Сдвиг по горизонтали.</param>
    /// <param name="y">Сдвиг по вертикали.</param>
    void MouseMoveBy(int x, int y);
    
    /// <summary>
    /// Перемещает курсор мыши на указанный сдвиг.
    /// </summary>
    /// <param name="offset">Сдвиг в виде WinPoint.</param>
    void MouseMoveBy(WinPoint offset);
    
    /// <summary>
    /// Перемещает курсор мыши в указанную точку на экране.
    /// </summary>
    /// <param name="x">Координата X точки назначения.</param>
    /// <param name="y">Координата Y точки назначения.</param>
    void MouseMoveTo(int x, int y);
    
    /// <summary>
    /// Перемещает курсор мыши в указанную точку на экране.
    /// </summary>
    /// <param name="location">Точка назначения в виде WinPoint.</param>
    void MouseMoveTo(WinPoint location);
    
    /// <summary>
    /// Эмулирует щелчок левой кнопкой мыши.
    /// </summary>
    /// <param name="clickDelayMs">Необязательная задержка (в миллисекундах) перед отпусканием кнопки. Если не указана, используется ClickDelay.</param>
    void MouseLeftClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Эмулирует двойной щелчок левой кнопкой мыши.
    /// </summary>
    /// <param name="clickDelayMs">Необязательная задержка (в миллисекундах) перед отпусканием кнопки. Если не указана, используется ClickDelay.</param>
    /// <param name="dblClickDelayMs">Необязательная задержка (в миллисекундах) между двумя щелчками. Если не указана, используется DoubleClickDelay.</param>
    void MouseLeftDoubleClick(int? clickDelayMs = default, int? dblClickDelayMs = default);
    
    /// <summary>
    /// Эмулирует щелчок правой кнопкой мыши.
    /// </summary>
    /// <param name="clickDelayMs">Необязательная задержка (в миллисекундах) перед отпусканием кнопки. Если не указана, используется ClickDelay.</param>
    void MouseRightClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Эмулирует щелчок кнопкой мыши.
    /// </summary>
    /// <param name="button">Кнопка мыши, которую нужно эмулировать.</param>
    /// <param name="clickDelayMs">Необязательная задержка (в миллисекундах) перед отпусканием кнопки. Если не указана, используется ClickDelay.</param>
    void MouseClick(MouseButton button = default, int? clickDelayMs = default);
    
    /// <summary>
    /// Эмулирует нажатие кнопки мыши.
    /// </summary>
    /// <param name="button">Кнопка мыши, которую нужно эмулировать.</param>
    void MouseDown(MouseButton button = default);
    
    /// <summary>
    /// Эмулирует отпускание кнопки мыши.
    /// </summary>
    /// <param name="button">Кнопка мыши, которую нужно эмулировать.</param>
    void MouseUp(MouseButton button = default);
    
    /// <summary>
    /// Эмулирует нажатие и отпускание клавиши клавиатуры.
    /// </summary>
    /// <param name="key">Клавиша, которую нужно эмулировать.</param>
    /// <param name="keyPressDelay">Необязательная задержка (в миллисекундах) перед отпусканием клавиши. Если не указана, используется KeyPressDelay.</param>
    void KeyPress(Key key, int? keyPressDelay = default);
    
    /// <summary>
    /// Эмулирует нажатие клавиши клавиатуры.
    /// </summary>
    /// <param name="key">Клавиша, которую нужно эмулировать.</param>
    void KeyDown(Key key);
    
    /// <summary>
    /// Эмулирует отпускание клавиши клавиатуры.
    /// </summary>
    /// <param name="key">Клавиша, которую нужно эмулировать.</param>
    void KeyUp(Key key);
    
    /// <summary>
    /// Эмулирует сложный жест, включающий клавиши клавиатуры или кнопки мыши.
    /// </summary>
    /// <param name="gesture">Жест, который нужно эмулировать.</param>
    /// <param name="inputEventType">Тип события ввода для эмуляции (например, нажатие клавиши, удержание клавиши, отпускание клавиши).</param>
    /// <param name="keyPressDelay">Необязательная задержка (в миллисекундах) перед отпусканием кнопки; работает только для событий KeyPress. Если не указана, используется KeyPressDelay.</param>
    void Gesture(HotkeyGesture gesture, InputEventType inputEventType, int? keyPressDelay = default);

    /// <summary>
    /// Эмулирует ввод строки текста.
    /// </summary>
    /// <param name="text">Текст для ввода.</param>
    /// <param name="delayMs">Необязательная задержка (в миллисекундах) между вводом каждого символа. Если не указана, используется KeyPressDelay.</param>
    void Text(string text, int? delayMs = default);

    /// <summary>
    /// Возвращает состояние кнопки мыши — нажата она в данный момент или нет.
    /// </summary>
    /// <param name="button">Кнопка, состояние которой нужно проверить.</param>
    bool IsMouseDown(MouseButton button = default);

    /// <summary>
    /// Возвращает состояние клавиши — нажата она в данный момент или нет.
    /// </summary>
    /// <param name="key">Клавиша, состояние которой нужно проверить.</param>
    bool IsKeyDown(Key key);
}
```