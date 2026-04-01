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

Когда скрипт запускается, выбранные вами файлы загружаются автоматически, и скрипт может их использовать.

### Через IScriptFileProvider

Этот способ позволяет прочитать содержимое файла как текст или как массив байтов. Что делать с этими байтами дальше — решаете вы.

```csharp
var fontData = GetService<IScriptFileProvider>().ReadAllBytes("Roboto-Regular.ttf"); 
```

### Через Blazor

Если вы строите UI через Blazor, файлы можно использовать напрямую. Например, если вы добавили в скрипт `Image 12.jpg`, то для отображения достаточно написать:

```html
<img src="Image 12.jpg" />
```

Точно так же можно показывать видео, загружать текст, стили и всё остальное.

### Как подключаемую DLL

По аналогии с пакетами NuGet, вы можете положить нужную DLL прямо в скрипт и при этом сохранить автодополнение, определение типов и прочие удобства.

Для этого нужно:

- добавить в скрипт нужную .NET-сборку, например `MyDll.dll`
- в `Script.csx` написать

```csharp
#r "assemblyPath: MyDll.dll"
```

Готово. При компиляции скрипта EyeAuras найдет подходящую DLL среди ресурсов проекта и использует её. А при запуске скрипта загрузит её из ресурсов. Никаких отдельных файлов рядом держать не нужно.

# Экспорт/импорт C# Solution

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

При импорте обратно EyeAuras просканирует `.csproj`, найдет все `EmbeddedResource`-элементы и покажет их в списке файлов скрипта. Имена и относительные пути сохраняются — это важно для корректного доступа из кода и Blazor.

![Пометка embedded resource в Rider](https://s3.eyeauras.net/media/2025/10/rider64_24V6ZnFu8u.png)

# Как это устроено внутри

При сборке скриптов EyeAuras старается максимально следовать логике официального компилятора: добавленные вами файлы включаются в итоговую DLL как Embedded Resources и доступны через `Assembly.GetManifestResourceNames` и `Assembly.GetManifestResourceStream`.

Кратко о .NET-методах:

- `Assembly.GetManifestResourceNames()` — возвращает полный список имен ресурсов, например `"DefaultNamespace.folder.file.ext"`
- `Assembly.GetManifestResourceStream(fullName)` — открывает поток для чтения ресурса по его ПОЛНОМУ имени

Пример «в лоб» (обычно это не нужно — удобнее использовать `IScriptFileProvider`):

```csharp
var asm = typeof(Script).Assembly; // your script’s assembly
foreach (var name in asm.GetManifestResourceNames())
{
    Log.Info($"Resource: {name}");
}

using var stream = asm.GetManifestResourceStream("MyScript.Images.logo.png");
using var ms = new MemoryStream();
stream.CopyTo(ms);
var bytes = ms.ToArray();
```

В EyeAuras удобнее использовать `IScriptFileProvider`, потому что он сам сопоставляет пути и находит нужный ресурс.

### Именование

У C# Embedded Resources есть одна особенность: когда ресурсы попадают в DLL, их относительный путь «сворачивается» и превращается в `namespace.folder.filename`.

Как формируется полное имя ресурса во время сборки:

- берется `DefaultNamespace` проекта (если он не задан — имя проекта)
- слеши в относительном пути файла заменяются на точки
- результат: `FullName = DefaultNamespace + "." + relative/path/with/dots`  
  Пример: проект с namespace `MyScript` и файл `Images/logo.png` → ресурс: `MyScript.Images.logo.png`

Как искать ресурс в EyeAuras:

- можно указать короткий путь: `"logo.png"` — провайдер заменит слеши на точки и будет искать по суффиксу без учета регистра
- можно указать подпапку: `"Images/logo.png"` или `"Images.logo.png"` — это надежнее
- можно указать ПОЛНОЕ имя: `"MyScript.Images.logo.png"` — точное совпадение с учетом регистра
- разделители `'/'`, `'\\'` и `'.'` в запросе взаимозаменяемы

Важно про совпадения и регистр:

- полное имя сравнивается строго и с учетом регистра
- короткие и частичные пути ищутся через `EndsWith`, без учета регистра
- если в проекте есть два файла с одинаковым окончанием пути (например, `a/logo.png` и `b/logo.png`), короткий запрос `"logo.png"` вернет первое совпадение. Чтобы избежать путаницы, указывайте подпапку или полное имя.

Примеры запросов, которые сработают для `Images/logo.png`:

- `"logo.png"`
- `"Images/logo.png"`
- `"Images.logo.png"`
- `"MyScript.Images.logo.png"`

EyeAuras старается упростить жизнь пользователю и поддерживает как полные имена (с точками), так и относительные (без namespace). Можно также использовать привычные пути вроде `folder/Image 12.jpg` вместо `folder.Image 12.jpg`.

## Практические примеры (ELI5)

- Прочитать JSON-конфиг как текст:

```csharp
var files = GetService<IScriptFileProvider>();
var json = files.ReadAllText("config.json");
var cfg = JsonConvert.DeserializeObject<MyConfig>(json);
```

- Загрузить ONNX/ML-модель как байты:

```csharp
var files = GetService<IScriptFileProvider>();
var model = files.ReadAllBytes("models/my_model.onnx");
// pass the bytes into your ML library
```

- Открыть поток (для больших файлов):

```csharp
var files = GetService<IScriptFileProvider>();
var file = files.GetFileInfo("video/tutorial.mp4");
using var stream = file.CreateReadStream();
// read in chunks without holding everything in memory
```

- Показать изображение в Blazor:

```html
<img src="Images/logo.png" />
```

## Загрузка DLL из ресурсов — как это работает

- На этапе компиляции
  - В `Script.csx` добавьте директиву:
    ```csharp
    #r "assemblyPath: MyLib.dll"
    ```
  - EyeAuras найдет файл `MyLib.dll` в ресурсах и добавит его как ссылку. Это даст автодополнение, определение типов и успешную компиляцию.

- Во время выполнения
  - EyeAuras подписывается на `AssemblyLoadContext.Resolving` и пытается загрузить сборку из embedded resources.

Полезный пример:

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

- Если вам нужен именно список manifest names, а сервисом является `ScriptEmbeddedResourceFileProvider`:

```csharp
var files = GetService<IScriptFileProvider>() as ScriptEmbeddedResourceFileProvider;
var names = files?.GetManifestNames() ?? Array.Empty<string>();
Log.Info(string.Join("\n", names));
```

## FAQ и нюансы

- Файл не находится
  - Убедитесь, что он добавлен в список файлов скрипта
  - Попробуйте указать подпапку: вместо `"logo.png"` → `"Images/logo.png"`
  - Проверьте регистр, если используете полное имя

- Дубликаты имен
  - Если есть два файла с одинаковым окончанием пути (`a/logo.png` и `b/logo.png`), короткий запрос `"logo.png"` может указать не на тот файл. Уточняйте путь через подпапку.

- Большие файлы
  - Читайте их как поток через `CreateReadStream()` — не держите всё целиком в памяти

- Я изменил файл, но не вижу обновлений
  - Embedded resources вшиваются в DLL. Перезапустите или пересоберите скрипт, чтобы новые байты попали в сборку.

- DLL не загружается
  - Проверьте, что `#r "assemblyPath: ..."` указывает на правильный файл.

- Точки или слеши в путях?
  - Работают оба варианта: `"Images/logo.png"`, `"Images.logo.png"` — провайдер нормализует путь в точки и ищет по суффиксу.