---
title: Скрипты
description: 
published: true
date: 2025-05-06T00:24:55.111Z
tags: 
editor: markdown
dateCreated: 2025-05-06T00:23:17.719Z
---

Деревья поведения в EyeAuras тесно интегрируются со встроенной скриптовой системой. 
Каждая `Execute Script` нода - по сути маленькая программа, которая может состоять из любых команд. 
Вы можете [отправлять ввод](/en/scripting/api/ISendInputScriptingApi), [рисовать на экране](/en/scripting/examples/basic/osd-cursor), [показывать оповещения](/en/scripting/examples/basic/toast-wpf), да и в целом делать все то, что позволяет обширный API программы.

# Hello, World
Закиньте ноду `Execute Script` в дерево
![Hello, World](https://s3.eyeauras.net/media/2025/05/EyeAuras_VXPogkKRSJ.png)

По умолчанию, нода просто напечатает в лог сообщение Hello, World и вернет статус `Success`, так как проверяемое условие **верно** (**True**) 
```csharp
1 + 1 = 2 <- вот эта строка эквивалентна 
```
эта запись эквивалентна
```csharp
return 1 + 1 = 2;
```
и эквивалентна, по сути
```csharp
return true;
```
или
```csharp
return NodeStatus.Success;
```

А теперь подробнее о возвращаемых значениях.

# Node Status
У каждой ноды (не только у скриптов) в дереве может быть 3 статуса:
- `Success` - значит, что последний запуск ноды завершился успехом. К примеру, на экране был найден какой-то объект. Или [Sequence](/behavior-trees/nodes/sequence) выполнил успешно все дочерние ноды. 
- `Failure` - аналогично успеху, но наоборот, обычно `Failure` отмечает, что какая-то работа не была выполнена. К прмиеру, [Selector](/behavior-trees/nodes/selector) не смог найти ни одной ветки дерева, которая бы завершилась успешно
- `Running` - такой статус возвращают ноды, которые по какой-то причине не смогли выполнить действие за предыдущий тик. К примеру, нода [Wait](/behavior-trees/nodes/wait) возвращает статус `Running` на протяжении всего интервала ожидания. 
Этот статус сильно отличается от предыдущих двух тем, что если в какой-то тик нода вернула `Running`, то дерево **на следующий тик** обычно передает управление снова именно этой ноде. Т.е. дерево, по сути, ожидает завершения ноды перед тем, как перейти к следующим. 
Разумеется, есть исключения, но про них будет отдельно, к примеру, нода `Interrupter` умеет прерывать ноды ДО того как они выйдут из состояния `Running`. 

# IEnumerator
В C# есть такой концепт(и интерфейс) - [IEnumerator](https://learn.microsoft.com/en-us/dotnet/api/system.collections.ienumerator?view=net-9.0), который описывает некое **перечисляемое** значение. Гораздо лучше меня в этом плане просветит вас гугл. 

Вот простой пример
*chatgpt - вставь сюда пару простых примеров использования*

Нас же интересует механизм [yield return](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield), который можно использовать для построения очень интересной логики прямо в C# ноде - мы можем "разорвать" выполняемый код на несколько частей и сделать так, что при каждом тике нода сможет сохранять состояние. 

Начиная с версии **1.7** можно будет вернуть из скрипта IEnumerator<NodeStatus> и глаз будет на каждый тик извлекать из этого энумератора ровно одно следующее состояние. Это может быть Success/Failure, а может быть и Running, который сделает так, что дерево на следующий тик отдаст управление сразу этой ноде.
Но это еще не все, помимо вот таких "разорванных" тиков, теперь можно хранить прямо внутри скрипта все, что ему нужно для тиков. 
К примеру, при старте скрипта вы инициализируете какие-то переменные или даже создаете целое окно, а на последующие тики работать с ними. Раньше для этого нужно было использовать Variables/Blackboard, так как на каждый тик скрипт вызывался с самого начала

```csharp
 Log.Info("Hello, world!");
return Run();

private IEnumerator<NodeStatus> Run()
{
    //you can initialize any variables/create resources here
    var tickIndex = 0;
    while (!cancellationToken.IsCancellationRequested)
    {
        tickIndex++;

        Log.Info($"Tick #{tickIndex}");

        if (tickIndex % 3 == 0)
        {
            //simulate that this is long-running operation
            yield return NodeStatus.Running;
        }
        else if (tickIndex % 5 == 0)
        {
            //simulate that condition is met
            yield return NodeStatus.Success;
        }
        else
        {
            yield return NodeStatus.Failure;
        }
    }
} 
```
Вот что будет если вызвать этот скрипт несколько раз
```
14:33:23.141 Hello, world! <-- very first tick, entry point of the script gets executed
14:33:23.144 Tick #1
14:33:23.146 Node Execute Script ticked with result Failure in 1183.88ms <- note that there was a compilation of the script on that tick, that is why it took more than a second

14:33:25.443 Tick #2
14:33:25.444 Node Execute Script ticked with result Failure in 1.15ms

14:33:26.894 Tick #3
14:33:26.894 Node Execute Script ticked with result Running in 0.57ms <- 3 is divisable by 3 so we return Running here

14:33:29.650 Tick #4
14:33:29.650 Node Execute Script ticked with result Failure in 0.46ms

14:33:31.650 Tick #5
14:33:31.650 Node Execute Script ticked with result Success in 0.41ms <- 5 is divisable by 5 so we return Success

14:33:35.013 Tick #6
14:33:35.013 Node Execute Script ticked with result Running in 0.70ms
```

Хорошим примером может быть использование, к примеру, [ImGui](/en/scripting/examples/basic/imgui-cursor) или EyeAuras OSD API для отрисовки чего-либо на экране - вы создаете окно на входе, а дальше на каждый тик выполняете отрисовку текущего состояния
или, как в моем случае из-за чего это и появилось - операция извлечения предмета из инвентаря довольно долгая и состоит из нескольких этапов. Это можно было бы реализовать через стандартные ноды Selector/Sequence, но дерево получалось слишком большим.
  
Теперь же можно закодить свою кастомную ноду, которая сама все откроет, переложит предметы и при этом дерево будет продолжать работать. При этом если в процессе перекладывания предмета вдруг возникнет какое-то событие, которое имеет больший вес - дерево автоматически передаст управление ему 
по сути теперь прямо в деревьях появились еще и [Корутины из Unity](https://docs.unity3d.com/6000.1/Documentation/Manual/coroutines.html) 

## Real-life example
Вот живая иллюстрация как это работает на практике. Задача - в рамках одной из веток логики добежать до NPC (MapDevice) и начать диалог его(кликнуть на него). 
1) Находим NPC в списке объектов вокруг
2) Проверяем насколько мы далеко от него
3) Если далеко - бежим к нему
4) Как только подбежали - открываем и ждем, пока появится окно диалога  

