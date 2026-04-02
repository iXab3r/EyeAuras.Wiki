---
title: Ссылки на NuGet и сборки
description: Подключение NuGet-пакетов и ссылок на сборки в проекте.
published: true
date: 2024-12-25T17:57:20.897Z
tags: ai-translated
editor: markdown
dateCreated: 2024-12-25T17:57:20.897Z
---
# Подключение внешних сборок

Движок скриптов полностью поддерживает подключение внешних сборок — как из файла, так и из [NuGet](https://www.nuget.org/).

> Важно: подключение сборок доступно только внутри `Script.csx`, который является аналогом вашего `Program.cs` в «обычном» C#.

## По имени пакета — из NuGet

Этот способ позволяет подключать любые пакеты из [NuGet](https://www.nuget.org/). EyeAuras скачает пакет и попытается подключить/загрузить все его части так же, как это обычно делают компиляторы в стандартных сценариях разработки.

```csharp
#r "nuget: Coroutine, 2.1.5"

Log.Info("Hello, World!"); //you can use Coroutine classes in that script
```

## По пути к сборке — из файла

Этот вариант позволяет подключать сборки из локальных файлов. Это может быть полезно, если нужная сборка по какой-то причине недоступна в NuGet.

```csharp
#r "assemblyPath: D:\Work\EAExile\EAExileAgent.Shared.dll"

Log.Info("Hello, World!"); //you can use EAExileAgent classes in that script
```

## По имени сборки — из памяти

Этот способ позволяет ссылаться на сборки, которые:

- уже загружены EyeAuras, но не входят в список сборок, подключаемых по умолчанию
- были загружены через `Assembly.Load` или любым другим способом, но уже находятся в [AssemblyLoadContext](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.loader.assemblyloadcontext?view=net-9.0)/[AppDomain](https://learn.microsoft.com/en-us/dotnet/api/system.appdomain?view=net-9.0)
- находятся в [GAC](https://learn.microsoft.com/en-us/dotnet/framework/app-domains/gac)

Исторически EyeAuras подключал ОЧЕНЬ много сборок по умолчанию — более 300. Это экономит пользователям время на предварительную настройку зависимостей для каждого C#-действия, BT-ноды и т. д., но в долгосрочной перспективе такой подход не является хорошим решением.

Постепенно всё больше сборок будет исключаться из списка подключаемых по умолчанию, а вместо этого появятся более удобные механизмы автодополнения, которые позволят легко подключать именно те библиотеки, которые нужны вашему скрипту. В будущем это упростит обновление программы для всех.

```csharp 
#r "assemblyName: Grpc.Net.Client"

Log.Info("Hello, World!"); //you can use Grpc.Net.Client classes in that script
```