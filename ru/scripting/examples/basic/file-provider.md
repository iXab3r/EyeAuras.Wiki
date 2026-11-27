---
title: Как читать встроенные файлы
description: Как открывать и читать встроенные файлы в EyeAuras.
published: true
date: 2025-03-09T13:21:37.597Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-09T13:21:37.597Z
---

# Прочитать README из ресурсов скрипта

Добавим к проекту текстовый файл и выведем его содержимое в журнал. Источник здесь — документ проекта скрипта, а не произвольный файл с диска. Такой способ подходит для справки, конфигурации, CSS и JavaScript, которые должны переноситься вместе с проектом.

Нужен редактируемый `C# Script` работающего EyeAuras. Можно [импортировать готовый пример](https://eu.eyeauras.net/share/S20250309131425bvdreSJs6IeI) либо собрать собственный:

1. Создайте ауру и действие `C# Script` в `On Enter`.
2. Покажите дерево файлов кнопкой `File Tree` — на старых снимках она называется `Show Files`. Через `New file` выберите `Markdown` и введите имя `README` без расширения: шаблон создаст `README.md`.
3. Замените его содержимое строкой ниже:

```markdown
any text
```

4. В `Script.csx` вставьте весь код:

```csharp
using PoeShared.Scaffolding;

{
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
}
```

5. Нажмите `Run`. В журнале появятся `Hello, World!`, диагностический список корня и `README:` с текстом `any text`. В списке могут находиться и другие файлы или каталоги.
6. Измените текст README в проекте, дождитесь перекомпиляции и повторите `Run`: журнал должен показать новое содержимое. Изменение постороннего одноимённого файла на диске этот ресурс не обновляет.

`GetService` и `Log` предоставляет верхнеуровневый хост; для `DumpToTable` явно подключено пространство имён `PoeShared.Scaffolding`. Обычному C#-классу передайте `IScriptFileProvider` явно.

## Документ проекта и ресурс сборки

Созданный через `Markdown` документ предоставляет служба файлов проекта: запрос `README.md` обращается к его пути. Файл, добавленный через `Add` → `Existing File(s)...`, хранится отдельно как встроенный двоичный ресурс. Для **такого ресурса** действуют следующие правила поиска:

| Запрос | Что он означает |
| --- | --- |
| `README.md` | Короткое имя сработает при однозначном совпадении ресурса. |
| `MyProject.docs.README.md` | Точное полное имя ресурса из манифеста сборки. |
| `MyProject/docs/README.md` | Полная форма того же имени со слешами. |
| Путь с подпапкой | Допускается поиск по границе суффикса; если совпадений несколько, результат — `Exists == false`. Уточните полное имя. |

`GetDirectoryContents` показывает проекцию имён ресурсов в дерево, поэтому не обещает убрать префикс проекта из каждого имени. Правила `wwwroot`, полные имена и экспорт описаны во [встроенных ресурсах](/ru/scripting/embedded-resources).

При запуске встроенные ресурсы ставятся перед прежним источником файлов: составной механизм выбирает первый существующий файл по порядку источников. Неоднозначность внутри одного источника от этого не исчезает.

Поток и `StreamReader` создаёт и закрывает скрипт через `using`. Общий `IScriptFileProvider`, полученный из контейнера, закрывать не нужно. Документ обновляйте в проекте, а двоичный ресурс — заменой его байтов или импортом из IDE. `Watch` источника встроенных ресурсов не отслеживает изменения уже собранной DLL.

Контекст и зависимости — в [маршрутах выполнения](/ru/scripting/api/core/app-runtime-contexts) и [ресурсах и ссылках](/ru/scripting/api/scripting/references-and-resources).
