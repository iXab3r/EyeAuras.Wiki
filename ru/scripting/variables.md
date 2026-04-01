---
title: Переменные
description: Использование в скриптах
published: true
date: 2025-10-19T16:05:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T11:24:15.492Z
---
# Переменные скриптов в EyeAuras

## Зачем нужны переменные вне кода?

Обычный скрипт живёт недолго: запускается, выполняет задачу и завершается. Но иногда нужно хранить настройки и результаты дольше — между перезапусками скрипта и даже делиться ими с другими скриптами. Для этого в EyeAuras есть «внешние» переменные — на уровне скриптов, аур и папок.

Основные сценарии:
- хранение настроек, которые редко меняются
- обмен данными между скриптами (например, конфиг в одном, логика в другом)
- просмотр значений в UI на вкладке Variables у ауры или папки

## Где могут храниться данные

- Локальные переменные — живут внутри метода. Обычный вариант:
  ```csharp
  var x = 123;
  ```
- Свойства sandbox — поля/свойства класса вашего скрипта. Они сохраняются, пока вы не измените код (после изменения скрипт перекомпилируется, и свойства сбрасываются):
  ```csharp
  int MyCounter { get; set; }
  // ...
  MyCounter = 16;
  Log.Info($"Counter: {MyCounter}");
  ```
- Переменные Script/Aura/Folder — долговременное хранилище, видимое в UI и доступное другим скриптам. Именно о них и пойдёт речь в этой статье.

## Общий принцип работы с переменными скрипта

В «сыром» виде переменные можно читать и записывать через индексатор по строковому ключу:

```csharp
Variables["myCounter"] = 1;
Log.Info($"Counter: {Variables["myCounter"]}");
```

Минусы: теряется тип, приходится вручную делать приведение. В C# это неудобно и ненадёжно.

Решение — `ScriptVariable<T>`: вы один раз задаёте имя и тип, а дальше работаете типобезопасно.

```csharp
var myCounter = Variables.Get<int>("myCounter");
myCounter.Value = myCounter.Value + 1;
Log.Info($"Counter value: {myCounter}"); // 2, 3, 4, ...
```

Снаружи это выглядит как обычная переменная: её можно читать, писать и логировать. Но внутри значение хранится в общем «хранилище переменных», доступном и другим скриптам.

## Как получить переменную

- Переменная текущего скрипта:
  ```csharp
  var v = Variables.Get<float>("speed");
  v.Value = 1.5f;
  ```
- Переменная другой ауры или папки по пути:
  ```csharp
  var auraVar = Variables.Get<int>(@".\Gameplay\Bosses\Shaper", "attempts");
  auraVar.Value++;
  ```
- Переменная, если у вас уже есть `IHasVariables`:
  ```csharp
  var aura = AuraTree.GetAuraByPath(@".\Something");
  var auraVar = Variables.Get<string>(aura, "status");
  Log.Info($"Status: {auraVar.Value}");
  ```

## Самое важное поведение `ScriptVariable<T>`

Ниже — простые правила, которые лучше понять один раз, чем потом долго отлаживать.

- `Value`
  - Читать всегда безопасно: исключения не выбрасываются.
  - Если значения нет или тип не подходит — возвращается `default(T)` (`0` для чисел, `false` для `bool`, `null` для ссылочных типов).
  - Присваивание просто записывает значение в хранилище.
  ```csharp
  var i = Variables.Get<int>("i");
  Log.Info(i.Value); // 0, если переменная не задана
  i.Value = 42;      // записали 42
  ```

- `HasValue`
  - `true`, если запись существует в хранилище (даже если для ссылочного типа там `null`).
  - `false`, если записи нет вообще.
  ```csharp
  var s = Variables.Get<string>("name");
  Log.Info(s.HasValue); // false, записи нет
  s.Value = null;
  Log.Info(s.HasValue); // true, запись есть, но значение null
  ```

- `TryGetValue(out T value)`
  - Возвращает `true`, только если запись существует, значение НЕ `null` и его можно привести/конвертировать к `T`.
  - Возвращает `false`, если записи нет, значение `null` или тип не подходит.
  ```csharp
  var f = Variables.Get<float>("ratio");
  if (f.TryGetValue(out var val))
  {
      Log.Info($"ratio = {val}");
  }
  else
  {
      Log.Info("ratio is not set or null or cannot be converted to float");
  }
  ```

