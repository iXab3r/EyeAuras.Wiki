---
title: Переводим мышь в центр экрана
description: 
published: true
date: 2024-02-24T00:47:44.678Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:47:33.928Z
---

# Один раз переместить курсор в центр основного экрана

По нажатию `F3` скрипт находит середину основного монитора и ставит туда настоящий курсор.

Нужен настольный EyeAuras с доступным `Windows Input`. Можно [импортировать исходный пример](https://eu.eyeauras.net/share/S202402240046520BBKcR6QKL07) или собрать его вручную:

1. Создайте ауру и добавьте [Hotkey Is Active](/ru/triggers/hotkey-is-active).
2. Задайте `F3`, режим `Hold`. Добавьте действие `C# Script` в `On Enter`.
3. Вставьте весь код в `Script.csx`:

```csharp
using EyeAuras.Roxy.Api;
using PoeShared.Scaffolding;

var sendInputApi = GetService<ISendInputScriptingApi>(); // нужно для отправки ввода
sendInputApi.InputSimulatorId = "Windows Input";
sendInputApi.TargetWindow = null; // экранная точка, без преобразования относительно окна
var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize; // берем размер основного экрана
Log.Info($"Primary monitor size: {screenSize}");

cancellationToken.ThrowIfCancellationRequested();
sendInputApi.MouseMoveTo(screenSize.Width / 2, screenSize.Height / 2); // переводим в центр
```

4. Нажмите и отпустите `F3`. В журнале появится размер основного монитора, а курсор встанет в его центр.

| Выбор | Значение для примера |
| --- | --- |
| `InputSimulatorId` | `Windows Input`. Если этот механизм недоступен, вы получите ошибку, а не перемещение. |
| `TargetWindow` | `null`: точка уже задана в координатах экрана, привязка к окну не нужна. |
| `PrimaryMonitorSize` | Размер только основного монитора. Его середина — не середина всего виртуального рабочего стола. |
| `MouseMoveTo` | Абсолютное положение. `MouseMoveBy` сдвигал бы курсор от текущего положения. |

Если точку даёт поиск, начните с [примера Image Search](/ru/scripting/examples/basic/image-search). Там отдельно показаны результат относительно окна и перевод локальной рамки в экранную. Перед отправкой точки выберите подходящую [систему координат](/ru/features/coordinate-system).

Не подставляйте сюда размер окна. Если `TargetWindow` не `null`, стандартный контроллер активирует окно и прибавляет начало его `DwmFrameBounds`, а это не начало клиентской области.

Сам вызов синхронный: токен Run он не принимает и подтверждения от приложения не возвращает. Сервис берётся из контекста скрипта, освобождать его не нужно. `GetService`, `Log` и `cancellationToken` доступны только в верхнеуровневом скрипте EyeAuras.

В режиме `Toggle` второе нажатие выключило бы ауру, и нового `On Enter` не было бы. Поэтому здесь выбран `Hold`. Как выбирать координаты и механизм ввода — в [карте ввода](/ru/scripting/api/windows-subsystems/input-hooks-hotkeys).
