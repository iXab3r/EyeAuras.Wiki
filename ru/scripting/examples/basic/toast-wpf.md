---
title: Показываем всплывающее сообщение на экране
description: 
published: true
date: 2025-02-06T10:10:56.649Z
tags: 
editor: markdown
dateCreated: 2025-02-06T10:06:21.149Z
---

> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb
{.is-info}

Для вывода оповещений можно использовать C# скрипт с буквально несколькими строчками кода - доступно множество самых разных библиотек, которые умеют выводить такие сообщения, я для примера возьму https://github.com/Platonenkov/Notification.Wpf от [Александра Платоненкова](https://github.com/Platonenkov)

1. Создаем ауру
2. Кидаем в нее `HotkeyIsActive` и биндим на удобную кнопку (это будет наш вкл/выкл, в примере `F3`), меняем тип активации на `Click/Hold`
3. Добавляем в `On Enter` действие `C# Script`
4. Копипастим сам скрипт
5. При нажатии на `F3` будет выведено сообщение в правом нижнем углу экрана

```csharp
#r "nuget: Notification.Wpf, 7.0.0"
using Notification.Wpf.Controls;
using Notification.Wpf;

var notificationManager = new NotificationManager();
notificationManager.Show("test");
```

![Результат работы](https://s3.eyeauras.net/media/2025/02/I0bceQwhw4GWyE3j.png)
![Примеры других сообщений](https://s3.eyeauras.net/media/2025/02/all_styles.gif)
![Вывод картинки](https://s3.eyeauras.net/media/2025/02/Image.gif)