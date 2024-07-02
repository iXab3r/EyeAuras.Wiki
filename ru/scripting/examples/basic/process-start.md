---
title: Как запустить игру/процесс
description: 
published: true
date: 2024-07-02T14:36:35.228Z
tags: 
editor: markdown
dateCreated: 2024-07-02T14:36:35.228Z
---

## Запускаем произвольную программу/игру
> Импортировать готовый пример можно отсюда https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL
{.is-info}

1. Создаем ауру
2. Кидаем в нее `HotkeyIsActive` и биндим на удобную кнопку (это будет наш вкл/выкл, в примере `F3`), меняем тип активации на `Click/Hold`
3. Добавляем в `On Enter` действие `C# Script`
4. Копипастим сам скрипт
5. При нажатии на `F3` запустится `Notepad`

```csharp
// можно использовать как короткое имя
Process.Start("notepad");
// так и полное
//Process.Start("C:/Windows/system32/notepad.exe");

// полная документация здесь - https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0
```