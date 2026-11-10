---
title: "Developer recipes"
description: "Complete script projects with explicit host context, dependencies, resources and ownership."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Developer recipes

Choose a small project whose data you own. Each recipe includes the named source files and separates the top-level script from ordinary classes or Razor components. Start with the log counter before adding a window, project resources or an optional native renderer.

| What you will build | Recipe |
| --- | --- |
| Observe one owned aura variable, increment it once per second and release the subscription when the script stops. | [Observe a typed counter until Stop](/en/recipes/developer/typed-counter-observation) |
| Package text and a supplied PNG with a script project, read the text through its file provider and display both in an owned window. | [Bundle help text and your own reference image](/en/recipes/developer/bundle-own-reference-resources) |
| Move counter formatting into an ordinary C# class, edit the exported solution and run the imported result in EyeAuras. | [Edit an exported project with an explicit helper](/en/recipes/developer/ide-project-with-helper) |
| Observe one loaded Hotkey Is Active trigger, switch it from Razor and style its current value through a project CSS file. | [Build a styled panel for your own trigger](/en/recipes/developer/reactive-aura-control-panel) |
| Import an ES module after rendering, pass one ElementReference and release the component-owned module on close. | [Highlight your own element through a project module](/en/recipes/developer/project-module-highlight) |
| Render a bounded owned list with ImGuiSdk 0.1.47, a supplied TTF and local font selection until Stop. | [Show 50 known telemetry rows with your own font](/en/recipes/developer/native-font-telemetry-panel) |

The window recipes require a compatible desktop Blazor/WebView2 host; the ImGui recipe states its pinned SDK and native prerequisites. Prepare your own PNG or TTF where requested. A package reference does not register every service.

[All recipes](/en/recipes) · [Basic](/en/recipes/basic) · [Intermediate](/en/recipes/intermediate).
