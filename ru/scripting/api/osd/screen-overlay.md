---
title: AI OSD и экранные оверлеи
description: Карта API Blazor для экранных оверлеев и OSD canvas.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, osd, overlay, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Screen Overlay / Blazor OSD — карта навигации

Краткая карта по отрисовке аннотаций поверх экрана через overlay-канвас на базе Blazor: прямоугольники, HTML-метки, Razor-компоненты и CV debug boxes.

Интерактивный выбор объектов вынесен в [osd/selection.md](/ru/scripting/api/osd/selection).

## Что обычно нужно

- Нарисовать прямоугольник вокруг области.
- Показать HTML-метку или badge поверх рабочего стола.
- Отрисовать Razor-компонент как плавающую аннотацию.
- Показать bounding boxes для CV/ML.
- Открыть DevTools для overlay WebView.

## Как это устроено

- `IOnScreenService` создает canvases с областью владения по owner.
- `IOnScreenCanvasScriptingApi` — фабрика canvas для скриптов.
- `IOnScreenCanvas` управляет экземплярами `IOnScreenObject` по `OnScreenObjectId`.
- Объекты используют координаты экрана рабочего стола.
- Текущие контракты отображаемых объектов — `IOnScreenRectangle`, `IOnScreenHtml` и `IOnScreenRazor`.
- Внутри renderer использует прозрачное click-through окно Blazor/WebView; снаружи нужно работать через canvas/object API.

## Показать рамку на пять секунд

Верхнеуровневый C# Script в desktop EyeAuras получает фабрику canvas из
скриптового контейнера. UI-модуль регистрирует `IOnScreenService`, а scripting-модуль —
`IOnScreenCanvasScriptingApi`. Нужны сборки `EyeAuras.Shared` и
`EyeAuras.Blazor.Controls`, доступные в этом хосте.

```csharp
using System;
using System.Drawing;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    var api = GetService<IOnScreenCanvasScriptingApi>();
    using var canvas = api.Create();
    try
    {
        using var rectangle = canvas.AddRectangle();
        rectangle.Location = new Point(100, 100);
        rectangle.Size = new Size(240, 120);
        rectangle.Background = Color.Transparent;
        rectangle.BorderColor = Color.Red;
        rectangle.BorderThickness = 2;
        await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
    }
    finally
    {
        canvas.Clear();
    }
}
```

Появится прозрачная рамка с красной границей в экранных координатах. При
выходе или отмене освобождается объект, его регистрация удаляется, затем
очищается и освобождается canvas. Для кода приложения аналогичная точка
получения — внедрённый `IOnScreenService.Create()`, а не глобальный `GetService`.
Реализация общего окна выставляет `PrimaryScreen.Bounds`; наличие экранных
координат в API не гарантирует отображения на всех мониторах или одинакового DPI.

## Добавить объект и затем убрать его

`AddRectangle()` без аргументов создаёт **и регистрирует** объект. Перегрузка
`AddRectangle(builder)` только создаёт объект и вызывает builder: если тот
не регистрирует объект, вызовите `canvas.AddOrUpdate(rectangle)` сами.
`AddHtmlObject()` и `AddRazor<T>(dataContext)` сразу добавляют объект.
Простой `new` также требует `AddOrUpdate`.

`Remove(object)` и `Clear()` убирают записи с canvas, но не заменяют `Dispose`
принадлежащих вам объектов. Фабричные helpers добавляют удаление с canvas в
ресурсы объекта. Не полагайтесь на освобождение всех объектов при одном
`canvas.Dispose()`; завершайте своё владение явно.

`IOnScreenHtml.Html` — доверенный HTML, а не текст с автоматическим экранированием.
Для Razor нужен реальный компонент и доступные ему зависимости; члены верхнего
уровня скрипта не становятся переменными компонента. Размер, видимость и
позицию задавайте самому объекту. Контракт здесь — EyeAuras `20fd3d4`.

## Показать подпись до Stop

HTML-объект подходит для короткой подписи. Пример C# Script создаёт собственный
canvas и размещает подпись рядом с известной экранной точкой:

