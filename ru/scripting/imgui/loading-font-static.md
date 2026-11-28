---
title: Загрузка пользовательского TTF-шрифта из статического класса
description: Как прочитать TTF-шрифт в обычном классе и применить его только к своему содержимому ImGui.
published: true
date: 2025-10-19T13:51:25.693Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-17T15:02:40.336Z
---
# Читать TTF через обычный класс и применять только к своему содержимому

Здесь файл шрифта читает статический класс `FontData`, а шрифт применяется только к вашей отрисовке. В отличие от [замены основного шрифта](/ru/scripting/imgui/loading-font), этот способ не вызывает `ReplaceFont` и не меняет основной шрифт общего окна.

Нужен настольный EyeAuras, совместимый с **EyeAuras.ImGuiSdk 0.1.47**. Как подключить пакет и зарегистрировать сервис, показано в [начале раздела](/ru/scripting/imgui/getting-started). Не смешивайте версии ImGui в одном процессе.

1. Добавьте в свой проект **C# Script** настоящий `Roboto-Regular.ttf` как [встроенный ресурс](/ru/scripting/embedded-resources). Для русского текста в файле должна быть кириллица.
2. Узнайте полное имя ресурса. Оно есть в журнале подготовки проекта. Или временно выполните в `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames()) Log.Info(name);
```

3. В основной программе замените `MyScript.Roboto-Regular.ttf` на найденное полное имя. Например, для папки `Fonts` получится `MyScript.Fonts.Roboto-Regular.ttf`. Это имя ресурса проекта, а не путь на диске и не пространство имён вспомогательного класса.

В этом же проекте создайте файл `FontData.cs` через **New file → C# Class**. Файловый сервис класс получает явно: `GetService` и `cancellationToken` в нём не глобальные имена.

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

4. Дождитесь компиляции и нажмите **Run**. Демонстрационное окно рисуется выбранным шрифтом. **Stop** удаляет своё описание шрифта и снимает отрисовку.

![Статический массив TTF в старом проекте](https://s3.eyeauras.net/media/2025/10/EyeAuras_SdQBF6VcjL.png)
![Результат выбора шрифта](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

| Часть | За что отвечает |
| --- | --- |
| `FontData.Load(files, manifestName)` | Читает байты через переданный файловый сервис. Это собственный класс примера, а не автоматически генерируемый `EmbeddedBinaryData`. |
| `byte[]` | Обычные данные TTF. Ресурс читать необязательно: можно передать массив байтов с настоящим TTF, который у вас уже есть. |
| `ImGuiFontSpec font` | Локальное описание шрифта для этого запуска. Это не статический указатель на нативный шрифт. |
| `PushFont(font)` / `PopFont(font)` | Парные вызовы: временно выбирают шрифт в пределах одного кадра. Пока нативного шрифта нет, оба ничего не делают. |
| `20`, `Cyrillic` | Размер и диапазон. По умолчанию AddFont берёт 16 и Default. Другие диапазоны описаны в [загрузке шрифта](/ru/scripting/imgui/loading-font). |

Статический метод не создаёт контекст и не кеширует `ImFontPtr` или `ImGuiFontSpec`. Прочитанные байты можно использовать повторно. А вот регистрировать и применять шрифт нужно для живого контекста на потоке отрисовки.

`AddFont` копирует байты TTF и возвращает `ImGuiFontSpec`, а не готовый нативный указатель. `IsInitialized` означает, что описание зарегистрировано. Атлас перестраивается после обработчиков текущего кадра, поэтому в первом кадре ещё может быть прежний шрифт.

При Stop программа просит удалить **своё** описание в потоке отрисовки и ждёт, пока кадр это подтвердит. Потом снимается обработчик и освобождается API. Для этого нужен работающий цикл кадров. `RemoveFont` убирает описание, но нативная копия байтов TTF в этой реализации намеренно не освобождается. Поэтому не загружайте шрифт заново каждый кадр и не меняйте шрифты бесконечно по этому примеру. Одно только освобождение API удаление описания не заменяет.

Байты читаются до начала отрисовки. `ReadAllBytes` сам закрывает поток, который открыл. Файловый сервис вам не принадлежит — не освобождайте его. Не храните `ImFontPtr` между перестроениями атласа. У `AddFont` нет аргумента отмены: токен здесь останавливает ожидание скрипта, а нативную загрузку не прерывает.

<details>
<summary>Старый готовый пример и версии</summary>

[Старый импорт](https://eyeauras.net/share/S20251017150654moSdG8zUyQ4D) использовал 0.1.17 с другим API загрузки. В этом проекте оставьте одну ссылку на 0.1.47, как в коде выше, и не добавляйте рядом старую версию. Сверить выбранный контракт помогут [источник EyeAuras](https://packages.eyeauras.net/v3/index.json) и [карта SDK](/ru/scripting/api/nuget/imgui-sdk).

</details>
