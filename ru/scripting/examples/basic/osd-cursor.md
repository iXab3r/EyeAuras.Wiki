---
title: OSD-отрисовка курсора
description: Отрисовка курсора в OSD
published: true
date: 2025-03-31T18:03:18.405Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-31T18:02:42.036Z
---
# Нарисовать рамку вокруг текущего курсора

Для проверки положения указателя можно показать небольшой экранный маркер. Скрипт читает координаты мыши и передвигает только зелёную рамку OSD. Сам курсор он не двигает и нажатий не отправляет.

Нужен настольный EyeAuras с модулем экранных оверлеев и Blazor/WebView2. Для первого опыта держите курсор на основном мониторе: текущая реализация общего OSD-окна размещает его именно там.

1. Создайте свою тестовую ауру и добавьте действие **C# Script**.
2. Вставьте весь код в верхнеуровневый `Script.csx`:

```csharp
using System;
using System.Drawing;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        using var cursorBox = canvas.AddRectangle();
        cursorBox.Size = new Size(10, 10);
        cursorBox.Background = Color.Transparent;
        cursorBox.BorderThickness = 2;
        cursorBox.BorderColor = Color.Green;

        while (!cancellationToken.IsCancellationRequested)
        {
            var cursor = System.Windows.Forms.Cursor.Position;
            cursorBox.Location = new Point(cursor.X - 5, cursor.Y - 5);
            await Task.Delay(16, cancellationToken);
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
    }
    finally
    {
        canvas.Clear();
        Log.Info("Маркер курсора убран");
    }
}
```

3. Нажмите **Run**, затем перемещайте мышь обычным способом по основному монитору. Рамка следует за указателем, её центр совпадает с прочитанным положением курсора.
4. Нажмите **Stop**. Цикл завершится, рамка будет удалена, в журнал попадёт **Маркер курсора убран**.

| Настройка | Результат |
| --- | --- |
| `Size(10, 10)` | Размер маркера в экранной системе OSD. |
| `cursor.X - 5`, `cursor.Y - 5` | Переводит точку центра в левый верхний угол рамки размером 10×10. |
| `Background = Color.Transparent` | Оставляет середину прозрачной; видна только граница. Для заливки можно задать цвет или использовать `WithBackground(Color.FromArgb(...))`. |
| `BorderThickness = 2`, `BorderColor = Color.Green` | Толщина и цвет рамки. |
| `Task.Delay(16, cancellationToken)` | Пауза между обновлениями с отменой. Это не обещание ровно 60 кадров в секунду. |

`Create()` создаёт собственный промежуточный холст поверх общего экранного окна. `AddRectangle()` создаёт принадлежащий примеру объект и регистрирует его. При выходе из `try` сначала освобождается прямоугольник, затем `Clear()` снимает оставшиеся регистрации этого холста, пока он ещё жив; выход из внешнего блока освобождает сам canvas. `Remove`/`Clear` не заменяют освобождение объектов, а одно освобождение canvas не должно подменять эту последовательность.

Координаты `Cursor.Position` экранные, не относительно клиентской области выбранного окна. Общий OSD использует основной монитор; пример не обещает одинаковый результат на всех мониторах и при любой комбинации DPI. Если рамка смещена, сначала сравните монитор и масштаб, не добавляйте наугад оконное смещение.

<details>
<summary>Диагностика и синхронная пауза</summary>

Во время работы скрипта после создания canvas можно вызвать `canvas.ShowDevTools()`, чтобы посмотреть его браузерное содержимое. Общее окно может оставаться живым для других пользователей OSD даже после удаления своего маркера.

Вместо `await Task.Delay(...)` в этом верхнеуровневом скрипте допустим `Sleep(16)`: это метод хоста, учитывающий токен запуска. Для обычного C# класса он не является глобальным; передавайте зависимости и токен явно. Асинхронная пауза выше позволяет ожидать цикл без отдельного фонового исполнителя.

Подробнее — [владение экранными объектами](/ru/scripting/api/osd/screen-overlay).

</details>
