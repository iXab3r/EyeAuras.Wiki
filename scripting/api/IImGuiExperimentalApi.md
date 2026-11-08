---
title: IImGuiExperimentalApi
description: Interface providing methods for creating/drawing custom elements on the screen
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, imgui, ai-translated
editor: markdown
dateCreated: 2025-07-16T10:36:31.172Z
---

# IImGuiExperimentalApi

The experimental `EyeAuras.ImGuiSdk` interface owns a render-loop attachment and exposes fonts, textures and overlay settings. See the [SDK map](/en/scripting/api/nuget/imgui-sdk) for higher-level UI and [Blazor Windows](/en/scripting/api/windows-subsystems/blazor-windows) for Razor.

## Draw a window on every frame

In an EyeAuras C# script, reference the package, register its extension, then resolve the API. `0.1.42` is the historical version used by the [getting-started guide](/en/scripting/imgui/getting-started); its published XML confirms the members below; native compatibility with your host remains a separate check.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"

using EyeAuras.ImGuiSdk;
using ImGuiNET;

{
    AddNewExtension<ImGuiContainerExtensions>();
    using var imgui = GetService<IImGuiExperimentalApi>();
    using var renderer = imgui.AddRenderer(() =>
    {
        ImGui.Begin("Example");
        ImGui.Text("Hello, World");
        ImGui.End();
    });
    cancellationToken.WaitHandle.WaitOne();
}
```

The window displays text until Stop. Dispose the renderer subscription separately before disposing the API. The callback runs every frame; keep sleeps, network waits and file loading outside it. Ordinary C# classes receive dependencies explicitly and do not have the script host's globals.

## Run an operation on one frame

`imgui.RunOnce(api => { /* short frame operation */ })` returns a disposable registration. Disposing it before invocation prevents the callback. It schedules one operation; persistent UI must be drawn every frame with `AddRenderer`.

## Configure the shared overlay

A newly created overlay defaults to `VSync = true`, `MaxFramesPerSecond = 0`, `NoActivate = false` and `ShowInTaskbar = false`. Zero disables the separate FPS limit; VSync takes precedence. For a manual limit, set `VSync = false` and then `MaxFramesPerSecond = 60`.

`NoActivate = true` prevents interaction from giving the overlay focus. API instances share the overlay named `Main`; these settings are not isolated per script. Disposing one instance does not close the shared overlay while another owner still holds it.

## Register fonts and textures

`AddFont(ReadOnlySpan<byte> ttf, float sizeInPixels = 16, string? name = null, ImGuiFontRangeType rangeType = ImGuiFontRangeType.Default)` returns an `ImGuiFontSpec`. `ReplaceFont(spec)` selects the default; `RemoveFont(spec)` removes the registration and returns a `bool`. The byte-based `ReplaceFont` overload is obsolete. Load bytes before rendering and modify the font repository on the render thread. See the [complete TTF example](/en/scripting/imgui/loading-font).

Registration is not native atlas readiness: `IsInitialized` checks the specification, and the dirty atlas is rebuilt after frame handlers. Use paired `ImGuiEx.PushFont(spec)` / `PopFont(spec)` in one frame for a local font, as in the [helper-class example](/en/scripting/imgui/loading-font-static). Do not also make that same specification the default and assume its ordinary PushFont slot remains populated in this implementation.

Fonts belong to shared `Main`. API disposal does not remove your registrations. `RemoveFont` also resets the default when applicable, but does not promise to release the original native byte buffer, which this implementation retains. Do not register fonts every frame.

`GetOrAddImage(string name, Image<Rgba32> image, bool srgb)` accepts a decoded SixLabors.ImageSharp image and an explicit color-space choice, returning an ImGui texture `IntPtr`. `RemoveImage(name)` returns `bool`. Reuse the resource name; these methods do not load or decode source files.

## Reference version

Source at `c8b2304ac`: [interface](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.ImGuiSdk/IImGuiExperimentalApi.cs), [implementation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.ImGuiSdk/ImGuiExperimentalApi.cs), [registration](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.ImGuiSdk/Prism/ImGuiContainerExtensions.cs). `WhenRender` emits frame `TimeSpan` values.

`MeasureText`, `DrawBox`, `DrawFrame` and `DrawCircleFilled` belong to the old `0.1.17` interface, not `0.1.42`, as confirmed by both published XML files. Use ImGui draw lists and available [SDK helpers](/en/scripting/api/nuget/imgui-sdk). Source review does not establish ABI compatibility for every published NuGet version.
