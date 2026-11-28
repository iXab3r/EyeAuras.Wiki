---
title: How to Read Embedded Files
description: 
published: true
date: 2025-03-09T13:21:37.597Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-09T13:21:37.597Z
---
# Read a README from your script project

Let's add a text file to the script project and print its contents in the log. The file is a document of the project itself, not some file on disk. This is handy for help, configuration, CSS and JavaScript: they travel with the project.

You need a **C# Script** you can edit in a running EyeAuras. You can [import the prepared example](https://eu.eyeauras.net/share/S20250309131425bvdreSJs6IeI) or build your own:

1. Create an aura and a **C# Script** action in **On Enter**.
2. Open the file tree with **File Tree**. Click **New file**, choose **Markdown** and enter the name `README` without an extension. The template creates `README.md`.
3. Replace its contents with:

```markdown 
any text
```

4. Paste the whole program into **Script.csx**:

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
        Log.Warn("README.md did not resolve uniquely; check the full resource name");
        return;
    }
    using var stream = readme.CreateReadStream();
    using var reader = new System.IO.StreamReader(stream);
    Log.Info($"README:\n{reader.ReadToEnd()}");
}
```

5. Click **Run**. The log shows `Hello, World!`, a listing of the root, then `README:` and `any text`.
6. Change the README text in the project, wait for recompilation and click **Run** again. The log shows the new text.

The top-level host gives you **GetService** and **Log**. The code imports **PoeShared.Scaffolding** for **DumpToTable**. An ordinary C# class needs IScriptFileProvider passed in explicitly.

## Distinguish a document from an embedded assembly resource

A document created through **Markdown** is served by the project file service: a `README.md` request goes by its path. A file added through **Add → Existing File(s)...** is stored separately as a binary embedded resource. **That resource** is looked up by these rules:

| Request | Meaning |
| --- | --- |
| `README.md` | Short name. Works if only one resource has that name. |
| `MyProject.docs.README.md` | Exact full resource name from the assembly manifest. |
| `MyProject/docs/README.md` | The same full name written with slashes. |
| Folder-qualified path | Can be matched by the end of the path (on a suffix boundary). Several matches give Exists == false. Use the full name. |

**GetDirectoryContents** shows resource names as a tree. The project prefix can stay in the names. [Embedded resources](/en/scripting/embedded-resources) covers full names, `wwwroot` and export.

At runtime, embedded resources go before the previous file source. A file is taken from the first source in order that has it. Ambiguity inside one source does not go away.

The script creates and closes the stream and StreamReader itself. Do not dispose the shared provider from the container. Change a document in the project. Change a binary resource by replacing its bytes or importing it from the IDE. **Watch** on the embedded source does not track changes in an already compiled DLL.

More on context and dependencies: [script-host context](/en/scripting/api/scripting/runtime) and [file-provider operations](/en/scripting/api/scripting/file-provider-operations).
