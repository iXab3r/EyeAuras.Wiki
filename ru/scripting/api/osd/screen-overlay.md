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

Интерактивный выбор объектов вынесен в `osd/selection.md`.

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
- Для настоящих окон используйте `windows-subsystems/blazor-windows.md`.
- Для UI на ImGui используйте `nuget/imgui-sdk.md`.

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

- `osd/selection.md`
- `windows-subsystems/blazor-windows.md`
- `nuget/imgui-sdk.md`
- `computer-vision/images.md`