---
title: Всплывающие уведомления
description: Краткое руководство по всплывающим уведомлениям
published: true
date: 2025-03-23T22:21:57.666Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-06T10:06:21.149Z
---
# Уведомления через C# Script

Готовый пример можно импортировать отсюда: [https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb](https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb)

Чтобы показывать уведомления, можно использовать `C# Script` — для этого достаточно буквально нескольких строк кода. Подойдут разные библиотеки для вывода таких сообщений. В этом примере используется [Notification.Wpf](https://github.com/Platonenkov/Notification.Wpf) от [Alexander Platonenkov](https://github.com/Platonenkov).

## Показать уведомление из действия

Код — верхнеуровневый файл действия `C# Script` в работающем Windows-приложении EyeAuras с WPF `Application.Current` и живым UI dispatcher. Вход — строка `"test"`; после запуска библиотека должна показать всплывающее сообщение. Это WPF-окно сторонней библиотеки, а не системное уведомление Windows.

Исторический пакет `Notification.Wpf, 7.0.0` сохранён. XML пакета содержит конструктор менеджера и перегрузку Show для строки. Восстановление в EyeAuras и совместимость с установленным host здесь не проверены. [Текущий upstream](https://github.com/Platonenkov/Notification.Wpf) описывает уже другие версии; это не подтверждение запуска версии 7.0.0.

## Настройка

1. Создайте ауру.
2. Добавьте триггер `HotkeyIsActive` и назначьте на него удобную клавишу, например `F3` — она будет включать и выключать уведомление.
3. У триггера смените тип активации на `Click/Hold`.
4. Добавьте действие `C# Script` в `On Enter`.
5. Вставьте в него код ниже.
6. При нажатии `F3` в правом нижнем углу экрана появится уведомление.

```csharp
#r "nuget: Notification.Wpf, 7.0.0"
using Notification.Wpf.Controls;
using Notification.Wpf;

// Создание WPF-объекта и Show выполняются в UI dispatcher EyeAuras.
await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
{
    var notificationManager = new NotificationManager();
    notificationManager.Show("test");
});
```

![Notification Result](https://s3.eyeauras.net/media/2025/02/I0bceQwhw4GWyE3j.png)
![Other Notification Styles](https://s3.eyeauras.net/media/2025/02/all_styles.gif)
![Image Display](https://s3.eyeauras.net/media/2025/02/Image.gif)

`InvokeAsync` переносит создание и показ на UI-поток; завершение этого вызова означает выполнение запроса показа, а не закрытие уведомления. Токен скрипта в `Show` не передаётся, и завершение действия само по себе не привязывает уведомление к `ExecutionAnchors`. Длительность показа задаёт библиотека.


В [исходниках v7.0.0.0](https://github.com/Platonenkov/Notification.Wpf/blob/26ab7dae1328b345e7f557d5f7f6e687e01d5d20/Notification.Wpf/Base/NotificationManager.cs)
менеджер выбирает переданный dispatcher либо `Application.Current.Dispatcher`,
а вызов с другого потока ставит в очередь. По умолчанию области уведомлений
передаётся срок пять секунд. Окно и области хранятся в статическом состоянии
библиотеки; локальная переменная менеджера не является владельцем popup с `Dispose`.
Фактическое закрытие зависит и от UI; выполненный показ здесь не заявляется.
