---
title: ISendInputUnstableScriptingApi
description: 
published: true
date: 2026-04-21T00:00:00.000Z
tags: user input, mouse actions, keyboard actions, scripting api, simulation, ai-translated
editor: markdown
dateCreated: 2024-02-28T13:04:42.575Z
---
# ISendInputUnstableScriptingApi

This is the old input API name. In source revision `20fd3d4`, the interface is
hidden from ordinary browsing and only inherits the main interface:

```csharp
namespace EyeAuras.Roxy.Api;

[System.ComponentModel.Browsable(false)]
public interface ISendInputUnstableScriptingApi : ISendInputScriptingApi
{
}
```

For a new C# Script, resolve the main interface. Open the intended application
and leave it active before running:

```csharp
using EyeAuras.Roxy.Api;
using System.Windows.Input;

var input = GetService<ISendInputScriptingApi>();
input.TargetWindow = null;
input.KeyPress(Key.F1);
```

Standard Windows Input sends F1 to the active application. A non-null `TargetWindow`
requests activation; it does not promise background delivery. See
[ISendInputScriptingApi](/en/scripting/api/ISendInputScriptingApi) for target selection,
controllers, delays and mouse operations. This requires an EyeAuras host; pass
`input` explicitly to ordinary classes.

[Source declaration](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Roxy.Shared/Api/ISendInputUnstableScriptingApi.cs).
The inheritance relationship does not establish binary compatibility of arbitrary
old packages with a current host.
