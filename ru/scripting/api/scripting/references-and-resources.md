---
title: AI scripting — справочники и ресурсы
description: AI-ориентированная карта по справочникам для скриптов, пакетам NuGet, ссылкам на сборки и встроенным ресурсам.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, nuget, resources, references, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта зависимостей и ресурсов

Справочная карта по зависимостям в script project: NuGet references, assembly
references, embedded files, `IScriptFileProvider`, ассеты DLL/image/font/model и
то, как всё это работает при export/import.

## Что обычно хотят сделать

- Добавить внешний NuGet-пакет в mini-app.
- Подключить assembly по имени или через embedded DLL file.
- Положить в проект images, fonts, JSON, ONNX models, scripts или DLLs.
- Читать embedded files из C# кода.
- Использовать embedded files из Blazor или ImGui.
- Сохранить совместимость exported projects с обычной IDE.
- Понять, что лучше использовать для зависимости: NuGet, assembly reference или resource.

## Модель понятий

- Директивы `#r` — это объявления ссылок на уровне script.
- `#r "nuget:..."` подключает NuGet package и его compile/runtime assets.
- `#r "assemblyName:..."` подключает уже доступную для загрузки assembly по имени.
- `#r "assemblyPath:..."` подключает путь к DLL file или embedded DLL resource.
- Директивы `#r` должны находиться в top-level script files, а не в произвольных helper classes.
- Embedded resources — это файлы, которые идут вместе с script project и компилируются в script assembly.
- `IScriptFileProvider` предоставляет доступ к script files через `IFileProvider`.
- Blazor windows могут напрямую отдавать script files в WebView content.
- Крупные binary assets по возможности лучше читать через stream, а не копировать в большие byte arrays.

## Виды ссылок

| Вид | Когда использовать | Примечание |
| --- | --- | --- |
| `#r "nuget:Package, Version"` | Публичные пакеты и optional SDKs | Предпочтительный вариант, если зависимость существует в виде package. |
| `#r "assemblyName:Name"` | Assemblies, которые уже загружены или могут быть разрешены другим способом | Удобно для assemblies, которые есть в host/runtime, но отсутствуют в default references. |
| `#r "assemblyPath:File.dll"` | Локальные или embedded DLLs | Для portable mini-apps лучше использовать относительные project/resource paths. |
| Project reference | Helper libraries в exported solutions | Хорошо подходит для IDE/test projects; при import стоит включать только payload projects. |
| Embedded resource | Images, fonts, models, JSON, JS/CSS, DLLs | Доступ через `IScriptFileProvider` или Blazor resource paths. |

## Подробности про embedded resources

- Resources включаются в script assembly как элементы `EmbeddedResource`.
- В exported project files элементы embedded resources должны сохраняться в `.csproj`.
- Import/live-import сканирует project resource metadata и сохраняет относительные пути.
- `ScriptEmbeddedResourceFileProvider` преобразует manifest names обратно в path-like names.
- Поиск resources поддерживает полные manifest names, относительные пути, dotted paths и leaf names, если они однозначны.
- Если имена файлов дублируются, короткий поиск по leaf name может стать неоднозначным.
- `Watch(...)` для embedded resources — это не live file watcher; resources вшиваются в compiled assembly.

## Детали API

- `IScriptFileProvider` — интерфейс провайдера script files, расширяет `IFileProvider`.
- `IFileProvider.GetFileInfo(...)` — возвращает file info/stream для одного resource.
- `IFileProvider.GetDirectoryContents(...)` — перечисляет folders/resources.
- `IFileInfo.CreateReadStream()` — позволяет читать большие файлы через stream.
- `ScriptEmbeddedResourceFileProvider` — провайдер embedded resources.
- `GetManifestNames()` — диагностический список raw manifest resource names.
- `CompositeScriptFileProvider` — объединяет несколько script file providers.
- `ExposeEmbeddedResourcesScriptRuntimeVisitor` — подключает embedded resource provider к runtime context.

## Частые сценарии

### Добавить optional SDK package

1. Добавьте NuGet reference в top-level script или project file.
2. Импортируйте namespace SDK.
3. Добавьте container extension SDK, если для него нужна явная регистрация.
4. Получите доступ к нужной возможности через подходящий для текущего контекста способ.

### Прочитать embedded file

1. Добавьте файл в script project как embedded resource.
2. Получите `IScriptFileProvider` из текущего script/app context.
3. Используйте `ReadAllText`, `ReadAllBytes`, `GetFileInfo` или `CreateReadStream`.
4. Для файлов с типовыми именами лучше использовать имена с подпапкой.

### Использовать resource в Blazor

1. Добавьте CSS/JS/image/video как embedded resource.
2. Сошлитесь на него из Razor по относительному пути или загружайте CSS/JS через Blazor utilities.
3. Сохраняйте стабильные resource paths при export/import.

### Использовать resource в ImGui

1. Добавьте image/font/markdown bytes как embedded resource.
2. Прочитайте bytes через `IScriptFileProvider`.
3. Используйте `IImGuiExperimentalApi.AddFont`, `ReplaceFont`, `GetOrAddImage` или `ImGuiEx.ImageRgba32`/`ImageFromUrl` в зависимости от типа asset.

## Что предпочтительно

- Лучше использовать NuGet packages вместо raw DLL resources, если пакет уже существует.
- Для portable mini-apps лучше использовать относительные resource paths.
- Лучше использовать `IScriptFileProvider`, а не разбирать manifest names вручную.
- Для крупных assets лучше использовать streams.
- Если имена могут пересекаться, лучше использовать resource names с подпапками.
- Во время работы в IDE helper libraries лучше подключать через project references, а обратно в script импортировать только нужный payload.

## Чего лучше избегать

- Не используйте абсолютные `assemblyPath` references в portable/shared docs или mini-apps.
- Не размещайте директивы `#r` внутри обычных C# helper classes.
- Не рассчитывайте, что embedded resources обновятся без перекомпиляции.
- Не загружайте большие models/videos целиком в память, если целевая library не требует bytes.
- Не полагайтесь на поиск по leaf name, если у двух resources совпадает имя файла.

## Research Anchors

- `IScriptFileProvider`
- `ScriptEmbeddedResourceFileProvider`
- `CompositeScriptFileProvider`
- `ExposeEmbeddedResourcesScriptRuntimeVisitor`
- `EmbeddedResourcesScriptVisitor`
- `IFileProvider`
- `IFileInfo`
- `GetFileInfo`
- `GetDirectoryContents`
- `CreateReadStream`
- `GetManifestNames`
- `#r "nuget:"`
- `#r "assemblyName:"`
- `#r "assemblyPath:"`
- `EmbeddedResource`

## Search Synonyms

- NuGet reference
- assembly reference
- assembly path
- embedded resource
- script file provider
- resource file
- embedded DLL
- embedded image
- embedded font
- ONNX model resource
- Blazor static file
- ImGui font resource
- resource manifest

## Связанные карты

- `scripting/container-extensions.md`
- `scripting/project-workflow.md`
- `nuget/imgui-sdk.md`
- `nuget/frida-sdk.md`
- `windows-subsystems/blazor-windows.md`
- `computer-vision/images.md`
- `ml/ai.md`