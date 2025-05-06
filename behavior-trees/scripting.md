---
title: Scripting
description: 
published: true
date: 2025-05-06T00:29:32.390Z
tags: 
editor: markdown
dateCreated: 2025-05-06T00:29:32.390Z
---

Behavior trees in EyeAuras are tightly integrated with the built-in scripting system. Each `Execute Script` node is essentially a small program that can contain any set of commands. You can [send input](/en/scripting/api/ISendInputScriptingApi), [draw on screen](/en/scripting/examples/basic/osd-cursor), [show notifications](/en/scripting/examples/basic/toast-wpf), and generally use the full power of the EyeAuras API.

# Hello, World

Let’s add an `Execute Script` node to a tree:  
![Hello, World](https://s3.eyeauras.net/media/2025/05/EyeAuras_VXPogkKRSJ.png)

By default, this node prints "Hello, World" to the log and returns `Success`, because the condition is **true**:

```csharp
1 + 1 = 2
```

is equivalent to:

```csharp
return 1 + 1 == 2;
```

which is equivalent to:

```csharp
return true;
```

or:

```csharp
return NodeStatus.Success;
```

# NodeStatus

Every node in a behavior tree can return one of three statuses:

* `Success` — the task was completed successfully (e.g., an object was found on screen).
* `Failure` — the task was not completed (e.g., a Selector couldn’t find a successful child node).
* `Running` — the task is still in progress (e.g., `Wait` returns `Running` until the wait time is over).

If a node returns `Running`, the tree will call it again on the next tick. There are exceptions (e.g., the `Interrupter` node can interrupt nodes in the `Running` state).

# IEnumerator and yield return

C# provides an interface called [IEnumerator](https://learn.microsoft.com/en-us/dotnet/api/system.collections.ienumerator?view=net-9.0), which represents a sequence of values. What we’re interested in is the [yield return](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield) keyword.

With `yield return`, you can implement nodes that maintain internal state between ticks:

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

If you call this script multiple times, you’ll see output like:

```
Tick #1 → Failure  
Tick #2 → Failure  
Tick #3 → Running  
Tick #4 → Failure  
Tick #5 → Success  
```

Previously, this kind of stateful logic required using Variables or the Blackboard. Now the script *lives* between ticks.

## Real-world example

Let’s say you want to walk up to an NPC (MapDevice) and start a conversation by clicking it. This interaction isn’t instantaneous — it involves movement and waiting for the dialog UI.

Here’s the logic:

1. Find the NPC (MapDevice) in the nearby entity list  
2. Check if the player is far from the NPC  
3. If far — start moving toward it  
4. Once close — click and wait for the dialog to open  

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

This is how **coroutines inside behavior trees** are born — just like [Unity Coroutines](https://docs.unity3d.com/6000.1/Documentation/Manual/coroutines.html).

The result: more compact, maintainable, and reactive behavior trees that can retain internal state between ticks.
