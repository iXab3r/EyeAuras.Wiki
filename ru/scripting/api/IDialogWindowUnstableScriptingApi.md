---
title: Нестабильный scripting API окна диалога
description: Нестабильный scripting API для работы с окнами диалога.
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-11-03T23:15:54.436Z
---
# Открыть диалог из скрипта

`IDialogWindowUnstableScriptingApi` создаёт Blazor-окно для Razor-компонента.
API экспериментальный. Здесь описан контракт EyeAuras `20fd3d4` / PoeEye `0e02c98`;
старые копии интерфейса с `ShowTitleBar` и `ViewDataContext` не подходят для этого среза.

## Показать окно и дождаться закрытия

В проект C# Script добавьте файл `HelloDialog.razor` с публичным компонентом
в namespace `MyScript`:

```razor
@namespace MyScript
<h3>Привет из EyeAuras</h3>
<p>Закройте окно крестиком, чтобы продолжить скрипт.</p>
```

Верхнеуровневый код скрипта выполняется в desktop EyeAuras, где UI-модуль
регистрирует dialog API и фабрику `IBlazorWindow`. Ссылка на assembly сама
эти сервисы не создаёт.

```csharp
using EyeAuras.Shared.Scripting;

var dialogs = GetService<IDialogWindowUnstableScriptingApi>();
using var window = dialogs.CreateWindow<MyScript.HelloDialog>();
window.Title = "Пример диалога";
window.Width = 400;
window.Height = 300;
window.ShowDialog(cancellationToken);
Log.Info("Ожидание диалога завершено");
```

Появится окно с текстом компонента. `ShowDialog` ждёт его закрытия; реализация
WPF поддерживает обработку сообщений dispatcher во время ожидания. Отмена
токена обрабатывается внутри этого метода: не рассчитывайте обязательно
получить `OperationCanceledException` снаружи. `using` освобождает окно и при
выходе из скрипта по исключению.

`CreateWindow<T>(object dataContext = default)` задаёт `ViewType`, `DataContext`
и `AutoOwner = false`. Окно также добавляется в ресурсы API. Это не обещает
автоматического назначения владельца другому окну приложения. Для немодального
окна используйте `Show()`, но сохраняйте окно живым до завершения работы:
`using` вокруг одного `Show()` сразу завершит его время жизни.

## Передать модель в компонент

Передайте свой объект аргументом `CreateWindow<T>(model)` и используйте компонент,
который принимает этот тип через `DataContext`, например наследника
`BlazorReactiveComponent<T>`. Модель и её уведомления об изменениях — часть
вашего проекта, а не глобальные переменные Razor. `ViewDataContext` — устаревший
псевдоним; используйте `DataContext`.

Свойства, события, нативные координаты и ограничения окна — в
[IBlazorWindow](IBlazorWindow). Для выбора файла из Razor нужны отдельные
обёртки нативных диалогов, описанные в [карте Blazor Windows](windows-subsystems/blazor-windows).
