---
title: Переводим мышь в центр экрана
description: 
published: true
date: 2024-02-24T00:47:44.678Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:47:33.928Z
---

# Перевести курсор в центр основного экрана

Выполним один вызов из верхнеуровневого файла действия `C# Script`. Нужен доступный настроенный симулятор ввода EyeAuras. Это перемещение настоящего курсора, в экранных координатах основного монитора, не в координатах клиентской области окна.

> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S202402240046520BBKcR6QKL07
{.is-info}

1. Создаем ауру
2. Кидаем в нее `HotkeyIsActive` и биндим на удобную кнопку (это будет наш вкл/выкл, в примере `F3`), меняем тип активации на `Click/Hold`
3. Добавляем в `On Enter` действие `C# Script`
4. Копипастим сам скрипт
5. При нажатии на `F3` курсор переведется в центр основного экрана

```csharp
using EyeAuras.Roxy.Api;
using PoeShared.Scaffolding;

var sendInputApi = GetService<ISendInputScriptingApi>(); // нужно для отправки ввода
sendInputApi.TargetWindow = null; // экранная точка, без преобразования относительно окна
var screenSize = System.Windows.Forms.SystemInformation.PrimaryMonitorSize; // берем размер основного экрана
Log.Info($"Primary monitor size: {screenSize}");

sendInputApi.MouseMoveTo(screenSize.Width / 2, screenSize.Height / 2); // переводим в центр
```

При `F3` курсор окажется в центре основного монитора, размеры которого напечатаны в журнале. Это не центр всего виртуального рабочего стола. `TargetWindow = null` существенен: ненулевое окно может быть активировано, а координаты преобразованы контроллером. Этот синхронный вызов не принимает токен отмены; получение сервиса не означает владение системным устройством ввода. Подробнее — [карта ввода](/ru/scripting/api/windows-subsystems/input-hooks-hotkeys).
