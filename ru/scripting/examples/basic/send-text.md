---
title: Печатаем текст
description: 
published: true
date: 2024-02-24T00:41:30.125Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:41:30.125Z
---

## Печатаем текст
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240224004118uKKy4R0wIpLd
{.is-info}

1. Создаем ауру
2. Кидаем в нее `HotkeyIsActive` и биндим на удобную кнопку (это будет наш вкл/выкл, в примере `F2`), меняем тип активации на `Click/Hold`
3. Добавляем в `On Enter` действие `C# Script`
4. Копипастим сам скрипт
5. При нажатии на `F2` напечатается несколько строк текста

![](https://i.imgur.com/mwIxxsL.gif)

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); 
sendInputApi.Text("Hello, world!"); // печатаем со стандартным интервалом (рандом, 1-5мс)

sendInputApi.KeyPressDelay = new RandomInteger(5, 15); //меняем интервал на 5-15мс
sendInputApi.Text("\nthis one is a bit slower"); 

sendInputApi.Text("\nand this one is very slow!", delayMs: 30); //печатаем с интервалом по 30мс
```

> В примере в начале строк указан спец-символ `\n`, это символ перевода строки
{.is-info}

