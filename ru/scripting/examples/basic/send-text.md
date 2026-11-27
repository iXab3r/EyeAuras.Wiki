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

По `F2` скрипт печатает три строки с разной задержкой и нажимает Enter между ними. Откройте пустой тестовый документ и оставьте курсор в его текстовом поле.

Нужны доступный `Windows Input` и редактор, который принимает обычные клавиши. `TargetWindow = null` означает активное окно, поэтому перед запуском фокус должен быть в вашем документе. Если нажать `Run` мышью в EyeAuras, фокус может уйти из документа, поэтому запускайте пример горячей клавишей.

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

3. Откройте пустой документ, поставьте курсор в поле и отпустите клавиши-модификаторы.
4. Нажмите и отпустите `F2`. На отдельных строках появятся `Hello, world!`, `this one is a bit slower` и `and this one is very slow!`.

| Вызов или настройка | Что задаёт |
| --- | --- |
| `Text(string, int? delayMs)` | Обычный текст. Синтаксис Send Sequence или AutoHotkey здесь не работает: `{Enter}` внутри строки не нажимает клавишу. |
| `KeyPressDelay = new RandomInteger(1, 5)` | Диапазон задержек для первого фрагмента. Он задан явно, поэтому действует и при повторном Run. |
| `new RandomInteger(5, 15)` | Диапазон для дальнейшего ввода, где нет своего `delayMs`. |
| `delayMs: 30` | Фиксированная задержка для одного вызова `Text`. |
| `KeyPress(Key.Enter)` | Отдельное нажатие Enter между фрагментами. Ему тоже можно задать `keyPressDelay`, например 30. |

`Text` в этом API печатает посимвольно, через `SendChars`: каждый символ превращается в нажатие клавиши, а раскладка определяется автоматически. Если подходящая раскладка не нашлась, берётся текущая. На символе, который не поддерживается, преобразование может закончиться ошибкой. Режимы `Control+V` / `Shift+Insert` из UI относятся к другим настройкам и параметром `delayMs` не выбираются.

<details>
<summary>Перевод строки в C# и фактическое нажатие клавиши</summary>

В обычной C#-строке `"\n"` — это один символ LF. В дословной `@"\n"` — обратная косая черта и буква n. Сам литерал ещё не определяет, как этот символ дойдёт до приложения: посимвольный ввод преобразует его через клавиатурную раскладку. Поэтому в примере Enter нажимается отдельными вызовами.

Дословные строки удобны для путей, обычные — для управляющих последовательностей. Не путайте их с синтаксисом [Send Sequence](/ru/actions/sendinput/send-sequence).

</details>

`Text` синхронно ждёт, пока ввод будет отправлен. Уже начатый `Text` токен Run не принимает и по Stop мгновенно не останавливается. Пока идёт печать, не переключайте активное окно. Если задать `TargetWindow`, стандартный ввод запросит активацию этого окна.

Сервис принадлежит контексту скрипта. В обычный класс его передают явно: `GetService` и токен — не глобальные API C#. Полное описание — [ISendInputScriptingApi](/ru/scripting/api/ISendInputScriptingApi).
