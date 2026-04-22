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

Для desktop-аннотаций с click-through используйте `osd/screen-overlay.md`, а для
опциональных ImGui-окон — `nuget/imgui-sdk.md`.

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

## Основные API

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
  предпочитайте `recipes/bot-memory-imgui-interface.md`.
- Для рисования поверх desktop предпочитайте `osd/screen-overlay.md`.
- Для инструментов, завязанных на ImGui, предпочитайте `nuget/imgui-sdk.md`.

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

- `osd/screen-overlay.md`
- `recipes/bot-memory-imgui-interface.md`
- `nuget/imgui-sdk.md`
- `scripting/project-workflow.md`
- `scripting/references-and-resources.md`
- `scripting/runtime.md`
- `core/app-runtime-contexts.md`