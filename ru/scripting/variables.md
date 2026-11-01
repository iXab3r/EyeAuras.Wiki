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

Обычный скрипт живёт недолго: запускается, выполняет задачу и завершается. Но иногда нужно хранить настройки и результаты дольше — между запусками в том же контексте и даже делиться ими с другими скриптами. Для этого в EyeAuras есть «внешние» переменные — на уровне скриптов, аур и папок.

Основные сценарии:
- хранение настроек, которые редко меняются
- обмен данными между скриптами (например, конфиг в одном, логика в другом)
- просмотр значений в UI на вкладке Variables у ауры или папки

## Где могут храниться данные

- Локальные переменные — живут внутри метода. Обычный вариант:
  ```csharp
  var x = 123;
  ```
- Свойства sandbox — поля/свойства класса вашего скрипта. Они сохраняются при повторном запуске с тем же контекстом. Изменение зависимой версии проекта или пересоздание контекста сбрасывает состояние:
  ```csharp
  int MyCounter { get; set; }
  // ...
  MyCounter = 16;
  Log.Info($"Counter: {MyCounter}");
  ```
- Переменные Script/Aura/Folder — хранилище выбранного владельца, видимое в UI и доступное другим скриптам через этого владельца. Именно о них и пойдёт речь в этой статье.

## Прочитать и увеличить счётчик

Все примеры ниже — код для `Script.csx`. `Variables` и `AuraTree` предоставляет host. В обычный класс передайте `IVariablesScriptingApi` из `EyeAuras.Scripting.Api` либо готовый `ScriptVariable<T>` из `EyeAuras.Scripting.UserSpace`. Получение handle не создаёт запись и не требует `Dispose`; подпиской `Listen()` владеет вызывающий код. Это не гарантия сохранения произвольных объектов после перезапуска приложения.

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
Log.Info($"Counter value: {myCounter.Value}"); // 2 после записи 1 выше; затем 3, 4, ...
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
  // В дереве должна существовать аура/папка по этому пути.
  var auraVar = Variables.Get<int>(@".\Gameplay\Bosses\Shaper", "attempts");
  auraVar.Value++;
  ```
- Переменная, если у вас уже есть `IHasVariables`:
  ```csharp
  var aura = AuraTree.GetAuraByPath(@".\Something");
  var auraVar = Variables.Get<string>(aura, "status");
  Log.Info($"Status: {auraVar.Value}");
  ```

## Как выбрать способ чтения

Ниже — простые правила, которые лучше понять один раз, чем потом долго отлаживать.

- `Value`
  - При отсутствии значения возвращается `default(T)`. Это не универсальная гарантия отсутствия исключений в пользовательских преобразованиях или сериализации.
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
  Log.Info(s.HasValue); // зависит от того, была ли запись раньше
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
  - Требует заданное значение нужного типа.
  - Выбрасывает `InvalidOperationException`, если записи нет, значение `null` или его нельзя привести/конвертировать к `T`.
  ```csharp
  var required = Variables.Get<int>("port");
  var port = required.GetOrThrow(); // выбросит исключение, если нет записи, null или неверный тип
  ```

- `Remove()`
  - Удаляет запись из хранилища. Возвращает `true`, если запись существовала, и `false`, если нет.
  - Удаляется локальная запись. Если у родителя есть одноимённое значение, оно снова станет видимым; иначе `Value` вернёт `default(T)` и `HasValue` станет `false`. `Listen()` получит новое эффективное значение, если оно отличается от предыдущего.
  ```csharp
  var v = Variables.Get<int>("x").Set(10);
  v.Remove(); // true, если локальная запись существовала
  Log.Info(v.Value);    // 0, если у родителя нет x
  Log.Info(v.HasValue); // false, если у родителя нет x
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

## Типы и конвертация

`ScriptVariable<T>` сначала пытается прочитать значение «как есть», а затем — сконвертировать его. Конвертация выполняется через внутренний репозиторий конвертеров (`IBindingValueConverterRepository`).

