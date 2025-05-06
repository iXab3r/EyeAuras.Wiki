---
title: Скрипты
description: 
published: true
date: 2025-05-06T00:28:08.944Z
tags: 
editor: markdown
dateCreated: 2025-05-06T00:23:17.719Z
---

Деревья поведения в EyeAuras тесно интегрированы со встроенной скриптовой системой. Каждая `Execute Script` нода — это небольшая программа, которая может содержать любые команды. Вы можете [отправлять ввод](/en/scripting/api/ISendInputScriptingApi), [рисовать на экране](/en/scripting/examples/basic/osd-cursor), [показывать оповещения](/en/scripting/examples/basic/toast-wpf), и в целом использовать весь богатый API EyeAuras.

# Hello, World

Добавим ноду `Execute Script` в дерево:
![Hello, World](https://s3.eyeauras.net/media/2025/05/EyeAuras_VXPogkKRSJ.png)

По умолчанию эта нода напечатает в лог сообщение "Hello, World" и вернет статус `Success`, потому что условие **истинно** (**True**):

```csharp
1 + 1 = 2
```

эквивалентно:

```csharp
return 1 + 1 == 2;
```

эквивалентно:

```csharp
return true;
```

или:

```csharp
return NodeStatus.Success;
```

# NodeStatus

У каждой ноды может быть один из трёх статусов:

* `Success` — задача выполнена успешно (например, объект найден на экране).
* `Failure` — задача не выполнена (например, Selector не нашёл успешной ветки).
* `Running` — задача продолжается (например, `Wait` возвращает `Running`, пока не истечёт время).

Если нода возвращает `Running`, то на следующем тике управление снова передается ей. Исключения возможны (например, `Interrupter` может прервать `Running`-ноду).

# IEnumerator и yield return

В C# есть интерфейс [IEnumerator](https://learn.microsoft.com/en-us/dotnet/api/system.collections.ienumerator?view=net-9.0), который описывает последовательность значений. Нас интересует его особенность — ключевое слово [yield return](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield).

С его помощью можно реализовать ноды, которые сохраняют состояние между тиками:

```csharp
Log.Info("Hello, world!");
return Run();

private IEnumerator<NodeStatus> Run()
{
    var tickIndex = 0;
    while (!cancellationToken.IsCancellationRequested)
    {
        tickIndex++;
        Log.Info($"Tick #{tickIndex}");

        if (tickIndex % 3 == 0)
        {
            yield return NodeStatus.Running;
        }
        else if (tickIndex % 5 == 0)
        {
            yield return NodeStatus.Success;
        }
        else
        {
            yield return NodeStatus.Failure;
        }
    }
}
```

Если вы вызовете этот скрипт несколько раз, вы увидите вывод:

```
Tick #1 → Failure
Tick #2 → Failure
Tick #3 → Running
Tick #4 → Failure
Tick #5 → Success
```

Ранее это было невозможно без сохранения состояния через Variables/Blackboard, теперь же скрипт "живёт" между тиками.

## Использование на реальном примере
Задача - в рамках одной из веток логики в дереве поведения добежать до NPC (MapDevice) и начать диалог - кликнуть на него. Перемещение персонажа от текущей позиции не мгновенное, да и сам диалог может открываться какое-то время. 

1) Находим NPC в списке объектов вокруг
2) Проверяем насколько мы далеко от него
3) Если далеко - бежим к нему
4) Как только подбежали - открываем и ждем, пока появится окно диалога 

```csharp
private IEnumerator<NodeStatus> Run()
{
    var mapDevice = GameController.Entities
        .Where(x => x.Type is EntityType.IngameIcon && x.IsTargetable && x.TryGetComponent<MinimapIcon>(out var minimapIcon) && minimapIcon.Name == "MapDevice")
        .FirstOrDefault();

    if (mapDevice == null)
    {
        Log.Warn("Map Device not found");
        yield return NodeStatus.Failure;
        yield break;
    }

    const float minDistance = 20;
    if (mapDevice.DistancePlayer > minDistance)
    {
        PF.AddDestination(mapDevice.GridPos, PfDestinationType.Interact, minDistance);
        while (mapDevice.DistancePlayer > minDistance)
        {
            yield return NodeStatus.Running;
        }
    }

    SendInput.MouseClick(CameraManager.WorldToScreen(mapDevice.BoundsCenterPos).ToPoint());

    while (!AtlasManager.IsActive)
    {
        yield return NodeStatus.Running;
    }

    yield return NodeStatus.Success;
}
```

Так появляются **корутины в деревьях**, аналогичные [Unity Coroutines](https://docs.unity3d.com/6000.1/Documentation/Manual/coroutines.html).

Результат — более компактные, управляемые и реактивные деревья поведения с сохранением контекста между тиками.
