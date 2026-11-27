---
title: Загрузка пользовательского TTF-шрифта из ресурсов
description: Как сделать свой TTF-шрифт из встроенных ресурсов основным шрифтом ImGui.
published: true
date: 2025-10-19T13:51:15.016Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-17T14:56:23.969Z
---
# Сделать свой TTF основным шрифтом ImGui

Здесь мы читаем шрифт из ресурсов скрипта и делаем его основным. По демонстрационному окну видно, как изменились начертание и размер текста. Пример рассчитан на то, что другие скрипты в это время не меняют основной шрифт общего окна **Main**.

Нужен настольный EyeAuras, совместимый с **EyeAuras.ImGuiSdk 0.1.47**. Как подключить пакет и зарегистрировать сервис, показано в [начале раздела](/ru/scripting/imgui/getting-started). Не смешивайте версии ImGui в одном процессе.

1. Добавьте в свой проект **C# Script** настоящий `Roboto-Regular.ttf` как [встроенный ресурс](/ru/scripting/embedded-resources). Для русского текста в файле должна быть кириллица.
2. Узнайте полное имя ресурса. Оно есть в журнале подготовки проекта. Или временно выполните в `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames()) Log.Info(name);
```

3. В основной программе замените `MyScript.Roboto-Regular.ttf` на найденное полное имя. Например, для папки `Fonts` получится `MyScript.Fonts.Roboto-Regular.ttf`. Это имя ресурса проекта, а не путь на диске и не пространство имён вспомогательного класса.

## Script.csx

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.47"
using System;
using System.Threading.Tasks;
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;
using PoeShared.Scaffolding;

{
    AddNewExtension<ImGuiContainerExtensions>();
    var files = GetService<IScriptFileProvider>();
    var fontData = files.ReadAllBytes("MyScript.Roboto-Regular.ttf");
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
                imgui.ReplaceFont(font);
            }
            ImGui.ShowDemoWindow();
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

4. Дождитесь компиляции и нажмите **Run**. Текст в демонстрационном окне должен смениться на выбранный шрифт размером 20. После **Stop** описание удаляется. Если оно ещё было основным, SDK возвращает стандартный шрифт, а не прежний выбор другого скрипта, который ему неизвестен.

![TTF в ресурсах проекта](https://s3.eyeauras.net/media/2025/10/EyeAuras_nMZAqZ6YHR.png)
![Демонстрационное окно с выбранным шрифтом](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

| Параметр или операция | Значение |
| --- | --- |
| `MyScript.Roboto-Regular.ttf` | Полное имя вашего встроенного TTF. Если шрифт лежит на диске, сначала прочитайте его байты через `File.ReadAllBytes` с настоящим путём. |
| `20` | Размер шрифта. По умолчанию AddFont берёт 16. |
| `"Roboto"` | Имя для диагностики. По нему шрифт не скачивается и не ищется. |
| `Cyrillic` | Диапазон для кириллицы. Глифы, которых нет в самом TTF, он не добавит. |
| `ReplaceFont(font)` | Выбирает основной шрифт общего атласа. Чтобы сменить шрифт только в своём фрагменте, используйте [PushFont/PopFont](/ru/scripting/imgui/loading-font-static). |

`AddFont` копирует байты TTF и возвращает `ImGuiFontSpec`, а не готовый нативный указатель. `IsInitialized` означает, что описание зарегистрировано. Атлас перестраивается после обработчиков текущего кадра, поэтому в первом кадре ещё может быть прежний шрифт.

При Stop программа просит удалить **своё** описание в потоке отрисовки и ждёт, пока кадр это подтвердит. Потом снимается обработчик и освобождается API. Для этого нужен работающий цикл кадров. `RemoveFont` убирает описание, но нативная копия байтов TTF в этой реализации намеренно не освобождается. Поэтому не загружайте шрифт заново каждый кадр и не меняйте шрифты бесконечно по этому примеру. Одно только освобождение API удаление описания не заменяет.

Байты читаются до начала отрисовки. `ReadAllBytes` сам закрывает поток, который открыл. Файловый сервис вам не принадлежит — не освобождайте его. Не храните `ImFontPtr` между перестроениями атласа. У `AddFont` нет аргумента отмены: токен здесь останавливает ожидание скрипта, а нативную загрузку не прерывает.

<details>
<summary>Другие диапазоны и старый импорт</summary>

| `ImGuiFontRangeType` | Назначение |
| --- | --- |
| `Default` | Стандартный диапазон библиотеки ImGui. |
| `Cyrillic`, `Greek` | Кириллица или греческие символы. |
| `Japanese`, `Korean`, `Thai`, `Vietnamese` | Соответствующие наборы символов, если они есть в TTF. |
| `ChineseFull`, `ChineseSimplifiedCommon` | Полный или распространённый упрощённый китайский набор. |

[Старый импорт](https://eyeauras.net/share/S20251017150828zhuomztM9lbi) сохранён. Он ссылается на 0.1.17 со старым `AddFontFromMemoryTTF`, поэтому рядом с программой выше эту ссылку оставлять нельзя. В 0.1.42 уже есть AddFont/ReplaceFont/RemoveFont, но здесь везде выбрана 0.1.47 из [источника пакетов](https://packages.eyeauras.net/v3/index.json). Различия версий перечислены в [карте SDK](/ru/scripting/api/nuget/imgui-sdk).

</details>
