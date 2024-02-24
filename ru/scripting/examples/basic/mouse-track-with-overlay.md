---
title: Отслеживаем мышь
description: 
published: true
date: 2024-02-24T00:08:49.173Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:08:49.173Z
---

## Выводим оверлей возле курсора
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX
{.is-info}

1. Создаем ауру
2. Кидаем в нее HotkeyIsActive и биндим на удобную кнопку (это будет наш вкл/выкл). В примере `F1`
3. Добавляем в **WhileActive** действие **C# Script**
4. Копипастим сам скрипт
5. Теперь когда наша аура включена, рядом с курсором будет отрисовываться небольшой цветной квадрат

![](https://i.imgur.com/FSSKzJp.gif)

```csharp
var sendInputApi = GetService<ISendInputUnstableScriptingApi>(); // для получения координат курсора
var overlayApi = GetService<IOnScreenCanvasScriptingApi>(); // для отрисовки оверлеев

var canvas = overlayApi.Create() // создаем "полотно", на котором будет отрисовывать оверлей
    .AddTo(ExecutionAnchors); // указываем, что при завершении скрипта полотно нужно очистить

var rectangle = canvas
    .AddRectangle() // добавляем прямоугольник
    .WithBorderColor(Color.Azure) // цвет
    .WithBorderThickness(1) // толщина границ
    .WithSize(new Size(32, 32)); // ну и размер

Log.Info("Starting tracking");

// Важно! Не while(true), а именно в таком виде
// Данный код будет выполняться в цикле до тех пор, пока скрипт не будет остановлен
// а остановлен он будет либо когда окно EyeAuras станет активным, либо по хоткею 
while (!cancellationToken.IsCancellationRequested){
    // получаем координаты курсора и указываем, что оверлей должен быть рядом
    rectangle.Location = sendInputApi.CursorPosition;
}

// сюда мы попадем когда скрипту будет отдана команда на завершение
Log.Info("Completed tracking");
```

> Само собой, оверлей может отрисовывать не только квадраты. Это может быть что угодно - текст, картинка, да хоть видео
{.is-info}

