---
title: Интерфейс IBlazorWindow
description: Интерфейс для окон Blazor
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-07T20:56:27.448Z
---
# Управление Blazor-окном

`PoeShared.Blazor.Wpf.IBlazorWindow` размещает Razor-компонент в нативном окне
с WebView2. В срезе PoeEye `0e02c98` он наследует `INativeWindow`, а тот —
`IBlazorWindowController`, `IBlazorWindowNativeController` и
`IDisposableReactiveObject`. Полные сигнатуры сверяйте с SDK/XML своей версии.

## Открыть окно, изменить размер и освободить его

В desktop-проекте C# Script создайте `WindowBody.razor`:

```razor
@namespace MyScript
<h3>Окно готово</h3>
```

Затем выполните верхнеуровневый код. `GetService` и `cancellationToken`
предоставляет скриптовый хост; в обычный класс передайте dialog API явно.
UI-модуль приложения регистрирует API и фабрику окна.

```csharp
using System;
using System.Threading.Tasks;
using EyeAuras.Shared.Scripting;

var dialogs = GetService<IDialogWindowUnstableScriptingApi>();
using var window = dialogs.CreateWindow<MyScript.WindowBody>();
window.Title = "Моё окно";
window.Width = 480;
window.Height = 320;
window.Show();
await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
window.Width = 640;
await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
window.Close();
```

Окно показывается немодально, через пять секунд получает новую ширину, затем
закрывается. `using` завершает владение и при отмене ожидания. Свойства и команды
передаются на dispatcher окна через очередь; возврат из `Show()` не означает,
что WebView уже закончил загрузку. Для модального сценария используйте
`ShowDialog(cancellationToken)` и сохраняйте окно живым до возврата.

## Настроить содержимое и внешний вид

| Задача | Свойства и типы |
|---|---|
| Выбрать компонент и модель | `ViewType`, `ViewTypeForTitleBar` — `Type`; `DataContext` — `object` |
| Подключить зависимости и файлы | `Container` — `IUnityContainer`; `AdditionalFiles` — `ImmutableArray<IFileInfo>`; `AdditionalFileProvider` — `IFileProvider` |
| Размер и положение | `Left`, `Top`, `Width`, `Height`, `MinWidth`, `MinHeight`, `MaxWidth`, `MaxHeight` — `int` |
| Цвет и рамка | `BackgroundColor`, `BorderColor` — `System.Windows.Media.Color`; `Padding`, `BorderThickness` — `System.Windows.Thickness` |
| Поведение | `TitleBarDisplayMode`, `ResizeMode`, `WindowState`; `Topmost`, `NoActivate`, `IsClickThrough`, `ShowInTaskbar` |

`DataContext` — действующее свойство. `ViewDataContext` помечено `Obsolete` и
перенаправляет к нему, несмотря на противоречивое старое XML-описание.
`ContentFactory` для произвольного WPF-содержимого здесь не поддерживается:
назначайте `ViewType`. Создание нативного окна ленивое; параметры прозрачности
и подавления активации задавайте до создания handle, которое может произойти
раньше первого показа.

## События, координаты и ресурсы

`WhenLoaded`, `WhenClosed`, `WhenClosing`, события клавиатуры/мыши и их
preview-варианты относятся к конкретному окну. Подпиской владеет вызывающий код:
храните её в `using` или ресурсах своего компонента. `WhenClosing` передаёт
`CancelEventArgs`; отмена закрытия и освобождение объекта — разные операции.
`Hide()` меняет видимость, не завершайте им владение ресурсом.

`GetWindowHandle()` возвращает HWND, а `GetWindowRect` / `SetWindowRect`,
`SetWindowSize`, `SetWindowPos` используют `System.Drawing.Rectangle`, `Size`
и `Point`. Это нативная геометрия окна; не подменяйте ею координаты DOM или
области CV без преобразования. Поведение DPI и нескольких мониторов нужно
проверять в целевом окружении.

`RegisterFileProvider` возвращает регистрацию `IDisposable`: освобождайте её,
когда источник файлов больше не нужен. `EnableDragMove` тоже возвращает ресурс
для остановки перетаскивания. `ShowDevTools` открывает инструменты WebView.
`WaitForIdle(timeout)` ждёт очередь окна, а не загрузку всех сетевых ресурсов;
нулевой timeout в WPF-реализации означает ожидание без ограничения.

Полный пример с моделью и ожиданием немодального окна до крестика или Stop —
в [dialog API](IDialogWindowUnstableScriptingApi). `Show()` и добавление окна
в anchors сами по себе не удерживают текущий Run открытым.
Выбор поверхности — в [карте Blazor Windows](windows-subsystems/blazor-windows).
Для экранных аннотаций есть [OSD canvas](osd/screen-overlay).