- Если значение уже имеет тип `T` — оно возвращается как есть.
- Если это другой тип, но есть конвертер в `T` — значение конвертируется и возвращается.
- Для строкового назначения (`T == string`) подходит почти любой тип — будет возвращён `value.ToString()`.
- Для `Nullable<T>` конвертация идёт к базовому типу.
- Если значение равно `null`, `TryGetValue` вернёт `false`, а `Value` — `default(T)`.
- Если преобразование для `TryGetValue` не найдено — он вернёт `false`, а `Value` вернёт `default(T)`.

**Ограничение реализации:** в рассмотренной версии `GetOrThrow()` после проверки точного типа передаёт конвертеру оболочку `AuraVariable`, а `TryGetValue()` и `Listen()` — её `Value`. Поэтому нельзя рассчитывать на одинаковую конвертацию. Для обязательных параметров храните сразу нужный тип. Между AssemblyLoadContext есть отдельная попытка преобразования одноимённых value types через JSON; она может выбросить исключение и не предназначена для произвольных классов.

Примеры ниже предполагают, что для этих имён не зарегистрированы ваши собственные преобразования.

```csharp
// 1) Типы совпадают — всё просто
Variables.Get<int>("n").Set(123);
Log.Info(Variables.Get<int>("n").Value); // 123

// 2) Чтение как другого типа
((EyeAuras.Scripting.UserSpace.IScriptVariable)Variables.Get<int>("mix")).Value = "abc"; // записали строку в обход типобезопасности
var v = Variables.Get<int>("mix");
Log.Info(v.Value);                  // 0 — default(int)
Log.Info(v.TryGetValue(out var x)); // false
// v.GetOrThrow(); // throws InvalidOperationException

// 3) Почти всё можно превратить в string
((EyeAuras.Scripting.UserSpace.IScriptVariable)Variables.Get<string>("text")).Value = 42;
Log.Info(Variables.Get<string>("text").Value); // "42"
```

Совет: если вам нужна конкретная конвертация, зарегистрируйте конвертер в `IBindingValueConverterRepository`. После этого `TryGetValue` и `Value` начнут возвращать нужный вам тип.

## Наблюдать изменения и освободить подписку

Если нужно реактивно отслеживать изменения переменной, используйте `Listen()`.

- Возвращает `IObservable<T>`.
- Сразу отправляет текущее значение (или `default(T)`, если записи нет).
- Затем отправляет только действительно новые значения (`DistinctUntilChanged`).
- `Remove()` меняет эффективное значение: на родительское либо на `default(T)`, если родительского нет.

Пример:

```csharp
using System.Collections.Generic;
using System.Reactive.Linq;

var hp = Variables.Get<int>("batchExample.hp");
var observed = new List<int>();
using var sub = hp.Listen().Subscribe(x => {
    Log.Info($"HP: {x}");
    observed.Add(x);
});

hp.Value = 100; // HP: 100
hp.Value = 100; // not emitted (distinct)
hp.Value = 90;  // HP: 90
hp.Remove();    // HP: 0, если у родителя нет batchExample.hp
```

Подписка действует до конца этого блока благодаря `using var`. Для долгого наблюдения оставьте скрипт запущенным и привяжите подписку к времени жизни запуска. Начальное значение зависит от хранилища; отсутствие записи и явный `null` дают `default(T)`. Родительское значение тоже может стать видимым после удаления локального.

## Выбрать владельца и учитывать иерархию

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

Пути в примерах требуют заранее созданного элемента дерева. Если его нет, перегрузка `Get<T>(path, name)` выбросит исключение. `Get<T>(source, name)` использует переданный `IHasVariables` и не ищет объект в дереве.

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
- Числовые сравнения делайте по `.Value`: у handle нет собственных операторов `<` и `>`.
  ```csharp
  var x = Variables.Get<int>("x").Set(2);
  var y = Variables.Get<int>("y").Set(3);
  if (y.Value > x.Value) { /* yes, 3 > 2 */ }
  if (x.Value < 3) { /* yes */ }
  ```

