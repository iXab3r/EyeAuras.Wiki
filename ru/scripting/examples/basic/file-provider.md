---
title: Как читать встроенные файлы
description: Как открывать и читать встроенные файлы в EyeAuras.
published: true
date: 2025-03-09T13:21:37.597Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-09T13:21:37.597Z
---
# Прочитать встроенный README

В проекте `C# Script` EyeAuras добавьте через `Show Files` текстовый ресурс `README.md` с содержимым ниже и вставьте код в `Script.csx`. Файл должен входить в ресурсы этого проекта. `GetService<IScriptFileProvider>()` предоставляет контейнер скрипта, обычному helper передайте провайдер явно.

> Готовый пример можно импортировать отсюда: [https://eu.eyeauras.net/share/S20250309131425bvdreSJs6IeI](https://eu.eyeauras.net/share/S20250309131425bvdreSJs6IeI)

### Для чего это может пригодиться

- пользовательские конфигурационные файлы
- документация для вашей программы
- JavaScript-файлы, которые будут загружаться в вашем UI
- пользовательские CSS-файлы

### Пример

1. Создайте ауру.
2. Добавьте действие `C# Script` в `On Enter`.
3. Скопируйте и вставьте сам скрипт.
4. Создайте новый Markdown-файл и назовите его `README`.
5. Запустите скрипт.
6. Скрипт выведет доступное содержимое корня и текст `README.md`. В списке могут быть и другие файлы/каталоги.

`Script.csx`
```csharp 
Log.Info("Hello, World!");

//built-in FileProvider which allows to access script environment files
var fileProvider = GetService<EyeAuras.Repl.IScriptFileProvider>(); 

var files = fileProvider.GetDirectoryContents("/");
Log.Info($"Script files:\n\t{files.DumpToTable()}");

var readme = fileProvider.GetFileInfo("README.md");
if (!readme.Exists)
{
    Log.Warn("README.md не найден однозначно; проверьте полное имя ресурса");
    return;
}
using var stream = readme.CreateReadStream();
using var reader = new System.IO.StreamReader(stream);
Log.Info($"README:\n{reader.ReadToEnd()}");
```

`README.md`
```markdown 
any text
```

У встроенного провайдера идентичность — полное manifest-имя ресурса. Допустимы точное имя, его полная форма с `/` и однозначный суффикс на границе имени. Например, ресурс `MyProject.docs.README.md` можно запросить полным именем `MyProject.docs.README.md` или `MyProject/docs/README.md`; голый `README.md` сработает только при однозначном совпадении. При неоднозначности возвращается not-found, а не случайный первый ресурс. Имена каталогов в диагностическом списке не обещают удаление префикса проекта.

При выполнении скрипта embedded-провайдер ставится перед прежним провайдером; composite выбирает первый существующий файл по порядку провайдеров. Это отдельное правило приоритета, не разрешение неоднозначности внутри embedded-провайдера. Поток и reader закрывает скрипт; общий провайдер из контейнера не освобождайте.

## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Ресурсы и ссылки](/ru/scripting/api/scripting/references-and-resources) · [Встроенные ресурсы](/ru/scripting/embedded-resources)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