```csharp
using System;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        using var label = canvas.AddHtmlObject();
        label.Location = new Point(320, 180);
        label.Size = new Size(180, 36);
        label.Html = "<div style='color:white;background:#222;padding:4px'>Найден объект</div>";
        label.IsVisible = true;
        try { await Task.Delay(Timeout.Infinite, cancellationToken); }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    }
    finally { canvas.Clear(); }
}
```

`Location` — положение в экранных координатах, а не координаты внутри окна
или CV-кадра. Для переменного пользовательского текста сначала примените
`System.Net.WebUtility.HtmlEncode`, затем вставляйте его в доверенную
обёртку. Не присваивайте произвольную разметку из внешнего источника.

## Обновлять один объект и временно скрывать его

В следующем отдельном C# Script одна рамка меняет положение. Четыре шага она
скрыта; затем появляется снова. Это модель обновлений, поступающих от вашего
источника, а не подписка на несуществующий глобальный поток прямоугольников:

```csharp
using System.Drawing;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;
using EyeAuras.Blazor.Controls.ScreenOverlay;

{
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    try
    {
        using var box = canvas.AddRectangle();
        box.Size = new Size(100, 60);
        box.Background = Color.Transparent;
        box.BorderColor = Color.Lime;
        box.BorderThickness = 2;
        for (var step = 0; step < 12; step++)
        {
            box.Location = new Point(100 + step * 10, 120);
            box.IsVisible = step < 4 || step >= 8;
            await Task.Delay(250, cancellationToken);
        }
    }
    finally { canvas.Clear(); }
}
```

В реальном обработчике меняйте свойства сохранённого `box`, а не вызывайте
`AddRectangle()` на каждом обновлении. Его `Id` остаётся тем же.
`IsVisible = false` сохраняет объект для следующего показа, `Dispose`
окончательно удаляет регистрацию, а `Clear()` касается только этого canvas.
Не заменяйте свою область владения глобальным canvas другого скрипта.

## Основные API

- `IOnScreenService` — runtime-фабрика canvas и хук для DevTools.
- `IOnScreenCanvasScriptingApi` — фабрика canvas для скриптов.
- `IOnScreenCanvas` — `ObjectsById`, `AddOrUpdate`, `Remove`, `Clear`, `ShowDevTools`.
- `IOnScreenObject` — `Id`, `Location`, `Size`, `Opacity`, `IsVisible`.
- `IOnScreenRectangle` — `Background`, `BorderColor`, `BorderThickness`.
- `IOnScreenHtml` — сырой доверенный `Html`.
- `IOnScreenRazor` — `ViewType` и `DataContext`.
- `OnScreenCanvasExtensions` — `AddRectangle`, `AddHtmlObject`, `AddRazor<T>`.

## Что предпочтительно

- Для overlay, которыми владеет скрипт, используйте `IOnScreenCanvasScriptingApi`.
- Для кода приложения и runtime-логики используйте `IOnScreenService`.
- Для встроенных объектов используйте `AddRectangle`, `AddHtmlObject` и `AddRazor<T>`.
- Для очистки предпочитайте корректно освобождать объекты и canvas через dispose.
- Для настоящих окон используйте [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows).
- Для UI на ImGui используйте [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk).

## Чего избегать

- Не создавайте собственные прозрачные WebView-окна, если нужны только простые аннотации.
- Не передавайте недоверенный HTML в `IOnScreenHtml`.
- Не используйте screen overlay как input picker.

## Опорные термины для поиска

- `IOnScreenCanvas`, `IOnScreenCanvasScriptingApi`, `IOnScreenService`,
  `IOnScreenObject`, `IOnScreenRectangle`, `IOnScreenHtml`,
  `IOnScreenRazor`, `OnScreenCanvasExtensions`, `AddRectangle`,
  `AddHtmlObject`, `AddRazor`, `OnScreenOverlayComponent`.

## Синонимы для поиска

- screen overlay
- Blazor OSD
- desktop overlay
- click-through overlay
- bounding box overlay
- debug overlay
- HTML overlay
- Razor overlay
- screen annotation

## Смежные карты

- [osd/selection.md](/ru/scripting/api/osd/selection)
- [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows)
- [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk)
- [computer-vision/images.md](/ru/scripting/api/computer-vision/images)
