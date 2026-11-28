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

Добавим в проект скрипта текстовый файл и выведем его содержимое в журнал. Файл здесь — документ самого проекта, а не произвольный файл с диска. Так удобно хранить справку, конфигурацию, CSS и JavaScript: они переносятся вместе с проектом.

Нужен `C# Script` в работающем EyeAuras, который можно редактировать. Можно [импортировать готовый пример](https://eu.eyeauras.net/share/S20250309131425bvdreSJs6IeI) или собрать свой:

1. Создайте ауру и действие `C# Script` в `On Enter`.
2. Откройте дерево файлов кнопкой `File Tree`. Нажмите `New file`, выберите `Markdown` и введите имя `README` без расширения: шаблон создаст `README.md`.
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

5. Нажмите `Run`. В журнале появятся `Hello, World!`, список содержимого корня и `README:` с текстом `any text`.
6. Измените текст README в проекте, дождитесь перекомпиляции и снова нажмите `Run` — в журнале будет новый текст.

`GetService` и `Log` даёт верхнеуровневый хост. Для `DumpToTable` в коде явно подключено пространство имён `PoeShared.Scaffolding`. В обычный C#-класс `IScriptFileProvider` нужно передать явно.

## Документ проекта и ресурс сборки

Документ, созданный через `Markdown`, отдаёт служба файлов проекта: запрос `README.md` идёт по его пути. Файл, добавленный через `Add` → `Existing File(s)...`, хранится отдельно как встроенный двоичный ресурс. **Такой ресурс** ищется по этим правилам:

| Запрос | Что он означает |
| --- | --- |
| `README.md` | Короткое имя. Сработает, если ресурс с таким именем один. |
| `MyProject.docs.README.md` | Точное полное имя ресурса из манифеста сборки. |
| `MyProject/docs/README.md` | То же полное имя, записанное через слеши. |
| Путь с подпапкой | Можно искать по концу пути (по границе суффикса). Если совпадений несколько, результат — `Exists == false`. Уточните полное имя. |

`GetDirectoryContents` показывает имена ресурсов в виде дерева, префикс проекта в именах может остаться. Правила `wwwroot`, полные имена и экспорт описаны во [встроенных ресурсах](/ru/scripting/embedded-resources).

При запуске встроенные ресурсы ставятся перед прежним источником файлов. Файл берётся из первого по порядку источника, где он есть. Неоднозначность внутри одного источника от этого не исчезает.

Поток и `StreamReader` скрипт создаёт и закрывает сам через `using`. Общий `IScriptFileProvider` из контейнера закрывать не нужно. Документ меняйте в проекте, а двоичный ресурс — заменой его байтов или импортом из IDE. `Watch` у источника встроенных ресурсов не следит за изменениями уже собранной DLL.

Про контекст и зависимости — в [маршрутах выполнения](/ru/scripting/api/core/app-runtime-contexts) и [ресурсах и ссылках](/ru/scripting/api/scripting/references-and-resources).
