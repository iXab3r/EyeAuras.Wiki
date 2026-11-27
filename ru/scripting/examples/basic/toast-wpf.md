---
title: Всплывающие уведомления
description: Как показать всплывающее уведомление из C#-скрипта.
published: true
date: 2025-03-23T22:21:57.666Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-06T10:06:21.149Z
---
# Показать короткое уведомление из скрипта

Скрипт показывает всплывающее сообщение с текстом **Пробный запуск завершён**, не открывая полноценный диалог. Его выводит библиотека **Notification.Wpf**. Это её собственное WPF-окно внутри настольного приложения, а не системное уведомление Windows.

Нужен EyeAuras на Windows с работающим WPF `Application.Current` и диспетчером потока интерфейса. Ещё должен восстанавливаться NuGet-пакет **Notification.Wpf 7.0.0**. Пример закреплён на этой версии, в другой версии API библиотеки может отличаться.

1. В тестовой ауре добавьте **C# Script** в **On Enter**. Для начала запускайте его вручную кнопкой **Run**.
2. Вставьте весь код в верхнеуровневый `Script.csx`. Директива `#r` восстанавливает пакет, а `using` подключает namespace.

```csharp
#r "nuget: Notification.Wpf, 7.0.0"
using System;
using Notification.Wpf;

cancellationToken.ThrowIfCancellationRequested();
await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
{
    var manager = new NotificationManager();
    manager.Show("Пробный запуск завершён", expirationTime: TimeSpan.FromSeconds(5));
});
```

3. Дождитесь, пока пакет восстановится и код скомпилируется, и нажмите **Run**. Появится уведомление с этим текстом. Библиотеке задан срок показа пять секунд.

![Пример текстового уведомления](https://s3.eyeauras.net/media/2025/02/I0bceQwhw4GWyE3j.png)

| Часть | Что можно изменить |
| --- | --- |
| Строка в `Show` | Текст уведомления. |
| `expirationTime` | Сколько показывать уведомление. |
| `Dispatcher.InvokeAsync` | Создаёт менеджер и показывает уведомление в UI-потоке WPF. `Task.Run` для этого не нужен. |
| `Notification.Wpf, 7.0.0` | Версия, на которой закреплён пример. |

Менеджер не `IDisposable` и отдельным уведомлением не владеет: окна и области уведомлений библиотека хранит в своём статическом состоянии. Завершение скрипта или **Stop** после показа уведомление не закрывают.

Если подпись должна быть видна всё время, пока выполняется условие ауры, берите [оверлей Text](/ru/overlays/text) и настройте его содержимое и видимость. Уведомление оставьте для разовых событий, например завершения работы.

<details>
<summary>Запуск горячей клавишей и другие варианты</summary>

Чтобы не открывать редактор, добавьте **Hotkey Is Active**, назначьте свободную клавишу, например `F3`, и выберите **Hold**. Когда аура становится активной, срабатывает **On Enter**. Отпустите клавишу — и ауру можно активировать снова. Каждое нажатие показывает новое уведомление, а не включает и выключает уже показанное.

Библиотека умеет показывать уведомления с разным оформлением и содержимым. На иллюстрациях из её примеров — варианты, которых вызов со строкой выше сам по себе не даёт:

![Варианты оформления Notification.Wpf](https://s3.eyeauras.net/media/2025/02/all_styles.gif)
![Уведомление с изображением](https://s3.eyeauras.net/media/2025/02/Image.gif)

[Исходники Notification.Wpf](https://github.com/Platonenkov/Notification.Wpf) автора [Alexander Platonenkov](https://github.com/Platonenkov), [менеджер закреплённой версии](https://github.com/Platonenkov/Notification.Wpf/blob/26ab7dae1328b345e7f557d5f7f6e687e01d5d20/Notification.Wpf/Base/NotificationManager.cs). Сохранён [исторический готовый пример](https://eu.eyeauras.net/share/S20250206100355L0RMN0j2bzvb).

</details>
