---
title: Горячие клавиши
description: Также известны как хоткеи
published: true
date: 2025-03-23T12:02:08.793Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-22T23:50:12.023Z
---
# Что такое Keybind'ы?

Keybind'ы позволяют привязать определённую функцию к нажатию клавиши или комбинации клавиш.

Это удобно, когда нужно быстро запускать какое-то действие — например, макрос или команду.

---

## Назначить клавишу и дождаться нажатия

Чтобы назначить горячую клавишу, используйте атрибут `[Keybind]`. Этот атрибут можно добавить к методу, и он будет вызываться при нажатии указанной клавиши.

Вставьте этот код в `Script.csx` у `C# Action`, запустите его и нажмите `Ctrl+2`:

```csharp
using System.Threading.Tasks;
using EyeAuras.Scripting.Api;

Log.Info("Waiting for Ctrl+2");
var runToken = cancellationToken;
await Task.Delay(System.Threading.Timeout.Infinite, runToken);

[Keybind("Ctrl+2", SuppressKey = false)]
public void OnKey()
{
    Log.Info("Ctrl+2 pressed");
}
```

В `Event Log` появится `Ctrl+2 pressed`; комбинация также дойдёт до других приложений. Без ожидания скрипт сразу завершится и обработчик перестанет принимать нажатия. Остановка запуска отменяет ожидание.

Runtime обнаруживает методы **объекта скрипта** при однократной настройке. Атрибут на методе произвольного helper-класса сам по себе не регистрирует хоткей. В текущей реализации обрабатываются клавиатурные комбинации.

---

## Параметры атрибута Keybind

Атрибут `[Keybind]` поддерживает несколько параметров:

- **`Hotkey`** — обязательный параметр, который задаёт горячую клавишу или комбинацию клавиш (например, `Ctrl+A`, `Shift+X`, `Alt+Tab`).
- **`SuppressKey`** — подавляет событие нажатия клавиши и не даёт ему дойти до других приложений. По умолчанию — `true`. **Важно:** подавление работает независимо от настройки `ActivationType` (см. ниже).
- **`IgnoreModifiers`** — игнорирует дополнительные клавиши-модификаторы. По умолчанию — `false`. Работает похоже на `*` в AutoHotkey (Wildcard).
- **`ActivationType`** — определяет, когда должен сработать метод: при **KeyDown** (когда клавиша нажата) или при **KeyUp** (когда клавиша отпущена). По умолчанию — `KeyDown`.

## Как работает IgnoreModifiers?

Если `IgnoreModifiers = true`, метод сработает даже в том случае, если одновременно нажаты дополнительные клавиши-модификаторы (например, `Shift`, `Alt`, `Ctrl`).

По умолчанию `IgnoreModifiers` **выключен**.

Пример:

```csharp
[Keybind("Ctrl+2", IgnoreModifiers = true)] // Triggers on: Ctrl+2, Ctrl+Alt+2, Ctrl+Shift+2
[Keybind("Ctrl+2", IgnoreModifiers = false)] // Triggers ONLY on Ctrl+2
```

## Как работает ActivationType?

Параметр `ActivationType` задаёт, в какой момент должен вызываться ваш метод:

- **`KeyDown`** — метод вызывается в момент нажатия клавиши.
- **`KeyUp`** — метод вызывается в момент отпускания клавиши.

Примеры:

```csharp
[Keybind("F1", ActivationType = KeybindActivationType.KeyDown)] // Calls method when F1 is pressed
[Keybind("F2", ActivationType = KeybindActivationType.KeyUp)]   // Calls method when F2 is released
```

## Как работает SuppressKey?

Если `SuppressKey = true`, нажатие клавиши не будет передано другим приложениям. Это полезно, если вы хотите обрабатывать клавишу исключительно внутри своего скрипта.

**Важно:** подавление всегда работает независимо от `ActivationType`. Например:

```csharp
[Keybind("F1", SuppressKey = true, ActivationType = KeybindActivationType.KeyUp)] // Suppresses F1 and triggers on release
[Keybind("F2", SuppressKey = true, ActivationType = KeybindActivationType.KeyDown)] // Suppresses F2 and triggers on press
```

Это помогает избежать «утечек» нажатий в нестандартных ситуациях.

---

## Переназначение клавиш

Комбинируя параметры, можно отправлять `R` при нажатии и отпускании `D`. Следующие члены добавьте в тот же `Script.csx`, оставив ожидание из первого примера. Добавьте `using System.Windows.Input;` в начало файла. `ISendInputScriptingApi` должен быть доступен в host, а целевое окно и способ отправки ввода — настроены в EyeAuras.

