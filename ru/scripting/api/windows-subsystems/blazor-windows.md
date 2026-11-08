---
title: AI Windows — окна Blazor
description: AI-ориентированная карта API для оконного фреймворка Blazor и хостинга окон.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, windows, blazor, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта по Blazor Windows

Справочная карта по нативным окнам на Blazor, хостам WebView2, диалоговым окнам,
разрешению Razor view, кастомным title bar и автоматизации окон.

Для desktop-аннотаций с click-through используйте [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay), а для
опциональных ImGui-окон — [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk).

## Типовые задачи

- Открыть диалоговое окно на Razor/Blazor, которым владеет скрипт.
- Встроить Razor-компонент в нативное окно.
- Понять, чем `C# Overlay` отличается от Blazor-окна, созданного скриптом.
- Настроить размер, позицию, owner, прозрачность, topmost, no-activate или
  click-through поведение.
- Получить доступ к родительскому окну изнутри Razor-компонента.
- Зарегистрировать или разрешить Razor view по DataContext.
- Открыть WebView DevTools.
- Подгрузить CSS/JavaScript/assets в размещённый WebView.
- Использовать реактивные Razor-компоненты для переключателей и UI, доступного
  из скрипта.
- Открывать сложные окна редакторов и инструментов из большого script app.

## Как это устроено

- `IBlazorWindow` — нативное WPF/WinForms-окно, которое хостит Blazor-контент.
- `ViewType` — тип Razor-компонента.
- `DataContext` передаётся в размещённый view.
- `IBlazorWindowController` управляет состоянием окна и операциями с ним.
- `IBlazorWindowNativeController` отвечает за native handle и операции с
  прямоугольником окна.
- `IBlazorWindowAccessor` даёт доступ к родительскому окну изнутри компонента.
- `BlazorContentPresenter` разрешает динамический контент компонента.
- WebView2 — встроенный браузер, который рендерит Razor/HTML/CSS/JS-поверхность.
- `C# Overlay` — это заранее настроенная Blazor-поверхность, размещённая
  скриптом и управляемая настройками overlay у ауры.
- Blazor-окно, созданное скриптом, открывается явно через код скрипта или app.
- Blazor windows — это нативные окна; для click-through-аннотаций поверх экрана
  используйте карты OSD/screen-overlay.

## Быстро открыть своё окно

Для desktop C# Script создайте файл `HelloWindow.razor`:

```razor
@namespace MyScript
<h3>Моё окно</h3>
```

В верхнеуровневом коде скрипта получите API, зарегистрированный UI-модулем:

```csharp
using EyeAuras.Shared.Scripting;

{
    var dialogs = GetService<IDialogWindowUnstableScriptingApi>();
    using var window = dialogs.CreateWindow<MyScript.HelloWindow>();
    window.Title = "Пример";
    window.Width = 480;
    window.Height = 320;
    window.ShowDialog(cancellationToken);
}
```

Появится нативное окно с Razor-содержимым, скрипт продолжится после закрытия
или обработки отмены. Созданное окно добавляется в ресурсы dialog API, а
`using` явно завершает владение. `CreateWindow` устанавливает `AutoOwner = false`:
не считайте, что другое окно приложения автоматически стало владельцем.
Для `Show()` сохраняйте объект живым после вызова. WPF-реализация сериализует
изменения через dispatcher окна; возврат из `Show` не подтверждает готовность DOM.

В срезе PoeEye `0e02c98` `IBlazorWindow` наследует `INativeWindow`.
Используйте `DataContext`, а не устаревшее `ViewDataContext`; режим заголовка —
`TitleBarDisplayMode`, не старые `ShowTitleBar` / `ShowIconOnTitleBar`.
Свойства цветов окна — WPF `Color`, размеры — `int`. Развёрнутые операции и
события — в [IBlazorWindow](../IBlazorWindow), детали фабрики — в
[dialog API](../IDialogWindowUnstableScriptingApi).

## Открыть нативный выбор файла из Razor

Диалог файла — отдельная операция, не `CreateWindow<T>`. В компоненте используйте
обёртку, зарегистрированную desktop Blazor-хостом:

