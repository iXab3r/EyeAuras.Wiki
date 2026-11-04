---
title: Встроенные ресурсы
description: Использование встроенных ресурсов
published: true
date: 2025-10-19T16:05:00.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-19T13:42:12.071Z
---
# Что это такое и зачем это нужно

Embedded Resources — это механизм в скриптах, который позволяет «нести с собой» любые файлы прямо рядом со скриптом: изображения, видео, ML-модели, исполняемые файлы и даже DLL.

Изображения можно использовать в вашем кастомном UI, видео — для обучающих материалов, а DLL — для дополнительного кода, который по каким-то причинам неудобно поставлять как пакет [NuGet](/ru/scripting/nuget).

## NuGet

Обратите внимание: если библиотека уже есть на [NuGet](https://nuget.org/), гораздо надежнее подключать её через [#r "nuget:"](/ru/scripting/nuget) и ссылаться на пакет, а не на «сырую» DLL.

## Как добавить

Щелкните правой кнопкой мыши по дереву файлов скрипта (его показывает кнопка Show Files) → Add Existing File...

![Add Existing File...](https://s3.eyeauras.net/media/2025/10/EyeAuras_hFvtxUlceb.png)

Либо воспользуйтесь кнопкой New.

После добавления файл появится в списке, и его можно будет выбрать.

![Выбор файла](https://s3.eyeauras.net/media/2025/10/EyeAuras_1Yr73UevIj.png)

## Как удалить

Чтобы удалить ресурс, просто удалите файл из списка.

## Как использовать

Файлы включаются в сборку скрипта. Провайдер даёт доступ к их содержимому; сам по себе ресурс не становится загруженной моделью, шрифтом или исполняемой DLL.

### Прочитать текст через IScriptFileProvider

Добавьте через `Show Files` файл `docs/help.txt` с текстом `Справка проекта`.
Теперь в `Script.csx` можно открыть поток и вывести содержимое:

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

Ожидаемый результат — текст файла в журнале. Поток и reader закрываются
при выходе из блока. Провайдер получает скрипт; обычному C#-классу передайте
`IScriptFileProvider` явно через конструктор или параметр.

### Через Blazor

Если вы строите UI через Blazor, файлы можно использовать напрямую. Например, если вы добавили в скрипт `Image 12.jpg`, то для отображения достаточно написать:

```html
<img src="Image 12.jpg" />
```

Это разметка Razor-компонента окна, которое предоставляет файлы скрипта. Подготовка окна — в [Blazor Windows](/ru/scripting/blazor-windows/getting-started). В обычной внешней HTML-странице такой путь сам по себе ресурс сборки не открывает.

### Как подключаемую DLL

По аналогии с пакетами NuGet, вы можете положить нужную DLL прямо в скрипт и при этом сохранить автодополнение, определение типов и прочие удобства.

Для этого нужно:

- добавить в скрипт нужную .NET-сборку, например `MyDll.dll`
- в `Script.csx` написать

```csharp
#r "assemblyPath: MyDll.dll"
```

Готово. При компиляции скрипта EyeAuras найдет подходящую DLL среди ресурсов проекта и использует её. А при запуске скрипта загрузит её из ресурсов. Никаких отдельных файлов рядом держать не нужно.

## Экспорт/импорт C# Solution

EyeAuras умеет экспортировать скрипт как полноценный C# `.sln`, который потом можно открыть в JetBrains Rider или Visual Studio.

Embedded resources (файлы) тоже экспортируются и помечаются как `Embedded Resource`.

Например, для `Image 12.jpg` произойдет следующее: во-первых, сам файл будет экспортирован в целевую папку, а во-вторых, в экспортированном файле проекта появится:

```xml
<ItemGroup>
   <EmbeddedResource Include="Image 12.jpg" />
   <None Remove="Image 12.jpg" />
</ItemGroup>
```

Это говорит C#-компилятору включить `Image 12.jpg` как embedded resource внутрь итоговой DLL.

При обратном импорте `.sln` в EyeAuras читаются элементы `Embedded Resource`, и вы увидите их как файлы в списке.

В Visual Studio/Rider это соответствует `Build Action = EmbeddedResource`. Если вы открыли экспортированный проект, можно:

- добавлять и удалять файлы прямо в папке проекта
- в `.csproj` указывать `<EmbeddedResource Include="..."/>` для каждого ресурса
- при необходимости добавлять `<None Remove="..."/>`, чтобы файл не копировался в выходную папку как обычный контент

При импорте обратно EyeAuras просканирует `.csproj`, найдет все `EmbeddedResource`-элементы и покажет их в списке файлов скрипта. Имена и относительные пути сохраняются — это важно для корректного доступа из кода и Blazor. Здесь используется явный `Include`: импорт не является полным выполнением произвольных MSBuild targets или wildcard-правил.

![Пометка embedded resource в Rider](https://s3.eyeauras.net/media/2025/10/rider64_24V6ZnFu8u.png)

## Как это устроено внутри

При сборке скриптов EyeAuras старается максимально следовать логике официального компилятора: добавленные вами файлы включаются в итоговую DLL как Embedded Resources и доступны через `Assembly.GetManifestResourceNames` и `Assembly.GetManifestResourceStream`.

Кратко о .NET-методах:

- `Assembly.GetManifestResourceNames()` — возвращает полный список имен ресурсов, например `"DefaultNamespace.folder.file.ext"`
- `Assembly.GetManifestResourceStream(fullName)` — открывает поток для чтения ресурса по его ПОЛНОМУ имени

Чтобы увидеть исходные имена, выполните в `Script.csx`:

```csharp
foreach (var name in typeof(Script).Assembly.GetManifestResourceNames())
{
    Log.Info(name);
}
```

`Script` здесь — сгенерированный тип submission, а не глобальный тип для
обычной библиотеки. Для открытия через `GetManifestResourceStream` нужно
точное имя из этого списка и закрытие полученного потока. Обычно задача
проще решается провайдером из примера выше.

В EyeAuras удобнее использовать `IScriptFileProvider`, потому что он сам сопоставляет пути и находит нужный ресурс.

### Именование

У C# Embedded Resources есть одна особенность: когда ресурсы попадают в DLL, их относительный путь «сворачивается» и превращается в `namespace.folder.filename`.

Как формируется полное имя ресурса во время сборки:

- берется `DefaultNamespace` проекта (если он не задан — имя проекта)
- слеши в относительном пути файла заменяются на точки
- результат: `FullName = DefaultNamespace + "." + relative/path/with/dots`  
  Пример: проект с namespace `MyScript` и файл `Images/logo.png` → ресурс: `MyScript.Images.logo.png`

Как искать ресурс в срезе EyeAuras `20fd3d4`:

- Полное manifest name и полная форма со слешами принимаются без учёта регистра.
- Путь с подпапкой, например `Images/logo.png`, допускает поиск по границе
  суффикса manifest name. Дополнительно рассматриваются пути `wwwroot`.
- Произвольное имя `logo.png` не гарантирует поиск по любой папке. Используйте
  однозначный путь с подпапкой или полную идентичность.
- Если кандидатов несколько, провайдер пишет предупреждение и возвращает
  `IFileInfo` с `Exists == false`. Первый случайный ресурс не выбирается.

Например, для manifest name `MyScript.Images.logo.png` используйте полное
имя или `MyScript/Images/logo.png`; `Images/logo.png` пригоден, если совпадение
однозначно. Не считайте произвольный частичный путь с точками эквивалентом
пути со слешами.

`GetDirectoryContents` показывает диагностическую проекцию полных имён в
дерево. Это не обещание восстановить исходную структуру папок проекта.

## Прочитать большой ресурс без дополнительного массива

Добавьте файл `video/tutorial.mp4` через `Show Files`. Этот пример не
воспроизводит видео: он подсчитывает прочитанные байты, не создавая массив
размером со весь файл. Выполните в `Script.csx`:

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

Для JSON, шрифта или ML-модели чтение — только первый шаг. Далее нужен
конкретный тип конфигурации или API библиотеки-потребителя. Не подменяйте
загрузку модели получением массива байтов. `ReadAllBytes` подходит, когда
потребитель требует именно весь массив.

## Загрузка DLL из ресурсов — как это работает

- На этапе компиляции
  - В `Script.csx` добавьте директиву:
    ```csharp
    #r "assemblyPath: MyLib.dll"
    ```
  - EyeAuras найдет файл `MyLib.dll` в ресурсах и добавит его как ссылку. Это даст автодополнение, определение типов и успешную компиляцию.

- Во время выполнения
  - EyeAuras подписывается на `AssemblyLoadContext.Resolving` и пытается загрузить сборку из embedded resources.

Если вы уже добавили совместимую `Newtonsoft.Json.dll` в файлы скрипта, можно проверить её вызовом:

```csharp
#r "assemblyPath: Newtonsoft.Json.dll"
using Newtonsoft.Json;
Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

## Как вывести список всех доступных имен

- Через .NET API (полные имена):

```csharp
var asm = typeof(Script).Assembly;
foreach (var name in asm.GetManifestResourceNames())
{
    Log.Info($"Resource: {name}");
}
```

- Через file provider (`IFileProvider`):

```csharp
var files = GetService<IScriptFileProvider>();
foreach (var fi in files.GetDirectoryContents("/"))
{
    Log.Info($"Found: {fi.Name} ({fi.Length} b)");
}
```

`GetService<IScriptFileProvider>()` может вернуть `CompositeScriptFileProvider`:
провайдер ресурсов сборки объединяется с существующим провайдером. У первого
имеющего файл провайдера есть приоритет, но внутри embedded-провайдера
неоднозначный поиск остаётся `NotFound`. Поэтому приведение сервиса к
`ScriptEmbeddedResourceFileProvider` не гарантирует список manifest names;
для сборки используйте пример выше.

## FAQ и нюансы

- Файл не находится
  - Убедитесь, что он добавлен в список файлов скрипта
  - Попробуйте указать подпапку: вместо `"logo.png"` → `"Images/logo.png"`
  - Проверьте регистр, если используете полное имя

- Дубликаты имен
  - Если есть два файла с одинаковым окончанием пути (`a/logo.png` и `b/logo.png`), неоднозначный запрос вернёт `NotFound`. Уточняйте путь через подпапку или полное manifest name.

- Большие файлы
  - Читайте их как поток через `CreateReadStream()` — не держите всё целиком в памяти

- Я изменил файл, но не вижу обновлений
  - Embedded resources вшиваются в DLL. Обновите ресурс и перекомпилируйте скрипт, чтобы новые байты попали в сборку. `Watch` embedded-провайдера возвращает `NullChangeToken` и не следит за изменением старой сборки.

- DLL не загружается
  - Проверьте, что `#r "assemblyPath: ..."` указывает на правильный файл.

- Точки или слеши в путях?
  - Используйте полное manifest name либо путь со слешами. Не обещайте одинаковый поиск по суффиксу для любого частичного имени с точками.
Контракты — EyeAuras `20fd3d4`, PoeEye `0e02c98`; точные сигнатуры сверяйте с SDK/XML своей версии.
