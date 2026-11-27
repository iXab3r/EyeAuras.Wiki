---
title: "Прочитать Int32 своего подготовленного процесса"
description: "Соберите маленький собственный процесс, получите его живые PID и адрес и прочитайте объявленное целое типизированным API."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Прочитать Int32 своего подготовленного процесса

Прочитайте известное **1234** из отдельного процесса, созданного для упражнения. Программа владеет четырёхбайтовым участком и сообщает реальные PID, адрес и схему. Игровые адреса и сканер не нужны.

Нужны Windows x64, .NET 8 SDK для программы-источника и настольный EyeAuras x64 с **действительно загруженным и готовым EyeAuras.Memory**. Метаданные для компиляции не загружают runtime builder. Здесь обычный локальный user-mode backend и доступный вам собственный процесс; DMA и обход через драйвер ядра не требуются.

1. Создайте новую пустую папку **C:\EARecipeScalar**, сохраните в неё **TelemetryFixture.csproj** и **Program.cs** ниже. Используйте один экземпляр программы; не занимайте чужой файл описания.
2. Из терминала в этой папке выполните `dotnet run --project TelemetryFixture.csproj -- "C:\EARecipeScalar\telemetry-fixture.json"`. Программа напечатает текущие PID, шестнадцатеричный адрес, `Int32`, размер четыре байта, разрядность 64 и создаст JSON. **Оставьте терминал ждать Enter.**
3. В EyeAuras создайте `RecipeScalar` через **Add new → New Aura → Actions → On Enter → C# Script**. Полностью замените **Script.csx**, используйте ручную **Run** и **Event Log**. Дополнительная директива NuGet не заменяет загрузку модуля Memory.
4. Сопоставьте `Int32=1234` в журнале с объявлением программы. Скрипт проверяет схему/разрядность и время старта процесса против явно устаревшего или повторно использованного PID, открывает свой reader и один раз вызывает `process.Memory.Read<int>(address)`.
5. После чтения нажмите Enter в терминале программы. Она освободит участок и удалит своё описание. Для повтора запустите её заново и используйте новую записанную идентичность; адрес завершённого процесса повторно не используйте.

| Граница | Смысл |
| --- | --- |
| `Address` в описании | Абсолютный виртуальный адрес участка живой программы, не RVA и не указатель экспортированной функции. |
| `Int32`, 4 байта | Соответствует C# `int` и `Marshal.WriteInt32` источника; упаковка в байты не нужна. |
| `using var process` | Владеет reader-дескриптором. `Memory` заимствовано, отдельно его не освобождают. |

Источник должен жить всё время чтения: проверка описания не замораживает чужой процесс. Ошибка недоступного адреса/чтения не является успешно прочитанным нулём; проверьте исключение и живую идентичность. Освобождение reader не убивает процесс. Скрипт EyeAuras не пишет память.

Отдельная программа использует обычные консольные API .NET. `Log` и `cancellationToken` скрипта принадлежат верхнеуровневому **Script.csx**, не произвольному классу. Различия раскрывают [локальные процессы](/ru/scripting/examples/advanced/memory/get-processes), [типизированное чтение](/ru/scripting/examples/advanced/memory/rpm-read) и [адреса модулей/экспортов](/ru/scripting/examples/advanced/memory/read-exports).

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
