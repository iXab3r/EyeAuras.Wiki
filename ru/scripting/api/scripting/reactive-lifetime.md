---
title: AI-скриптинг и реактивный жизненный цикл
description: Карта по DisposableReactiveObject, Anchors, AddTo и отслеживанию изменений свойств в скриптах.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, disposable, reactive, lifetime, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Время жизни ресурсов и реактивное состояние

Справочная карта для классов, которым в скриптах и mini-apps нужны `IDisposable`, уведомления об изменении свойств или и то, и другое.

## Для чего это нужно

- Владеть подписками, окнами, readers процессов, таймерами и дочерними сервисами.
- Не писать вручную шаблонный код для `IDisposable`.
- Сделать так, чтобы вспомогательные классы уведомляли UI и bindings об изменении свойств.
- Использовать один и тот же подход к времени жизни и в скриптах, и в app/service-коде.

## Основная модель

- `DisposableReactiveObject` — базовый класс по умолчанию, если классу нужен `IDisposable`, `INotifyPropertyChanged` или оба интерфейса сразу.
- `Anchors` — контейнер времени жизни объекта. Добавляйте туда все owned disposable-ресурсы.
- `.AddTo(Anchors)` делает владение ресурсами явным и избавляет от большинства ручных реализаций `Dispose()`.
- В обычных проектах EyeAuras поддержка notify-property-changed обычно добавляется через `PropertyChanged.Fody`.
- В скриптовых проектах runtime использует собственный code weaver, который может внедрять поведение notify-property-changed во время выполнения.
- Верхнеуровневые script `ExecutionAnchors` создаются отдельно для каждого запуска. `Anchors` у `DisposableReactiveObject` принадлежат конкретному экземпляру объекта.
- Используйте anchors самого объекта для mini-app окон, coordinators, readers, trackers и сервисов с собственным временем жизни.

## Детали API

- `PoeShared.Scaffolding.DisposableReactiveObject` — базовый класс с реализацией `IDisposableReactiveObject`.
- `PoeShared.Scaffolding.IDisposableReactiveObject` — объединяет `IDisposable`, `INotifyPropertyChanged`, `Anchors` и `RaisePropertyChanged`.
- `Anchors` — `CompositeDisposable`, который очищается при dispose объекта.
- `AddTo(Anchors)` — стандартный extension-паттерн для привязки owned disposables.
- `RaisePropertyChanged(string)` — явное уведомление об изменении свойства.
- `RaiseAndSetIfChanged(ref field, value)` — helper для сеттера в ручных свойствах.
- `DisposableReactiveObjectWithLogger` — та же модель времени жизни плюс лениво создаваемый type logger.

## Освободить подписку вместе с её владельцем

В `Script.csx` создадим объект, который наблюдает изменения списка. Здесь
нет таймера или фоновой задачи: работа происходит при добавлении элементов.
В обычном `.cs`-классе нужны те же `using` и ссылка на PoeShared.

```csharp
using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Reactive.Disposables;
using PoeShared.Logging;
using PoeShared.Scaffolding;

{
    var items = new ObservableCollection<string>();
    using var observer = new ItemObserver(items, Log);
    items.Add("Первый");
    items.Add("Второй");
}

public sealed class ItemObserver : DisposableReactiveObject
{
    public ItemObserver(ObservableCollection<string> items, IFluentLog log)
    {
        NotifyCollectionChangedEventHandler handler = (_, _) =>
            log.Info($"Элементов: {items.Count}");
        items.CollectionChanged += handler;
        Disposable.Create(() => items.CollectionChanged -= handler).AddTo(Anchors);
    }
}
```

В журнал попадут количества 1 и 2. Выход из блока вызывает `Dispose()`
наблюдателя, а его `Anchors` снимает обработчик. Сам список передан в
пользование и не становится собственностью наблюдателя.

Для ресурса на весь Run вместо локального `using` можно использовать
`.AddTo(ExecutionAnchors)`. После возврата тела скрипта эти anchors очищаются,
даже если отмены не было. `Anchors` песочницы живёт дольше отдельного Run;
`Anchors` вашего объекта принадлежит только этому объекту. Выберите одного
владельца и не добавляйте заимствованные общие сервисы в его список очистки.

## Уведомить UI об изменении состояния

`DisposableReactiveObject` реализует `INotifyPropertyChanged`, но сам по себе
не переписывает setter. В проектах с настроенным PropertyChanged.Fody или
скриптовым weaver для простого изменяемого состояния используйте auto-property:

```csharp
using PoeShared.Scaffolding;

public sealed class ReaderState : DisposableReactiveObject
{
    public bool IsAttached { get; set; }
}
```

Это объявление модели, а не самостоятельное окно. Чтобы показать состояние,
нужно создать экземпляр, передать его UI как модель и связать отображение
с `IsAttached`: [настройка Blazor](/ru/scripting/api/core/blazor). Без
настроенного weaving auto-property не отправит уведомление. Ручной setter
нужен, если при присваивании есть дополнительная логика; не добавляйте его
только ради обхода настройки weaver.

Уведомление не переносит выполнение на UI-поток. Планирование UI и обновление
компонента остаются отдельной обязанностью. `DisposableReactiveObjectWithLogger`
даёт логгер типа; если нужен журнал скрипта, передайте `IFluentLog` как выше.

## Лучше использовать

- `DisposableReactiveObject` вместо ручного `IDisposable`, если класс владеет несколькими disposable-ресурсами.
- `.AddTo(Anchors)` для подписок, окон, readers, таймеров, сессий и дочерних объектов.
- Auto-properties с настроенным weaver для простого состояния; ручной setter для дополнительной логики.
- `DisposableReactiveObjectWithLogger` только тогда, когда type logger действительно подходит для этой диагностической области.

## Чего избегать

- Ручных `Dispose()`-методов, которые только освобождают список полей.
- Добавления ресурсов долгоживущего объекта в верхнеуровневые `ExecutionAnchors`, если у объекта есть собственное время жизни.
- Предположения, что внутри классов, унаследованных от `DisposableReactiveObject`, доступны script globals вроде `Log`.
- Зависимости от notify-property-changed weaving в коде, который должен работать и в build/runtime-конфигурации без включенного weaver.

## Ключевые сущности для изучения

- `DisposableReactiveObject`
- `IDisposableReactiveObject`
- `DisposableReactiveObjectWithLogger`
- `Anchors`
- `CompositeDisposable`
- `AddTo`
- `RaisePropertyChanged`
- `RaiseAndSetIfChanged`
- `PropertyChanged.Fody`
- `AddNotifyPropertyChangedAssemblyWeaver`

## Что искать

- reactive object
- disposable reactive object
- anchors lifetime
- composite disposable
- AddTo anchors
- notify property changed
- NPC
- INotifyPropertyChanged
- property changed weaving
- Fody

## Связанные карты

- `scripting/runtime.md`
- `scripting/logging.md`
- `scripting/async.md`
- `core/app-runtime-contexts.md`
- `windows-subsystems/blazor-windows.md`
- `nuget/imgui-sdk.md`
Контракты — EyeAuras `20fd3d4`, PoeEye `0e02c98`; сигнатуры и настройку weaving сверяйте с SDK/XML своей версии.
