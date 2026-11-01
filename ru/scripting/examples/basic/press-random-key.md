---
title: Как нажать случайную клавишу
description: Как эмулировать нажатие случайной клавиши.
published: true
date: 2025-01-04T18:42:46.105Z
tags: ai-translated
editor: markdown
dateCreated: 2025-01-04T18:42:33.221Z
---
# Как нажать случайную клавишу

1. Создайте ауру.
2. Добавьте к ней `HotkeyIsActive` и привяжите его к удобной кнопке — это будет наш переключатель вкл/выкл. В примере используется `F3`. Затем измените тип активации на `Click/Hold`.
3. Добавьте действие `C# Script` в `On Enter`.
4. Скопируйте и вставьте сам скрипт.
5. Откройте приложение, которое должно получить ввод. При нажатии `F3` скрипт отправит одну из клавиш `1`, `2`, `4`, `5`, `A`, `D`.

```csharp
using EyeAuras.Roxy.Api;
using System.Windows.Input;

var randomKeys = new[] { Key.D1, Key.D2, Key.D4, Key.D5, Key.A, Key.D }; // list your random keys here
var input = GetService<ISendInputScriptingApi>();
input.TargetWindow = null; // стандартный Windows Input отправит клавишу активному приложению
input.KeyPress(randomKeys[System.Random.Shared.Next(randomKeys.Length)]);
```

При каждом входе в ауру выбирается одна клавиша и отправляется одно нажатие.
`KeyPress` синхронный и сам не получает токен запуска; задержка между нажатием
и отпусканием берётся из настроек API. `GetService` и другие
возможности хоста доступны в C# Script, а обычному классу сервис нужно передать
явно. Другие механизмы ввода выбирайте по [контракту SendInput](/ru/scripting/api/ISendInputScriptingApi).
