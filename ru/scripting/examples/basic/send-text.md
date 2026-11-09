---
title: Печатаем текст
description: 
published: true
date: 2024-02-24T00:41:30.125Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:41:30.125Z
---

# Напечатать три строки в собственном редакторе

Откройте пустой тестовый документ и оставьте фокус в его текстовом поле. По `F2` скрипт напечатает три строки с разной задержкой и явными нажатиями Enter между ними. Документ остаётся локальным: пример не нажимает кнопку отправки и не выбирает внешнего адресата.

Нужны доступный `Windows Input` и редактор, принимающий обычные клавиши. `TargetWindow = null` означает активное окно, поэтому перед запуском фокус должен быть в вашем документе. Нажатие `Run` мышью в EyeAuras может перенести фокус — для опыта используйте горячую клавишу.

1. Создайте ауру с [Hotkey Is Active](/ru/triggers/hotkey-is-active): клавиша `F2`, режим `Hold`.
2. В `On Enter` добавьте `C# Script` и вставьте весь код в верхнеуровневый `Script.csx`:

```csharp
using System.Windows.Input;
using EyeAuras.Roxy.Api;
using PoeShared.Scaffolding;

var sendInputApi = GetService<ISendInputScriptingApi>();
sendInputApi.InputSimulatorId = "Windows Input";
sendInputApi.KeyPressDelay = new RandomInteger(1, 5);
sendInputApi.TargetWindow = null; // ввод в активное окно
cancellationToken.ThrowIfCancellationRequested();
sendInputApi.Text("Hello, world!"); // печатаем со стандартным интервалом (рандом, 1-5мс)

sendInputApi.KeyPressDelay = new RandomInteger(5, 15); //меняем интервал на 5-15мс
cancellationToken.ThrowIfCancellationRequested();
sendInputApi.KeyPress(Key.Enter);
sendInputApi.Text("this one is a bit slower");

cancellationToken.ThrowIfCancellationRequested();
sendInputApi.KeyPress(Key.Enter);
sendInputApi.Text("and this one is very slow!", delayMs: 30); //печатаем с интервалом по 30мс
```

3. Откройте собственный пустой документ, установите курсор в поле и отпустите клавиши-модификаторы.
4. Нажмите и отпустите `F2`. Должны появиться `Hello, world!`, `this one is a bit slower` и `and this one is very slow!` на отдельных строках. При повторном запуске текст добавляется в текущее положение курсора.

![](https://i.imgur.com/mwIxxsL.gif)

Сохранённая демонстрация показывает прежний вариант печати; в текущем примере переход строки задан отдельным `KeyPress(Key.Enter)`.

| Вызов или настройка | Что задаёт |
| --- | --- |
| `Text(string, int? delayMs)` | Обычный текст. Это не грамматика Send Sequence или AutoHotkey; `{Enter}` внутри строки не заменяет вызов клавиши. |
| `KeyPressDelay = new RandomInteger(1, 5)` | Исходный диапазон задержек первого фрагмента, задан явно и при повторном Run. |
| `new RandomInteger(5, 15)` | Диапазон для последующего ввода без отдельного `delayMs`. |
| `delayMs: 30` | Фиксированная задержка для конкретного `Text`. |
| `KeyPress(Key.Enter)` | Отдельная клавиша Enter между фрагментами. Для неё тоже можно задать `keyPressDelay`, например 30. |

В этом API `Text` использует посимвольный путь `SendChars`: символы преобразуются в клавиши с выбором раскладки через автоматическое определение. Если подходящая раскладка не определилась, используется текущая; неподдерживаемый символ может привести к ошибке преобразования. Это не безусловный Unicode-ввод и не вставка через буфер обмена. Режимы UI `Control+V` / `Shift+Insert` принадлежат другим настройкам и не выбираются параметром `delayMs`.

<details>
<summary>Перевод строки в C# и фактическое нажатие клавиши</summary>

В обычной C#-строке `"\n"` — один символ LF, а в дословной `@"\n"` — обратная косая черта и буква n. Сам C#-литерал ещё не задаёт способ доставки этого символа приложению. Посимвольный путь преобразует его через клавиатурную раскладку; для требуемого Enter в этом примере используются отдельные вызовы клавиши.

Дословные строки удобны для путей, обычные — для управляющих последовательностей. Не путайте их с синтаксисом [Send Sequence](/ru/actions/sendinput/send-sequence).

</details>

`Text` синхронно ждёт отправки, но не подтверждает, что окно обработало все события. Проверки отмены разделяют короткие части; уже начатый `Text` не принимает токен Run и не останавливается мгновенно по Stop. Во время печати не меняйте активное окно. Ненулевой `TargetWindow` у стандартного ввода запрашивает активацию, а не универсальную фоновую доставку.

Сервис принадлежит контексту скрипта. В обычном классе его передают явно; `GetService` и токен не являются глобальными API C#. Полный контракт — [ISendInputScriptingApi](/ru/scripting/api/ISendInputScriptingApi).
