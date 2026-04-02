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
5. При нажатии `F3` будет запущен `Notepad`.

```csharp
var randomKeys = new[] { Key.D1, Key.D2, Key.D4, Key.D5, Key.A, Key.D }; // list your random keys here
GetService<ISendInputUnstableScriptingApi>().KeyPress(randomKeys.PickRandom()); // press one of them
```