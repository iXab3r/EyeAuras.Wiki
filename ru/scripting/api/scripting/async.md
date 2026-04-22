---
title: Асинхронность в AI Scripting
description: Карта по async/await, фоновой работе, отмене и coroutine-подобным сценариям в скриптах EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, async, coroutine, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта async в скриптах

Краткая справка по асинхронной работе в script mini-apps: top-level `await`, риски fire-and-forget, отмена и альтернативы в стиле coroutine.

## Что обычно нужно пользователю

- Вызывать file, network, AI, OSD или service API с `await` прямо из `Script.csx`.
- Запускать долгую работу скрипта без блокировки UI/render-потоков.
- Безопасно стартовать фоновые задачи.
- Отменять async-работу при остановке скрипта.
- Избегать unobserved exceptions, которые могут дестабилизировать host app.

## Как это устроено

- Top-level scripts поддерживают `async`/`await`; тело `Script.csx` может использовать `await` напрямую.
- EyeAuras ожидает выполнение скрипта снаружи.
- `cancellationToken` представляет отмену текущего запуска скрипта.
- `ExecutionAnchors` владеет ресурсами, которые должны быть освобождены после завершения текущего запуска.
- Обычные helper-классы используют стандартные async-паттерны C#; host-only globals в них автоматически недоступны.
- Fire-and-forget задачи опасны, если они не перехватывают и не логируют все исключения и не учитывают отмену.
- Для циклов, таймеров и пошаговых сценариев пакет NuGet `Coroutine` часто безопаснее и проще, чем разрозненный фоновый код на `Task`.

## Правила безопасности

- Используйте `await` напрямую, если текущий запуск скрипта должен дождаться результата.
- Передавайте `cancellationToken` в async API везде, где это поддерживается.
- Избегайте `async void`, кроме обработчиков событий, где этого требует framework.
- Не запускайте `_ = Task.Run(...)` без верхнеуровневого `try/catch`.
- Не позволяйте исключениям выходить наружу из render callbacks, background tasks, timer callbacks, event handlers или worker-циклов скрипта.
- Логируйте ошибки через `Log` в top-level script code или через `IFluentLog` в helper-классах.
- Освобождайте cancellation sources, subscriptions, windows, renderers и owners фоновых задач через `ExecutionAnchors`, `Anchors` или явные `using`-scopes.
- Не блокируйте ImGui, Blazor, OSD или hook callbacks с помощью `.Wait()`, `.Result`, `Thread.Sleep` или долгой синхронной работы.

## Частые сценарии

Ожидание одной операции:

```csharp
var window = await osdSelectionService.PickWindow();
Log.Info($"Selected PID {window.ProcessId}");
```

Безопасный запуск фоновой работы:

```csharp
_ = Task.Run(async () =>
{
    try
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            await Task.Delay(250, cancellationToken);
            Log.Debug("Tick");
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
        // Normal script stop.
    }
    catch (Exception ex)
    {
        Log.Error("Background worker failed", ex);
    }
}, cancellationToken);
```

Использование Coroutines для пошаговых циклов:

```csharp
#r "nuget: Coroutine, 2.1.5"
```

Используйте код в стиле coroutine, если сценарий представляет собой повторяющуюся state machine, bot loop, retry flow или animation/timing sequence. Это предпочтительнее набора несвязанных background tasks, когда скрипту нужны предсказуемые шаги, отмена и понятные границы обработки ошибок.

## Что предпочитать

- Предпочитайте прямой `await` для одноразовых операций.
- Предпочитайте API с поддержкой cancellation token.
- Предпочитайте Coroutines для долгих циклов, retry-последовательностей и сценариев в стиле state machine.
- Предпочитайте явный `try/catch` на каждой границе fire-and-forget.
- Логируйте достаточно контекста, чтобы было понятно, какой target, action, window, profile или request завершился ошибкой.

## Чего избегать

- Избегайте unobserved tasks.
- Избегайте `async void`.
- Избегайте фоновой работы, которая живёт дольше владельца скрипта.
- Избегайте блокировки UI/render/hook callbacks.
- Не считайте, что исключения в фоновой работе скрипта изолированы от host process.

## Опорные термины

- `async`, `await`, `Task`, `Task.Run`, `OperationCanceledException`,
  `CancellationToken`, `cancellationToken`, `ExecutionAnchors`, `Anchors`,
  `CompositeDisposable`, `IFluentLog`, `Coroutine`.

## Что искать

- async script
- await Script.csx
- fire and forget
- unobserved task exception
- background task
- cancellation token
- script cancellation
- coroutine
- bot loop
- retry loop
- long running script

## Связанные карты

- `scripting/runtime.md`
- `scripting/logging.md`
- `scripting/references-and-resources.md`
- `nuget/imgui-sdk.md`
- `recipes/recipe.md`