```csharp
  private IEnumerator<NodeStatus> Run()
{
    var mapDevice = GameController
        .Entities
        .Where(x => x.Type is EntityType.IngameIcon && x.IsTargetable && x.TryGetComponent<MinimapIcon>(out var minimapIcon) && minimapIcon.Name == "MapDevice")
        .FirstOrDefault();

    if (mapDevice == null)
    {
        Log.Warn("Map Device not found");
        yield return NodeStatus.Failure;
        yield break;
    }

    const float minDistanceToDevice = 20;
    if (mapDevice.DistancePlayer > minDistanceToDevice)
    {
        Log.Info($"Moving to {mapDevice.GridPos} from {Player.GridPosition}");
        PF.AddDestination(mapDevice.GridPos, PfDestinationType.Interact, minDistanceToDevice);

        while (mapDevice.DistancePlayer > minDistanceToDevice)
        {
            Log.Info($"Still moving to {mapDevice.GridPos} from {Player.GridPosition}, distance: {mapDevice.DistancePlayer}");
            yield return NodeStatus.Running; //while we're running return... Running
        }
    }
    else
    {
        Log.Info($"Player is close enough to map device, distance: {mapDevice.DistancePlayer}");
    }

    var center = CameraManager.WorldToScreen(mapDevice.BoundsCenterPos);
    SendInput.MouseClick(center.ToPoint());

    while (!AtlasManager.IsActive)
    {
        //wait until atlas is visible
        yield return NodeStatus.Running;
    }

    yield return NodeStatus.Success;
}
```