- `GetOrThrow()`
  - Единственный «небезопасный» способ чтения.
  - Выбрасывает `InvalidOperationException`, если записи нет, значение `null` (для ссылочных типов) или его нельзя привести/конвертировать к `T`.
  ```csharp
  var required = Variables.Get<int>("port");
  var port = required.GetOrThrow(); // выбросит исключение, если нет записи, null или неверный тип
  ```

- `Remove()`
  - Удаляет запись из хранилища. Возвращает `true`, если запись существовала, и `false`, если нет.
  - После `Remove()` чтение `Value` вернёт `default(T)`, `HasValue` станет `false`, а `Listen()` получит событие «сброс к значению по умолчанию».
  ```csharp
  var v = Variables.Get<int>("x").Set(10);
  v.Remove(); // true
  Log.Info(v.Value);    // 0
  Log.Info(v.HasValue); // false
  ```

- Неявное преобразование к `T`
  - Можно писать просто: `int i = myIntVar;`
  ```csharp
  var myIntVar = Variables.Get<int>("score").Set(5);
  int i = myIntVar; // 5
  var missing = Variables.Get<int>("missing");
  int j = missing;  // 0
  ```

- Строковое представление
  - `v.ToString()` показывает имя и текущее значение, либо `"<not set>"`, если записи не существует.
  ```csharp
  var a = Variables.Get<int>("a");
  Log.Info(a.ToString()); // "a = <not set>"
  a.Value = 10;
  Log.Info(a.ToString()); // "a = 10"
  ```

## Типы и конвертация: что происходит на самом деле

`ScriptVariable<T>` сначала пытается прочитать значение «как есть», а затем — сконвертировать его. Конвертация выполняется через внутренний репозиторий конвертеров (`IBindingValueConverterRepository`).

- Если значение уже имеет тип `T` — оно возвращается как есть.
- Если это другой тип, но есть конвертер в `T` — значение конвертируется и возвращается.
- Для строкового назначения (`T == string`) подходит почти любой тип — будет возвращён `value.ToString()`.
- Для `Nullable<T>` конвертация идёт к базовому типу.
- Если значение равно `null`, `TryGetValue` вернёт `false`, а `Value` — `default(T)`.
- Если конвертации нет — `Value` вернёт `default(T)`, `TryGetValue` вернёт `false`, а `GetOrThrow` выбросит исключение.

Примеры:

```csharp
// 1) Типы совпадают — всё просто
Variables.Get<int>("n").Set(123);
Log.Info(Variables.Get<int>("n").Value); // 123

// 2) Чтение как другого типа
((IScriptVariable)Variables.Get<int>("mix")).Value = "abc"; // записали строку в обход типобезопасности
var v = Variables.Get<int>("mix");
Log.Info(v.Value);                  // 0 — default(int)
Log.Info(v.TryGetValue(out var x)); // false
// v.GetOrThrow(); // throws InvalidOperationException

// 3) Почти всё можно превратить в string
((IScriptVariable)Variables.Get<string>("text")).Value = 42;
Log.Info(Variables.Get<string>("text").Value); // "42"
```

Совет: если вам нужна конкретная конвертация, зарегистрируйте конвертер в `IBindingValueConverterRepository`. После этого `TryGetValue` и `Value` начнут возвращать нужный вам тип.

## Подписка на изменения: `Listen()`

Если нужно реактивно отслеживать изменения переменной, используйте `Listen()`.

- Возвращает `IObservable<T>`.
- Сразу отправляет текущее значение (или `default(T)`, если записи нет).
- Затем отправляет только действительно новые значения (`DistinctUntilChanged`).
- `Remove()` отправляет событие «сброса» к `default(T)`.

Пример:

```csharp
var hp = Variables.Get<int>("hp");
var observed = new List<int>();
using var sub = hp.Listen().Subscribe(x => {
    Log.Info($"HP: {x}");
    observed.Add(x);
});

hp.Value = 100; // HP: 100
hp.Value = 100; // not emitted (distinct)
hp.Value = 90;  // HP: 90
hp.Remove();    // HP: 0 (default)
```

Для ссылочных типов первым значением будет `null`, затем новые значения, а потом снова `null` при `Remove()` или если вы сами присвоите `null`.

## Переменные аур и папок, иерархия значений

Каждая аура и папка тоже является контейнером переменных. Здесь действует иерархия: дочерние элементы «видят» значения родителей и могут их переопределять.

Есть два способа доступа:

- По пути:
  ```csharp
  var auraVar = Variables.Get<int>(@".\Something", "myCounter");
  auraVar.Value = 16;
  ```
