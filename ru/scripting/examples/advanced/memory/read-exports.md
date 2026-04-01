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

    var kernel32Mem = process.MemoryOfModule("kernel32.dll");
    var kernel32Exports = kernel32Mem.ReadExports();
    Log.Info($"Kernel 32 exports: {kernel32Exports.DumpToNamedTable("Exports")}");

    var loadLibraryA = kernel32Exports.First(x => x.ExportName == "LoadLibraryA");
    Log.Info($"LoadLibraryA: {loadLibraryA}");
}
```