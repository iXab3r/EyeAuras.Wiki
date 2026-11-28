---
title: Как добавить сглаживание перемещения мыши
description: 
published: true
date: 2024-07-01T20:34:21.401Z
tags: 
editor: markdown
dateCreated: 2024-07-01T20:20:30.551Z
---
# Провести мышь по собственной траектории

Алгоритм сглаживания получает начальную и конечную точки и возвращает план движения. Напишем простой линейный вариант: 20 отрезков, то есть 21 точка вместе с началом и концом, и пауза 10 мс после каждой точки. Скрипт один раз проведёт настоящий курсор в центр основного монитора и ничего не нажмёт.

Нужен настольный EyeAuras с модулем ввода и **Windows Input**. Для первого раза оставьте на основном мониторе своё тестовое окно и не двигайте его. Не запускайте одновременно другие действия, которые меняют этот API или запись `MyScript.Linear20`.

Возможно, хватит готовой траектории: сначала сравните [встроенные алгоритмы сглаживания](/ru/actions/sendinput/mouseinputsmoothing), а потом решайте, нужен ли свой. Если курсор приходит не в ту точку, сначала проверьте [систему координат](/ru/features/coordinate-system), а уже потом меняйте интерполяцию.

1. Создайте ауру с **C# Script**. Вставьте в `Script.csx` весь код, включая класс после основного блока. Это обычный класс: он реализует интерфейс и не обращается к глобальным сервисам скрипта.

```csharp
using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using EyeAuras.Roxy.Api;
using EyeAuras.Roxy.Services;
using EyeAuras.Roxy.Shared;

{
    var input = GetService<ISendInputScriptingApi>();
    var registry = GetService<IUserInputSmootherRegistrator>();
    var custom = new CustomInputSmoother();
    var previousRegistration = GetService<IUserInputSmootherProvider>()
        .KnownEntities.Items.FirstOrDefault(x => x.Id == custom.Id);
    var previousSmoother = input.InputSmootherId;
    var previousSimulator = input.InputSimulatorId;
    var previousTarget = input.TargetWindow;
    registry.Register(custom);
    try
    {
        input.InputSimulatorId = "Windows Input";
        input.InputSmootherId = custom.Id;
        input.TargetWindow = null;
        var bounds = System.Windows.Forms.Screen.PrimaryScreen.Bounds;
        var target = new Point(bounds.X + bounds.Width / 2, bounds.Y + bounds.Height / 2);
        cancellationToken.ThrowIfCancellationRequested();
        Log.Info($"Начало: {input.CursorPosition}; цель: {target}");
        input.MouseMoveTo(target);
        Log.Info($"Курсор после перемещения: {input.CursorPosition}");
    }
    finally
    {
        input.TargetWindow = previousTarget;
        input.InputSimulatorId = previousSimulator;
        input.InputSmootherId = previousSmoother;
        if (previousRegistration != null) registry.Register(previousRegistration);
    }
}

public sealed class CustomInputSmoother : IUserInputSmoother
{
    public string Id { get; init; } = "MyScript.Linear20";
    public string Name { get; init; } = "Линейный путь из 20 отрезков";
    public int NumberOfPoints { get; init; } = 20;
    public TimeSpan DelayBetweenPoints { get; init; } = TimeSpan.FromMilliseconds(10);

    public IReadOnlyList<MouseInput> Generate(Point startPosition, Point targetPosition)
    {
        var inputs = new List<MouseInput>();
        for (var i = 0; i <= NumberOfPoints; i++)
        {
            var t = (float)i / NumberOfPoints;
            var x = (int)(startPosition.X * (1 - t) + targetPosition.X * t);
            var y = (int)(startPosition.Y * (1 - t) + targetPosition.Y * t);
            inputs.Add(new MouseInput(new Point(x, y), DelayBetweenPoints));
        }
        return inputs;
    }
}
```

2. Нажмите **Run**. Курсор пройдёт по точкам плана к центру основного экрана. Сравните в журнале цель и итоговую позицию. Курсор останется там, куда пришёл: восстановление настроек мышь назад не возвращает.

| Поле или операция | Смысл |
| --- | --- |
| `Generate(startPosition, targetPosition)` | Возвращает план, но сам ввод не отправляет. Начальную точку даёт контроллер — это текущее положение мыши. |
| `NumberOfPoints = 20` | Число отрезков. Цикл включает оба конца, поэтому точек 21. Если меняете, оставьте значение положительным. |
| `DelayBetweenPoints = 10 мс` | Контроллер ждёт после каждой точки. В сумме паузы дают 210 мс. |
| `Id` | Постоянный идентификатор вашей записи. Запись с таким же Id заменяется, поэтому не берите имя чужого алгоритма и не создавайте новый Id на каждый кадр. |
| `TargetWindow = null` | Точки в этом примере экранные. Если ввод идёт в окно, контроллер переводит начальную экранную позицию в координаты окна и обратно при отправке. Это не клиентские координаты. |
| `InputSmootherId` | Выбирает зарегистрированный алгоритм для API. В конце возвращаются прежние настройки и прежняя запись, если она была. |

`Register` возвращает `void`, а публичного способа удалить запись нет. Если раньше записи не было, после запуска она останется в реестре под этим Id. Stop регистрацию не отменяет. Освобождать что-то через `Dispose` классу не нужно.

`MouseMoveTo` вызывается синхронно и не передаёт токен скрипта в выполнение плана. Отмена проверяется перед началом, а уже начатое движение Stop может и не прервать.

<details>
<summary>Использовать готовый алгоритм</summary>

Вместо своего класса можно выбрать готовый алгоритм по Id. Прежний `InputSmootherId` сохраните и потом верните, как в основном коде:

| Id | Назначение |
| --- | --- |
| `BenLandLinearFast` | Быстрый вариант BenLand с линейной настройкой. |
| `BenLandRandomizedFast` | Вариант BenLand с отклонением траектории. Не рассчитывайте, что случайное смещение будет одно и только в начале. |
| `BenLandUserInputSmoother`, `KalonUserInputSmoother` | Встроенные реализации со своими параметрами и наборами настроек. |

В коде это одна строка: `input.InputSmootherId = "BenLandRandomizedFast";`. Сама она мышь не двигает — движение выполнит следующий вызов ввода.

[Старый готовый пример](https://eyeauras.net/share/S20240701201856mfdkUQbqEY1k), [контекст скрипта](/ru/scripting/api/core/app-runtime-contexts), [ввод и сглаживание](/ru/scripting/api/windows-subsystems/input-hooks-hotkeys), [SendInput](/ru/scripting/api/ISendInputScriptingApi).

</details>
