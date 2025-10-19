---
title: Встроенные Ресурсы (Embedded Resources)
description: 
published: true
date: 2025-10-19T13:42:12.071Z
tags: 
editor: markdown
dateCreated: 2025-10-19T13:42:12.071Z
---

# Что это и зачем нужно
Встроенные ресурсы(aka `Embedded Resources`) механизм в скриптах, который позволяет "таскать" прямо рядом со скриптом абсолютно любые файлы - картинки, видео, ML модели, исполняемые файлы и даже DLL. 
Картинки можно использовать для вашего пользовательского интерфейса, видео может содержать обучающие материалы, а DLL - дополнительный код, который по какой-то причине неудобно или не хочется распространять как [Nuget](/scripting/nuget) пакет.

## NuGet 
Обратите внимание, что для подключения библиотек, которые присутствуют в [NuGet](https://nuget.org/) гораздо-гораздо надежнее использовать [#r "nuget: "](/scripting/nuget) и подключать пакеты, а не DLL напрямую

## Как добавить
Правый клик на дерево файлов скрипта (кнопка Show Files его показывает-скрывает) -> Add Existing File...
![Add Existing File...](https://s3.eyeauras.net/media/2025/10/EyeAuras_hFvtxUlceb.png)
Или через кнопку New 

После того как вы добавите файл, он отобразится в списке и его можно будет выделить
![Select file](https://s3.eyeauras.net/media/2025/10/EyeAuras_1Yr73UevIj.png)

## Как удалить
Чтобы удалить ресурс достаточно удалить файл из списка

## Как использовать
Теперь при запуске скрипта, выбранные вами файлы будут подгружены автоматически и скрипт сможет их использовать

### Через IScriptFileProvider
Этот метод позволяет вычитать содержимое файла в виде текста или набора байт.
Как вы будете дальше этими данными распоряжаться - ваш выбор.
```csharp
var fontData = GetService<IScriptFileProvider>().ReadAllBytes("Roboto-Regular.ttf"); 
```

### Через Blazor
При создании UI через Blazor, вы тоже можете использовать файлы напрямую, к примеру, 
если вы приложили в скрипт файл `Image 12.jpg`, то чтобы показать эту картинку, достаточно написать
```html
<img src="Image 12.jpg" />
```
Ровно по той же логике можно показывать видео, подгружать текст, стили и все остальное. 

### Как подключаемую DLL
По аналогии с nuget-пакетами, вы можете включить нужную вам DLL прямо в скрипт, при этом будет работать
подсветка синтаксиса, вы увидите типы, которые есть в этой сборке и т.п. 
Достаточно лишь:
- добавить нужную вам .NET сборку в скрипт, к примеру, "MyDll.dll"
- в `Script.csx` написать 
```csharp
#r "assemblyPath: MyDll.dll"
```
И все. Теперь при компиляции скрипта, EyeAuras поищет в ресурсах проекта подходящую DLL и использует ее.
А когда скрипт будет запущен - подгрузит ее из ресурсов. Никаких валяющихся рядом файлов. 

# Export/Import C# Solution
В EyeAuras есть функционал, который позволяет вам выгружать скрипт в виде полноценного C# `.sln` файла 
и дальше открывать его в JetBrains Rider и Visual Studio.

Встроенные ресурсы(файлы) тоже экспортируются и помечаются как `Embedded Resource`
К примеру, в случае с `Image 12.jpg`, во-первых сам файл будет экспортирован в целевую папку, а во-вторых в файле экспортированного проекта будет создана запись
```xml
 <ItemGroup>
    <EmbeddedResource Include="Image 12.jpg" />
    <None Remove="Image 12.jpg" />
</ItemGroup>
```
Этот набор параметров говорит компилятору C#, что `Image 12.jpg` нужно включить как ресурс прямо внутрь финальной DLL.

При импорте `.sln` обратно, EyeAuras вычитает `Embedded Resource` и вы увидите их как файлы в списке.

В Visual Studio/Rider это пометка Build Action = EmbeddedResource. Если вы открыли экспортированный проект, можно:
- Добавлять/удалять файлы прямо в папке проекта
- В .csproj указывать <EmbeddedResource Include="..."/> для каждого ресурса
- Опционально добавить <None Remove="..."/>, чтобы файл не попадал в выходную папку как обычный контент

При импорте обратно EyeAuras просканирует .csproj, найдёт все элементы EmbeddedResource и покажет их в списке файлов скрипта. Имена и относительные пути сохраняются — это важно для правильного доступа к ресурсу из кода/Blazor.
![Marking as embedded resource in Rider](https://s3.eyeauras.net/media/2025/10/rider64_24V6ZnFu8u.png)

# Под капотом
EyeAuras при сборке скриптов старается максимально следовать логике, которая используется официальным компилятором - 
добавленные вами файлы будут включены как Embedded Resource в финальную DLL, видны и доступны для использования через Assembly.GetManifestResourceNames и Assembly.GetManifestResourceStream.

Коротко о методах .NET:
- Assembly.GetManifestResourceNames() — возвращает полный список имён ресурсов вида "DefaultNamespace.folder.file.ext".
- Assembly.GetManifestResourceStream(fullName) — открывает поток для чтения ресурса по ПОЛНОМУ имени.

Пример “в лоб” (обычно он не нужен — используйте IScriptFileProvider):
```csharp
var asm = typeof(Script).Assembly; // сборка вашего скрипта
foreach (var name in asm.GetManifestResourceNames())
{
    Log.Info($"Resource: {name}");
}

using var stream = asm.GetManifestResourceStream("MyScript.Images.logo.png");
using var ms = new MemoryStream();
stream.CopyTo(ms);
var bytes = ms.ToArray();
```
В EyeAuras на практике удобнее обращаться через IScriptFileProvider, который сам преобразует пути и ищет нужный ресурс.

### Именование
Одна из особенностей C# Embedded Resources это то, что включении ресурсов внутрь DLL, относительный путь "схлопывается"
и превращается в namespace.folder.filename
Как формируется полное имя ресурса при сборке:
- Берётся DefaultNamespace проекта (если не задан — имя проекта)
- К относительному пути файла добавляются точки вместо слэшей
- Итог: FullName = DefaultNamespace + "." + relative/path/with/dots
  Пример: проект с namespace MyScript и файл Images/logo.png → ресурс: MyScript.Images.logo.png

Как искать ресурс в EyeAuras:
- Можно указать короткий путь: "logo.png" — провайдер преобразует слэши в точки и ищет окончание имени (без учёта регистра)
- Можно указать подпапку: "Images/logo.png" или "Images.logo.png" — так надёжнее
- Можно указать ПОЛНОЕ имя: "MyScript.Images.logo.png" — точное совпадение (с учётом регистра)
- Разделители '/', '\\' или '.' взаимозаменяемы в запросе

Важно про совпадения и регистр:
- Полное имя совпадает строго и чувствительно к регистру
- Короткие/частичные пути ищутся как "EndsWith" без учёта регистра
- Если в проекте есть два файла с одинаковым хвостом (например, a/logo.png и b/logo.png), короткий запрос "logo.png" вернёт первый найденный. Чтобы избежать путаницы — указывайте подпапку или полное имя.

Примеры запросов, которые сработают для Images/logo.png:
- "logo.png"
- "Images/logo.png"
- "Images.logo.png"
- "MyScript.Images.logo.png"

EyeAuras старается слегка упростить жизнь пользователям, поэтому поддерживает как обращение по 
полному пути (с точками), так и по относительному (без namespace), плюс можно использовать 
привычные пути, такие как `folder/Image 12.jpg`, а не `folder.Image 12.jpg`


## Практические примеры (ELI5)

- Прочитать JSON конфиг как текст:
```csharp
var files = GetService<IScriptFileProvider>();
var json = files.ReadAllText("config.json");
var cfg = JsonConvert.DeserializeObject<MyConfig>(json);
```

- Загрузить ONNX/ML модель как байты:
```csharp
var files = GetService<IScriptFileProvider>();
var model = files.ReadAllBytes("models/my_model.onnx");
// передайте байты в вашу ML-библиотеку
```

- Открыть поток (для больших файлов):
```csharp
var files = GetService<IScriptFileProvider>();
var file = files.GetFileInfo("video/tutorial.mp4");
using var stream = file.CreateReadStream();
// читаете по частям, не держа всё в памяти
```

- Показать изображение в Blazor:
```html
<img src="Images/logo.png" />
```

## Загрузка DLL из ресурсов — как это работает

- На этапе компиляции
  - В Script.csx пишете директиву:
    ```csharp
    #r "assemblyPath: MyLib.dll"
    ```
  - EyeAuras найдёт в ресурсах файл MyLib.dll и добавит его как ссылку. Это нужно для подсветки кода, подсказок и успешной компиляции.

- На этапе выполнения
  - EyeAuras подписывается на AssemblyLoadContext.Resolving и пытается загрузить сборку из embedded-ресурсов.

Полезный пример:
```csharp
#r "assemblyPath: Newtonsoft.Json.dll"
using Newtonsoft.Json;
Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

## Как посмотреть все доступные имена

- Через .NET API (полные имена):
```csharp
var asm = typeof(Script).Assembly;
foreach (var name in asm.GetManifestResourceNames())
{
    Log.Info($"Resource: {name}");
}
```

- Через провайдер файлов (IFileProvider):
```csharp
var files = GetService<IScriptFileProvider>();
foreach (var fi in files.GetDirectoryContents("/"))
{
    Log.Info($"Found: {fi.Name} ({fi.Length} b)");
}
```

- Если нужно именно список manifest-имён, а сервис — ScriptEmbeddedResourceFileProvider:
```csharp
var files = GetService<IScriptFileProvider>() as ScriptEmbeddedResourceFileProvider;
var names = files?.GetManifestNames() ?? Array.Empty<string>();
Log.Info(string.Join("\n", names));
```

## FAQ и нюансы

- Файл не находится
  - Убедитесь, что он добавлен в список файлов скрипта
  - Попробуйте указать подпапку: вместо "logo.png" → "Images/logo.png"
  - Проверьте регистр, если используете полное имя

- Дубликаты имён
  - Если есть два файла с одинаковым хвостом (a/logo.png и b/logo.png), короткий запрос "logo.png" может попасть не туда. Уточняйте путь.

- Большие файлы
  - Читайте потоком через CreateReadStream() — не держите всё в памяти

- Изменил файл, но изменения не видны
  - Embedded-ресурсы попадают внутрь DLL. Перезапустите/пересоберите скрипт, чтобы новые байты попали в сборку.

- DLL не грузится
  - Проверьте, что директива `#r "assemblyPath: ..."` указывает на правильный файл.

- Пути с точками или слэшами?
  - Можно и так, и так: "Images/logo.png", "Images.logo.png" — провайдер всё равно сведёт к точкам и найдёт по окончанию имени.

