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

Скрипт рисует небольшую зелёную рамку вокруг курсора — так удобно проверять, где находится указатель. Он читает координаты мыши и двигает только рамку OSD. Сам курсор он не двигает и нажатий не отправляет.

Нужен настольный EyeAuras с модулем экранных оверлеев и Blazor/WebView2. Для первого раза держите курсор на основном мониторе: сейчас общее OSD-окно размещается именно там.

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

3. Нажмите **Run** и подвигайте мышью по основному монитору. Рамка идёт за указателем, её центр совпадает с прочитанным положением курсора.
4. Нажмите **Stop**. Цикл завершится, рамка исчезнет, а в журнале появится **Маркер курсора убран**.

| Настройка | Результат |
| --- | --- |
| `Size(10, 10)` | Размер маркера в экранной системе OSD. |
| `cursor.X - 5`, `cursor.Y - 5` | Переводит центр в левый верхний угол рамки 10×10. |
| `Background = Color.Transparent` | Середина прозрачная, видна только граница. Для заливки задайте цвет или используйте `WithBackground(Color.FromArgb(...))`. |
| `BorderThickness = 2`, `BorderColor = Color.Green` | Толщина и цвет рамки. |
| `Task.Delay(16, cancellationToken)` | Пауза между обновлениями с отменой. Ровно 60 кадров в секунду она не обещает. |

`Create()` создаёт свой промежуточный холст поверх общего экранного окна. `AddRectangle()` создаёт объект, которым владеет пример, и регистрирует его. При выходе из `try` сначала освобождается прямоугольник. Затем `Clear()` снимает оставшиеся регистрации холста, пока он ещё жив. Выход из внешнего блока освобождает сам canvas. `Remove` и `Clear` не заменяют освобождение объектов, а одно только освобождение canvas не заменяет эту последовательность.

`Cursor.Position` — экранные координаты, а не координаты клиентской области выбранного окна. Общий OSD использует основной монитор. Пример не обещает одинаковый результат на всех мониторах и при любом сочетании DPI. Если рамка смещена, сначала проверьте монитор и масштаб, а не прибавляйте оконное смещение наугад.

Чтобы рисовать такой же маркер в нативном кадре, возьмите [пример курсора ImGui](/ru/scripting/examples/basic/imgui-cursor). Там рамка описывается заново при каждой отрисовке, а не меняется объект холста. SDK и нативный контекст готовятся так, как описано в том примере.

<details>
<summary>Диагностика и синхронная пауза</summary>

Пока скрипт работает, после создания canvas можно вызвать `canvas.ShowDevTools()` и посмотреть его браузерное содержимое. Общее окно может остаться живым для других пользователей OSD, даже когда ваш маркер удалён.

Вместо `await Task.Delay(...)` в этом верхнеуровневом скрипте можно написать `Sleep(16)`. Это метод хоста, он учитывает токен запуска. В обычном C#-классе он не глобальный: передавайте зависимости и токен явно. Асинхронной паузе выше отдельный фоновый исполнитель не нужен.

Подробнее — [владение экранными объектами](/ru/scripting/api/osd/screen-overlay).

</details>
