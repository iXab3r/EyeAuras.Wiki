---
title: How to Read Embedded Files
description: 
published: true
date: 2025-03-09T13:21:37.597Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-09T13:21:37.597Z
---

# Read an embedded README

In an EyeAuras `C# Script` project, use `Show Files` to add a text resource named `README.md`, then put the code below in `Script.csx`. The file must be included in this project’s resources. `GetService<IScriptFileProvider>()` comes from the script container; pass the provider explicitly to an ordinary helper class.
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
5. Run the script.
6. The script logs the root entries and the contents of `README.md`. Other files and directories may also appear in the listing.

`Script.csx`
```csharp 
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

`README.md`
```markdown 
any text
```

The embedded provider identifies a resource by its full manifest name. Use that name, its full slash-separated form, or a unique suffix at a name boundary. For example, `MyProject.docs.README.md` can be requested as `MyProject.docs.README.md` or `MyProject/docs/README.md`; `README.md` works only if it matches uniquely. Ambiguous names return not-found. Directory listings do not promise to strip the project prefix.

The script's embedded provider precedes the previous provider in the composite. The composite selects the first existing file in provider order; this does not resolve ambiguity inside one embedded provider. The script disposes its stream and reader. Do not dispose the borrowed provider.

## Related contracts

[Script context](/en/scripting/api/core/app-runtime-contexts) · [Resources and references](/en/scripting/api/scripting/references-and-resources) · [Resource loading and priority](/en/scripting/api/scripting/file-provider-operations)

See the linked resource contract for the checked source versions and full provider behavior. This example has not been executed in the script host.
