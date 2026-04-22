---
title: AI Scripting: Project Workflow
description: AI-first map for export/import/live-import, IDE workflow, script project shape, and solution boundaries.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ide, export, import
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Script Project Workflow Discovery Map

Reference map for developing script mini-apps as normal C# projects: export,
import, live import, IDE editing, C# Overlay live workflow, embedded resources,
and multi-project solutions.

## User Intents

- Export a script into an IDE-friendly C# solution.
- Build a script project with normal .NET tooling.
- Import edited code back into EyeAuras.
- Use live import for fast UI/script iteration.
- Keep tests and helper projects near the main script project.
- Understand which projects/files are runtime payload.
- Add Razor components, CSS, JS, images, models, or DLLs to the script project.

## Concept Model

- A script project can be exported as a real `.sln` / `.csproj`.
- The exported project should compile normally with .NET tooling.
- Host-generated stubs can exist to make script APIs compile outside the app.
- Import reads project metadata and updates the script payload.
- Live import watches project files and recompiles changed script parts.
- A solution may contain unrelated helper/test/tool projects.
- Not every project in the solution should be imported as script payload.
- C# Overlay is a script-hosted Blazor surface with especially fast live UI
  feedback.

## Workflow Concepts

- Export - create an IDE-editable project from a script.
- Import - pull the edited project back into the script.
- Live Import - watch project changes and keep the script runtime prepared for
  quick restart/reload.
- Open in IDE - export plus live import plus IDE launch.
- C# Overlay live workflow - edit Razor/C# UI and see changes in the hosted
  overlay/window flow.
- Embedded resources - files in the project marked as resources and included in
  the compiled script assembly.

## Project Shape

- Keep the top-level script file as the runtime entry point/composition root.
- Put domain code into ordinary `.cs` files and folders.
- Put Razor components in `.razor` plus optional code-behind files.
- Put CSS/JS/images/fonts/models as embedded resources when they must ship with
  the mini-app.
- Put tests in separate projects that are useful for IDE work but not script
  runtime import.
- Put experiments/prototypes in separate projects when they should not become
  runtime payload.
- Keep project file metadata accurate; import relies on project structure.

## Common Flows

### Export And Edit

1. Export the script project.
2. Open the generated solution in an IDE.
3. Build the main project.
4. Add classes, Razor components, packages, and resources.
5. Import or live-import back into the script runtime.

### Live UI Work

1. Use C# Overlay or a script-owned Blazor window.
2. Export/open the project in an IDE.
3. Enable live import.
4. Edit Razor/CSS/JS/C# files.
5. Restart or refresh the script surface according to the host workflow.

### Multi-Project Solution

1. Keep the script payload project separate from helper/test projects.
2. Reference helper projects when useful for IDE compilation.
3. Keep tests out of the script import payload.
4. Import only the intended script project/files back into EyeAuras.

## Prefer

- Prefer exported projects for large mini-apps.
- Prefer keeping the main script project buildable.
- Prefer live import for UI-heavy iteration.
- Prefer separate test/helper projects for code that should not be imported as
  script payload.
- Prefer embedded resources for assets that must travel with the mini-app.
- Prefer stable relative project paths over machine-specific paths.

## Avoid

- Avoid editing the same script in EyeAuras after export if you plan to import
  from the IDE project; import will replace script-side changes.
- Avoid relying on pre/post-build steps to run inside EyeAuras import.
- Avoid assuming the IDE can run/debug the script exactly like the app host.
- Avoid treating every project in the solution as runtime script code.
- Avoid keeping important files only in build output folders.

## Research Anchors

- `ProjectSynchronizer`
- `AuraScriptSerializerVisitor`
- `EmbeddedResourcesScriptVisitor`
- `RazorVisitor`
- `MsbuildSdkVisitor`
- `MetadataReferenceGraphVisitor`
- `GlobalImportsVisitor`
- `IAuraScriptManager`
- `AuraScriptRuntimeManager`
- `RoslynFileProvider`
- `IScriptFileProvider`
- `CsharpAuraOverlay`
- `ScriptBlazorWindowConfigurator`

## Search Synonyms

- export script
- import script
- live import
- IDE integration
- open in IDE
- C# Overlay
- live overlay
- script project
- mini-app project
- exported solution
- embedded resource import
- project synchronizer
- Razor live import

## Related Maps

- `scripting/runtime.md`
- `scripting/container-extensions.md`
- `scripting/references-and-resources.md`
- `windows-subsystems/blazor-windows.md`
- `core/deployment.md`
- `recipes/recipe.md`
