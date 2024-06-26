---
title: Как добавить сглаживание перемещения мыши
description: 
published: true
date: 2024-07-01T20:34:21.401Z
tags: 
editor: markdown
dateCreated: 2024-07-01T20:20:30.551Z
---

# Добавляем сглаживание перемещений мыши
По умолчанию, мышь "телепортируется" из точки А в точку Б, что не всегда является желаемым поведением. 
Вот тут-то на помощь и приходят "смузеры" - инструменты, которые умеют строить план перемещения мыши по *какой-то* логике.
Сам алгоритм может отличаться. По умолчанию в программу встроены алгоритмы от BenLand (`BenLandUserInputSmoother`) и Kalon (`KalonUserInputSmoother`). 
В них есть некоторые параметры, которые вы можете настраивать, но даже по умолчанию в программу встроены несколько пресетов, вот самые полезные:
- `BenLandLinearFast` - перемещает мышь из точки А в точку Б по прямой
- `BenLandRandomizedFast` - перемещает добавляя некоторое отклонение в начальной точке траектории

Указав в коде `InputSmootherId` можно указать симулятору, что перемещения мыши нужно сглаживать

```csharp
ISendInputUnstableScriptingApi SendInput { get; } = GetService<ISendInputUnstableScriptingApi>(); // нужно для отправки ввода
SendInput.InputSmootherId = "BenLandRandomizedFast"; // указываем здесь Id смузера
```

## Пример, в котором мы реализуем свое собственное сглаживание
> Импортировать готовый пример можно отсюда https://eyeauras.net/share/S20240701201856mfdkUQbqEY1k
{.is-info}

1. Создаем ауру со скриптом
2. Копипастим, запускаем, если все хорошо - скрипт переместит мышь в центр экрана с видимой задержкой и достаточно плавно

```csharp
using EyeAuras.Roxy.Services;

ISendInputUnstableScriptingApi SendInput { get; } = GetService<ISendInputUnstableScriptingApi>(); // нужно для отправки ввода

var customSmoother = new CustomInputSmoother();
GetService<IUserInputSmootherRegistrator>() // берем службу, которая отвечает за все наши "смузеры"
    .Register(customSmoother); // и добавляем наш

// а теперь говорим API, чтобы он использовал наш смузер
SendInput.InputSmootherId = customSmoother.Id; // or something like "BenLandRandomizedFast";

var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize; // берем размер основного экрана

Log.Info($"Primary monitor size: {screenSize}");
SendInput.MouseMoveTo(screenSize.Width / 2, screenSize.Height / 2); // переводим в центр
Log.Info($"Movement completed, cursor is at: {SendInput.CursorPosition}");

/// <summary>
/// В этом классе сосредоточена вся суть нашего смузера.
/// Он добавляет NumberOfPoints точек между начальной точкой перемещения и конечной.
/// "Настоящий" смузер может использовать какие-нибудь штуки типа кривых Безье или любую другую логику 
/// </summary>
class CustomInputSmoother : IUserInputSmoother
{
    public string Id { get; init; } = "MySmoother";

    public string Name { get; init; } = "This is my new cool input smoother";

    public int NumberOfPoints { get; init; } = 20;

    public TimeSpan DelayBetweenPoints { get; init; } = TimeSpan.FromMilliseconds(10);

    public IReadOnlyList<MouseInput> Generate(
        Point startPosition,
        Point targetPosition)
    {
        var inputs = new List<MouseInput>();

        //спасибо ChatGPT за немного кода для аппроксимации точек на прямой
        for (int i = 0; i <= NumberOfPoints; i++)
        {
            var t = (float)i / NumberOfPoints;

            var x = (int)(startPosition.X * (1 - t) + targetPosition.X * t);
            var y = (int)(startPosition.Y * (1 - t) + targetPosition.Y * t);

            var input = new MouseInput(new Point(x, y), DelayBetweenPoints);
            inputs.Add(input);
        }

        return inputs;

    }
}
```
