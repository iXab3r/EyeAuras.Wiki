---
title: Loading Custom TTF Font from Static Class
description: 
published: true
date: 2025-10-19T13:51:25.693Z
tags: imgui, scripting, ai-translated
editor: markdown
dateCreated: 2025-10-17T15:02:40.336Z
---
# Load a TTF through a static class

A static class can prepare font bytes, but it does not inherit script globals. Pass its file provider explicitly and render in a frame callback.

## Prepare the font and SDK

Add your `Roboto-Regular.ttf` as an embedded resource in the C# script project. Use a real TTF containing the required glyphs; its filename does not establish Cyrillic coverage. Set `fontPath` to the full manifest name: `MyScript.Roboto-Regular.ttf` for a root file or `MyScript.Fonts.Roboto-Regular.ttf` for the Fonts folder. Script preparation lists actual names in the debug log. Do not assume a short filename matches any resource.

The [historical import](https://eyeauras.net/share/S20251017150654moSdG8zUyQ4D) used:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.17"
```

Package `0.1.17` exposes the old `AddFontFromMemoryTTF` and does not support the code below. Use `0.1.42` for `AddFont`, `ReplaceFont(ImGuiFontSpec)` and `RemoveFont`; these members are present in its published XML from the [EyeAuras feed](https://packages.eyeauras.net/v3/index.json). Replace the historical project reference:

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"
```

The lifetime explanation follows source `c8b2304ac`. Package members alone do not establish native renderer compatibility with every application build. See the [SDK map](/en/scripting/api/nuget/imgui-sdk) for version boundaries.

## Script.csx

Keep one selected `EyeAuras.ImGuiSdk` reference in the project. Run this in the EyeAuras script host, where `AddNewExtension`, `GetService` and `cancellationToken` are available:

```csharp
using EyeAuras.ImGuiSdk;
using EyeAuras.Repl;
using ImGuiNET;
using PoeShared.Scaffolding;

{
    AddNewExtension<ImGuiContainerExtensions>();

    var files = GetService<IScriptFileProvider>();
    var fontPath = "MyScript.Roboto-Regular.ttf"; // full manifest name of your resource
    var fontData = FontData.Load(files, fontPath);
    using var osd = GetService<IImGuiExperimentalApi>();
    ImGuiFontSpec font = default;

    using var rendering = osd.AddRenderer(() =>
    {
        // Register and use the font on the render thread.
        if (!font.IsInitialized)
        {
            font = osd.AddFont(fontData, 20, "Roboto", ImGuiFontRangeType.Cyrillic);
        }

        ImGuiEx.PushFont(font);
        try
        {
            ImGui.ShowDemoWindow();
        }
        finally
        {
            ImGuiEx.PopFont(font);
        }
    });

    // Keep the script alive until Stop.
    cancellationToken.WaitHandle.WaitOne();
}
```

### FontData.cs

Add this ordinary C# file to the same project. It is the example's helper; it does not require a host-generated `EmbeddedBinaryData.RobotoRegularTtf`:

```csharp
using EyeAuras.Repl;
using PoeShared.Scaffolding;

public static class FontData
{
    public static byte[] Load(IScriptFileProvider files, string manifestName)
    {
        return files.ReadAllBytes(manifestName);
    }
}
```

This helper reads bytes through its explicit dependency. It creates no ImGui context and must not call ImGui from an arbitrary thread. An existing valid TTF byte array can replace file loading without changing the rendering rules.

## Font readiness and ownership

`AddFont` copies the bytes and returns an `ImGuiFontSpec`, not a ready native `ImFontPtr`. It marks the atlas dirty; rebuilding happens after frame callbacks, so the first frame may still use the old font. `IsInitialized` means a specification was registered, not that the native atlas is ready.

Pair `ImGuiEx.PushFont(font)` and `ImGuiEx.PopFont(font)` with the same specification in the same frame. Both do nothing until the native font is available. Do not retain a raw pointer across atlas rebuilds. This selects a font only for your content; [ReplaceFont](/en/scripting/imgui/loading-font) changes the default.

`AddFont` defaults to size `16` and `ImGuiFontRangeType.Default`. This example explicitly requests `Cyrillic`; a glyph range cannot add characters absent from the TTF. Exact glyph ranges and parsing depend on the native library.

The Run owns its frame subscription and API instance. Stop removes the subscription before releasing this share of the overlay. It does not close other owners' windows or automatically remove your font registration. `RemoveFont` removes the specification and resets the default if necessary, but the source implementation intentionally retains the original native buffer. Do not register a font every frame or treat repeated loading as an unlimited font-switching loop.

Font-loading methods have no cancellation-token parameter. Here the token keeps the script alive until Stop; it does not cancel native font loading. Check TTF, SDK and renderer compatibility in your installed version.

![Example of embedded resource](https://s3.eyeauras.net/media/2025/10/EyeAuras_SdQBF6VcjL.png)

![Imgui with updated font](https://s3.eyeauras.net/media/2025/10/EyeAuras_yzz7IrmjnJ.png)
