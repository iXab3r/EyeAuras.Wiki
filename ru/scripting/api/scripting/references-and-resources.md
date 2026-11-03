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
- Используйте полное manifest name или путь с подпапкой через слеши. Произвольное имя без подпапки не является универсальным поиском по окончанию.
- Неоднозначный поиск возвращает `IFileInfo` с `Exists == false` и пишет предупреждение; первый случайный ресурс не выбирается.
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

## Подключить библиотеку и использовать её

Для NuGet-пакета укажите версию в начале `Script.csx`, затем вызовите API:

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"
using Newtonsoft.Json;

var text = JsonConvert.SerializeObject(new { Name = "Пример", Count = 3 });
Log.Info(text);
```

Ожидаемый результат — JSON с двумя полями в журнале. Пакет должен быть
доступен для восстановления и совместим с runtime; это не проверка любого
пакета NuGet. В экспортированном проекте соответствующая зависимость
представляется `PackageReference`. Обычный helper-класс импортирует namespace,
а не содержит собственную директиву `#r`.

Если DLL уже доступна host, есть `#r "assemblyName: ИмяСборки"`. Если вы
поставляете свою DLL, добавьте её в файлы скрипта и используйте
`#r "assemblyPath: MyLib.dll"`. Это формы записи, а не готовые примеры вызова:
для работы нужны сама совместимая сборка и её реальный API. Подключение
типов не регистрирует сервисы SDK — см. [расширения контейнера](container-extensions).

## Прочитать текст из ресурсов скрипта

В редакторе через `Show Files` → `Add Existing File...` добавьте файл
`docs/help.txt` с текстом `Справка проекта`. Для IDE задайте явный
`EmbeddedResource Include="docs/help.txt"` в `.csproj` и импортируйте проект.
Теперь выполните в `Script.csx`:

```csharp
using System.IO;
using EyeAuras.Repl;

{
    var files = GetService<IScriptFileProvider>();
    var file = files.GetFileInfo("docs/help.txt");
    if (!file.Exists)
    {
        Log.Warn("Ресурс docs/help.txt не найден");
        return;
    }
    using var stream = file.CreateReadStream();
    using var reader = new StreamReader(stream);
    Log.Info(reader.ReadToEnd());
}
```

Журнал покажет содержимое файла. Поток и reader закрываются при выходе из
блока. Обычному классу передайте `IScriptFileProvider` и логгер явно.

Провайдер хранит исходные manifest names. Полное имя и его форма со слешами
принимаются без учёта регистра; путь с подпапкой допускает поиск по границе
суффикса. Учитываются также варианты `wwwroot`. Все совпадения участвуют в
проверке однозначности. `help.txt` не обещает найти любой ресурс в любой папке,
а неоднозначный путь даёт `Exists == false`.

`GetDirectoryContents` показывает диагностическое дерево полного имени, а
не обязательно исходные папки проекта. `GetManifestNames()` есть у конкретного
`ScriptEmbeddedResourceFileProvider`; сервис может быть составным, поэтому
приведение к этому типу не гарантируется. Подробности: [ресурсы](/ru/scripting/embedded-resources).

## Передать ресурс в UI или библиотеку

Для Blazor добавьте `Images/logo.png` в файлы скрипта и в Razor-компоненте
его окна используйте `<img src="Images/logo.png" />`. Окно должно предоставлять
файлы скрипта: [настройка окна](/ru/scripting/blazor-windows/getting-started).
Сам HTML вне этого host не получает доступ к ресурсам сборки.

Для ImGui нужны пакет и регистрация SDK, затем чтение изображения/шрифта и
передача в соответствующий API. Законченная настройка есть в
[руководстве ImGui](/ru/scripting/imgui/getting-started). Наличие байтов само
по себе не создаёт текстуру или загруженную ML-модель.

Поток уменьшает дополнительные копии у вызывающего кода; `ReadAllBytes`
создаёт целый массив. Embedded `Watch` возвращает `NullChangeToken`: новые
байты появятся после обновления ресурсов и перекомпиляции, а не от наблюдения
за старой сборкой.

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
- Не полагайтесь на произвольный поиск по имени без подпапки; используйте однозначный путь или manifest name.

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
Контракты — EyeAuras `20fd3d4`, PoeEye `0e02c98`. Для точных сигнатур используйте SDK/XML своей версии; пакеты имеют собственные версии.

## Приоритет и чтение источников ресурсов

[Операции файлового провайдера](file-provider-operations) показывают чтение подготовленного ресурса, объединение двух `IScriptFileProvider` с явным приоритетом, перечисление каталога и смысл `Watch`. В `CompositeScriptFileProvider` побеждает первый существующий файл в порядке источников; при объединении каталога остаётся первая запись с данным `Name`.

Провайдер, файловая запись и открытый поток имеют разное время жизни. Вызов `CreateReadStream()` создаёт поток, которым владеет вызывающий; полученный через host `IScriptFileProvider` не нужно освобождать как этот поток.
