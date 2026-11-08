---
title: Как запустить игру/процесс
description: 
published: true
date: 2024-07-02T14:36:35.228Z
tags: 
editor: markdown
dateCreated: 2024-07-02T14:36:35.228Z
---

# Запускаем произвольную программу/игру
> Импортировать готовый пример можно отсюда https://eyeauras.net/share/S20240702143616Nj8fr0gCxktL
{.is-info}

1. Создаем ауру
2. Кидаем в нее `HotkeyIsActive` и биндим на удобную кнопку (это будет наш вкл/выкл, в примере `F3`), меняем тип активации на `Click/Hold`
3. Добавляем в `On Enter` действие `C# Script`
4. Копипастим сам скрипт
5. При нажатии на `F3` запустится `Notepad`

```csharp
using System.Diagnostics;

// можно использовать как короткое имя

{
    using var process = Process.Start("notepad");
    // так и полное
    //Process.Start("C:/Windows/system32/notepad.exe");

    // полная документация здесь - https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0
}
```

Вставьте код в верхнеуровневый файл действия `C# Script` в Windows. Вход — имя доступной программы либо существующий полный путь; для игры задайте путь к её исполняемому файлу и нужную рабочую папку через `ProcessStartInfo`, если она требуется игре. После запуска появится Блокнот. `using` освобождает объект `Process`, но **не завершает запущенную программу**. Остановка скрипта тоже не означает остановку дочернего процесса; отмена не передаётся в `Process.Start`.

См. [контракт Process.Start](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.start?view=net-8.0) и [реализацию Close/Dispose .NET 8.0.19](https://github.com/dotnet/runtime/blob/v8.0.19/src/libraries/System.Diagnostics.Process/src/System/Diagnostics/Process.cs). Закрытие компонента освобождает его ресурсы и наблюдение; это не вызов Kill.
