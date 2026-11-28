---
title: Как запустить игру/процесс
description: 
published: true
date: 2024-07-02T14:36:35.228Z
tags: 
editor: markdown
dateCreated: 2024-07-02T14:36:35.228Z
---
# Открыть свою локальную программу из действия

Скрипт запускает Блокнот и пишет в журнал идентификатор процесса (PID).

1. Создайте тестовую ауру и добавьте **C# Script** в **On Enter**. Для начала запускайте его вручную кнопкой **Run**.
2. Вставьте весь код в верхнеуровневый `Script.csx`. Он рассчитан на Windows, где есть `notepad.exe`:

```csharp
using System;
using System.Diagnostics;
using System.IO;

{
    var systemFolder = Environment.GetFolderPath(Environment.SpecialFolder.System);
    var start = new ProcessStartInfo
    {
        FileName = Path.Combine(systemFolder, "notepad.exe"),
        Arguments = "",
        WorkingDirectory = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
        UseShellExecute = false
    };
    cancellationToken.ThrowIfCancellationRequested();
    using var process = Process.Start(start);
    if (process == null) { Log.Warn("Новый процесс не создан"); return; }
    Log.Info($"Запущен PID: {process.Id}");
}
```

3. Нажмите **Run**. Откроется Блокнот, а в журнале появится PID. Повторный Run отправляет новый запрос запуска.
4. Когда пробное окно больше не нужно, закройте его обычным способом. Скрипт сам его не закрывает.

| Поле или результат | Как выбрать |
| --- | --- |
| `FileName` | Реальный исполняемый файл. В примере путь строится от системной папки Windows и не привязан к диску `C:`. |
| `Arguments` | Строка аргументов программы. Здесь она пустая. |
| `WorkingDirectory` | Начальная рабочая папка запущенного процесса. При `UseShellExecute = false` исполняемый файл в ней не ищется. |
| `UseShellExecute = false` | Программа запускается напрямую. Чтобы открыть документ в связанной с ним программе, нужен запуск через оболочку, с `true`. |
| `Process.Id` | Идентификатор запущенного процесса. Процесс может передать запрос уже работающему экземпляру и быстро завершиться, поэтому PID не подтверждает, что окно готово. |

`using` освобождает объект `Process` и ресурсы наблюдения за ним, но не вызывает `Kill`. **Stop** тоже не завершает запущенную программу: токен отмены в `Process.Start` не передаётся. Если нужно дождаться завершения, вызовите `await process.WaitForExitAsync(cancellationToken)` **внутри блока, до освобождения Process**. Отмена этого ожидания процесс тоже не завершает.

Если следующий шаг должен дождаться окна, добавьте отдельное условие [Window Exists](/ru/triggers/window-exists). Чтобы вывести вперёд уже открытое окно, а не запускать программу заново, берите [Win Activate](/ru/actions/win-activate).

<details>
<summary>Короткое имя, своя программа или горячая клавиша</summary>

Самый короткий вариант `Script.csx`:

```csharp
using System.Diagnostics;

{
    using var process = Process.Start("notepad");
}
```

Вместо короткого имени можно передать полный путь, например `C:/Windows/system32/notepad.exe`, если такой файл есть на вашей машине. Для своей программы или игры укажите её реальный `FileName`, нужные аргументы и рабочую папку.

Чтобы запускать клавишей, добавьте **Hotkey Is Active → Hold**, назначьте свободную `F3` и оставьте действие в **On Enter**. Каждое нажатие отправляет новый запрос запуска. Когда вы отпускаете клавишу, запущенный процесс не закрывается.

[Готовый исторический пример](https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL), [Process.Start](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0), [Close/Dispose .NET](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/System.Diagnostics.Process/src/System/Diagnostics/Process.cs).

</details>
