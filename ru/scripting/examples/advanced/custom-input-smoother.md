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

Алгоритм сглаживания получает начальную и конечную точки и возвращает план перемещения. Напишем простой линейный вариант: 20 отрезков, 21 точка вместе с началом и концом, задержка 10 мс после каждой точки. Скрипт один раз переместит настоящий курсор в центр основного монитора, без нажатий.

Нужен настольный EyeAuras с модулем ввода и **Windows Input**. Для первого опыта оставьте собственное неподвижное тестовое окно на основном мониторе. Не запускайте другие действия, одновременно меняющие этот API или запись `MyScript.Linear20`.

Если достаточно готовой траектории, сначала сравните [алгоритмы сглаживания](/ru/actions/sendinput/mouseinputsmoothing), а затем решайте, нужен ли свой планировщик. Если курсор приходит не в ту конечную точку, проверьте [систему координат](/ru/features/coordinate-system) до изменения интерполяции.

1. Создайте свою ауру с **C# Script**. Вставьте в `Script.csx` всю программу, включая класс после основного блока. Обычный класс реализует интерфейс и не обращается к глобальным сервисам скрипта.

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

2. Нажмите **Run**. Курсор пройдёт к центру основного экрана по точкам плана. Сравните цель и итоговую позицию в журнале. Изменение положения курсора — результат этого примера; восстановление настроек не возвращает мышь обратно.

| Поле или операция | Смысл |
| --- | --- |
| `Generate(startPosition, targetPosition)` | Возвращает план, сам ввод не отправляет. Начало предоставляет контроллер по текущему положению мыши. |
| `NumberOfPoints = 20` | Число отрезков; цикл включает оба конца, поэтому точек 21. При изменении оставьте значение положительным. |
| `DelayBetweenPoints = 10 мс` | Контроллер ждёт после каждой точки. Номинальная сумма задержек 210 мс не обещает точное время движения. |
| `Id` | Стабильный собственный идентификатор записи. Совпадающий Id заменяет запись, поэтому не используйте имя чужого алгоритма или новый Id каждый кадр. |
| `TargetWindow = null` | Точки этого опыта экранные. Для адресного ввода контроллер переводит начальную экранную позицию в координаты окна и обратно при отправке; это не клиентские координаты. |
| `InputSmootherId` | Выбирает зарегистрированный алгоритм для API. В конце прежние настройки и прежняя запись, если она была, восстанавливаются. |

`Register` возвращает `void`, а публичной операции удаления записи нет. Если ранее записи не было, после опыта она останется в реестре под этим одним Id; Stop не является отменой регистрации. Классу не требуется освобождать собственные ресурсы через `Dispose`. Это ограничение механизма, а не обещание автоматической очистки или повод придумывать `Unregister`.

Вызов `MouseMoveTo` синхронный и не передаёт токен скрипта в выполнение плана. Проверка отмены действует перед началом; Stop не обещает прервать уже начатое движение. Алгоритм интерполирует точки, а не гарантирует точную физическую траекторию устройства.

<details>
<summary>Использовать готовый алгоритм</summary>

Вместо своего класса можно выбрать один из зарегистрированных вариантов по Id, сохранив и затем восстановив прежний `InputSmootherId`, как в основной программе:

| Id | Назначение |
| --- | --- |
| `BenLandLinearFast` | Быстрый вариант BenLand с линейной настройкой. |
| `BenLandRandomizedFast` | Вариант BenLand с отклонением траектории; это не обещание единственного случайного смещения только в начале. |
| `BenLandUserInputSmoother`, `KalonUserInputSmoother` | Встроенные реализации с собственными параметрами и наборами настроек. |

Фрагмент выбора внутри программы: `input.InputSmootherId = "BenLandRandomizedFast";`. Он сам не перемещает мышь; движение выполняет следующий вызов ввода.

[Исторический готовый пример](https://eyeauras.net/share/S20240701201856mfdkUQbqEY1k), [контекст скрипта](/ru/scripting/api/core/app-runtime-contexts), [ввод и сглаживание](/ru/scripting/api/windows-subsystems/input-hooks-hotkeys), [SendInput](/ru/scripting/api/ISendInputScriptingApi).

</details>
