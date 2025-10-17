---
title: Loading TTF via Static Class
description: 
published: true
date: 2025-10-17T15:02:40.336Z
tags: 
editor: markdown
dateCreated: 2025-10-17T15:02:40.336Z
---

> Import from here https://eyeauras.net/share/S202510171500516QI82emjTckw
{.is-info}

In this example we load Robot font into ImGui using static class with raw data

![Example of embedded resource](https://s3.eyeauras.net/media/2025/10/EyeAuras_SdQBF6VcjL.png)

![Imgui with updated font](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

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