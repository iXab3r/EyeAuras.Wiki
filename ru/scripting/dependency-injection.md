---
title: Внедрение зависимостей
description: Использование внедрения зависимостей в EyeAuras
published: true
date: 2025-03-23T12:04:28.776Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-23T11:44:34.759Z
---
# Что такое Dependency Injection (DI)?

**Dependency Injection (DI)** позволяет получать готовые сервисы программы.
Представьте ящик с инструментами: вместо сборки каждого инструмента вы просите
нужный по имени. Но инструмент должен быть в ящике: наличие интерфейса в SDK
ещё не означает, что сервис зарегистрирован в текущем host.

## Получить сервис в Script.csx

Например, чтобы узнать положение курсора, выполните в C# Script:

```csharp
using EyeAuras.Roxy.Api;

var input = GetService<ISendInputScriptingApi>();
Log.Info($"Курсор на экране: {input.CursorPosition}");
```

Результат — экранные координаты в журнале, без перемещения мыши. Нужен
работающий EyeAuras с зарегистрированным API ввода. `GetService<T>()`
разрешает зависимость через контейнер песочницы и связанные контексты;
это не проверка «есть ли сервис» с возвратом `null`.

Повторное получение не обязательно создаёт новый экземпляр: это зависит
от регистрации. Метод не обещает ни временную доступность любого интерфейса,
ни автоматическое освобождение каждого `IDisposable`. Своим ресурсам задайте
[владельца времени жизни](/ru/scripting/api/scripting/reactive-lifetime).

## Заполнить свойство скрипта один раз

Если зависимость используется в нескольких методах, оставьте её свойством.
Это альтернативное полное тело `Script.csx` для той же задачи:

```csharp
using Microsoft.AspNetCore.Components;
using EyeAuras.Roxy.Api;

[Inject] public ISendInputScriptingApi Input { get; init; }

Log.Info($"Курсор на экране: {Input.CursorPosition}");
```

Runtime находит записываемые свойства с `[Inject]` и заполняет их в
`OneTimeSetupScript`. `init` ограничивает обычное присваивание из C#;
runtime использует reflection. Это настройка экземпляра скрипта, **не
обещание нового заполнения перед каждым Run** того же контекста.

Вместо `[Inject]` можно использовать Unity `[Dependency]`. Если свойство
должно допускать явное присваивание вашим кодом, объявите `set`:

```csharp
using Unity;
using EyeAuras.Roxy.Api;

[Dependency] public ISendInputScriptingApi Input { get; set; }

Log.Info($"Курсор на экране: {Input.CursorPosition}");
```

Оба атрибута поддерживаются для свойств объекта скрипта. `set` сам по себе
не включает автоматическое переключение сервиса при смене окна.

## Передать зависимость обычному классу

Объект, созданный через `new`, не получает `Log`, `Variables` или свойства
песочницы автоматически. Поместите в `CursorReporter.cs`:

```csharp
using EyeAuras.Roxy.Api;
using PoeShared.Logging;

public sealed class CursorReporter
{
    private readonly ISendInputScriptingApi input;
    private readonly IFluentLog log;

    public CursorReporter(ISendInputScriptingApi input, IFluentLog log)
    {
        this.input = input;
        this.log = log;
    }

    public void Report() => log.Info($"Курсор на экране: {input.CursorPosition}");
}
```

А в `Script.csx` выполните:

```csharp
using EyeAuras.Roxy.Api;

var reporter = new CursorReporter(GetService<ISendInputScriptingApi>(), Log);
reporter.Report();
```

Класс работает с переданными сервисами и пишет в журнал скрипта. Он не
становится их владельцем и не освобождает их после вызова.

Для большого графа классов используйте
[ScriptContainerExtension](/ru/scripting/api/scripting/container-extensions):
там есть законченный пример регистрации и получения своего состояния.
В Razor `[Inject]` обслуживает Blazor; это отдельная точка композиции,
а не правило заполнения любого обычного C#-объекта.

## Какой способ выбрать

- Разовый вызов из тела скрипта — `GetService<T>()`.
- Зависимость нескольких методов скрипта — свойство `[Inject]` или `[Dependency]`.
- Обычный класс — явный конструктор; DI полезен, когда упрощает создание графа.

Срез контрактов — EyeAuras `20fd3d4`, PoeEye `0e02c98`. Точные типы,
перегрузки и регистрации сверяйте с SDK/XML и составом host своей версии.

Примеры применения:

- [Отслеживание мыши с overlay](/ru/scripting/examples/basic/mouse-track-with-overlay)
- [Печать переменных на экране](/ru/scripting/examples/basic/print-variables-on-screen)
