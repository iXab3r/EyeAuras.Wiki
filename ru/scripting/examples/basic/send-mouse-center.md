---
title: Переводим мышь в центр экрана
description: 
published: true
date: 2024-02-24T00:47:44.678Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:47:33.928Z
---

> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S202402240046520BBKcR6QKL07
{.is-info}

1. Создаем ауру
2. Кидаем в нее `HotkeyIsActive` и биндим на удобную кнопку (это будет наш вкл/выкл, в примере `F3`), меняем тип активации на `Click/Hold`
3. Добавляем в `On Enter` действие `C# Script`
4. Копипастим сам скрипт
5. При нажатии на `F3` курсор переведется в центр основного экрана

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); // нужно для отправки ввода
var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize; // берем размер основного экрана
Log.Info($"Primary monitor size: {screenSize}");

sendInputApi.MouseMoveTo(screenSize.Width / 2, screenSize.Height / 2); // переводим в центр
```

