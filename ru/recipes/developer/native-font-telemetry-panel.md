---
title: "Вывести 50 известных показателей своим шрифтом"
description: "Панель ImGuiSdk 0.1.47 показывает 50 известных значений вашим TTF-шрифтом и убирает его при Stop."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Вывести 50 известных показателей своим шрифтом

Нативная панель ImGui покажет 50 заранее известных значений вашим шрифтом. Данные создаёт сам скрипт. Память процесса и игровые данные он не читает.

Нужен настольный EyeAuras на Windows, совместимый с **EyeAuras.ImGuiSdk 0.1.47**, его зависимостью **EyeAuras.ClickableTransparentOverlay 11.5.28** и нужными нативными графическими компонентами. Пакет рассчитан на .NET 8 Windows. Ссылка на пакет даёт только типы: несовместимый хост или отсутствующий нативный провайдер она не исправит. Не загружайте в тот же процесс вторую версию ImGui.NET/CTO.

1. Возьмите настоящий TTF-шрифт, которым вы вправе пользоваться. В нём должны быть латиница и нужная вам кириллица. Назовите свою копию `RecipeSans.ttf`. Имя файла ничего не говорит о наборе глифов. Wiki шрифт не даёт и не скачивает.
2. Создайте ауру `RecipeTelemetry` и добавьте **Actions → On Enter → C# Script** для ручного запуска. В дереве файлов скрипта выберите **Add → Existing File(s)...**, добавьте шрифт как ресурс и через **Rename** задайте путь `fonts/RecipeSans.ttf`. Такой ресурс должен быть один.
3. Целиком замените **Script.csx**. Оставьте одну ссылку `#r` на версию **0.1.47** из [источника пакетов EyeAuras](/ru/scripting/nuget). Расширение контейнера в коде регистрирует сервис до того, как скрипт его запросит.
4. Когда пакет восстановится и скрипт скомпилируется, нажмите **Run**. В окне **Known telemetry** будут строки от `Sample 01: 10` до `Sample 50: 500` — прокрутите панель до последней. Шрифт 20 px появляется после перестроения атласа, поэтому первый кадр может быть нарисован прежним шрифтом.
5. Нажмите **Stop**. Следующий вызов обработчика кадра удалит описание шрифта этого запуска и подтвердит удаление. Только после этого скрипт снимет отрисовку и освободит свою долю API. Новый Run зарегистрирует шрифт заново. Чтобы поменять данные, замените `value * 10` на `value * 20`, перекомпилируйте и нажмите Run: значения станут `20`…`1000`.

## Script.csx

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;

{
    var files = GetService<IScriptFileProvider>();
    var file = files.GetFileInfo("fonts/RecipeSans.ttf");
    if (!file.Exists) throw new FileNotFoundException("Add your own fonts/RecipeSans.ttf.");
    byte[] fontBytes;
    using (var input = file.CreateReadStream())
    using (var output = new MemoryStream())
    {
        await input.CopyToAsync(output, cancellationToken);
        fontBytes = output.ToArray();
    }
    var rows = Enumerable.Range(1, 50)
        .Select(value => $"Sample {value:00}: {value * 10}").ToArray();
    AddNewExtension<ImGuiContainerExtensions>();
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
                font = imgui.AddFont(fontBytes, 20, "RecipeSans", ImGuiFontRangeType.Cyrillic);
            ImGuiEx.PushFont(font);
            try
            {
                var visible = ImGui.Begin("Known telemetry##recipe-telemetry");
                try
                {
                    if (visible)
                        foreach (var row in rows) ImGui.TextUnformatted(row);
                }
                finally { ImGui.End(); }
            }
            finally { ImGuiEx.PopFont(font); }
        }
    });
    try { await Task.Delay(Timeout.Infinite, cancellationToken); }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
    finally
    {
        lock (gate) stopping = true;
        await removed.Task;
    }
}
```


| Часть | За что отвечает |
| --- | --- |
| `rows` | Массив из 50 строк, создаётся один раз до отрисовки. Растущей истории и фонового источника нет. |
| `AddFont(..., 20, "RecipeSans", Cyrillic)` | Копирует байты TTF и регистрирует размер и диапазон на потоке отрисовки. Глифов, которых нет в шрифте, не создаёт. |
| `ImGuiFontSpec` | Описание шрифта на один Run. Это не статический нативный указатель, который можно использовать после уничтожения контекста. |
| `ImGuiEx.PushFont` / `PopFont` | Вызываются парой и включают шрифт только для своего рисования в одном кадре. Пока нативный шрифт не готов, оба ничего не делают. |
| `Begin` / `End` | Вызываются парой, даже если панель свёрнута. |
| `removed.Task` | Подтверждает, что шрифт удалён из живого кадра, до освобождения API. Это не тайм-аут нативного завершения. |

Файловый сервис скрипт только берёт у хоста и не освобождает. Поток чтения и временный поток в памяти — свои, они закрываются до отрисовки. `AddFont` делает собственную нативную копию, поэтому `GCHandle` и небезопасные указатели не нужны. SDK намеренно держит эту нативную память и после `RemoveFont`. Поэтому не загружайте шрифт на каждом кадре и не переключайте шрифты без ограничения.

Атлас и оверлей **Main** общие. Скрипт не меняет их основной шрифт, не закрывает общее окно напрямую и не хранит `ImFontPtr` между перестроениями атласа. Ожидание идёт вне кадра. Чтобы очистка при Stop сработала, цикл отрисовки должен работать. При сбое нативной части подтверждение может не прийти.

Про хост и регистрацию — в [Начале работы с ImGui](/ru/scripting/imgui/getting-started). Про владение шрифтом — в [Локальном выборе шрифта](/ru/scripting/imgui/loading-font-static). Про логические пути и manifest-имена — во [встроенных ресурсах](/ru/scripting/embedded-resources).
