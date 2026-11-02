---
title: Скриптовый API переменных
description: Доступ к переменным EyeAuras из скриптов
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-02-20T21:30:29.037Z
---
# IVariablesScriptingApi

Читайте и изменяйте переменные текущего контекста через `Variables` в коде
верхнего уровня EyeAuras. Для другой ауры, папки или макроса сначала укажите
владельца. Обычному классу передайте `IVariablesScriptingApi` через конструктор;
сам по себе SDK не создаёт хранилище переменных.

## Записать значение и прочитать его обратно

Этот код выполняется в верхнеуровневом скрипте с действующим контекстом:

```csharp
var counter = Variables.Get<int>("counter");
counter.Value = 10;
Log.Info($"counter = {counter.Value}");
```

В журнале скрипта появится `counter = 10`, а в хранилище владельца будет
запись `counter`. `Get<T>` создаёт небольшой handle `ScriptVariable<T>`;
**само получение handle не создаёт запись**. Несколько handles одного
владельца с одинаковым именем обращаются к одной переменной.

У handle `HasValue` проверяет наличие записи, включая запись с `null`.
`Value` возвращает `default(T)`, если значение отсутствует, равно `null` или
не удалось преобразование. Когда это различие важно, используйте
`counter.TryGetValue(out var value)`. `counter.Remove()` удаляет запись и
возвращает `true`, если локальная запись существовала. В иерархии после
удаления снова может стать видимым родительское значение.

Возврат `default` или `false` не означает, что любое преобразование безопасно:
в этой версии JSON-преобразование структуры из другого контекста загрузки
не перехватывает ошибки сериализации. Это относится и к `Value`, который
вызывает `TryGetValue`.

## Прочитать переменную другого элемента

Предварительно создайте папку `Farm` и ауру `State` в ней, затем задайте у
неё целочисленную переменную `hp`:

```csharp
var hp = Variables.Get<int>("Farm/State", "hp");
if (hp.TryGetValue(out var value))
{
    Log.Info($"HP = {value}");
}
```

Путь определяет владельца, а второй аргумент — имя переменной. Если элемент
по пути не найден, `Get<T>(path, name)` бросает `ArgumentException` ещё до
чтения значения. Если у вас уже есть объект `IHasVariables`, используйте
`Get<T>(source, name)`. Правила путей описаны в
[навигации по дереву](IAuraTreeScriptingApi).

## Обновить счётчик без отдельного чтения

```csharp
Variables.AddOrUpdate("runs", 1, (int previous) => previous + 1);
Log.Info($"Runs = {Variables.GetValue<int>("runs")}");
```

При первом вызове записывается `1`, при следующих — результат `updater`.
Обновление выполняется внутри операции редактирования кэша. Уже сохранённое
значение должно иметь подходящий тип: эта перегрузка не использует
преобразования `ScriptVariable<T>`.

## Выбрать способ чтения

| Операция | Отсутствующая запись | Существующая запись |
|---|---|---|
| `Variables.Contains(name)` | `false` | `true`, даже для `null` |
| `Variables.TryGetValue<T>(name, out value)` | `false`, значение `default` | Прямое приведение к `T`, возможна ошибка типа |
| `Variables.GetValue(name, fallback)` | `fallback` | То же прямое приведение; fallback не исправляет несовместимый тип |
| `Variables.GetValue<T>(name)` | `KeyNotFoundException` | `null` даёт `default`; несовместимый тип — `ArgumentException` |
| `handle.TryGetValue(out value)` | `false` | Проверка значения, затем попытки преобразования |
| `handle.GetOrThrow()` | `InvalidOperationException` | Требует ненулевое подходящее значение |

В срезе `20fd3d4` методы handle `GetOrThrow` и `TryGetValue` передают разные
объекты вспомогательным конвертерам. Не рассчитывайте, что любое успешное
преобразование одного метода обязательно повторится в другом.

## Наблюдать изменения в текущем запуске

```csharp
using System.Reactive.Linq;

{
    var status = Variables.Get<string>("status");
    using var subscription = status.Listen()
        .Subscribe(value => Log.Info($"Status = {value}"));
    status.Value = "Ready";
    await Task.Delay(1000, cancellationToken);
}
```

`Listen()` выдаёт текущее значение и последующие отличающиеся значения;
неудачное чтение даёт `default`. Подписка живёт до конца блока `using`.
Не подразумевайте UI-поток у уведомлений: перенос на нужный scheduler —
обязанность потребителя. Больше о длительных подписках — в
[переменных скрипта](scripting/variables).

## Контракт и версия

`EyeAuras.Scripting.Api.IVariablesScriptingApi` наследует
`EyeAuras.Scripting.UserSpace.IVariablesAccessor`. В самом интерфейсе объявлены
две перегрузки `Get<T>(itemPath, variableName)` и `Get<T>(source, variableName)`;
`Count`, `Contains`, перечисление, индексатор и локальные операции наследуются.
Описание сверено с объявлениями и реализациями среза EyeAuras `20fd3d4`;
полный reference берите из SDK/XML установленной версии.
