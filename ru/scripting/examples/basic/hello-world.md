---
title: Hello, world!
description: 
published: true
date: 2024-02-23T23:15:46.402Z
tags: 
editor: markdown
dateCreated: 2024-02-20T19:56:21.080Z
---

# Ббббаза - печатаем легендарный Hello, world
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240223231508UC4AdkJYNJjI
{.is-info}

## Создаем ауру
Ну тут уж без скриншота, сорян.

## Создаем действие C# Script
![](https://s3.eyeauras.net/media/wiki/scripting/examples/basic/hello-world/mz7CUzL.png)

## Печатаем сообщение из C# Script

Код вставляется прямо в действие `C# Script`, в верхнеуровневый файл скрипта. `Log` предоставляет EyeAuras; дополнительных пакетов и входных данных не нужно. После `Run` строка `Hello, world!` появится в `Event Log` этого действия. В обычном C# классе `Log` нужно передать отдельно.

В некоторых версиях свежесозданный скрипт уже содержит этот код:
```csharp
Log.Info("Hello, world!");
```
##  Нажимаем Run
![](https://s3.eyeauras.net/media/wiki/scripting/examples/basic/hello-world/VP8JnWk.png)

## Voila!
![](https://s3.eyeauras.net/media/wiki/scripting/examples/basic/hello-world/JeZXXU8.png)

Поздравляю, официально это был первый шаг к могучим скриптам будущего.

## Уууу, тыкать Run вручную не стильно
Чтобы было ну не настолько просто, давайте сделаем так, что наш скрипт будет вызываться только когда нажата какая-то кнопка, к примеру, пусть будет `F1`

## Докидываем в ауру триггер HotkeyIsActive
![](https://s3.eyeauras.net/media/wiki/scripting/examples/basic/hello-world/j7ma0e1.png)

## Переводим его в режим Click/Hold и указываем F1
![](https://s3.eyeauras.net/media/wiki/scripting/examples/basic/hello-world/s3eKrnp.png)

В текущем `HotkeyTracker` режим Hold устанавливает активность по KeyDown
и снимает по KeyUp. Click (режим Toggle в UI) переключает состояние на KeyUp.
Для действия в On Enter два отдельных нажатия с отпусканием в Hold дают два
входа; в Toggle второй цикл выключает состояние и не даёт второго On Enter.
Это описание переходов, не гарантия порядка выполнения долгих действий.

## Все!
Теперь при каждом нажатии на `F1` ваш скрипт будет печатать в `Event Log`. Само собой, что это не самое интересное, что мы можем делать, однако об этом в следующих примерах

[Реализация HotkeyTracker](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Wpf/UI/Hotkeys/HotkeyTracker.cs).
