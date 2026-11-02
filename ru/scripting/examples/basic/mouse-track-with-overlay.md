---
title: Отслеживаем мышь
description: 
published: true
date: 2024-02-24T00:08:49.173Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:08:49.173Z
---

# Выводим оверлей возле курсора
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240224000701ZxH9BwnuQbRX
{.is-info}

1. Создаем ауру
2. Кидаем в нее HotkeyIsActive и биндим на удобную кнопку (это будет наш вкл/выкл). В примере `F1`
3. Добавляем в **WhileActive** действие **C# Script**
4. Копипастим сам скрипт
5. Теперь когда наша аура включена, рядом с курсором будет отрисовываться небольшой цветной квадрат

![](https://i.imgur.com/FSSKzJp.gif)

Это верхнеуровневый скрипт EyeAuras с зарегистрированными Roxy и OSD.
В стандартном `Windows Input` чтение `CursorPosition` даёт экранную точку;
этот пример не отправляет ввод. При остановке или ошибке сначала освобождается
прямоугольник, затем очищается и освобождается его canvas. Не полагайтесь
только на время жизни canvas для удаления детей. Само общее окно может
оставаться у других скриптов. [Контракт OSD](/ru/scripting/api/osd/screen-overlay)
также описывает ограничения основного монитора и DPI. Обычному C# классу
эти сервисы и токен нужно передать явно.

```csharp
using System.Drawing;
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    var sendInputApi = GetService<ISendInputScriptingApi>();
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        using var rectangle = canvas.AddRectangle();
        rectangle.BorderColor = Color.Azure;
        rectangle.BorderThickness = 1;
        rectangle.Size = new Size(32, 32);

        Log.Info("Starting tracking");
        while (!cancellationToken.IsCancellationRequested)
        {
            rectangle.Location = sendInputApi.CursorPosition;
            Sleep(16); // ограничиваем частоту обновления и учитываем остановку
        }
    }
    finally
    {
        canvas.Clear();
        Log.Info("Completed tracking");
    }
}
```

> Само собой, оверлей может отрисовывать не только квадраты. Это может быть что угодно - текст, картинка, да хоть видео
{.is-info}
