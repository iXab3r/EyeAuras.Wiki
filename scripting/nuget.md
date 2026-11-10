---
title: NuGet/Assembly References
description: 
published: true
date: 2024-12-25T17:57:20.897Z
tags: ai-translated
editor: markdown
dateCreated: 2024-12-25T17:57:20.897Z
---
# Read JSON using a NuGet package

When a script needs a library, a [NuGet package](https://www.nuget.org/) supplies its types and dependencies. This example parses a JSON string with **Newtonsoft.Json** and logs a delay of **250 milliseconds**, without reading a file or making a network request from the example itself.

You need an editable **C# Script** and access to the configured package sources for the initial restore. Put **#r** directives in **Script.csx**, not in an ordinary `.cs` helper.

1. Open the script and click **Properties**.

![Script Properties button](https://s3.eyeauras.net/media/2026/04/EyeAuras_Vlj2LmgbOY.png =x600)

2. On **NuGet**, find `Newtonsoft.Json`, select **13.0.3**, and click **Add Package**. Use **Update Package** when replacing an installed version.

![NuGet tab](https://s3.eyeauras.net/media/2026/04/EyeAuras_9TwUfSgAH2.png =x600)

3. Use the program below. If Properties already added the directive, keep one reference to this version rather than adding a duplicate.

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"

using Newtonsoft.Json.Linq;

var settings = JObject.Parse("{\"delayMs\":250}");
var delayMs = settings.Value<int>("delayMs");
Log.Info($"Delay: {delayMs} ms");
```

4. Wait for restore and compilation, then click **Run**. **Event Log** should contain `Delay: 250 ms`. If `JObject` is unresolved, inspect dependency diagnostics rather than only the Installed Packages list.

[Version 13.0.3 exists on NuGet](https://www.nuget.org/packages/Newtonsoft.Json/13.0.3) and is pinned here for reproducibility. It is not a requirement to choose this version for every new project.

## Choose a reference form

| Form | What it supplies |
| --- | --- |
| Properties → NuGet | Package search, version selection, add/update/remove, using the same dependency mechanism as `#r "nuget: ..."`. |
| `#r "nuget: ID, version"` | An explicit package ID and version in a portable script. |
| Properties → References | An assembly already available in EyeAuras, or an external DLL by path. |
| `#r "assemblyPath: ..."` | A DLL on disk or in [embedded resources](/en/scripting/embedded-resources). |
| `#r "assemblyName: ..."` | Assembly metadata the host can resolve; it does not download a missing library. |

A namespace **using** selects names; it does not add an assembly reference. References, package restore, code loading and service registration are separate steps. Some SDKs need a [container extension](/en/scripting/script-container-extensions). Adding a reference does not automatically support arbitrary native assets or MSBuild targets. Normal runs use the host's configured package sources; exported projects carry their NuGet source settings.

<details>
<summary>Reference a local DLL or an available assembly</summary>

This fragment requires your own existing compatible DLL. Replace the path; the log message only shows that the script ran, not that every library type was exercised:

```csharp
#r "assemblyPath: D:\Work\EAExile\EAExileAgent.Shared.dll"

Log.Info("Assembly reference declared"); // Check diagnostics and the required types
```

The file does not appear automatically on another PC. To ship it with the script, add it as a resource and ensure its additional dependencies also resolve. A relative disk path is not universally based on the exported project's directory; see [embedded resources](/en/scripting/embedded-resources) for portable resource paths.

An assembly-name reference can use metadata already available through the host's resolver, such as assemblies loaded through Assembly.Load. Presence in the .NET Framework GAC alone is not sufficient:

```csharp
#r "assemblyName: Grpc.Net.Client"

Log.Info("Assembly reference declared"); // Not a network-call test
```

This requires **Grpc.Net.Client** to be resolvable and makes no network call. Default assembly lists vary by EyeAuras version; declare the dependencies you need instead of relying on a historical inventory.

</details>

## When editing in an IDE

The [exported project](/en/scripting/ide-integration) contains `.csproj` and NuGet configuration. Import supports explicit **PackageReference** IDs and versions on the main script project, converting them to script references. It does not run the entire MSBuild pipeline; dependency import for helper projects has separate limits. Check EyeAuras restore and diagnostics after import even if the IDE builds the solution.