При `IgnoreModifiers = true` дополнительные модификаторы не мешают совпадению `D`. `SuppressKey` по умолчанию подавляет исходное событие. Отправка `R` зависит от выбранного input simulator; это не гарантия работы в каждом приложении. Если остановить скрипт между KeyDown и KeyUp, освобождение отправленной клавиши нужно предусмотреть отдельно.

```csharp
[Unity.Dependency]
public EyeAuras.Roxy.Api.ISendInputScriptingApi SendInput { get; init; }

[Keybind(Hotkey = "d", ActivationType = KeybindActivationType.KeyDown, IgnoreModifiers = true)]
public void OnKeyDownForD(){
    SendInput.KeyDown(Key.R);
}

[Keybind(Hotkey = "d", ActivationType = KeybindActivationType.KeyUp, IgnoreModifiers = true)]
public void OnKeyUpForD(){
    SendInput.KeyUp(Key.R);
}
```

---

## Как работают обработчики Keybind

Система поддерживает параллельную обработку нажатий. Это значит, что даже если вы быстро нажимаете несколько клавиш или многократно жмёте одну и ту же клавишу, каждый обработчик выполняется независимо.

### Как организовать последовательное выполнение

Ниже два варианта для того же `Script.csx`. Добавьте `using System.Threading;` и выберите один обработчик. Свойство с семафором сохраняется между вызовами, в отличие от локальной переменной внутри обработчика.

```csharp
SemaphoreSlim HotkeySemaphore { get; } = new(1, 1);

[Keybind("A", SuppressKey = false)]
public async Task HandleA()
{
    var runToken = cancellationToken;
    await HotkeySemaphore.WaitAsync(runToken);
    try
    {
        Log.Info("Processing key A");
        await Task.Delay(1000, runToken);
    }
    finally
    {
        HotkeySemaphore.Release();
    }
}
```

Нажатия ждут освобождения семафора. Переданный токен отменяет ожидание; уже запланированный обработчик не считается автоматически остановленным вместе со скриптом. Не делайте `async void`: runtime ожидает возвращённый `Task`.

### Как пропускать лишние нажатия

Если очередь не нужна, замените обработчик на этот, оставив то же свойство `HotkeySemaphore`:

```csharp
[Keybind("A", SuppressKey = false)]
public async Task HandleA()
{
    var runToken = cancellationToken;
    if (!HotkeySemaphore.Wait(0))
    {
        return;
    }
    try
    {
        Log.Info("Processing key A");
        await Task.Delay(1000, runToken);
    }
    finally
    {
        HotkeySemaphore.Release();
    }
}
```

`Wait(0)` проверяет и занимает слот одной операцией. Проверка `CurrentCount` перед отдельным захватом оставляет гонку: несколько обработчиков могут одновременно увидеть свободный слот.

## Полезные советы

-  Используйте `IgnoreModifiers = true`, если хотите обрабатывать комбинации независимо от дополнительных модификаторов.
-  Используйте `SemaphoreSlim` или другие механизмы синхронизации, если нужно не допускать одновременных вызовов одного и того же метода.
-  Помните, что методы могут принимать параметры — runtime разрешает их типы через Unity-контейнер при вызове (например, `IAuraEventLoggingService`). Нужная регистрация должна уже существовать. `Log`, `Sleep` и `cancellationToken` доступны здесь как члены host скрипта; в обычный класс зависимости передавайте явно.

Сигнатуры: [KeybindAttribute](https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.KeybindAttribute.html). Проверяйте версию reference относительно своей сборки EyeAuras.
## Граница времени жизни по исходникам

В [visitor среза c8b2304](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting/Visitors/HotkeyTrackerRuntimeVisitor.cs)
проверяются основная клавиша и обязательные модификаторы; `IgnoreModifiers`
разрешает дополнительные. Подавление помечает подходящие Down и Up до выбора
ребра для вызова метода. Если обязательный модификатор уже отпущен, KeyUp может
не пройти тот же тест совпадения.

Выход из Run прекращает приём новых событий, но не ожидает уже запланированные
фоновые обработчики и не отправляет KeyUp за клавиши, нажатые вашим кодом.
Обработчик читает токен песочницы в момент фактического запуска; отложенный
вызов может пережить Run, который его запланировал. Возвращённый Task ожидается
синхронно внутри фонового callback, а не основным скриптом. Для долгих обработчиков
нужна явная координация состояния, владельца запуска и завершения.
