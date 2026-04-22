---
title: AI Core — реактивность
description: AI-ориентированная карта PropertyBinder, Rx/ReactiveUI, DynamicData, реактивных коллекций и объектных привязок, используемых в коде в стиле EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, reactivity, rx, reactiveui, dynamicdata, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта реактивности

Эта карта описывает общий слой реактивности, который используется в коде приложения, представлениях Blazor/WPF, долгоживущих сервисах и script mini-apps.

Используйте её, когда коду нужны вычисляемые свойства, живые коллекции, отслеживание изменений, обновление UI от состояния или подписки, которые должны освобождаться вместе с объектом-владельцем.

## Когда это нужно

- Пересчитывать одно свойство при изменении других свойств.
- Держать состояние UI синхронизированным с состоянием сервиса или модели.
- Подписываться на события или изменения значений без утечек обработчиков.
- Поддерживать живую таблицу, список или дерево на основе меняющихся данных.
- Фильтровать, сортировать, преобразовывать или группировать живую коллекцию.
- Условно привязывать значения, включая `null` и fallback-сценарии.
- Переносить реактивные обновления на UI scheduler/dispatcher.
- Понимать, когда использовать `PropertyBinder`, Rx-подписки или DynamicData.

## Модель концепций

- `DisposableReactiveObject` — обычная базовая модель для объектов, которым нужно управление временем жизни и/или уведомления об изменении свойств. Подписки и ресурсы, которыми владеет объект, добавляйте в `Anchors`.
- Rx (`IObservable<T>`) — это слой потоков. Используйте его для событий, таймеров, асинхронного состояния, throttling, переключения, комбинирования и разовых подписок.
- ReactiveUI даёт хелперы для наблюдения за свойствами, например `WhenAnyValue`, `WhenAnyProperty`, `ReactiveCommand` и `ObservableAsPropertyHelper`.
- `PropertyBinder` нужен для декларативных привязок на уровне объекта. Обычно его объявляют как статический `Binder<TContext>` и подключают один раз из конструктора экземпляра.
- DynamicData — предпочтительный слой для изменяемых живых коллекций. `SourceList<T>` и `SourceCache<T, TKey>` отдают наборы изменений через `Connect()`.
- `SourceCache<T, TKey>` обычно лучше подходит, когда у элементов есть стабильные ID. `SourceList<T>` удобнее для упорядоченных списков без ключа.
- `SourceListEx<T>` и `SourceCacheEx<T, TKey>` — это обёртки PoeShared, которые владеют источником DynamicData и отдают материализованные read-only коллекции.
- UI-код обычно работает с материализованными `IReadOnlyObservableCollection<T>`, полученными через `BindToCollection(...)` или похожие хелперы.
- Свойства, которыми владеет UI, должны обновляться на правильном scheduler/dispatcher. Для этого используйте scheduler-aware хелперы binder-а или `ObserveOn(...)`, где это нужно.

## Основные API

- `PropertyBinder.Binder<TContext>` - хранит декларативные правила привязки для типа контекста.
- `Binder.Attach(instance)` - активирует все правила binder-а для конкретного объекта; освобождайте результат вместе со временем жизни объекта.
- `Binder.Bind(...)` - привязывает выражение к целевому свойству.
- `Binder.BindIf(...).ElseIf(...).Else(...)` - цепочка условной привязки.
- `To(...)` - задаёт целевое свойство или вызывает callback присваивания.
- `WithDependency(...)` - добавляет дополнительные сигналы зависимостей, которые должны запускать пересчёт.
- `PropagateNullValues(...)` - управляет поведением распространения `null` в путях свойств.
- `DoNotRunOnAttach()` - отключает начальное вычисление привязки при attach.
- `DoNotOverride()` / `OverrideKey(...)` - управляет тем, как правила привязки переопределяют друг друга.
- `OnScheduler(...)` - выполняет присваивание binder-а на выбранном scheduler.
- `WhenAnyValue(...)` - наблюдает одно или несколько значений свойств.
- `WhenAnyProperty(...)` - наблюдает уведомления об изменении свойств по имени свойства или выражению.
- `ReactiveCommand` - абстракция команды с наблюдаемым состоянием выполнения.
- `ObservableAsPropertyHelper<T>` - хранит вычисленное observable-значение как свойство.
- `SourceList<T>` - изменяемый живой список.
- `SourceCache<T, TKey>` - изменяемая живая коллекция с ключом.
- `Connect()` - открывает поток change set для DynamicData.
- `Preview()` - наблюдает изменения до того, как они будут применены.
- `Edit(...)` - пакетно изменяет источник DynamicData.
- `Watch(key)` - наблюдает один элемент в `SourceCache`.
- `Lookup(key)` / `GetOrDefault(...)` - читает значения из keyed cache.
- `CountChanged` - наблюдает текущее количество элементов в живой коллекции.
- `BindToCollection(out collection)` - материализует change set в read-only observable collection.
- `ToObservableChangeSet()` - адаптирует observable sequence или коллекцию в change set для DynamicData.
- `SourceListEx<T>` / `SourceCacheEx<T, TKey>` - обёртки PoeShared вокруг источников DynamicData с учётом времени жизни.
- `BindableReactiveObject` / `ReactiveBinding` - инфраструктура привязки по путям свойств для динамических сценариев source/target binding.

## Паттерн `PropertyBinder`

Используйте `Binder<T>` для стабильного вычисляемого состояния на уровне объекта. Не создавайте binder-ы внутри render loop, polling loop или кода, который выполняется каждый frame.

