---
title: "Вывести 50 известных показателей своим шрифтом"
description: "Покажите ограниченный собственный список через ImGuiSdk 0.1.47 с настоящим TTF и локальным выбором шрифта до Stop."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Вывести 50 известных показателей своим шрифтом

Нативная панель ImGui покажет 50 заранее известных значений вашим шрифтом. Данные создаёт сам скрипт; чтения памяти процесса или игровых данных здесь нет.

Нужен настольный Windows-хост EyeAuras, совместимый с **EyeAuras.ImGuiSdk 0.1.47**, зависимостью **EyeAuras.ClickableTransparentOverlay 11.5.28** и необходимыми нативными графическими компонентами. Пакет предназначен для .NET 8 Windows. Ссылка предоставляет типы, но не подготавливает несовместимый хост или отсутствующий нативный провайдер. Не загружайте вторую версию ImGui.NET/CTO в тот же процесс.

1. Подготовьте настоящий TTF, которым вы вправе пользоваться, с латинскими и нужными вам кириллическими глифами. Назовите собственную копию `RecipeSans.ttf`; имя не доказывает состав глифов. Wiki не предоставляет и не скачивает шрифт.
2. Создайте свою ауру `RecipeTelemetry` с **Actions → On Enter → C# Script** для ручного Run. В дереве файлов скрипта выберите **Add → Existing File(s)...**, импортируйте шрифт как ресурс и через **Rename** задайте `fonts/RecipeSans.ttf`. Оставьте один соответствующий ресурс.
3. Полностью замените **Script.csx**. Сохраните одну ссылку `#r` на **0.1.47** из [источника пакетов EyeAuras](/ru/scripting/nuget). Явное расширение контейнера регистрирует сервис до его получения.
4. После восстановления зависимости и компиляции нажмите **Run**. В **Known telemetry** должны быть строки от `Sample 01: 10` до `Sample 50: 500`; прокрутите панель до последней. Локальный шрифт 20 px появляется после перестроения атласа, поэтому первый кадр может использовать прежний шрифт.
5. Нажмите **Stop**. Следующий работающий обработчик кадра удалит описание шрифта этого Run и подтвердит удаление. Только затем блок владения снимет отрисовку и освободит свою долю API. Новый Run создаст новую регистрацию. Для намеренного изменения данных замените `value * 10` на `value * 20`, перекомпилируйте и нажмите Run: значения станут `20`…`1000`.

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
| `rows` | Один массив из 50 строк, созданный до отрисовки; нет растущей истории или фонового источника. |
| `AddFont(..., 20, "RecipeSans", Cyrillic)` | Копирует настоящие TTF-байты и регистрирует размер/диапазон на потоке отрисовки; отсутствующие глифы не создаёт. |
| `ImGuiFontSpec` | Описание одного Run, не статический нативный указатель для повторного использования после уничтожения контекста. |
| `ImGuiEx.PushFont` / `PopFont` | Парно выбирают шрифт только для своего рисования в одном кадре. Пока нативный шрифт не готов, оба ничего не делают. |
| `Begin` / `End` | Сбалансированы и при свёрнутом содержимом панели. |
| `removed.Task` | Подтверждает удаление из живого кадра до освобождения API; это не тайм-аут нативного завершения. |

Заимствованный файловый сервис не освобождается. Поток чтения и временный поток памяти принадлежат примеру и закрываются до отрисовки. `AddFont` создаёт собственную нативную копию, поэтому вызывающему коду не нужны `GCHandle` или небезопасный указатель. SDK намеренно удерживает это нативное выделение и после удаления описания через `RemoveFont`; не превращайте пример в загрузку шрифта на каждом кадре или неограниченное переключение шрифтов.

Атлас и оверлей **Main** общие. Программа не меняет их основной шрифт, не закрывает общее окно напрямую и не хранит `ImFontPtr` между перестроениями атласа. Ожидание выполняется вне кадра; для очистки при Stop нужен работающий цикл отрисовки. Сбой нативного механизма может помешать подтверждению.

[Начало работы с ImGui](/ru/scripting/imgui/getting-started) объясняет хост и регистрацию. [Локальный выбор шрифта](/ru/scripting/imgui/loading-font-static) — владение, [встроенные ресурсы](/ru/scripting/embedded-resources) — логические пути и manifest-имена.
