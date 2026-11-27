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
| Read cursor positions in one ImGui context, retain at most 64 points and release the renderer on Stop. | [Keep a bounded trail of your own cursor](/en/recipes/developer/cursor-trail-cleanup) |
| Warm up capture separately, measure ten new-frame searches and then count pixels ten times on one owned copy. | [Separate CV capture cost from ten same-frame passes](/en/recipes/developer/profile-cv-without-input) |
| Build a tiny owned fixture, obtain its live PID and address, then read its declared integer through the typed memory API. | [Read an Int32 from your own prepared process](/en/recipes/developer/read-owned-process-scalar) |
| Register an immutable snapshot and controller explicitly, serve one local GET and stop the owned host with the script. | [Expose an owned read-only status on loopback](/en/recipes/developer/localhost-status-controller) |
| Create a physical HTML fixture, read its cells in an isolated Selenium 4.24.0 session and always Quit that session. | [Read known cells from your own local HTML table](/en/recipes/developer/read-local-html-table) |
| Review owned images, complete annotation, train and export a compatible detector, then inspect boxes without input actions. | [Train your own reviewed detector and inspect its boxes](/en/recipes/developer/own-detector-to-boxes) |

The window recipes require a compatible desktop Blazor/WebView2 host; the ImGui recipe states its pinned SDK and native prerequisites. Prepare your own PNG or TTF where requested. A package reference does not register every service.

[All recipes](/en/recipes) · [Basic](/en/recipes/basic) · [Intermediate](/en/recipes/intermediate).
