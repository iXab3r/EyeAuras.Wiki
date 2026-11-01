---
title: Экспериментальный API ImGui
description: Интерфейс с методами для создания и отрисовки пользовательских элементов на экране
published: true
date: 2026-04-21T00:00:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-07-16T10:36:31.172Z
---
# IImGuiExperimentalApi

Экспериментальный интерфейс пакета `EyeAuras.ImGuiSdk` управляет циклом отрисовки, шрифтами и текстурами. Для выбора более высокого уровня UI смотрите [карту ImGui SDK](/ru/scripting/api/nuget/imgui-sdk); для Razor — [Blazor Windows](/ru/scripting/api/windows-subsystems/blazor-windows).

## Показать окно на каждом кадре

В C# Script внутри EyeAuras подключите пакет, зарегистрируйте расширение контейнера и только затем получите сервис. Версия `0.1.42` сохранена из [руководства по ImGui](/ru/scripting/imgui/getting-started); соответствие конкретного установленного пакета описанному ниже исходному контракту нужно проверять отдельно.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"

using EyeAuras.ImGuiSdk;
using ImGuiNET;

AddNewExtension<ImGuiContainerExtensions>();
using var imgui = GetService<IImGuiExperimentalApi>();
using var renderer = imgui.AddRenderer(() =>
{
    ImGui.Begin("Пример");
    ImGui.Text("Hello, World");
    ImGui.End();
});
cancellationToken.WaitHandle.WaitOne();
```

Появится окно с текстом. Скрипт ждёт остановки пользователем, после чего `using` освобождает подписку и экземпляр API. Возвращаемый `AddRenderer` объект удаляет обработчик при `Dispose`; его нужно освобождать отдельно. Рисование выполняется в обработчике кадра, поэтому не помещайте туда `Sleep`, ожидание сети или чтение большого файла. Обычный C# класс не получает `GetService`, `AddNewExtension` и `cancellationToken` как глобальные функции — зависимости ему передаёт вызывающий код.

## Выполнить действие на ближайшем кадре

В уже настроенном скрипте `imgui.RunOnce(api => { /* короткая операция кадра */ })` ставит обработчик на один кадр и возвращает `IDisposable`. Освобождение этого объекта до выполнения предотвращает вызов. Это средство планирования работы с ImGui, а не способ хранить постоянное изображение: содержимое интерфейса обычно нужно рисовать каждый кадр через `AddRenderer`.

## Настроить частоту и поведение окна

У нового общего overlay в рассматриваемой реализации `VSync = true`, `MaxFramesPerSecond = 0`, `NoActivate = false`, `ShowInTaskbar = false`. `0` означает отсутствие отдельного лимита FPS; при включённом VSync приоритет у синхронизации с монитором. Чтобы задать лимит вручную, установите `imgui.VSync = false` и затем, например, `imgui.MaxFramesPerSecond = 60`.

`NoActivate = true` позволяет взаимодействовать с overlay без получения им фокуса. Экземпляры API используют общий ресурс overlay с именем `Main`, поэтому эти настройки нельзя считать изолированными для каждого скрипта. Освобождение одного экземпляра API также не означает немедленного закрытия общего overlay, пока им пользуются другие владельцы.

## Зарегистрировать шрифт или текстуру

`AddFont(ReadOnlySpan<byte> ttf, float sizeInPixels = 16, string? name = null, ImGuiFontRangeType rangeType = ImGuiFontRangeType.Default)` принимает готовые байты TTF и возвращает `ImGuiFontSpec`. Чтобы сделать его основным, вызовите `ReplaceFont(fontSpec)`; `RemoveFont(fontSpec)` удаляет регистрацию и возвращает `bool`. Старый `ReplaceFont` с байтами помечен `Obsolete`. Чтение файла выполняйте до обработчика кадра, а изменение репозитория шрифтов — в потоке отрисовки. [Полный пример загрузки TTF](/ru/scripting/imgui/loading-font) включает получение ресурса и отрисовку.

Регистрация ещё не означает загрузку в атлас: `IsInitialized` у описания
не является проверкой готовности нативного шрифта. После обработчиков кадра
грязный атлас перестраивается. Для локального выбора используйте парные
`ImGuiEx.PushFont(spec)` / `PopFont(spec)` в одном кадре, как в
[примере со вспомогательным классом](/ru/scripting/imgui/loading-font-static).
Не назначайте то же описание основным через `ReplaceFont` и одновременно
не рассчитывайте на его обычный слот для `PushFont` в этой реализации.

Шрифты общие для overlay `Main`. Освобождение API не удаляет ваши регистрации
из общего репозитория. `RemoveFont` удаляет описание и сбрасывает основной
шрифт, если нужно; это не обещание освободить исходный нативный буфер — в
данном срезе он намеренно сохраняется. Поэтому не добавляйте новый шрифт
на каждом кадре или при каждой отрисовке текста.

`GetOrAddImage(string name, Image<Rgba32> image, bool srgb)` принимает изображение SixLabors.ImageSharp и явный выбор цветового пространства, возвращает `IntPtr` текстуры ImGui. `RemoveImage(string name)` возвращает `bool`. Имя — ключ ресурса, а не произвольная новая строка на каждый кадр. Эти методы не заменяют загрузку или декодирование исходного изображения.

## Версия справочника

Контракт сверён с [IImGuiExperimentalApi](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.ImGuiSdk/IImGuiExperimentalApi.cs), [реализацией](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.ImGuiSdk/ImGuiExperimentalApi.cs) и [регистрацией контейнера](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.ImGuiSdk/Prism/ImGuiContainerExtensions.cs) версии EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`. `WhenRender` предоставляет поток кадров с `TimeSpan`.

Прежний список `MeasureText`, `DrawBox`, `DrawFrame`, `DrawCircleFilled` не является составом этого интерфейса в указанной версии. Для рисования используйте ImGui draw lists и доступные в вашем пакете расширения из [карты SDK](/ru/scripting/api/nuget/imgui-sdk). Справочник исходников не подтверждает двоичную совместимость всех опубликованных версий NuGet.
