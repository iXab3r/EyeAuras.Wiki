---
title: Загрузка пользовательского TTF-шрифта из ресурсов
description: Как загрузить пользовательский TTF-шрифт из встроенных ресурсов.
published: true
date: 2025-10-19T13:51:15.016Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-17T14:56:23.969Z
---
# Сделать свой TTF основным шрифтом ImGui

Прочитаем шрифт из ресурсов скрипта и назначим его основным. Демонстрационное окно покажет, как изменились форма и размер текста. Этот опыт рассчитан на запуск без других скриптов, меняющих основной шрифт общего окна **Main**.

Нужен настольный EyeAuras с совместимым **EyeAuras.ImGuiSdk 0.1.47**. Подключение пакета и регистрация сервиса показаны в [начале раздела](/ru/scripting/imgui/getting-started); не смешивайте версии ImGui в одном процессе.

1. В своём проекте **C# Script** добавьте настоящий `Roboto-Regular.ttf` как [встроенный ресурс](/ru/scripting/embedded-resources). Для русского текста файл должен содержать кириллицу; имя Roboto само по себе этого не гарантирует.
2. Получите полное имя ресурса из журнала подготовки проекта или временно выполните в `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames()) Log.Info(name);
```

3. В основной программе замените `MyScript.Roboto-Regular.ttf` найденным полным именем. Например, папка `Fonts` даёт `MyScript.Fonts.Roboto-Regular.ttf`. Это имя ресурса проекта, не произвольный путь на диске и не пространство имён вспомогательного класса.

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

4. Дождитесь компиляции и нажмите **Run**. В демонстрационном окне текст должен перейти на выбранный шрифт размером 20. После **Stop** описание удаляется; если оно ещё является основным, SDK сбрасывает выбор на стандартный шрифт, а не восстанавливает неизвестный прежний выбор другого скрипта.

На старых снимках показаны ресурс проекта и результат назначения шрифта. Видимый в старом коде `AddFontFromMemoryTTF` относится к 0.1.17; выше используется AddFont/ReplaceFont:

![TTF в ресурсах проекта](https://s3.eyeauras.net/media/2025/10/EyeAuras_nMZAqZ6YHR.png)
![Демонстрационное окно с выбранным шрифтом](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

| Параметр или операция | Значение |
| --- | --- |
| `MyScript.Roboto-Regular.ttf` | Полное имя собственного встроенного TTF. Для файла на диске сначала прочитайте его байты через `File.ReadAllBytes` с реальным путём. |
| `20` | Размер шрифта; значение AddFont по умолчанию — 16. |
| `"Roboto"` | Диагностическое имя, не команда скачать или найти шрифт. |
| `Cyrillic` | Диапазон для кириллицы; недостающие в самом TTF глифы не создаёт. |
| `ReplaceFont(font)` | Выбирает основной шрифт общего атласа. Для своего фрагмента вместо этого используйте [PushFont/PopFont](/ru/scripting/imgui/loading-font-static). |

`AddFont` копирует байты TTF и возвращает `ImGuiFontSpec`, а не готовый нативный указатель. `IsInitialized` означает, что описание зарегистрировано. Атлас перестраивается после обработчиков текущего кадра, поэтому первый кадр может ещё использовать прежний шрифт.

При Stop программа запрашивает удаление **своего** описания в потоке отрисовки и ждёт подтверждения кадра. Затем снимается обработчик и освобождается API. Это требует работающего цикла кадров. `RemoveFont` убирает описание, но в этой реализации нативная копия байтов TTF намеренно не освобождается. Не загружайте шрифт заново каждый кадр и не используйте пример как бесконечную смену шрифтов. Одно освобождение API также не заменяет удаление описания.

Чтение байтов заканчивается до отрисовки; метод `ReadAllBytes` сам закрывает открытый им поток. Не освобождайте заимствованный файловый сервис и не храните `ImFontPtr` между перестроениями атласа. У `AddFont` нет аргумента отмены: токен здесь останавливает ожидание скрипта, а не прерывает нативную загрузку.

<details>
<summary>Другие диапазоны и старый импорт</summary>

| `ImGuiFontRangeType` | Назначение |
| --- | --- |
| `Default` | Стандартный диапазон библиотеки ImGui. |
| `Cyrillic`, `Greek` | Кириллица или греческие символы. |
| `Japanese`, `Korean`, `Thai`, `Vietnamese` | Соответствующие наборы символов, если они есть в TTF. |
| `ChineseFull`, `ChineseSimplifiedCommon` | Полный или распространённый упрощённый китайский набор. |

Сохранён [исторический импорт](https://eyeauras.net/share/S20251017150828zhuomztM9lbi). Его ссылка на 0.1.17 относится к старому `AddFontFromMemoryTTF`; её нельзя оставлять рядом с программой выше. В 0.1.42 уже есть AddFont/ReplaceFont/RemoveFont, здесь выбрана единая 0.1.47 из [источника пакетов](https://packages.eyeauras.net/v3/index.json). Различия версий перечислены в [карте SDK](/ru/scripting/api/nuget/imgui-sdk); наличие пакета не означает выполненную проверку графики в вашей сборке.

</details>
