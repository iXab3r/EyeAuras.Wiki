---
title: Загрузка пользовательского TTF-шрифта из ресурсов
description: Как загрузить пользовательский TTF-шрифт из встроенных ресурсов.
published: true
date: 2025-10-19T13:51:15.016Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-17T14:56:23.969Z
---
# Сделать TTF-шрифт основным в ImGui

Прочитаем TTF из ресурсов скрипта и заменим основной шрифт через `IImGuiExperimentalApi`. После загрузки текст демонстрационного окна будет рисоваться выбранным шрифтом.

## Подготовить шрифт и SDK

Добавьте свой `Roboto-Regular.ttf` как встроенный ресурс проекта C# Script. Нужен настоящий TTF с нужными символами; имя файла не гарантирует наличие кириллицы. Для примера ниже задайте `fontPath` полным manifest-именем: при пространстве имён `MyScript` и файле в корне это `MyScript.Roboto-Regular.ttf`, при папке `Fonts` — `MyScript.Fonts.Roboto-Regular.ttf`. Фактические имена перечисляются в отладочном журнале подготовки скрипта. Не рассчитывайте на поиск любого ресурса по короткому `Roboto-Regular.ttf`.

Импортируемый исторический пример: https://eyeauras.net/share/S20251017150828zhuomztM9lbi. Его ссылка на пакет сохранена:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.17"
```

Далее показан контракт `AddFont` / `ReplaceFont(ImGuiFontSpec)` из исходников EyeAuras `20fd3d4` и PoeEye `0e02c98`. Наличие этих методов в опубликованном пакете `0.1.17` здесь не проверено. Перед запуском выберите в своём проекте совместимую версию SDK и проверьте доступность этих символов; историческая ссылка сама по себе этого не доказывает. Если в установленном SDK другой API, не смешивайте примеры разных версий. [Карта SDK](/ru/scripting/api/nuget/imgui-sdk) помогает найти контракты.

## Script.csx

В проекте должна быть одна выбранная ссылка на `EyeAuras.ImGuiSdk`. Код ниже размещается в верхнеуровневом `Script.csx` живого EyeAuras, где доступны `AddNewExtension`, `GetService`, `ExecutionAnchors` и `cancellationToken`.

```csharp
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;
using PoeShared.Scaffolding;

AddNewExtension<ImGuiContainerExtensions>();

var files = GetService<IScriptFileProvider>();
var fontPath = "MyScript.Roboto-Regular.ttf"; // полное имя вашего ресурса
var fontData = files.ReadAllBytes(fontPath);
using var osd = GetService<IImGuiExperimentalApi>();
ImGuiFontSpec font = default;

using var rendering = osd.AddRenderer(() =>
{
    // И регистрация, и использование шрифта происходят в потоке отрисовки.
    if (!font.IsInitialized)
    {
        font = osd.AddFont(fontData, 20, "Roboto", ImGuiFontRangeType.Cyrillic);
        osd.ReplaceFont(font);
    }

    ImGui.ShowDemoWindow();
});

// Не завершать выполнение сразу после регистрации обработчика.
cancellationToken.WaitHandle.WaitOne();
```

## Когда шрифт появится и кто им владеет

`AddFont` возвращает `ImGuiFontSpec`, а не готовый `ImFontPtr`. Он копирует входные данные и помечает атлас для перестроения. В этой реализации перестроение выполняется после обработчиков текущего кадра, поэтому первый кадр может ещё использовать прежний шрифт. `IsInitialized` означает регистрацию описания, а не завершение загрузки в атлас.

`ReplaceFont(font)` выбирает основной шрифт общего атласа. API использует общее окно `Main`, поэтому замена может затронуть другие скрипты, рисующие в нём. Для локального выбора используйте [парные PushFont/PopFont](/ru/scripting/imgui/loading-font-static), не назначая то же описание основным.

По умолчанию `AddFont` использует размер `16` и `ImGuiFontRangeType.Default`, который обращается к стандартному диапазону ImGui. Здесь явно выбран `Cyrillic`; диапазон не добавляет отсутствующие в TTF глифы. Точный состав стандартного диапазона и поведение нативного парсера зависят от библиотеки.

Обработчик кадров и экземпляр API принадлежат этому запуску; после остановки `using` сначала удаляет обработчик, затем освобождает долю общего окна. Это не обещание закрыть окно других пользователей или удалить зарегистрированный шрифт: экземпляр API сам по себе не снимает его описание из общего репозитория. При повторных запусках не рассчитывайте на автоматическое освобождение шрифтов. `RemoveFont(font)` удаляет описание из репозитория и при необходимости сбрасывает основной шрифт, но в этой реализации исходный нативный буфер намеренно не освобождается. Поэтому не добавляйте шрифт заново на каждом кадре и не используйте загрузку как бесконечный цикл смены шрифтов.

У методов загрузки шрифта нет аргумента `CancellationToken`: токен в примере удерживает выполнение скрипта до остановки, а не отменяет нативную загрузку. Совместимость TTF, пакета и нативного рендерера нужно проверять в своей установленной версии.

![Example of embedded resource](https://s3.eyeauras.net/media/2025/10/EyeAuras_nMZAqZ6YHR.png)

![Imgui with updated font](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)
