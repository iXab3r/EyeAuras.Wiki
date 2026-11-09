---
title: Загрузка пользовательского TTF-шрифта из статического класса
description: Как загрузить пользовательский TTF-шрифт из статического класса.
published: true
date: 2025-10-19T13:51:25.693Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-17T15:02:40.336Z
---
# Читать TTF через обычный класс и применять только к своему содержимому

Вынесем чтение файла в статический `FontData`, а выбор шрифта ограничим своей отрисовкой. В отличие от [замены основного шрифта](/ru/scripting/imgui/loading-font), этот вариант не вызывает `ReplaceFont` и не меняет основной выбор общего окна.

Нужен настольный EyeAuras с совместимым **EyeAuras.ImGuiSdk 0.1.47**. Подключение пакета и регистрация сервиса показаны в [начале раздела](/ru/scripting/imgui/getting-started); не смешивайте версии ImGui в одном процессе.

1. В своём проекте **C# Script** добавьте настоящий `Roboto-Regular.ttf` как [встроенный ресурс](/ru/scripting/embedded-resources). Для русского текста файл должен содержать кириллицу; имя Roboto само по себе этого не гарантирует.
2. Получите полное имя ресурса из журнала подготовки проекта или временно выполните в `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames()) Log.Info(name);
```

3. В основной программе замените `MyScript.Roboto-Regular.ttf` найденным полным именем. Например, папка `Fonts` даёт `MyScript.Fonts.Roboto-Regular.ttf`. Это имя ресурса проекта, не произвольный путь на диске и не пространство имён вспомогательного класса.

Создайте в этом же проекте через **New file → C# Class** файл `FontData.cs`. Класс получает файловый сервис явно; `GetService` и `cancellationToken` в нём не являются глобальными именами.

## FontData.cs

```csharp
using EyeAuras.Repl;
using PoeShared.Scaffolding;

namespace FontDemo;

public static class FontData
{
    public static byte[] Load(IScriptFileProvider files, string manifestName)
    {
        return files.ReadAllBytes(manifestName);
    }
}
```

## Script.csx

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;
using PoeShared.Scaffolding;
using FontDemo;

{
    AddNewExtension<ImGuiContainerExtensions>();
    var files = GetService<IScriptFileProvider>();
    var fontData = FontData.Load(files, "MyScript.Roboto-Regular.ttf");
    using var imgui = GetService<IImGuiExperimentalApi>();
    var gate = new object();
    var stopping = false;
    ImGuiFontSpec font = default;
    var removed = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
    using var rendering = imgui.AddRenderer(_ =>
    {
        lock (gate)
        {
            if (stopping)
            {
                if (font.IsInitialized) imgui.RemoveFont(font);
                font = default;
                removed.TrySetResult(true);
                return;
            }
            if (!font.IsInitialized)
            {
                font = imgui.AddFont(fontData, 20, "Roboto", ImGuiFontRangeType.Cyrillic);
            }
            ImGuiEx.PushFont(font);
            try { ImGui.ShowDemoWindow(); }
            finally { ImGuiEx.PopFont(font); }
        }
    });
    try { await Task.Delay(System.Threading.Timeout.Infinite, cancellationToken); }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally
    {
        lock (gate) stopping = true;
        await removed.Task;
    }
}
```

4. Нажмите **Run** после компиляции. Демонстрационное окно использует выбранный шрифт во время своего рисования; основной шрифт остальных обработчиков не назначается заново. **Stop** удаляет своё описание и снимает отрисовку.

На старом снимке TTF представлен статическим массивом байтов в `EmbeddedBinaryData`. Текущий `FontData` читает встроенный ресурс; отдельное закрепление буфера через `GCHandle` ему не нужно, поскольку AddFont копирует байты.

![Статический массив TTF в историческом проекте](https://s3.eyeauras.net/media/2025/10/EyeAuras_SdQBF6VcjL.png)
![Результат выбора шрифта](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

| Часть | За что отвечает |
| --- | --- |
| `FontData.Load(files, manifestName)` | Читает байты через переданную зависимость. Это собственный класс примера, не автоматически генерируемый `EmbeddedBinaryData`. |
| `byte[]` | Обычные данные TTF. Вместо чтения ресурса можно передать уже имеющийся настоящий TTF в массиве байтов. |
| `ImGuiFontSpec font` | Локальное описание регистрации данного запуска; не статический указатель на нативный шрифт. |
| `PushFont(font)` / `PopFont(font)` | Парный временный выбор в одном кадре. До появления нативного шрифта оба вызова ничего не делают. |
| `20`, `Cyrillic` | Размер и диапазон. По умолчанию AddFont использует 16/Default; другие диапазоны описаны в [загрузке шрифта](/ru/scripting/imgui/loading-font). |

Статический метод не создаёт контекст и не кеширует `ImFontPtr` или `ImGuiFontSpec`. Подготовленные байты можно переиспользовать, но регистрацию и использование выполняют для живого контекста на потоке отрисовки. Слово `static` не делает нативный шрифт подходящим для любого нового контекста после закрытия прежнего.

`AddFont` копирует байты TTF и возвращает `ImGuiFontSpec`, а не готовый нативный указатель. `IsInitialized` означает, что описание зарегистрировано. Атлас перестраивается после обработчиков текущего кадра, поэтому первый кадр может ещё использовать прежний шрифт.

При Stop программа запрашивает удаление **своего** описания в потоке отрисовки и ждёт подтверждения кадра. Затем снимается обработчик и освобождается API. Это требует работающего цикла кадров. `RemoveFont` убирает описание, но в этой реализации нативная копия байтов TTF намеренно не освобождается. Не загружайте шрифт заново каждый кадр и не используйте пример как бесконечную смену шрифтов. Одно освобождение API также не заменяет удаление описания.

Чтение байтов заканчивается до отрисовки; метод `ReadAllBytes` сам закрывает открытый им поток. Не освобождайте заимствованный файловый сервис и не храните `ImFontPtr` между перестроениями атласа. У `AddFont` нет аргумента отмены: токен здесь останавливает ожидание скрипта, а не прерывает нативную загрузку.

<details>
<summary>Старый готовый пример и версии</summary>

[Исторический импорт](https://eyeauras.net/share/S20251017150654moSdG8zUyQ4D) использовал 0.1.17 с другим API загрузки. Для этого проекта оставьте одну ссылку на 0.1.47, как в коде выше; не добавляйте старую версию одновременно. В 0.1.42 также есть AddFont/ReplaceFont/RemoveFont, но это не повод смешивать пакеты одного процесса. [Источник EyeAuras](https://packages.eyeauras.net/v3/index.json) и [карта SDK](/ru/scripting/api/nuget/imgui-sdk) помогают сверить выбранный контракт.

</details>
