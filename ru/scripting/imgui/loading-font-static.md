---
title: Загрузка пользовательского TTF-шрифта из статического класса
description: Как загрузить пользовательский TTF-шрифт из статического класса.
published: true
date: 2025-10-19T13:51:25.693Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-17T15:02:40.336Z
---
# Загрузить TTF через статический класс

Статический класс может подготовить байты шрифта, но не наследует `GetService` и другие возможности `Script.csx`. Передадим ему файловый провайдер явно, а рисовать будем в обработчике кадров.

## Подготовить шрифт и SDK

Добавьте свой `Roboto-Regular.ttf` как встроенный ресурс проекта C# Script. Нужен настоящий TTF с нужными символами; имя файла не гарантирует наличие кириллицы. Для примера ниже задайте `fontPath` полным manifest-именем: при пространстве имён `MyScript` и файле в корне это `MyScript.Roboto-Regular.ttf`, при папке `Fonts` — `MyScript.Fonts.Roboto-Regular.ttf`. Фактические имена перечисляются в отладочном журнале подготовки скрипта. Не рассчитывайте на поиск любого ресурса по короткому `Roboto-Regular.ttf`.

Импортируемый исторический пример: https://eyeauras.net/share/S20251017150654moSdG8zUyQ4D. Его ссылка на пакет сохранена:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.17"
```

Пакет `0.1.17` содержит старый `AddFontFromMemoryTTF` и не подходит для кода ниже. Для `AddFont`, `ReplaceFont(ImGuiFontSpec)` и `RemoveFont` используйте `0.1.42`: эти члены присутствуют в XML опубликованного пакета из [источника EyeAuras](https://packages.eyeauras.net/v3/index.json). В проекте замените историческую ссылку:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"
```

Жизненный цикл ниже сверён с исходниками `c8b2304ac`; наличие членов пакета не доказывает совместимость нативного рендерера с любой сборкой приложения. [Карта SDK](/ru/scripting/api/nuget/imgui-sdk) разделяет эти версии.

## Script.csx

В проекте должна быть одна выбранная ссылка на `EyeAuras.ImGuiSdk`. Код ниже размещается в верхнеуровневом `Script.csx` живого EyeAuras, где доступны `AddNewExtension`, `GetService`, `ExecutionAnchors` и `cancellationToken`.

```csharp
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;
using PoeShared.Scaffolding;

{
    AddNewExtension<ImGuiContainerExtensions>();

    var files = GetService<IScriptFileProvider>();
    var fontPath = "MyScript.Roboto-Regular.ttf"; // полное имя вашего ресурса
    var fontData = FontData.Load(files, fontPath);
    using var osd = GetService<IImGuiExperimentalApi>();
    ImGuiFontSpec font = default;

    using var rendering = osd.AddRenderer(() =>
    {
        // И регистрация, и использование шрифта происходят в потоке отрисовки.
        if (!font.IsInitialized)
        {
            font = osd.AddFont(fontData, 20, "Roboto", ImGuiFontRangeType.Cyrillic);
        }

        ImGuiEx.PushFont(font);
        try
        {
            ImGui.ShowDemoWindow();
        }
        finally
        {
            ImGuiEx.PopFont(font);
        }
    });

    // Не завершать выполнение сразу после регистрации обработчика.
    cancellationToken.WaitHandle.WaitOne();
}
```

### FontData.cs

Добавьте обычный C# файл в тот же проект. Это собственный вспомогательный класс примера; генерация `EmbeddedBinaryData.RobotoRegularTtf` хостом для него не требуется.

```csharp
using EyeAuras.Repl;
using PoeShared.Scaffolding;

public static class FontData
{
    public static byte[] Load(IScriptFileProvider files, string manifestName)
    {
        return files.ReadAllBytes(manifestName);
    }
}
```

Статический метод только читает данные через переданную зависимость. Он не создаёт ImGui-контекст и не должен вызывать ImGui с произвольного потока. Вместо чтения ресурса можно передать уже имеющийся `byte[]` настоящего TTF — способ получения данных не меняет правила отрисовки.

## Когда шрифт появится и кто им владеет

`AddFont` возвращает `ImGuiFontSpec`, а не готовый `ImFontPtr`. Он копирует входные данные и помечает атлас для перестроения. В этой реализации перестроение выполняется после обработчиков текущего кадра, поэтому первый кадр может ещё использовать прежний шрифт. `IsInitialized` означает регистрацию описания, а не завершение загрузки в атлас.

`ImGuiEx.PushFont(font)` и `ImGuiEx.PopFont(font)` работают парой с одним описанием в одном кадре. До появления нативного шрифта оба вызова ничего не делают. Не сохраняйте сырой указатель между перестроениями атласа. Этот вариант выбирает шрифт только на время отрисовки своего содержимого; для основного шрифта есть [ReplaceFont](/ru/scripting/imgui/loading-font).

По умолчанию `AddFont` использует размер `16` и `ImGuiFontRangeType.Default`, который обращается к стандартному диапазону ImGui. Здесь явно выбран `Cyrillic`; диапазон не добавляет отсутствующие в TTF глифы. Точный состав стандартного диапазона и поведение нативного парсера зависят от библиотеки.

Обработчик кадров и экземпляр API принадлежат этому запуску; после остановки `using` сначала удаляет обработчик, затем освобождает долю общего окна. Это не обещание закрыть окно других пользователей или удалить зарегистрированный шрифт: экземпляр API сам по себе не снимает его описание из общего репозитория. При повторных запусках не рассчитывайте на автоматическое освобождение шрифтов. `RemoveFont(font)` удаляет описание из репозитория и при необходимости сбрасывает основной шрифт, но в этой реализации исходный нативный буфер намеренно не освобождается. Поэтому не добавляйте шрифт заново на каждом кадре и не используйте загрузку как бесконечный цикл смены шрифтов.

У методов загрузки шрифта нет аргумента `CancellationToken`: токен в примере удерживает выполнение скрипта до остановки, а не отменяет нативную загрузку. Совместимость TTF, пакета и нативного рендерера нужно проверять в своей установленной версии.

![Пример embedded resource](https://s3.eyeauras.net/media/2025/10/EyeAuras_SdQBF6VcjL.png)

![ImGui с обновлённым шрифтом](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)