- Через объект:
  ```csharp
  var aura = AuraTree.GetAuraByPath(@".\Something");
  var auraVar = Variables.Get<int>(aura, "myCounter");
  auraVar.Value = 16;
  ```

Почему это важно: можно задать «значение по умолчанию» на папке — и все вложенные ауры смогут его читать. А там, где нужно, переопределить локально. Это очень удобно для общих настроек: целевое окно, input simulator и т. п.

Нюанс: переменные с префиксом `default.` часто используются как «базовые значения» по всему дереву. Например, если переопределить `default.WindowSelector.TargetWindow`, это повлияет на выбор окна во всех вложенных элементах.

## Операторы и удобные мелочи

Для удобства доступны операторы и неявные преобразования.

- Неявное преобразование к `T`:
  ```csharp
  var score = Variables.Get<int>("score").Set(5);
  int current = score; // 5
  ```
- Сравнение по значению:
  ```csharp
  var a = Variables.Get<int>("a").Set(3);
  var b = Variables.Get<int>("b").Set(3);
  if (a == b) { /* same values */ }
  if (a != b) { /* different values */ }
  ```
- Числовые сравнения (когда `T` — сравнимый числовой тип):
  ```csharp
  var x = Variables.Get<int>("x").Set(2);
  var y = Variables.Get<int>("y").Set(3);
  if (y > x) { /* yes, 3 > 2 */ }
  if (x < 3) { /* yes */ }
  ```

## Типичные сценарии

- «Конфигурационный скрипт» записывает параметры, а «рабочий скрипт» их читает.
- Счётчики запусков, задержки, интервалы — сохраняются между запусками.
- Кэш промежуточных результатов, который нужен нескольким скриптам.

Пример «config -> worker»:

```csharp
// Config script
Variables.Get<string>("target").Set("Shaper");
Variables.Get<int>("maxAttempts").Set(5);

// Worker script
var target = Variables.Get<string>("target").GetOrThrow();
var maxAttempts = Variables.Get<int>("maxAttempts").GetOrThrow();
for (var i = 0; i < maxAttempts; i++)
{
    Log.Info($"Try {i+1} on {target}");
}
```

## Частые ошибки и как их избежать

- «Почему `Value` вернул `0/false/null`, а не выбросил исключение?»
  - Это ожидаемое поведение: `Value` никогда не выбрасывает исключения. Если нужна строгая проверка, используйте `GetOrThrow()`.

- «`TryGetValue` вернул `false` для `null` — это баг?»
  - Нет. Для `TryGetValue` `null` означает «значения нет». Для ссылочных типов `HasValue` при этом будет `true` (запись существует), а `TryGetValue` — `false` (потому что реального значения нет).

- «Почему `Listen()` не отправил то же значение второй раз?»
  - Подряд идущие одинаковые значения отфильтровываются.

- «Я удалил переменную, что отправит `Listen()`?»
  - `default(T)`. Для `int` это `0`, для `string` — `null` и так далее.

## Рекомендации

- Объявляйте `ScriptVariable<T>` один раз и переиспользуйте его.
- Для «обязательных» параметров читайте через `GetOrThrow()`.
- Для «необязательных» значений лучше использовать `TryGetValue`, а не сравнение с `default(T)`.
- Не путайте `set null` и `Remove()`:
  - `set null` — запись остаётся (`HasValue == true`), но `TryGetValue == false`.
  - `Remove()` — запись удаляется (`HasValue == false`), а `Value` возвращает `default(T)`.
- Для подписок не забывайте вызывать `Dispose()` у возвращаемого `IDisposable` (обычно удобно через `using var ...`).
- Давайте переменным понятные имена и придерживайтесь единого формата, например `snake_case` или `camelCase`.

## Краткая шпаргалка по API

```csharp
var v = Variables.Get<int>("n");

// чтение/запись
int x = v.Value;  // безопасно, default если нет значения/неверный тип
v.Value = 10;     // запись

// строгий сценарий
var required = v.GetOrThrow(); // исключение, если нет значения/неверный тип/null

// аккуратное чтение
if (v.TryGetValue(out var val)) { /* ok */ } else { /* no value */ }

// подписка на изменения
using var sub = v.Listen().Subscribe(x => Log.Info($"n = {x}"));

// удаление
var removed = v.Remove();

// прочее
bool has = v.HasValue; // существует ли запись?
string name = v.Name;
IHasVariables src = v.Source; // откуда читает/куда пишет
```