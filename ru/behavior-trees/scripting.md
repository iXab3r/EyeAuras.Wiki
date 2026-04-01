---
title: Скриптинг
description: Документация по скриптингу в EyeAuras
published: true
date: 2025-05-06T00:29:32.390Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-06T00:23:17.719Z
---
Деревья поведения в EyeAuras тесно интегрированы со встроенной системой скриптов. Каждый узел `Execute Script` — это, по сути, небольшая программа, в которой можно использовать любые команды. Вы можете [отправлять ввод](/ru/scripting/api/ISendInputScriptingApi), [рисовать на экране](/ru/scripting/examples/basic/osd-cursor), [показывать уведомления](/ru/scripting/examples/basic/toast-wpf) и в целом пользоваться всей мощью API EyeAuras.

# Привет, мир

Давайте добавим в дерево узел `Execute Script`:  
![Привет, мир](https://s3.eyeauras.net/media/2025/05/EyeAuras_VXPogkKRSJ.png)

По умолчанию этот узел выводит в лог `"Hello, World"` и возвращает `Success`, потому что условие **истинно**:

```csharp
1 + 1 = 2
```

эквивалентно:

```csharp
return 1 + 1 == 2;
```

что, в свою очередь, эквивалентно:

```csharp
return true;
```

или:

```csharp
return NodeStatus.Success;
```

# NodeStatus

Каждый узел в дереве поведения может вернуть один из трёх статусов:

* `Success` — задача успешно выполнена (например, объект найден на экране).
* `Failure` — задача не выполнена (например, `Selector` не смог найти дочерний узел, который вернул бы успех).
* `Running` — задача всё ещё выполняется (например, `Wait` возвращает `Running`, пока не истечёт время ожидания).

Если узел возвращает `Running`, дерево вызовет его снова на следующем тике. Есть исключения — например, узел `Interrupter` может прерывать узлы, находящиеся в состоянии `Running`.

# IEnumerator и yield return

В C# есть интерфейс [IEnumerator](https://learn.microsoft.com/en-us/dotnet/api/system.collections.ienumerator?view=net-9.0), который представляет последовательность значений. В нашем случае особенно важен оператор [yield return](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield).

С помощью `yield return` можно создавать узлы, которые сохраняют внутреннее состояние между тиками:

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

Если вы вызовете этот скрипт несколько раз, увидите примерно такой результат:

```
Tick #1 → Failure  
Tick #2 → Failure  
Tick #3 → Running  
Tick #4 → Failure  
Tick #5 → Success  
```

Раньше для такой логики с сохранением состояния приходилось использовать Variables или Blackboard. Теперь сам скрипт *живёт* между тиками.

## Практический пример

Представим, что вам нужно подойти к NPC (`MapDevice`) и начать диалог кликом по нему. Такое взаимодействие происходит не мгновенно: персонажу нужно подойти, а затем дождаться появления окна диалога.

Логика будет такой:

1. Найти NPC (`MapDevice`) в списке ближайших сущностей  
2. Проверить, далеко ли игрок находится от NPC  
3. Если далеко — начать движение к нему  
4. Когда подойдёте достаточно близко — кликнуть по нему и дождаться открытия диалога  

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

Именно так появляются **корутины внутри деревьев поведения** — почти как [Unity Coroutines](https://docs.unity3d.com/6000.1/Documentation/Manual/coroutines.html).

В итоге деревья поведения становятся компактнее, проще в поддержке и лучше реагируют на происходящее, при этом сохраняя внутреннее состояние между тиками.