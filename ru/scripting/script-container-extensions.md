---
title: Script Container Extensions
description: Как регистрировать свои сервисы и подключать модульные библиотеки в скриптах EyeAuras
published: true
date: 2026-04-02T15:30:00.000Z
tags: c#, scripting, dependency-injection
editor: markdown
dateCreated: 2026-04-02T15:30:00.000Z
---
# Script Container Extensions

`ScriptContainerExtension` регистрирует ваши службы в контейнере скрипта. Это удобно, когда несколько классов должны пользоваться одним состоянием: например, логика бота и его интерфейс читают один снимок мира. Для небольшого скрипта достаточно `new` с явными зависимостями или уже зарегистрированного `GetService<T>()`.

## Зарегистрировать службу и получить её из скрипта

Добавьте обычный файл `CounterServices.cs` в проект скрипта:

```csharp
using EyeAuras.Scripting.Api;
using Unity;
using PoeShared.Logging;

public interface ICounter
{
    int Next();
}

public sealed class Counter : ICounter
{
    private int value;
    public int Next() => ++value;
}

public sealed class CounterServices : ScriptContainerExtension
{
    protected override void Initialize()
    {
        Container.RegisterSingleton<ICounter, Counter>();
    }
}
```

В `Script.csx` получите зарегистрированную службу:

```csharp
var counter = GetService<ICounter>();
Log.Info($"Counter: {counter.Next()}");
```

В `Event Log` появится `Counter: 1`, при следующем запуске с тем же контекстом — `Counter: 2`. Это один экземпляр на контейнер скрипта, а не глобальный счётчик всех аур. При пересоздании контекста состояние теряется. Счётчик показывает регистрацию и повторное использование; для параллельных обработчиков нужна синхронизация.

Runtime ищет конкретные наследники `ScriptContainerExtension` в скомпилированной сборке контейнера при создании контекста, **до выполнения кода скрипта**. Поэтому эта extension из проекта обнаруживается автоматически. Не рассчитывайте, что сканирование каждой произвольной загруженной DLL зарегистрирует её службы.

## Передать зависимости обычному классу

У обычного C# класса нет глобальных `Log`, `Variables`, `Sleep` или `GetService`. Зависимости нужно передать. Например, добавьте в тот же файл:

```csharp
public sealed class CounterReporter
{
    private readonly ICounter counter;
    private readonly IFluentLog log;

    public CounterReporter(ICounter counter, IFluentLog log)
    {
        this.counter = counter;
        this.log = log;
    }

    public void Report() => log.Info($"Counter: {counter.Next()}");
}
```

В `Initialize()` добавьте `Container.RegisterType<CounterReporter>();`, затем в `Script.csx` вызовите:

```csharp
var reporter = GetService<CounterReporter>();
reporter.Report();
```

Контейнер передаст в конструктор общий `ICounter` и логгер скрипта. `RegisterType` и `RegisterSingleton` задают разные правила создания объектов; сам факт получения службы не означает, что её надо освобождать вручную. Проверяйте владение ресурсами конкретной службы. Универсальной гарантии автоматического `Dispose` для любого результата `GetService` нет.

## Подключить extension из библиотеки

Наличие ссылки на пакет делает доступными типы, но само по себе не заменяет регистрацию служб. В `Script.csx` можно явно вызвать `AddNewExtension<T>()`; если extension уже настроена, повторного добавления не будет. Метод возвращает текущую песочницу.

Например, для ImGui SDK:

```csharp
#r "nuget: EyeAuras.ImGuiSdk, 0.1.42"

using EyeAuras.ImGuiSdk;

AddNewExtension<ImGuiContainerExtensions>();
var imgui = GetService<IImGuiExperimentalApi>();
Log.Info("ImGui API resolved");
```

Это получение API, а не создание окна. Продолжение — [первое окно ImGui](/ru/scripting/imgui/getting-started). Версия здесь взята из примеров Wiki; доступность пакета и совместимость с вашей сборкой EyeAuras нужно проверить при восстановлении и запуске.

Для `EyeAuras.FridaSdk` встречается аналогичный вызов `AddNewExtension<FridaContainerExtensions>()`. Реализация этого внешнего пакета здесь не подтверждена; его регистрацию и требования проверяйте по документации выбранной версии. Примеры составных проектов: [Aim Trainer ML](/ru/scripting/examples/advanced/aimtrainer-ml) и [YOLO11 ESP](/ru/scripting/examples/advanced/yolo11-esp).

Внутри другой extension для зависимости используется `Container.AddNewExtensionIfNotExists<T>()` из `PoeShared.Scaffolding`. Это операция контейнера, тогда как `AddNewExtension<T>()` в `Script.csx` — метод песочницы.

## Когда выполняется внедрение свойств

Свойства объекта скрипта с `[Inject]` или `[Dependency]`, у которых есть setter, заполняются при **однократной настройке объекта**, а не при каждом `Run`. Это относится и к `init`-свойствам. Служба должна быть зарегистрирована к этому моменту.

Если вы регистрируете extension вручную уже внутри `Script.csx`, получайте её службы после регистрации через `GetService<T>()`. Вызов не запускает повторное заполнение ранее объявленных свойств. Для обычных классов используйте конструктор, Unity или механизм внедрения того фреймворка, который создаёт объект; ручной `new` сам ничего не внедряет.

Подробнее: [Dependency Injection](/ru/scripting/dependency-injection), [песочница](/ru/scripting/sandbox), [карта операций контейнера](/ru/scripting/api/scripting/container-extensions) и [Mini-app](/ru/features/mini-app).
