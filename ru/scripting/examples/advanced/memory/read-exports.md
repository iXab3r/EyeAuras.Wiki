---
title: Просмотр экспортов
description: Просмотр и работа с экспортированными данными.
published: true
date: 2025-06-12T16:08:52.785Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-12T16:08:52.785Z
---
# Чтение экспортов модулей из образа процесса

Запустите этот верхнеуровневый `C# Script` в EyeAuras с загруженным модулем памяти. Входы — имя процесса `EyeAuras.exe` и загруженный модуль `kernel32.dll`; при нескольких процессах поиск по имени выберет первый. Для точного выбора используйте известный PID с `LocalProcess.ByProcessId`. Нужны права чтения выбранного процесса.

В предыдущих руководствах мы уже научились получать список модулей запущенного процесса.

Этого достаточно, чтобы читать часть информации из них, но современные игры устроены гораздо сложнее: в них тысячи структур и методов.
Здесь и помогают публичные экспорты — данные, которые DLL экспортируют наружу и которые указывают на конкретные места в бинарном файле.

## Пример

```csharp
using EyeAuras.Memory;
using EyeAuras.Memory.Scaffolding;

using (var process = LocalProcess.ByProcessName("EyeAuras.exe"))
{
    Log.Info($"Process: {process.ProcessName} ({process.ProcessId})");

    var modules = process.GetProcessModules();
    Log.Info($"Modules: {modules.Count()}");

    using var kernel32Mem = process.MemoryOfModule("kernel32.dll");
    var kernel32Exports = kernel32Mem.ReadExports();
    Log.Info($"Kernel 32 exports: {kernel32Exports.DumpToNamedTable("Exports")}");

    var loadLibraryA = kernel32Exports.FirstOrDefault(x => x.ExportName == "LoadLibraryA");
    Log.Info($"LoadLibraryA: {loadLibraryA}");
}
```

В `EventLog` попадут сведения о процессе и таблица экспортов загруженного PE-образа. `MemoryOfModule` — представление адресов модуля, а не копия DLL с диска; процесс должен оставаться открытым. `ReadExports` также возвращает экспорты только по ordinal и перенаправления: проверяйте `IsForwarder`/`ForwarderName`, прежде чем считать запись адресом исполняемого кода. Наличие имени не доказывает, что по нему можно безопасно вызвать функцию. `using` закрывает созданный читатель процесса; представление модуля его не заменяет.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Процессы и память](/ru/scripting/api/memory/processes) · [Примитивы памяти](/ru/scripting/memory-api/memory-basics)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
