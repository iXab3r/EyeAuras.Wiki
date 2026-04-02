---
title: Как читать встроенные файлы
description: Как открывать и читать встроенные файлы в EyeAuras.
published: true
date: 2025-03-09T13:21:37.597Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-09T13:21:37.597Z
---
## Встраивание файлов

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
6. Скрипт выведет список встроенных файлов (в этом случае только `README.md`) и содержимое `README`.

`Script.csx`
```csharp 
Log.Info("Hello, World!");

//built-in FileProvider which allows to access script environment files
var fileProvider = GetService<EyeAuras.Repl.IScriptFileProvider>(); 

var files = fileProvider.GetDirectoryContents("/");
Log.Info($"Script files:\n\t{files.DumpToTable()}");

var readmeContent = fileProvider.ReadAllText("README.md"); //or fileProvider.GetFileInfo() to get access to raw data
Log.Info($"README:\n{readmeContent}");
```

`README.md`
```markdown 
any text
```