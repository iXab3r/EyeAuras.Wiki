---
title: Чтение и приоритет ресурсов скрипта
description: IScriptFileProvider и CompositeScriptFileProvider для чтения перечисления и объединения источников ресурсов
published: true
date: 2026-11-03T00:00:00.000Z
tags: scripting, api, resources, file-provider
editor: markdown
dateCreated: 2026-11-03T00:00:00.000Z
---
# Чтение и приоритет ресурсов скрипта

`EyeAuras.Repl.IScriptFileProvider` предоставляет файлы скрипта через `Microsoft.Extensions.FileProviders.IFileProvider`. Через него можно получить файл, перечислить каталог и запросить уведомление об изменениях. Путь относится к источнику ресурсов; он не обязан существовать как обычный путь на диске.

## Прочитать подготовленный текстовый ресурс

Добавьте `docs/help.txt` в ресурсы проекта скрипта, как описано в [подключении ресурсов](references-and-resources). Следующий верхнеуровневый C# Action предполагает, что выбранный провайдер уже разрешает этот путь:

```csharp
using System.IO;
using EyeAuras.Repl;

{
    var files = GetService<IScriptFileProvider>();
    var file = files.GetFileInfo("docs/help.txt");
    if (file.Exists && !file.IsDirectory)
    {
        using var stream = file.CreateReadStream();
        using var reader = new StreamReader(stream);
        Log.Info(reader.ReadToEnd());
    }
    else
    {
        Log.Info("Ресурс docs/help.txt не найден");
    }
}
```

При наличии ресурса в журнал попадёт его текст. Поток и reader созданы этим выполнением и освобождаются в показанном блоке. Полученный из host сервис `files` заимствован. `PhysicalPath` у ресурса может отсутствовать; для чтения используйте `CreateReadStream()`.

Если имя не разрешается, проверьте manifest name и способ подключения ресурса, а не только имя проекта. Точное имя и допустимое сокращение зависят от провайдера; [встроенные ресурсы](references-and-resources) разбирают этот случай.

## Задать приоритет двух источников

В обычном C# helper два уже подготовленных `IScriptFileProvider` передаются явно. Первый содержит пользовательские переопределения, второй — встроенные значения:

```csharp
using System.IO;
using EyeAuras.Repl;

public static class HelpResources
{
    public static string Read(IScriptFileProvider overrides, IScriptFileProvider defaults)
    {
        var files = new CompositeScriptFileProvider(overrides, defaults);
        var file = files.GetFileInfo("docs/help.txt");
        if (!file.Exists || file.IsDirectory)
        {
            throw new FileNotFoundException("Ресурс не найден", "docs/help.txt");
        }

        using var stream = file.CreateReadStream();
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}
```

Вызов `HelpResources.Read(overrides, defaults)` возвращает содержимое первого существующего файла. Если оба провайдера содержат один путь, побеждает `overrides`; если первый не нашёл файл, поиск продолжается в `defaults`.

Метод не создаёт исходные провайдеры и не принимает владение ими. `CompositeScriptFileProvider` сам не реализует `IDisposable`; он не освобождает переданные источники. Созданные потоки принадлежат методу.

Порядок источников нужен не только для fallback: он является частью контракта вашего набора ресурсов. Сохраняйте его при построении композиции. Внутри одного `ScriptEmbeddedResourceFileProvider` неоднозначные сокращённые имена — отдельная ситуация; порядок composite не выбирает один из двух неоднозначных ресурсов этого источника.

## Перечислить каталог

В C# Action с подключёнными ресурсами:

```csharp
using EyeAuras.Repl;

var files = GetService<IScriptFileProvider>();
var directory = files.GetDirectoryContents("docs");
if (directory.Exists)
{
    foreach (var entry in directory)
    {
        Log.Info($"{entry.Name}, каталог: {entry.IsDirectory}");
    }
}
```

`GetDirectoryContents` возвращает записи каталога, а не рекурсивный список всех файлов. У composite содержимое объединяется; для одинаковых `Name` остаётся первая запись в порядке провайдеров.

Для рекурсивного поиска используйте расширения `PoeShared.Scaffolding.FileProviderExtensions.GetFiles` и `GetDirectories`. Перегрузки принимают `subpath`, шаблон имени и `SearchOption` либо `EnumerationOptions`. Результат — массив `IFileInfo[]`. Эти расширения могут пропускать недоступные записи; пустой массив не доказывает, что источник не содержит файлов.

## Запросить уведомление об изменении

`Watch(string pattern)` возвращает `IChangeToken`. Наличие токена не означает, что конкретный источник способен сообщать об изменениях: например, `ScriptEmbeddedResourceFileProvider` возвращает `NullChangeToken`.

У composite собираются токены всех переданных провайдеров. Срабатывание одного может уведомить об изменении всей композиции. Область жизни регистрации callback принадлежит потребителю; само получение `IChangeToken` не создаёт бесконечную подписку и не перечитывает файл.

## Контракт и удобные расширения

| API | Назначение |
|---|---|
| `IScriptFileProvider : IFileProvider` | Наследует `GetFileInfo`, `GetDirectoryContents`, `Watch` |
| `CompositeScriptFileProvider(params IScriptFileProvider[]? fileProviders)` | Создать композицию из упорядоченных источников |
| Конструктор с `IEnumerable<IScriptFileProvider>?` | Зафиксировать переданную последовательность источников |
| `FileProviders` | Получить настроенную последовательность |
| `GetFileInfo(string subpath)` | Первый результат с `Exists == true`, иначе `NotFoundFileInfo`; перед чтением отдельно исключите каталог |
| `GetDirectoryContents(string subpath)` | Объединение записей каталога с приоритетом первого имени |
| `Watch(string pattern)` | Составной change token либо token без уведомлений |
| `GetFileInfoOrThrow(path)` | Расширение возвращает существующий файл либо бросает `FileNotFoundException` |
| `ReadAllText(path)`, `ReadAllBytes(path)` | Расширения читают содержимое и освобождают созданные потоки |
| `GetSubpath()` у `IFileInfo` | Нормализованный относительный путь источника либо представление имени |

Для расширений подключите `using PoeShared.Scaffolding;`. Сведения о конкретной файловой системе и наблюдении зависят от реализации `IFileProvider`; не переносите поведение физического провайдера на embedded-ресурсы.

## Версия и связанные операции

Контракты сверены с EyeAuras `20fd3d424d886f6c99b979536a148774d289d110`: [IScriptFileProvider](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Repl/IScriptFileProvider.cs), [CompositeScriptFileProvider](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Repl/CompositeScriptFileProvider.cs). Расширения относятся к PoeEye `0e02c98dcab4bff263684f1c0647eed120e2700f`.

- [Подключение assembly и ресурсов](references-and-resources)
- [Работа с проектом](project-workflow)
- [Ресурсы Blazor](../core/blazor)
