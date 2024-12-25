---
title: NuGet/Assembly References
description: 
published: true
date: 2024-12-25T17:57:20.897Z
tags: 
editor: markdown
dateCreated: 2024-12-25T17:57:20.897Z
---

Scripting engine fully supports referencing external assemblies, be it loading from file or from [NuGet](https://www.nuget.org/). 
Important! Referencing assemblies is available only inside `Script.csx` which is equivalent of your `Program.cs` in "normal" C#.


### By package name - from NuGet
Allows you to reference any [NuGet](https://www.nuget.org/) packages which are out there in the wild. EA will download the package and will try to reference/load all parts of it just like compilers do it in normal programming workflows.
```csharp
#r "nuget: Coroutine, 2.1.5"

Log.Info("Hello, World!"); //you can use Coroutine classes in that script
```


### By assembly path - from file
This way of referencing assemblies allows you to read the data from local files. This could be useful if the assembly is not available on NuGet for some reason. 
```csharp
#r "assemblyPath: D:\Work\EAExile\EAExileAgent.Shared.dll"

Log.Info("Hello, World!"); //you can use EAExileAgent classes in that script
```

### By assembly name - from memory
This method of referencing assemblies allows you to reference those assemblies which are either:
- already loaded by EyeAuras, but have not been included into default referenced assemblies list
- were loaded using `Assembly.Load` or via any other means, but they are already part of [AssemblyLoadContext](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.loader.assemblyloadcontext?view=net-9.0)/[AppDomain](https://learn.microsoft.com/en-us/dotnet/api/system.appdomain?view=net-9.0)
- are in [GAC](https://learn.microsoft.com/en-us/dotnet/framework/app-domains/gac)

Historically, EA referenced A LOT of assemblies by default, more than 300 assemblies. This allows users to save some type on pre-configuring these dependencies on each and every C# action/BT node/etc, but this is not a good way long-term. Gradually, I'll be de-linking more and more default assemblies and will include a better auto-completion techniques which would allow to easily include those libraries which are needed for your script. In the future, this will make upgrading the program easier for everyone

```csharp 
#r "assemblyName: Grpc.Net.Client"

Log.Info("Hello, World!"); //you can use Grpc.Net.Client classes in that script
```
