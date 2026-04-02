---
title: Нестабильный API скриптинга SendInput
description: API скриптинга для эмуляции пользовательского ввода через SendInput.
published: true
date: 2025-03-21T23:36:48.505Z
tags: user input, mouse actions, keyboard actions, scripting api, simulation, ai-translated
editor: markdown
dateCreated: 2024-02-23T21:58:16.489Z
---
УСТАРЕЛО — обновлённая версия API находится [здесь](/scripting/api/ISendInputScriptingApi)
{.is-warning}

```csharp
/// <summary>
/// Предоставляет интерфейс для симуляции пользовательского ввода, включая действия мыши и клавиатуры.
/// </summary>
public interface ISendInputUnstableScriptingApi : IScriptingApi
{
    /// <summary>
    /// Возвращает или задаёт идентификатор используемого симулятора ввода.
    /// </summary>
    string InputSimulatorId { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт идентификатор используемого сглаживателя ввода.
    /// </summary>
    string InputSmootherId { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт диапазон задержки (в миллисекундах) между событиями нажатия и отпускания клавиши.
    /// </summary>
    RandomInteger KeyPressDelay { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт диапазон задержки (в миллисекундах) перед отпусканием кнопки мыши.
    /// </summary>
    RandomInteger ClickDelay { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт диапазон задержки (в миллисекундах) для двойного клика мышью.
    /// </summary>
    RandomInteger DoubleClickDelay { get; set; }
    
    /// <summary>
    /// Возвращает или задаёт текущую позицию курсора на экране. Установка позиции эквивалентна вызову MouseMoveTo()
    /// Для получения позиции курсора используется текущий симулятор ввода, указанный в InputSimulatorId
    /// </summary>
    WinPoint CursorPosition { get; set; }
    
    /// <summary>
    /// Перемещает курсор мыши на заданное смещение.
    /// </summary>
    /// <param name="x">Смещение по горизонтали.</param>
    /// <param name="y">Смещение по вертикали.</param>
    void MouseMoveBy(int x, int y);
    
    /// <summary>
    /// Перемещает курсор мыши на заданное смещение.
    /// </summary>
    /// <param name="offset">Смещение в виде WinPoint.</param>
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
    /// Симулирует клик левой кнопкой мыши.
    /// </summary>
    /// <param name="clickDelayMs">Необязательная задержка (в миллисекундах) перед отпусканием кнопки. Если не указано, используется ClickDelay.</param>
    void MouseLeftClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Симулирует двойной клик левой кнопкой мыши.
    /// </summary>
    /// <param name="clickDelayMs">Необязательная задержка (в миллисекундах) перед отпусканием кнопки. Если не указано, используется ClickDelay.</param>
    /// <param name="dblClickDelayMs">Необязательная задержка (в миллисекундах) между двумя кликами. Если не указано, используется DoubleClickDelay.</param>
    void MouseLeftDoubleClick(int? clickDelayMs = default, int? dblClickDelayMs = default);
    
    /// <summary>
    /// Симулирует клик правой кнопкой мыши.
    /// </summary>
    /// <param name="clickDelayMs">Необязательная задержка (в миллисекундах) перед отпусканием кнопки. Если не указано, используется ClickDelay.</param>
    void MouseRightClick(int? clickDelayMs = default);
    
    /// <summary>
    /// Симулирует клик кнопкой мыши.
    /// </summary>
    /// <param name="button">Кнопка мыши, которую нужно симулировать.</param>
    /// <param name="clickDelayMs">Необязательная задержка (в миллисекундах) перед отпусканием кнопки. Если не указано, используется ClickDelay.</param>
    void MouseClick(MouseButton button = default, int? clickDelayMs = default);
    
    /// <summary>
    /// Симулирует нажатие кнопки мыши.
    /// </summary>
    /// <param name="button">Кнопка мыши, которую нужно симулировать.</param>
    void MouseDown(MouseButton button = default);
    
    /// <summary>
    /// Симулирует отпускание кнопки мыши.
    /// </summary>
    /// <param name="button">Кнопка мыши, которую нужно симулировать.</param>
    void MouseUp(MouseButton button = default);
    
    /// <summary>
    /// Симулирует нажатие и отпускание клавиши клавиатуры.
    /// </summary>
    /// <param name="key">Клавиша, которую нужно симулировать.</param>
    /// <param name="keyPressDelay">Необязательная задержка (в миллисекундах) перед отпусканием клавиши. Если не указано, используется KeyPressDelay.</param>
    void KeyPress(Key key, int? keyPressDelay = default);
    
    /// <summary>
    /// Симулирует нажатие клавиши клавиатуры.
    /// </summary>
    /// <param name="key">Клавиша, которую нужно симулировать.</param>
    void KeyDown(Key key);
    
    /// <summary>
    /// Симулирует отпускание клавиши клавиатуры.
    /// </summary>
    /// <param name="key">Клавиша, которую нужно симулировать.</param>
    void KeyUp(Key key);
    
    /// <summary>
    /// Симулирует сложный жест с использованием клавиш клавиатуры или кнопок мыши.
    /// </summary>
    /// <param name="gesture">Жест, который нужно симулировать.</param>
    /// <param name="inputEventType">Тип симулируемого события ввода (например, нажатие клавиши, удержание клавиши, отпускание клавиши).</param>
    /// <param name="keyPressDelay">Необязательная задержка (в миллисекундах) перед отпусканием кнопки; работает только для событий KeyPress. Если не указано, используется KeyPressDelay.</param>
    void Gesture(HotkeyGesture gesture, InputEventType inputEventType, int? keyPressDelay = default);

    /// <summary>
    /// Симулирует ввод строки текста.
    /// </summary>
    /// <param name="text">Текст для ввода.</param>
    /// <param name="delayMs">Необязательная задержка (в миллисекундах) между вводом каждого символа. Если не указано, используется KeyPressDelay.</param>
    void Text(string text, int? delayMs = default);

    /// <summary>
    /// Возвращает состояние кнопки мыши — нажата она или нет
    /// </summary>
    /// <param name="button">Кнопка, состояние которой нужно проверить</param>
    bool IsMouseDown(MouseButton button = default);

    /// <summary>
    /// Возвращает состояние клавиши — нажата она или нет
    /// </summary>
    /// <param name="key">Клавиша, состояние которой нужно проверить</param>
    bool IsKeyDown(Key key);
}
```