## Типичные сценарии

- «Конфигурационный скрипт» записывает параметры, а «рабочий скрипт» их читает.
- Счётчики запусков, задержки, интервалы — сохраняются между запусками.
- Кэш промежуточных результатов, который нужен нескольким скриптам.

Пример «config -> worker»: заранее создайте папку `SharedConfig` рядом с контекстами обоих скриптов и укажите в обоих один и тот же путь. Вызов `Variables.Get<T>(name)` без владельца работает с текущим контекстом и сам по себе не связывает два разных скрипта.

```csharp
// Config Script.csx — выполнить первым
var shared = AuraTree.GetFolderByPath(@".\SharedConfig");
Variables.Get<string>(shared, "target").Set("Shaper");
Variables.Get<int>(shared, "maxAttempts").Set(5);
```

```csharp
// Worker Script.csx — тот же владелец
var shared = AuraTree.GetFolderByPath(@".\SharedConfig");
var target = Variables.Get<string>(shared, "target").GetOrThrow();
var maxAttempts = Variables.Get<int>(shared, "maxAttempts").GetOrThrow();
for (var i = 0; i < maxAttempts; i++)
{
    Log.Info($"Try {i+1} on {target}");
}
```

## Частые ошибки и как их избежать

- «Почему `Value` вернул `0/false/null`, а не выбросил исключение?»
  - Это ожидаемое поведение при отсутствии значения или неудачном преобразовании. Если нужна строгая проверка, используйте `GetOrThrow()`.

- «`TryGetValue` вернул `false` для `null` — это баг?»
  - Нет. Для `TryGetValue` `null` означает «значения нет». Для ссылочных типов `HasValue` при этом будет `true` (запись существует), а `TryGetValue` — `false` (потому что реального значения нет).

- «Почему `Listen()` не отправил то же значение второй раз?»
  - Подряд идущие одинаковые значения отфильтровываются.

- «Я удалил переменную, что отправит `Listen()`?»
  - Родительское значение либо `default(T)`, если родительского нет. Событие будет только при изменении эффективного значения.

## Рекомендации

- Объявляйте `ScriptVariable<T>` один раз и переиспользуйте его.
- Для «обязательных» параметров читайте через `GetOrThrow()`.
- Для «необязательных» значений лучше использовать `TryGetValue`, а не сравнение с `default(T)`.
- Не путайте `set null` и `Remove()`:
  - `set null` — запись остаётся (`HasValue == true`), но `TryGetValue == false`.
  - `Remove()` — удаляется локальная запись; родительское значение, если оно есть, снова видно.
- Для подписок не забывайте вызывать `Dispose()` у возвращаемого `IDisposable` (обычно удобно через `using var ...`).
- Давайте переменным понятные имена и придерживайтесь единого формата, например `snake_case` или `camelCase`.

## Краткая шпаргалка по API

```csharp
using System.Reactive.Linq;

var v = Variables.Get<int>("n");

// чтение/запись
int x = v.Value;  // default, если значение отсутствует или преобразование не удалось
v.Value = 10;     // запись

// строгий сценарий
var required = v.GetOrThrow(); // исключение, если нет значения/неверный тип/null

// аккуратное чтение
if (v.TryGetValue(out var val)) { /* ok */ } else { /* no value */ }

// подписка на изменения
using var sub = v.Listen().Subscribe(value => Log.Info($"n = {value}"));

// удаление
var removed = v.Remove();

// прочее
bool has = v.HasValue; // существует ли запись?
string name = v.Name;
var src = v.Source; // откуда читает/куда пишет
```

Не путайте `v.TryGetValue(out value)` у handle с `Variables.TryGetValue<T>(name, out value)` у accessor. Второй делает прямое приведение сохранённого объекта и может выбросить исключение при несовместимом типе. Подробные перегрузки — [IVariablesScriptingApi](/ru/scripting/api/IVariablesScriptingApi), маршруты к SDK/reference — [карта переменных](/ru/scripting/api/scripting/variables).
