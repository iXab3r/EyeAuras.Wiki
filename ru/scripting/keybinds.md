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

## Как это работает?

Чтобы назначить горячую клавишу, используйте атрибут `[Keybind]`. Этот атрибут можно добавить к методу, и он будет вызываться при нажатии указанной клавиши.

```csharp
[Keybind("p")] // Simple example - triggers when 'p' is pressed
[Keybind("Ctrl+2")] // Triggers only when 'Ctrl + 2' is pressed
[Keybind("Ctrl+2", IgnoreModifiers = true)] // Triggers on ANY combination containing 'Ctrl + 2' (e.g., 'Ctrl + Alt + 2')
public void OnKey(){
    Log.Info("Key pressed");
}

[Keybind(Hotkey = "4", SuppressKey = false)] // Handles the key, but it will still pass through to other apps
public void HandleKeyWithInjectedServices(IAuraEventLoggingService loggingService){
    Log.Info("Key pressed");
    loggingService.LogMessage(new AuraEvent(){ Text = "Message", Loglevel = FluentLogLevel.Info });
}
```

> Важно! Keybind'ы работают только пока запущен скрипт.

---

## Параметры атрибута `[Keybind]`

Атрибут `[Keybind]` поддерживает несколько параметров:

- **`Hotkey`** — обязательный параметр, который задаёт горячую клавишу или комбинацию клавиш (например, `Ctrl+A`, `Shift+X`, `Alt+Tab`).
- **`SuppressKey`** — подавляет событие нажатия клавиши и не даёт ему дойти до других приложений. По умолчанию — `true`. **Важно:** подавление работает независимо от настройки `ActivationType` (см. ниже).
- **`IgnoreModifiers`** — игнорирует дополнительные клавиши-модификаторы. По умолчанию — `true`. Работает похоже на `*` в AutoHotkey (Wildcard).
- **`ActivationType`** — определяет, когда должен сработать метод: при **KeyDown** (когда клавиша нажата) или при **KeyUp** (когда клавиша отпущена). По умолчанию — `KeyDown`.

## Как работает `IgnoreModifiers`?

Если `IgnoreModifiers = true`, метод сработает даже в том случае, если одновременно нажаты дополнительные клавиши-модификаторы (например, `Shift`, `Alt`, `Ctrl`).

По умолчанию `IgnoreModifiers` **выключен**.

Пример:

```csharp
[Keybind("Ctrl+2", IgnoreModifiers = true)] // Triggers on: Ctrl+2, Ctrl+Alt+2, Ctrl+Shift+2
[Keybind("Ctrl+2", IgnoreModifiers = false)] // Triggers ONLY on Ctrl+2
```

## Как работает `ActivationType`?

Параметр `ActivationType` задаёт, в какой момент должен вызываться ваш метод:

- **`KeyDown`** — метод вызывается в момент нажатия клавиши.
- **`KeyUp`** — метод вызывается в момент отпускания клавиши.

Примеры:

```csharp
[Keybind("F1", ActivationType = KeyDown)] // Calls method when F1 is pressed
[Keybind("F2", ActivationType = KeyUp)]   // Calls method when F2 is released
```

## Как работает `SuppressKey`?

Если `SuppressKey = true`, нажатие клавиши не будет передано другим приложениям. Это полезно, если вы хотите обрабатывать клавишу исключительно внутри своего скрипта.

**Важно:** подавление всегда работает независимо от `ActivationType`. Например:

```csharp
[Keybind("F1", SuppressKey = true, ActivationType = KeyUp)] // Suppresses F1 and triggers on release
[Keybind("F2", SuppressKey = true, ActivationType = KeyDown)] // Suppresses F2 and triggers on press
```

Это помогает избежать «утечек» нажатий в нестандартных ситуациях.

---

## Переназначение клавиш

Комбинируя параметры выше, можно полностью переназначить одну клавишу на другую. Например:

Теперь, независимо от того, какие ещё клавиши вы нажимаете вместе с `D`, она всегда будет заменяться на `R`.

```csharp
ISendInputScriptingApi SendInput {get; init;} //initialize SendInput API

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

Вот как можно организовать последовательную обработку нажатий — с помощью [SemaphoreSlim](https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim?view=net-9.0) можно сделать так, чтобы остальные обработчики ждали завершения текущего.

```csharp
// Allow only ONE active handler at a time - others will be queued
SemaphoreSlim hotkeySemaphore = new(1);

[Keybind("A")]
public void HandleA(){
   using var blockUntilCompleted = hotkeySemaphore.Rent(); //Important! This should be in all handlers you want to block

   Log.Info("Processing key A");
   Sleep(1000);    
}
```

Если нажать `A` несколько раз подряд, метод будет обрабатываться **по одному разу**, пока не завершится предыдущий вызов.

### Как пропускать лишние нажатия

Если вам нужно **пропускать** лишние нажатия вместо постановки в очередь, код нужно организовать немного иначе — с проверкой доступных слотов.

```csharp
SemaphoreSlim hotkeySemaphore = new(1);

[Keybind("A")]
public void HandleA(){
   if (hotkeySemaphore.CurrentCount <= 0){ //Check for available slots
       Log.Info("Skipping handler - key press already being processed");
       return;
   }

   using var blockUntilCompleted = hotkeySemaphore.Rent(); //Occupy an available slot

   Log.Info("Processing key A");
   Sleep(1000);    
}
```

Если нажать `A` несколько раз подряд, одновременно будет выполняться только один обработчик, а остальные будут **пропущены**.

---

## Полезные советы

-  Используйте `IgnoreModifiers = true`, если хотите обрабатывать комбинации независимо от дополнительных модификаторов.
-  Используйте `SemaphoreSlim` или другие механизмы синхронизации, если нужно не допускать одновременных вызовов одного и того же метода.
-  Помните, что методы могут принимать параметры — они будут автоматически запрошены через `GetService<>` (например, `IAuraEventLoggingService`).