```razor
@using EyeAuras.Blazor.Shared.Services
@inject IBlazorOpenFileDialog OpenFileDialog

<button @onclick="PickFile">Выбрать файл</button>
<p>@selectedPath</p>

@code {
    private string selectedPath;

    private async Task PickFile()
    {
        var file = await OpenFileDialog.ShowDialog();
        selectedPath = file?.FullName;
    }
}
```

После выбора путь появится под кнопкой. Обёртка сама вызывает нативный диалог
на WPF UI scheduler. Для сохранения и папок есть `IBlazorSaveFileDialog` и
`IBlazorFolderBrowserDialog`. При прямом вызове нативного диалога нужен явный
переход через UI scheduler; `Task.Run(() => dialog.ShowDialog())` для этого
не подходит. Обычный Blazor-обработчик после `await` обновляет UI; в компонентах
на базе `BlazorReactiveComponent` внешние изменения проводите через `Refresh(tag)`.

## Основные API

Для немодального окна с моделью есть [полный пример dialog API](../IDialogWindowUnstableScriptingApi):
обычный `.cs`-класс, типизированный `DataContext` в Razor и ожидание `WhenClosed`
с токеном текущего запуска. Добавление окна в anchors задаёт очистку, но не
заменяет это ожидание. `ShowDialog` ждёт внутри вызова; `Show()` — нет.

- `IBlazorWindow` — основной контракт окна; `Show`, `ShowDialog`, `Close`,
  `ShowDevTools`, `ViewType`, `DataContext`, `Container`.
- `IBlazorWindowController` — свойства внешнего вида и поведения окна.
- `IBlazorWindowNativeController` — `GetWindowHandle`, `GetWindowRect`,
  `SetWindowRect`.
- `IDialogWindowUnstableScriptingApi` — script-facing helper для диалоговых
  окон.
- `IBlazorWindowAccessor` — внедряемый accessor к родительскому окну.
- `IBlazorViewRepository`, `IBlazorViewRegistrator`, `BlazorViewAttribute` —
  разрешение view по DataContext.
- `BlazorReactiveComponent` / `BlazorReactiveComponent<T>` — общая база для
  реактивных Razor-компонентов.
- `IJsPoeBlazorUtils.LoadCss(...)` — загрузка CSS в WebView во время выполнения.
- `IJsPoeBlazorUtils.LoadScript(...)` — загрузка обычного JavaScript в WebView
  во время выполнения.
- `HeadContent` — декларативный способ Blazor добавить CSS и содержимое в head.
- `ToggleButton` — переиспользуемый двухсостоянийный Blazor-контрол кнопки из
  PoeShared.
- `ScriptBlazorWindowConfigurator` — точка интеграции script-window, которая
  подключает file providers/resources скрипта к окнам.

## Практические моменты

- Файлы Razor-компонентов — это обычные файлы проекта, и у них может быть
  `.razor.cs` code-behind.
- Для окон, создаваемых скриптом, проще всего использовать public-классы
  Razor-компонентов.
- Компоненты должны использовать dependency injection, parameters и
  `DataContext`; члены верхнеуровневого script host не являются глобальными
  переменными компонента.
- `DataContext` — основной способ передать view-model или service object в
  размещённый компонент.
- `IBlazorWindowAccessor` — способ для компонента получить доступ к
  родительскому нативному окну.
- `ShowDevTools()` открывает инструменты разработчика WebView и полезен для
  отладки CSS/JS.
- CSS можно писать inline, подключать декларативно через `HeadContent` или
  загружать программно через `LoadCss`.
- JavaScript можно загружать через `LoadScript`; JS в стиле модулей работает по
  обычным правилам Blazor/JS interop.
- Embedded resources скрипта доступны Blazor-окнам по относительному пути.
- Если у вас несколько toggles или повторяющихся контролов, лучше использовать
  явные свойства или item view-models, а не копировать и вставлять жёстко
  прописанные accessors.

## Типовые сценарии

### Диалоговое окно, которым владеет скрипт

