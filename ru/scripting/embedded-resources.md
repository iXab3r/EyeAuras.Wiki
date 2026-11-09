---
title: Встроенные ресурсы
description: Использование встроенных ресурсов
published: true
date: 2025-10-19T16:05:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T13:42:12.071Z
---

# Добавить справку в проект скрипта

Встроенный ресурс хранит файл внутри сборки скрипта. Добавим `docs/help.txt`, чтобы справка переносилась вместе с проектом и читалась без отдельного пути на диске. Так же можно упаковать изображение, видео, модель или DLL; включение файла само по себе не запускает его и не загружает модель.

Нужен редактируемый проект `C# Script`. `GetService`, `Log` и `cancellationToken` в примерах предоставляет верхнеуровневый хост EyeAuras. Обычному классу передайте нужные зависимости явно.

## Добавить файл и прочитать текст

1. Подготовьте собственный текстовый файл `help.txt` с содержимым `Справка проекта`.
2. Покажите дерево файлов через `File Tree` — на прежних снимках это `Show Files`. В контекстном меню дерева выберите `Add` → `Existing File(s)...` и добавьте файл. На старом снимке команда называется `Add Existing File...`.

![Add Existing File...](https://s3.eyeauras.net/media/2025/10/EyeAuras_hFvtxUlceb.png)

3. Через `Rename...` задайте ресурсу имя `docs/help.txt`. Выберите его в дереве: у встроенного ресурса показывается служебное описание, а не текстовый редактор содержимого.

![Выбор файла](https://s3.eyeauras.net/media/2025/10/EyeAuras_1Yr73UevIj.png)

4. В `Script.csx` вставьте код:

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

5. Нажмите `Run`. В журнале появится `Справка проекта`. Если сработал `Log.Warn`, проверьте имя ресурса и правила поиска ниже.

Скрипт закрывает созданные поток и `StreamReader` при выходе из блока. Общий `IScriptFileProvider`, полученный из контейнера, освобождать не нужно. Чтобы убрать ресурс, удалите файл из списка проекта. Для замены байтов удалите старый ресурс и добавьте изменённый файл с тем же итоговым именем либо используйте импорт из IDE, затем перекомпилируйте скрипт.

Через `New file` можно создать редактируемый текстовый документ проекта, например Markdown. Его тоже видит служба файлов, но он не становится двоичным ресурсом только от появления в дереве: [пример README](/ru/scripting/examples/basic/file-provider) показывает этот отдельный путь.

## Понять имя и выбрать способ чтения

При сборке используется `DefaultNamespace` проекта, а если он не задан — имя проекта. Слеши пути заменяются точками: `MyScript` и `Images/logo.png` дают `MyScript.Images.logo.png`.

| Способ | Как найти ресурс |
| --- | --- |
| `IScriptFileProvider.GetFileInfo` | Принимает полное имя манифеста, полную форму со слешами и однозначный суффикс на границе имени. Полные формы сравниваются без учёта регистра. |
| `Images/logo.png` | Может сопоставиться с `MyScript.Images.logo.png`; дополнительно учитываются варианты `wwwroot`. Если кандидатов несколько, `Exists == false`, а не случайный первый файл. |
| `Assembly.GetManifestResourceNames()` | Возвращает исходные полные имена ресурсов конкретной сборки. |
| `Assembly.GetManifestResourceStream(fullName)` | Открывает поток по точному полному имени; полученный поток нужно закрыть. |
| `GetDirectoryContents` | Показывает диагностическую проекцию имён в дерево, а не гарантированную исходную структуру папок без префикса проекта. |

Не считайте любой частичный путь с точками эквивалентным пути со слешами. Если короткое имя неоднозначно, используйте полное, например `MyScript.Images.logo.png` или `MyScript/Images/logo.png`.

Посмотреть полные имена в `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

`Script` здесь — сгенерированный тип скрипта, а не универсальный тип обычной библиотеки. Альтернативный вариант с подписью в журнале:

```csharp
var asm = typeof(Script).Assembly;
foreach (var name in asm.GetManifestResourceNames())
{
    Log.Info($"Resource: {name}");
}
```

Список файлов через общий сервис можно получить так; добавьте `using EyeAuras.Repl;` в начало `Script.csx`:

```csharp
var files = GetService<IScriptFileProvider>();
foreach (var fi in files.GetDirectoryContents("/"))
{
    Log.Info($"Found: {fi.Name} ({fi.Length} b)");
}
```

Сервис может быть составным: ресурсы сборки проверяются перед прежним источником файлов. Первый существующий файл имеет приоритет, но это не снимает неоднозначности внутри одного источника. Приведение сервиса к конкретному классу ресурсов не требуется. Короткий законченный пример — [прочитать README](/ru/scripting/examples/basic/file-provider).

## Сохранить ресурсы при работе в IDE

При [экспорте проекта](/ru/scripting/ide-integration) EyeAuras записывает файлы на диск и добавляет явные элементы `EmbeddedResource` в `.csproj`. Например, для `Image 12.jpg`:

```xml
<ItemGroup>
   <EmbeddedResource Include="Image 12.jpg" />
   <None Remove="Image 12.jpg" />
</ItemGroup>
```

В Rider или Visual Studio этому соответствует `Build Action = EmbeddedResource`:

![Пометка embedded resource в Rider](https://s3.eyeauras.net/media/2025/10/rider64_24V6ZnFu8u.png)

При обратном импорте читаются явные `Include` и байты соответствующих файлов относительно проекта. Указывайте каждый ресурс явно; импорт не выполняет произвольные MSBuild targets и не обещает обработку всех шаблонов путей. `None Remove` убирает файл из набора `None`, а не заменяет все настройки копирования содержимого в выходную папку.

<details>
<summary>Изображение в Blazor и чтение большого файла</summary>

Если ресурс `Image 12.jpg` добавлен в проект, разметка **Razor-компонента подготовленного окна** может выглядеть так:

```html
<img src="Image 12.jpg" />
```

Окно должно предоставлять файлы проекта: см. [Blazor Windows](/ru/scripting/blazor-windows/getting-started). В произвольной внешней HTML-странице такой путь не начинает работать сам.

Для большого файла читайте поток, не создавая массив размером со весь ресурс. Добавьте `video/tutorial.mp4`; следующий отдельный `Script.csx` считает байты, а не воспроизводит видео. Проверка отмены позволяет выйти при `Stop`:

```csharp
using System.IO;
using EyeAuras.Repl;

{
    var file = GetService<IScriptFileProvider>().GetFileInfo("video/tutorial.mp4");
    if (!file.Exists) { Log.Warn("Видео не найдено"); return; }
    using var stream = file.CreateReadStream();
    var buffer = new byte[8192];
    long total = 0;
    int count;
    while ((count = stream.Read(buffer, 0, buffer.Length)) > 0)
    {
        cancellationToken.ThrowIfCancellationRequested();
        total += count;
    }
    Log.Info($"Прочитано {total} байт");
}
```

</details>

<details>
<summary>DLL как ресурс</summary>

Если библиотека есть в [NuGet](https://nuget.org/), начните с [пакета](/ru/scripting/nuget): он задаёт версию и зависимости. Для собственной DLL добавьте её файл в ресурсы и в начале `Script.csx` укажите относительный путь:

```csharp
#r "assemblyPath: MyDll.dll"
```

Это только директива ссылки, а не самостоятельная программа. Для другого имени файла она будет такой:

```csharp
#r "assemblyPath: MyLib.dll"
```

При компиляции ссылка разрешается в метаданные ресурса, а при выполнении обработчик загрузки может прочитать подходящую сборку из ресурсов. Её дополнительные зависимости и совместимость всё равно должны быть обеспечены.

Например, **после добавления совместимой `Newtonsoft.Json.dll`** в проект можно выполнить:

```csharp
#r "assemblyPath: Newtonsoft.Json.dll"
using Newtonsoft.Json;
Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

</details>

## Почему не видно изменения файла

Ресурсы вшиваются в DLL. `Watch` этого источника возвращает `NullChangeToken`: изменение отдельного файла не переписывает уже загруженную сборку. Обновите ресурс в проекте или импортируйте его из IDE, дождитесь компиляции и запустите новую версию.

При `Exists == false` проверьте наличие файла в проекте, полное имя и неоднозначные окончания вроде `a/logo.png` и `b/logo.png`. Для DLL дополнительно проверьте директиву `assemblyPath` и диагностику её зависимостей.
