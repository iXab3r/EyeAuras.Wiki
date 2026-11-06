---
title: API reference and version identity
description: API reference and version identity
published: true
date: 2026-11-06T00:00:00.000Z
tags: scripting, api, reference, ai-translated
editor: markdown
dateCreated: 2026-11-06T00:00:00.000Z
---
# Find the exact API contract

Start with a [discovery map](/en/scripting/api/AGENTS), follow its operation guide,
then check the declaring type in the SDK that your script actually uses. The map
explains where to look; it is not an exhaustive list of overloads.

## Choose the matching reference

| Source | What it establishes | Version to retain |
| --- | --- | --- |
| [Generated API reference](https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IVariablesScriptingApi.html) | Public declarations and available XML comments for the assemblies used by that generation | The assembly/package version used to generate it |
| SDK assemblies and accompanying XML documentation in an exported script project | The contract available to that project's compiler, including inherited members and extension methods | EyeAuras build, assembly identity and resolved package versions |
| Source at a fixed commit | Implementation details such as ownership, cancellation and service registration | Commit SHA and submodule revisions |
| Optional NuGet SDK | The public surface of that specific package, which may differ from built-in APIs | Exact package version and supported host version |

The public reference is a separate publication from Wiki. A newer Wiki page or a
successful Git refresh does not establish that the reference was regenerated.
If a reference page does not identify the required version, check your installed
SDK before copying a signature. A missing generated page is not evidence that a
public member is absent from the installed assembly.

## Inspect the contract used by a script

Export the script as a project through the [IDE integration workflow](/en/scripting/ide-integration)
and open it in your IDE. Navigate to the declaring type, inspect its base types
and extension methods, and use the adjacent XML documentation for parameter and
return semantics. Keep the exported project's resolved dependencies; replacing
an optional package with its latest version changes the contract being checked.

For example, `IVariablesScriptingApi` inherits `IVariablesAccessor`; reading only
its directly declared `Get<T>` overloads misses inherited operations. Pair the
[Variables guide](/en/scripting/api/scripting/variable-lifecycle-operations) with
[the declaring interface at the source revision](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting/Api/IVariablesScriptingApi.cs)
and follow its inherited contract. A declaration alone does not prove a service
is registered in every host; use the [runtime context map](/en/scripting/api/core/app-runtime-contexts).

In a top-level EyeAuras C# Script, this logs the assembly identity of the contract
loaded by the running host:

```csharp
Log.Info(typeof(EyeAuras.Scripting.Api.IVariablesScriptingApi).Assembly.FullName);
```

Assembly identity helps detect a mismatch but does not uniquely identify a Git
commit or NuGet package. Retain the EyeAuras build and resolved package version
as well. Ordinary helper classes must receive their own logger.

## How the generated reference is built

The existing [DocFX configuration](https://github.com/iXab3r/EyeAuras.Docs/blob/21464a4aafc91ed41dee7f59261064616b6e1671/docfx.json)
reads selected SDK assemblies and generates reference pages. Its
[API filter](https://github.com/iXab3r/EyeAuras.Docs/blob/21464a4aafc91ed41dee7f59261064616b6e1671/api-filter.yml)
excludes several implementation areas. It is therefore a selected reference,
not proof of coverage of every optional SDK or all runtime services.

For a version-specific check, use the matching SDK assemblies and XML files.
Do not substitute a hand-maintained method dump for that contract: it loses
inherited members, overloads and version identity as the implementation changes.