1. Создайте или получите scripting API для dialog window в верхнеуровневом
   скрипте или в коде композиции app.
2. Создайте окно для типа Razor-компонента.
3. Передайте `DataContext`, если компоненту нужна view-model.
4. До показа настройте стартовую позицию, размер, прозрачность или поведение.
5. Привяжите окно к lifetime владельца, чтобы оно закрывалось при остановке
   скрипта или app.

### UI через C# Overlay

1. Создайте элемент ауры `C# Overlay`.
2. Поместите код Razor/CSS/JS/компонентов в проект скрипта overlay.
3. Используйте настройки overlay для позиции, стиля, прозрачности и режима
   window-vs-overlay.
4. Используйте live import/export для быстрой итерации по UI.

### Загрузка ресурсов

1. Добавьте CSS/JS/изображения как embedded resources в проект скрипта.
2. Ссылайтесь на изображения и видео из Razor по относительному пути.
3. Используйте `HeadContent` для декларативного CSS или `LoadCss`, если момент
   загрузки должен контролироваться кодом.
4. Используйте `LoadScript` для обычных JavaScript-файлов или URL.

## Что предпочесть

- Для диалоговых окон, которыми владеет скрипт, предпочитайте
  `IDialogWindowUnstableScriptingApi`.
- Внутри размещённых компонентов предпочитайте `IBlazorWindowAccessor`.
- Если компоненту нужны helpers для реактивного обновления, предпочитайте
  `BlazorReactiveComponent`.
- Для нетривиальных компонентов предпочитайте `DataContext`/view-models.
- Для CSS/JS/изображений, которые поставляются вместе с mini-app, предпочитайте
  embedded resources и относительные пути.
- Если Blazor windows — часть большого script app с корнем на ImGui,
  предпочитайте [recipes/bot-memory-imgui-interface.md](/ru/scripting/api/recipes/bot-memory-imgui-interface).
- Для рисования поверх desktop предпочитайте [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay).
- Для инструментов, завязанных на ImGui, предпочитайте [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk).

## Чего избегать

- Не создавайте вручную WPF/WinForms-shell для Razor-контента.
- Не меняйте прозрачность, заданную при создании, после того как нативное окно
  уже существует.
- Не предполагайте, что Razor-компонент может получить доступ к своему owner
  без accessor.
- Не предполагайте, что члены верхнеуровневого script host доступны напрямую в
  Razor-компонентах.
- Не выбирайте Blazor Windows как первый вариант для простых аннотаций поверх
  экрана; для этого используйте API из OSD/screen-overlay.
- Избегайте удалённых CSS/JS-зависимостей, если mini-app должен работать
  офлайн или быть переносимым.

## Ключевые сущности для поиска

- `IBlazorWindow`, `IBlazorWindowController`,
  `IBlazorWindowNativeController`, `IDialogWindowUnstableScriptingApi`,
  `IBlazorWindowAccessor`, `BlazorContentPresenter`,
  `IBlazorViewRepository`, `BlazorViewAttribute`, `ShowDevTools`,
  `BlazorReactiveComponent`, `IJsPoeBlazorUtils`, `LoadCss`,
  `LoadScript`, `HeadContent`, `ToggleButton`,
  `ScriptBlazorWindowConfigurator`.

## Синонимы для поиска

- Blazor window
- Razor window
- script dialog
- WebView2 window
- C# Overlay
- hosted Razor component
- Razor code-behind
- HeadContent
- LoadCss
- LoadScript
- BlazorReactiveComponent
- ToggleButton
- custom title bar
- click-through window
- transparent window
- WebView DevTools

## Связанные карты

- [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay)
- [recipes/bot-memory-imgui-interface.md](/ru/scripting/api/recipes/bot-memory-imgui-interface)
- [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk)
- [scripting/project-workflow.md](/ru/scripting/api/scripting/project-workflow)
- [scripting/references-and-resources.md](/ru/scripting/api/scripting/references-and-resources)
- [scripting/runtime.md](/ru/scripting/api/scripting/runtime)
- [core/app-runtime-contexts.md](/ru/scripting/api/core/app-runtime-contexts)