```csharp
private sealed class CharacterState : DisposableReactiveObject
{
    private static readonly Binder<CharacterState> Binder = new();

    static CharacterState()
    {
        Binder.Bind(x => $"{x.Name} ({x.Level})")
            .To(x => x.DisplayName);

        Binder.BindIf(x => x.Target != null, x => x.Target.Name)
            .Else(x => "<no target>")
            .To(x => x.TargetName);
    }

    public CharacterState()
    {
        Binder.Attach(this).AddTo(Anchors);
    }

    public string Name { get; set; } = "";
    public int Level { get; set; }
    public TargetInfo? Target { get; set; }
    public string DisplayName { get; private set; } = "";
    public string TargetName { get; private set; } = "";
}
```

## Паттерн Rx-подписок

Используйте Rx для потоков и side effect-ов. Всегда освобождайте подписки вместе с объектом-владельцем.

```csharp
this.WhenAnyValue(x => x.IsRunning)
    .DistinctUntilChanged()
    .Subscribe(isRunning => Log.Info($"Running: {isRunning}"), Log.HandleException)
    .AddTo(Anchors);
```

Часто используемые операторы:

- `Select` - преобразует значение.
- `Where` - фильтрует события.
- `DistinctUntilChanged` - убирает повторяющиеся значения.
- `CombineLatest` - объединяет несколько последних значений.
- `Switch` - использует последний внутренний observable и отписывается от предыдущего.
- `Throttle` / `Sample` - уменьшает шум в потоке событий.
- `ObserveOn` - переносит downstream-уведомления на нужный scheduler.

## Паттерн DynamicData

Используйте DynamicData, когда коллекция меняется со временем. Предпочитайте пайплайны change set вместо ручного сравнения списков.

```csharp
private readonly SourceCache<ItemVm, string> items = new(x => x.Id);

public IReadOnlyObservableCollection<ItemVm> Items { get; }

public InventoryVm()
{
    items.Connect()
        .Filter(x => x.IsVisible)
        .BindToCollection(out var visibleItems)
        .Subscribe()
        .AddTo(Anchors);

    Items = visibleItems;
    items.AddTo(Anchors);
}
```

Для пакетных изменений используйте `Edit(...)`:

```csharp
items.Edit(update =>
{
    update.Clear();
    update.AddOrUpdate(newItems);
});
```

## Что и когда использовать

- Используйте `PropertyBinder` для долгоживущих вычисляемых свойств и проекций состояния объекта.
- Используйте `WhenAnyValue` / Rx для потоков событий, таймеров, подписок, debounce/throttle-логики, асинхронного переключения и side effect-ов.
- Используйте `DynamicData` для живых коллекций, особенно таблиц, деревьев, кэшей и данных, которые постоянно обновляются.
- Используйте обычные свойства для простого локального состояния, которому не нужны уведомления и вычисляемые обновления.
- Используйте `ReactiveCommand`, когда UI-действиям нужно наблюдаемое состояние выполнения, ошибки или логика can-execute.
- Используйте `SourceCache<T, TKey>` для списков сущностей, списков процессов, окон, aura objects, файлов и любых данных со стабильными ID.
- Используйте `SourceList<T>`, когда порядок сам по себе является моделью и естественного ключа нет.

## Чего не делать

- Не оставляйте Rx-подписки без освобождения. Добавляйте их в `Anchors`.
- Не изменяйте UI-bound свойства из произвольных background thread.
- Не выносите `Binder.Attach(...)` за пределы владельца времени жизни объекта.
- Не создавайте `Binder<T>` заново много раз для одного и того же типа.
- Не делайте ручной diff для `List<T>`, если DynamicData может отдать change set.
- Не полагайтесь на обычные auto-property, если потребители ожидают уведомления об изменении свойств.
- Не создавайте циклические reactive binding, если они не защищены очень аккуратно.
- Не прячьте долгие операции внутри getter-ов свойств или binding-выражений.

## Синонимы для поиска

- reactivity, reactive state, property changed, INPC, notify property changed
- PropertyBinder, binder, derived property, computed property, conditional binding
- Rx, System.Reactive, observable, subscription, scheduler, ObserveOn
- ReactiveUI, WhenAnyValue, ReactiveCommand, ObservableAsPropertyHelper
- DynamicData, SourceList, SourceCache, change set, live collection
- BindToCollection, observable collection, filtered table, sorted list
- AddTo Anchors, lifetime, Dispose, DisposableReactiveObject

## Опорные точки для исследования

- `Binder<TContext>`
- `PropertyRuleBuilder`
- `Bind`
- `BindIf`
- `ElseIf`
- `Else`
- `To`
- `WithDependency`
- `PropagateNullValues`
- `OnScheduler`
- `WhenAnyValue`
- `WhenAnyProperty`
- `ReactiveCommand`
- `ObservableAsPropertyHelper`
- `SourceList<T>`
- `SourceCache<T, TKey>`
- `Connect`
- `Preview`
- `Edit`
- `Watch`
- `Lookup`
- `CountChanged`
- `BindToCollection`
- `ToObservableChangeSet`
- `SourceListEx<T>`
- `SourceCacheEx<T, TKey>`
- `BindableReactiveObject`
- `ReactiveBinding`
- `ReactiveTrackerList`
- `ReactiveSection`

## Связанные карты

- [Blazor Foundation](blazor.md)
- [Reactive Lifetime](../scripting/reactive-lifetime.md)
- [Async Patterns](../scripting/async.md)
- [Scripting Runtime](../scripting/runtime.md)
- [Blazor Windows](../windows-subsystems/blazor-windows.md)