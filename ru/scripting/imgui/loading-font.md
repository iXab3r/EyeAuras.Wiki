---
title: Загрузка пользовательского TTF-шрифта из ресурсов
description: Как загрузить пользовательский TTF-шрифт из встроенных ресурсов.
published: true
date: 2025-10-19T13:51:15.016Z
tags: ai-translated
editor: markdown
dateCreated: 2025-10-17T14:56:23.969Z
---
> Импортируйте отсюда: https://eyeauras.net/share/S20251017150828zhuomztM9lbi
{.is-info}

# Загрузка шрифта в ImGui через embedded resources

В этом примере мы загружаем шрифт Roboto в ImGui с помощью embedded resources.

![Example of embedded resource](https://s3.eyeauras.net/media/2025/10/EyeAuras_nMZAqZ6YHR.png)

![Imgui with updated font](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.17" //EyeAuras v8825+ is required

using EyeAuras.ImGuiSdk; //root ImGuiSdk namespace needed to add registrations (see below)
using ImGuiNET; //that namespace is needed to get access to ImGui itself

var osd = GetService<IImGuiExperimentalApi>() //create ImGui API - this will show empty OSD
    .AddTo(ExecutionAnchors); //ensure that you'll hide OSD when script stops or gets stopped

var fontData = GetService<IScriptFileProvider>()
    .ReadAllBytes("Roboto-Regular.ttf"); //loading font data from resources

osd.AddFontFromMemoryTTF(fontData); //loading the font itself

osd.AddRenderer(() =>
{
    //this method will be called many-many times per second
    //you can put any logic here
    ImGui.ShowDemoWindow();
});

//wait until script stops or gets stopped
cancellationToken.WaitHandle.WaitOne();
```