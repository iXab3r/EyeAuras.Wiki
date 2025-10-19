---
title: Переменные
description: использование в скриптах
published: true
date: 2025-10-19T11:24:15.492Z
tags: 
editor: markdown
dateCreated: 2025-10-19T11:24:15.492Z
---

# Скриптовые переменные в EyeAuras

## Зачем вообще переменные вне кода?
Обычный скрипт живёт недолго: запустился, сделал работу, завершился. Но иногда хочется хранить настройки и результаты подольше — между перезапусками скрипта и даже передавать их другим скриптам. Для этого в EyeAuras есть «внешние» переменные — у скриптов, аур и папок.

Главные кейсы:
- хранить настройки, которые меняются редко;
- обмениваться данными между скриптами (конфиг один, логика — в другом);
- видеть значения в UI на вкладке Variables у ауры/папки.


## Где могут жить данные
- Локальные переменные — живут в пределах метода. Самые обычные:
  ```csharp
  var x = 123;
  ```
- Свойства «песочницы» — поля/свойства вашего класса-скрипта. Живут, пока вы не поменяли код (после изменения скрипт перекомпилируется и свойства обнулятся):
  ```csharp
  int MyCounter { get; set; }
  // ...
  MyCounter = 16;
  Log.Info($"Counter: {MyCounter}");
  ```
- Переменные скриптов/аур/папок — долговременное хранение, видны в UI и доступны другим скриптам. Это то, о чём статья.


## Как вообще работать со скриптовыми переменными
В «сыром» виде можно читать/писать переменные через индексатор по строковому ключу:
```csharp
Variables["myCounter"] = 1;
Log.Info($"Counter: {Variables["myCounter"]}");
```
Минусы: тип теряется, нужен ручной кастинг. В C# это неудобно и ломко.

Решение — ScriptVariable<T>: один раз указываем имя и тип, дальше работаем типобезопасно.
```csharp
var myCounter = Variables.Get<int>("myCounter");
myCounter.Value = myCounter.Value + 1;
Log.Info($"Counter value: {myCounter}"); // 2, 3, 4, ...
```

Похоже на обычную переменную: читаем, пишем, логируем. Но внутри значение хранится в общем «хранилище переменных», доступном другим скриптам.


## Как получить переменную
- Переменная текущего скрипта:
  ```csharp
  var v = Variables.Get<float>("speed");
  v.Value = 1.5f;
  ```
- Переменная другой ауры/папки по пути:
  ```csharp
  var auraVar = Variables.Get<int>(@".\Gameplay\Bosses\Shaper", "attempts");
  auraVar.Value++;
  ```
- Переменная, если у вас уже есть IHasVariables:
  ```csharp
  var aura = AuraTree.GetAuraByPath(@".\Something");
  var auraVar = Variables.Get<string>(aura, "status");
  Log.Info($"Status: {auraVar.Value}");
  ```


## Самое важное про поведение ScriptVariable<T>
Ниже — простые правила. Лучше один раз понять, чем долго дебажить.

- Value
  - Всегда безопасен при чтении: никогда не бросает исключение.
  - Если значения нет или тип не подходит — вернёт default(T) (0 для чисел, false для bool, null для ссылочных типов).
  - При присвоении просто записывает в хранилище.
  ```csharp
  var i = Variables.Get<int>("i");
  Log.Info(i.Value); // 0, если переменная не установлена
  i.Value = 42;      // записали 42
  ```

- HasValue
  - true, если запись существует в хранилище (даже если это null для ссылочного типа).
  - false, если записи нет вообще.
  ```csharp
  var s = Variables.Get<string>("name");
  Log.Info(s.HasValue); // false, записи нет
  s.Value = null;
  Log.Info(s.HasValue); // true, запись есть, но значение null
  ```

- TryGetValue(out T value)
  - Возвращает true только если запись существует и значение НЕ null и его можно привести/сконвертировать к T.
  - Возвращает false, если запись отсутствует, значение null или тип совсем не подходит.
  ```csharp
  var f = Variables.Get<float>("ratio");
  if (f.TryGetValue(out var val))
  {
      Log.Info($"ratio = {val}");
  }
  else
  {
      Log.Info("ratio не задан или равен null или не конвертируется к float");
  }
  ```

