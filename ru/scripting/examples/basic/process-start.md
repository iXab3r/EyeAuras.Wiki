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

Запустим Блокнот и выведем идентификатор созданного процесса в журнал. Этот первый опыт отделяет успешный запуск процесса от готовности окна: PID сам по себе ещё не доказывает, что текстовое поле уже появилось.

1. Создайте свою тестовую ауру и добавьте **C# Script** в **On Enter**. Сначала используйте ручной **Run**.
2. В верхнеуровневый `Script.csx` вставьте весь код. Он рассчитан на Windows с доступным `notepad.exe`:

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

3. Нажмите **Run**. Должен открыться Блокнот, а журнал покажет PID. При повторном Run отправляется новый запрос запуска; не используйте его как команду активации уже открытого редактора.
4. Закройте только своё пробное окно обычным способом, когда оно больше не нужно. Скрипт его автоматически не завершает.

| Поле или результат | Как выбрать |
| --- | --- |
| `FileName` | Реальный исполняемый файл. В примере используется системная папка Windows, без предположения о диске `C:`. |
| `Arguments` | Строка аргументов программы; здесь пустая. Аргументы зависят от самой программы. |
| `WorkingDirectory` | Начальная рабочая папка дочернего процесса. При `UseShellExecute = false` она не служит поиском исполняемого файла. |
| `UseShellExecute = false` | Прямой запуск программы. Для открытия документа через его ассоциацию нужен иной, оболочечный путь с `true`. |
| `Process.Id` | Идентификатор запущенного процесса. Процесс может передать запрос существующему экземпляру и быстро завершиться; это не подтверждение готового UI. |

`using` освобождает объект `Process` и его ресурсы наблюдения, но не вызывает `Kill`. **Stop** также не завершает дочернюю программу: в `Process.Start` токен отмены не передаётся. Если нужно ждать завершения, `await process.WaitForExitAsync(cancellationToken)` размещается **внутри блока до освобождения Process**; отмена такого ожидания тоже не является завершением процесса.

<details>
<summary>Короткое имя, своя программа или горячая клавиша</summary>

Самый короткий самостоятельный вариант `Script.csx`:

```csharp
using System.Diagnostics;

{
    using var process = Process.Start("notepad");
}
```

Вместо короткого имени можно передать существующий полный путь, например `C:/Windows/system32/notepad.exe`, если именно этот файл есть на вашей машине. Для своей программы или игры задайте её реальный `FileName`, требуемые аргументы и рабочую папку; универсальных параметров для всех программ нет.

Для запуска клавишей добавьте **Hotkey Is Active → Hold**, назначьте свободную `F3` и оставьте действие в **On Enter**. Каждая новая активация отправит запрос запуска; отпускание клавиши не закрывает созданный процесс. Старое имя режима `Click/Hold` не означает переключатель жизни программы.

[Готовый исторический пример](https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL), [Process.Start](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0), [Close/Dispose .NET](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/System.Diagnostics.Process/src/System/Diagnostics/Process.cs).

</details>
