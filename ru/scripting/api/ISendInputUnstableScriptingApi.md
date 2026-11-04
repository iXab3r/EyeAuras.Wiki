---
title: Нестабильный API SendInput для скриптов
description: 
published: true
date: 2026-04-21T00:00:00.000Z
tags: user input, mouse actions, keyboard actions, scripting api, simulation, ai-translated
editor: markdown
dateCreated: 2024-02-23T21:58:16.489Z
---
# ISendInputUnstableScriptingApi

Старое имя API отправки ввода. В исходниках EyeAuras `20fd3d424d886f6c99b979536a148774d289d110` этот скрытый из обычного просмотра интерфейс только наследует `ISendInputScriptingApi` и не добавляет методов:

```csharp
namespace EyeAuras.Roxy.Api;

[System.ComponentModel.Browsable(false)]
public interface ISendInputUnstableScriptingApi : ISendInputScriptingApi
{
}
```

Для нового C# Script получайте основной интерфейс:

```csharp
using EyeAuras.Roxy.Api;
using System.Windows.Input;

var input = GetService<ISendInputScriptingApi>();
input.TargetWindow = null; // ввод в активное приложение
input.KeyPress(Key.F1);
```

Откройте нужное приложение и оставьте его активным перед запуском. При стандартном `Windows Input` скрипт отправит ему нажатие `F1`. Ненулевой `TargetWindow` у этого механизма запрашивает активацию окна; он не означает фоновую доставку. Выбор цели и механизма, задержки и операции мыши описаны в [ISendInputScriptingApi](/ru/scripting/api/ISendInputScriptingApi). Это API хоста EyeAuras; обычному C# классу передайте `input` явно.

[Исходное объявление старого имени](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Roxy.Shared/Api/ISendInputUnstableScriptingApi.cs). Состав интерфейса не подтверждает совместимость любого старого пакета с текущим хостом.