- GetOrThrow()
  - Единственный «опасный» способ чтения.
  - Бросает InvalidOperationException, если записи нет, значение равно null (для ссылочных типов) или его нельзя привести/сконвертировать к T.
  ```csharp
  var required = Variables.Get<int>("port");
  var port = required.GetOrThrow(); // упадёт, если нет записи, null или тип не тот
  ```

- Remove()
  - Удаляет запись из хранилища. Возвращает true, если запись была, и false — если уже не было.
  - После Remove() чтение Value вернёт default(T), HasValue станет false, а в Listen() придёт «сброс к значению по умолчанию».
  ```csharp
  var v = Variables.Get<int>("x").Set(10);
  v.Remove(); // true
  Log.Info(v.Value);    // 0
  Log.Info(v.HasValue); // false
  ```

- Неявное преобразование к T
  - Можно написать просто: int i = myIntVar;
  ```csharp
  var myIntVar = Variables.Get<int>("score").Set(5);
  int i = myIntVar; // 5
  var missing = Variables.Get<int>("missing");
  int j = missing;  // 0
  ```

- Строковое представление
  - v.ToString() показывает имя и текущее значение, либо «<not set>», если записи нет.
  ```csharp
  var a = Variables.Get<int>("a");
  Log.Info(a.ToString()); // "a = <not set>"
  a.Value = 10;
  Log.Info(a.ToString()); // "a = 10"
  ```


## Типы и конвертации: что происходит на самом деле
ScriptVariable<T> сначала пытается прочитать значение «как есть», затем — сконвертировать. Конвертация делается через внутренний репозиторий конвертеров (IBindingValueConverterRepository).

- Если тип уже T — просто возвращается.
- Если тип другой, но есть конвертер к T — значение конвертируется и возвращается.
- Для строки-назначения (T == string) допустим «любой» тип — вернётся value.ToString().
- Для Nullable<T> — конвертируется к базовому типу.
- Если значение null, TryGetValue вернёт false, а Value — default(T).
- Если конвертации нет — Value вернёт default(T), TryGetValue даст false, а GetOrThrow бросит исключение.

Примеры:
```csharp
// 1) Совпадающие типы — всё просто
Variables.Get<int>("n").Set(123);
Log.Info(Variables.Get<int>("n").Value); // 123

// 2) Пытаемся прочитать как другой тип
((IScriptVariable)Variables.Get<int>("mix")).Value = "abc"; // пишем строку «в обход»
var v = Variables.Get<int>("mix");
Log.Info(v.Value);                 // 0 — default(int)
Log.Info(v.TryGetValue(out var x)); // false
// v.GetOrThrow(); // бросит InvalidOperationException

// 3) В строку можно почти всё
((IScriptVariable)Variables.Get<string>("text")).Value = 42;
Log.Info(Variables.Get<string>("text").Value); // "42"
```

Подсказка: если вам нужна специфическая конвертация, регистрируйте конвертер в `IBindingValueConverterRepository`. Тогда TryGetValue/Value начнут возвращать нужный тип.


## Подписки на изменения: Listen()
Хотите реактивно реагировать на изменения переменной? Use Listen().
- Возвращает IObservable<T>.
- Сначала сразу даст текущее значение (или default(T), если записи нет).
- Затем будет присылать только действительно новые значения (DistinctUntilChanged).
- Remove() присылает «сброс» к default(T).

Пример:
```csharp
var hp = Variables.Get<int>("hp");
var observed = new List<int>();
using var sub = hp.Listen().Subscribe(x => {
    Log.Info($"HP: {x}");
    observed.Add(x);
});

hp.Value = 100; // HP: 100
hp.Value = 100; // не придёт (distinct)
hp.Value = 90;  // HP: 90
hp.Remove();    // HP: 0 (default)
```

Для ссылочных типов первым будет null, потом новые значения, потом снова null при Remove() или если вы записали null.


