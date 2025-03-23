---
title: Keybinds
description: настраиваем хоткеи
published: true
date: 2025-03-23T10:26:51.743Z
tags: 
editor: markdown
dateCreated: 2025-03-22T23:50:12.023Z
---

# Что такое Keybinds?

Keybinds позволяют привязать выполнение определенной функции к нажатию клавиши или комбинации клавиш. 

## Как это работает?

Для привязки горячей клавиши используется атрибут `[Keybind]`. Этот атрибут можно добавить к методу, и он будет вызван при нажатии указанной клавиши.

```csharp
[Keybind("p")] // Простой пример - сработает при нажатии клавиши 'p'
[Keybind("Ctrl+2")] // Сработает только при нажатии 'Ctrl + 2'
[Keybind("Ctrl+2", IgnoreModifiers = true)] // Сработает при всех комбинациях, содержащих 'Ctrl + 2' (например, 'Ctrl + Alt + 2')
public void OnKey(){
    Log.Info("Нажата клавиша");
}

[Keybind(Hotkey = "4", SuppressKey = false)] // Обработает клавишу, но она пройдет дальше в другие приложения
public void HandleKeyWithInjectedServices(IAuraEventLoggingService loggingService){
    Log.Info("Нажата клавиша");
    loggingService.LogMessage(new AuraEvent(){ Text = "Сообщение", Loglevel = FluentLogLevel.Info });
}
```

> ВАЖНО! Keybinds работают только пока работает скрипт!

---

## Параметры атрибута [Keybind]

Атрибут `[Keybind]` поддерживает несколько параметров:

- `Hotkey` — обязательный параметр, указывает на горячую клавишу или комбинацию клавиш (например, `Ctrl+A`, `Shift+X`, `Alt+Tab`).
- `SuppressKey` — подавляет событие нажатия клавиши, предотвращая его передачу в другие приложения. По умолчанию `true`. **Важно:** Подавление срабатывает независимо от выбранного `ActivationType` (см. ниже).
- `IgnoreModifiers` — игнорирует дополнительные модификаторы. По умолчанию `true`. Это аналог `*` в AutoHotkey (Wildcard).
- `ActivationType` — определяет, когда метод должен быть вызван: на **KeyDown** (когда клавиша нажата) или на **KeyUp** (когда клавиша отпущена). По умолчанию `KeyDown`.

## Как работает IgnoreModifiers

Если `IgnoreModifiers = true`, метод будет вызван, даже если нажаты дополнительные модификаторы (например, `Shift`, `Alt`, `Ctrl`).
По умолчанию `IgnoreModifiers` **Выключен**.

Пример:

```csharp
[Keybind("Ctrl+2", IgnoreModifiers = true)] // Сработает для комбинаций: Ctrl+2, Ctrl+Alt+2, Ctrl+Shift+2
[Keybind("Ctrl+2", IgnoreModifiers = false)] // Сработает ТОЛЬКО для Ctrl+2
```

## Как работает ActivationType

Параметр ActivationType позволяет указать, когда именно должен срабатывать ваш обработчик:

KeyDown — метод сработает в момент нажатия клавиши

KeyUp — метод сработает в момент отпускания клавиши

Примеры:

```csharp
[Keybind("F1", ActivationType = KeyDown)] // Вызовет метод при нажатии клавиши F1
[Keybind("F2", ActivationType = KeyUp)]   // Вызовет метод при отпускании клавиши F2
```


## Как работает `SuppressKey`

Если `SuppressKey = true`, нажатие клавиши не будет передано другим приложениям. Это полезно, когда нужно обработать клавишу исключительно внутри вашего скрипта.

**Важно:** Подавление нажатий срабатывает **всегда**, вне зависимости от выбранного `ActivationType`. Например:

```csharp
[Keybind("F1", SuppressKey = true, ActivationType = KeyUp)] // Подавит нажатие F1 и вызовет метод на отпускание клавиши
[Keybind("F2", SuppressKey = true, ActivationType = KeyDown)] // Подавит нажатие F2 и вызовет метод на нажатие клавиши
```

Это помогает избежать "утечек" нажатий клавиш при нестандартных ситуациях.

# Remapping
С помощью комбинации вышеуказанных параметров можно сделать полный ремаппинг одной клавиши на другую, к примеру.
Теперь не важно одновременно с какими клавишами вы нажимаете `D`, она всегда будет заменяться на `R`. 

```csharp
[Dependency] ISendInputScriptingApi SendInput {get;}

[Keybind(Hotkey = "d", ActivationType = KeybindActivationType.KeyDown, IgnoreModifiers = true)]
public void OnKeyDownForD(){
    SendInput.KeyDown(Key.R);
}

[Keybind(Hotkey = "d", ActivationType = KeybindActivationType.KeyUp, IgnoreModifiers = true)]
public void OnKeyUpForD(){
    SendInput.KeyUp(Key.R);
}
```

# Как работают обработчики нажатий
Система поддерживает параллельную обработку нажатий. Это означает, что даже при быстром нажатии нескольких клавиш одновременно или при частых нажатиях одной и той же клавиши обработка выполняется независимо друг от друга.

### Организуем очередь нажатий
Вот так можно организовать поочередную обработку нажатий - с помощью [SemaphoreSlim](https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim?view=net-9.0) вы можете заблокировать другие обработчики на то время, пока выполняется текущий

```csharp
//допускаем максимум ОДИН одновременный обработчик - остальные будут поставлены в очередь
SemaphoreSlim hotkeySemaphore = new(1);

[Keybind("A")]
public void HandleA(){
   using var blockUntilCompleted = hotkeySemaphore.Rent(); //Важно! Эта строка должна быть во всех обработчиках, которые нужно блокировать

   Log.Info("Обработака клавиша A");
   Sleep(1000);    
}
```
Если вы нажмете `A` несколько раз подряд, вызов метода будет обработан **один раз** до завершения предыдущего вызова.

### Пропускаем нажатия
Если же вам нужно **пропускать** нажатия, а не ставить их в очередь, код нужно организовать чуть по-другому и проверять есть ли свободные места.

```csharp
SemaphoreSlim hotkeySemaphore = new(1);

[Keybind("A")]
public void HandleA(){
   if (hotkeySemaphore.CurrentCount <= 0){ //проверяем есть ли свободные места
       Log.Info("Пропускаем обработчик - нажатие уже обрабатывается");
       return;
   } 

   using var blockUntilCompleted = hotkeySemaphore.Rent(); //занимаем свободный слот

   Log.Info("Обработака клавиша A");
   Sleep(1000);    
}
```
Если вы нажмете `A` несколько раз подряд, только один обработчик будет выполняться в один момент времени, остальные будут **пропущены**

---

## Полезные советы

- ✅ Используйте `IgnoreModifiers = true` для гибкости, если хотите обрабатывать комбинации клавиш вне зависимости от дополнительных модификаторов
- ✅ При необходимости исключить одновременные вызовы одного и того же метода используйте `SemaphoreSlim` или другие механизмы синхронизации
- ✅ Не забудьте, что метод может принимать параметры, которые будут автоматически запрошены через `GetService<>` (например, `IAuraEventLoggingService`)

