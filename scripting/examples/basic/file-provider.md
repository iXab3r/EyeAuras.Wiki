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

Add a text document and print it in the log. Its source is the script project, rather than an arbitrary file on disk. This is useful for help, configuration, CSS and JavaScript that need to travel with a project.

You need an editable **C# Script** in a running EyeAuras host. You can [import the prepared example](https://eu.eyeauras.net/share/S20250309131425bvdreSJs6IeI), or create your own:

1. Create an aura and a **C# Script** action in **On Enter**.
2. Show **File Tree**, called **Show Files** in older versions. Under **New file**, choose **Markdown** and enter `README` without an extension; the template creates `README.md`.
3. Replace its contents with:

```markdown 
any text
```

4. Put the complete program below in **Script.csx**:

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

5. Click **Run**. The log should show `Hello, World!`, a diagnostic root listing, then `README:` and `any text`. Other project files and directories may appear in the listing too.
6. Change the README text in the project, wait for recompilation and run again. The new contents should be logged. Changing an unrelated same-named disk file does not update this document.

The host provides **GetService** and **Log**; **PoeShared.Scaffolding** supplies the **DumpToTable** extension used here. Pass IScriptFileProvider explicitly to an ordinary helper class.

## Distinguish a document from an embedded assembly resource

The **Markdown** template creates an editable project document exposed by the project file service at its path. A file added through **Add → Existing File(s)...** is stored separately as a binary embedded resource. For that embedded form, lookup follows these rules:

| Request | Meaning |
| --- | --- |
| `README.md` | A short request works when it identifies a resource uniquely. |
| `MyProject.docs.README.md` | Exact full manifest name. |
| `MyProject/docs/README.md` | Full slash form of that name. |
| Folder-qualified path | Boundary-suffix lookup can apply. Multiple matches return Exists == false; use the full name to disambiguate. |

**GetDirectoryContents** projects resource names into a tree; it does not promise to remove the project prefix. [Embedded resources](/en/scripting/embedded-resources) explains full names, `wwwroot` and export.

At runtime, embedded resources precede the previous file source. The composite chooses the first existing file in provider order; ambiguity inside one source remains not found.

The program owns and closes its stream and StreamReader inside the explicit block. Do not dispose the borrowed provider. Edit text documents in the project; replace binary resource bytes or import their change from the IDE. Embedded **Watch** does not monitor an already compiled DLL for new bytes.

See [script-host context](/en/scripting/api/scripting/runtime) and [file-provider operations](/en/scripting/api/scripting/file-provider-operations) for the corresponding contracts.
