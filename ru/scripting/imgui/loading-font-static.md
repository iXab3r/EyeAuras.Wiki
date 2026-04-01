---
title: Загрузка пользовательского TTF-шрифта из статического класса
description: Как загрузить пользовательский TTF-шрифт из статического класса.
published: true
date: 2025-10-19T13:51:25.693Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-17T15:02:40.336Z
---
> Импортируйте пример отсюда: https://eyeauras.net/share/S20251017150654moSdG8zUyQ4D
{.is-info}

# Загрузка шрифта в ImGui из памяти

В этом примере мы загружаем шрифт Roboto в ImGui из сырых бинарных данных через статический класс.

![Пример embedded resource](https://s3.eyeauras.net/media/2025/10/EyeAuras_SdQBF6VcjL.png)

![ImGui с обновлённым шрифтом](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.17" //EyeAuras v8825+ is required

using EyeAuras.ImGuiSdk; //root ImGuiSdk namespace needed to add registrations (see below)
using ImGuiNET; //that namespace is needed to get access to ImGui itself

var osd = GetService<IImGuiExperimentalApi>() //create ImGui API - this will show empty OSD
    .AddTo(ExecutionAnchors); //ensure that you'll hide OSD when script stops or gets stopped

osd.AddFontFromMemoryTTF(EmbeddedBinaryData.RobotoRegularTtf); //loading the font itself

osd.AddRenderer(() =>
{
    //this method will be called many-many times per second
    //you can put any logic here
    ImGui.ShowDemoWindow();
});

//wait until script stops or gets stopped
cancellationToken.WaitHandle.WaitOne();
```