---
title: How to Read Embedded Files
description: 
published: true
date: 2025-03-09T13:21:37.597Z
tags: 
editor: markdown
dateCreated: 2025-03-09T13:21:37.597Z
---

## Embedding Files
> You can import a ready-made example from here: [https://eu.eyeauras.net/share/S20250309131425bvdreSJs6IeI](https://eu.eyeauras.net/share/S20250309131425bvdreSJs6IeI)

### How is it useful?
- custom configuration files
- some documentation for your program
- JavaScript files which will be loaded in your UI
- custom CSS files

### Example

1. Create an aura.
2. Add a `C# Script` action to `On Enter`.
3. Copy and paste the script itself.
4. Create a new Markdown file, name it README
4. Run the script. 
5. The script will print list of embedded files (in this case, only README.md) and README content

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