## Переменные аур и папок, иерархия значений
Каждая аура/папка — тоже контейнер переменных. Есть иерархия: дочерние элементы «видят» значения родителя и могут их переопределять.

Два способа доступа:
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

Зачем это нужно: задали «дефолт» на папке — все вложенные ауры смогут его читать. А где нужно — переопределите локально. Очень удобно для общих настроек (окно-цель, симулятор ввода и т. п.).

Нюанс: переменные с префиксом `default.` часто используются как «базовые значения» по дереву. Если вы переопределите, например, `default.WindowSelector.TargetWindow` — это повлияет на выбор окна во всех вложенных элементах.


## Операторы и удобства
Для удобства есть операторы и неявные преобразования.

- Неявное преобразование к T:
  ```csharp
  var score = Variables.Get<int>("score").Set(5);
  int current = score; // 5
  ```
- Равенство по значению:
  ```csharp
  var a = Variables.Get<int>("a").Set(3);
  var b = Variables.Get<int>("b").Set(3);
  if (a == b) { /* одинаковые значения */ }
  if (a != b) { /* разные значения */ }
  ```
- Сравнения «как числа» (если T — сравнимый тип):
  ```csharp
  var x = Variables.Get<int>("x").Set(2);
  var y = Variables.Get<int>("y").Set(3);
  if (y > x) { /* да, 3 > 2 */ }
  if (x < 3) { /* да */ }
  ```


## Типичные сценарии
- «Конфиг-скрипт» пишет параметры, «рабочий скрипт» их читает.
- Счётчики запусков, задержки, интервалы — живут между запусками.
- Кэширование промежуточных результатов, которые нужны нескольким скриптам.

Пример «конфиг -> рабочий»:
```csharp
// Конфиг-скрипт
Variables.Get<string>("target").Set("Shaper");
Variables.Get<int>("maxAttempts").Set(5);

// Рабочий скрипт
var target = Variables.Get<string>("target").GetOrThrow();
var maxAttempts = Variables.Get<int>("maxAttempts").GetOrThrow();
for (var i = 0; i < maxAttempts; i++)
{
    Log.Info($"Try {i+1} on {target}");
}
```


## Частые ошибки и как их избежать
- «Почему Value вернул 0/false/null вместо исключения?»
  - Так задумано: Value никогда не бросает. Если нужно строго — используйте GetOrThrow().

- «TryGetValue вернул false при null, это баг?»
  - Нет. null считается «значение отсутствует» для TryGetValue. Для ссылочных типов в HasValue будет true (запись существует), а TryGetValue — false (потому что реального значения нет).

- «Почему Listen() не прислал одинаковое значение второй раз?»
  - Одинаковые подряд значения фильтруются.

- «Удалил переменную, что придёт в Listen()?»
  - Придёт default(T). Для int — 0, для string — null и т. д.


## Лучшие практики
- Объявляйте ScriptVariable<T> один раз и переиспользуйте.
- Для «обязательных» параметров читайте через GetOrThrow().
- Для «необязательных» — TryGetValue, а не проверка на default(T).
- Не путайте set null и Remove():
  - set null — запись остаётся (HasValue == true), но TryGetValue == false.
  - Remove() — записи нет (HasValue == false), Value вернёт default(T).
- Для подписок не забудьте Dispose() у возвращённого IDisposable (используйте using var ...).
- Давайте переменным понятные имена и придерживайтесь единого формата (например, snake_case или camelCase).


## Краткая «шпаргалка» по API
```csharp
var v = Variables.Get<int>("n");

// чтение/запись
int x = v.Value;  // безопасно, default если нет значения/тип не тот
v.Value = 10;     // записать

// строгие сценарии
var required = v.GetOrThrow(); // исключение если нет/тип не тот/null

// аккуратное чтение
if (v.TryGetValue(out var val)) { /* ok */ } else { /* нет значения */ }

// подписка на изменения
using var sub = v.Listen().Subscribe(x => Log.Info($"n = {x}"));

// удалить
var removed = v.Remove();

// служебное
bool has = v.HasValue; // запись существует?
string name = v.Name;
IHasVariables src = v.Source; // откуда читается/куда пишется
```