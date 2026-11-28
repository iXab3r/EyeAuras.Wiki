---
title: "Прочитать Int32 своего подготовленного процесса"
description: "Соберите маленькую программу, возьмите её PID и адрес и прочитайте объявленное целое типизированным API."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Прочитать Int32 своего подготовленного процесса

Скрипт читает известное число **1234** из отдельного процесса, который вы сами запускаете для этого упражнения. Программа выделяет участок в четыре байта и сообщает свои реальные PID, адрес и схему.

Нужны Windows x64, .NET 8 SDK для программы-источника и настольный EyeAuras x64 с **действительно загруженным и готовым EyeAuras.Memory**. Метаданных для компиляции мало: runtime builder они не загружают. Используется обычный локальный user-mode backend и ваш собственный процесс, к которому у вас есть доступ.

1. Создайте новую пустую папку **C:\EARecipeScalar** и сохраните в неё **TelemetryFixture.csproj** и **Program.cs** ниже. Запускайте один экземпляр программы и не занимайте чужой файл описания.
2. В терминале в этой папке выполните `dotnet run --project TelemetryFixture.csproj -- "C:\EARecipeScalar\telemetry-fixture.json"`. Программа напечатает текущий PID, шестнадцатеричный адрес, тип `Int32`, размер четыре байта, разрядность 64 и создаст JSON. **Оставьте терминал ждать Enter.**
3. В EyeAuras создайте `RecipeScalar` через **Add new → New Aura → Actions → On Enter → C# Script**. Целиком замените **Script.csx**, запускайте вручную кнопкой **Run** и смотрите **Event Log**.
4. В журнале должно быть `Int32=1234` — то же число, что объявила программа. Скрипт сверяет схему и разрядность. По времени старта процесса он отсеивает явно устаревший или повторно использованный PID. Затем он открывает свой reader и один раз вызывает `process.Memory.Read<int>(address)`.
5. После чтения нажмите Enter в терминале программы. Она освободит участок и удалит своё описание. Чтобы повторить, запустите её заново и берите новые PID и адрес. Адрес завершённого процесса повторно не используйте.

| Граница | Смысл |
| --- | --- |
| `Address` в описании | Абсолютный виртуальный адрес участка в живой программе. |
| `Int32`, 4 байта | То же, что `int` в C# и `Marshal.WriteInt32` в источнике. Собирать значение из байтов не нужно. |
| `using var process` | Владеет дескриптором reader. `Memory` заимствовано, отдельно его не освобождают. |

Источник должен работать всё время чтения: проверка описания не замораживает чужой процесс. Ошибка чтения или недоступный адрес — это не успешно прочитанный ноль. Посмотрите исключение и проверьте, что процесс тот же и жив. Освобождение reader процесс не завершает.

`Log` и `cancellationToken` скрипта есть только в верхнеуровневом **Script.csx**, а не в произвольном классе. Подробнее — [локальные процессы](/ru/scripting/examples/advanced/memory/get-processes), [типизированное чтение](/ru/scripting/examples/advanced/memory/rpm-read) и [адреса модулей/экспортов](/ru/scripting/examples/advanced/memory/read-exports).

## TelemetryFixture.csproj

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <PlatformTarget>x64</PlatformTarget>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
```

## Program.cs

```csharp
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.Json;

var receipt = Path.GetFullPath(args.Length == 1 ? args[0] : "telemetry-fixture.json");
if (File.Exists(receipt))
    throw new IOException("Use an empty fixture folder; a receipt already exists.");
var address = Marshal.AllocHGlobal(sizeof(int));
try
{
    Marshal.WriteInt32(address, 1234);
    using var self = Process.GetCurrentProcess();
    var descriptor = new
    {
        Pid = Environment.ProcessId,
        Address = $"0x{address.ToInt64():X}",
        Type = "Int32",
        Bytes = sizeof(int),
        Bitness = IntPtr.Size * 8,
        StartTimeUtcTicks = self.StartTime.ToUniversalTime().Ticks
    };
    var json = JsonSerializer.Serialize(descriptor, new JsonSerializerOptions { WriteIndented = true });
    File.WriteAllText(receipt, json);
    Console.WriteLine(json);
    Console.WriteLine($"Receipt: {receipt}");
    Console.WriteLine("Value is 1234. Keep this process open while reading. Press Enter to release it.");
    Console.ReadLine();
}
finally
{
    Marshal.FreeHGlobal(address);
    if (File.Exists(receipt)) File.Delete(receipt);
}
```

## Script.csx

```csharp
using System;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using EyeAuras.Memory;

{
    cancellationToken.ThrowIfCancellationRequested();
    using var document = JsonDocument.Parse(
        File.ReadAllText(@"C:\EARecipeScalar\telemetry-fixture.json"));
    var info = document.RootElement;
    if (info.GetProperty("Type").GetString() != "Int32" ||
        info.GetProperty("Bytes").GetInt32() != sizeof(int) ||
        info.GetProperty("Bitness").GetInt32() != IntPtr.Size * 8)
        throw new InvalidOperationException("Fixture schema or bitness differs.");
    var pid = info.GetProperty("Pid").GetInt32();
    var addressText = info.GetProperty("Address").GetString();
    var address = new IntPtr(Convert.ToInt64(addressText.Substring(2), 16));
    using var identity = Process.GetProcessById(pid);
    if (identity.StartTime.ToUniversalTime().Ticks !=
        info.GetProperty("StartTimeUtcTicks").GetInt64())
        throw new InvalidOperationException("PID belongs to a different process instance.");
    using var process = LocalProcess.ByProcessId(pid);
    cancellationToken.ThrowIfCancellationRequested();
    var value = process.Memory.Read<int>(address);
    Log.Info($"Fixture PID={pid}, address={addressText}, Int32={value}; expected 1234");
}
```
