---
title: AI Scripting: Project Workflow
description: AI-first map for export/import/live-import, IDE workflow, script project shape, and solution boundaries.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ide, export, import, ai-translated
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

## Edit a script in an IDE and import it

Start with a working C# Script containing `Log.Info("EyeAuras version");`.
Keep a copy before import: the project replaces the script's code.

1. Choose `Export` in the script editor and select a dedicated empty folder.
   Export clears files and subdirectories in that folder, retaining `.git`.
   See the buttons and screenshots in [IDE integration](/en/scripting/ide-integration).
2. Open the exported `.sln` in Rider or Visual Studio. Install the .NET SDK
   and Windows dependencies specified by the generated project, then use
   the normal `dotnet build` command.
3. Change the script to `Log.Info("IDE version");` and save it.
4. Import the solution into the same script and run it in EyeAuras. The log
   should contain the new message.

An IDE build checks compilation; execution in EyeAuras supplies the live host
and services. Generated host stubs do not replace the sandbox. Export recreates
those stubs and import ignores them; put your own classes in the script project.

## Repeat changes with Live Import

After a successful manual import, enable `Live Import` for the same solution
using the [IDE guide](/en/scripting/ide-integration). Edit in the IDE, save,
and check that the change appears in EyeAuras. For C# Overlay, change text in
an existing Razor component and inspect it after refreshing/restarting the surface.

File synchronization does not prove that previous windows, fields or subscriptions
have been recreated. Verify the running script's result. Automatic restart depends
on the surface and host version.

In source revision `c8b2304`, `CsharpScriptEditor` uses `AuraScriptSynchronizer`
for both import and live import. Import is a single load. Monitoring loads the
solution initially and then reloads tracked changes, respecting `.gitignore`,
`.eaignore` and generated-file exclusions. Stop ends monitoring; it does not undo
already imported changes. Both commands reject scripts with `CompileOnce` enabled.
See [editor implementation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.CsScriptAuras/Actions/CsharpScript/CsharpScriptEditor.cs)
and [synchronizer](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Scripting.Editor/Services/AuraScriptSynchronizer.cs).

## Separate payload, tests and resources

Import matches the script and its dependencies to projects on disk. A neighboring
test project does not become script code merely because it belongs to the solution.
A dependency of the main project can be imported, so project-reference direction matters.

Declare a resource explicitly:

```xml
<ItemGroup>
  <EmbeddedResource Include="docs/help.txt" />
  <None Remove="docs/help.txt" />
</ItemGroup>
```

Create `docs/help.txt` containing `Project help`, import it, and read it using the
[complete example](references-and-resources). Import reads resource metadata;
it does not promise to execute arbitrary MSBuild targets, generators or pre/post-build
steps. Do not keep the only copy of an asset in `bin` or `obj`.

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

- `AuraScriptSynchronizer` — current import and monitoring; `ProjectSynchronizer` is legacy V2
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

- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [scripting/container-extensions.md](/en/scripting/api/scripting/container-extensions)
- [scripting/references-and-resources.md](/en/scripting/api/scripting/references-and-resources)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [core/deployment.md](/en/scripting/api/core/deployment)
- [recipes/recipe.md](/en/scripting/api/recipes/recipe)

## Read resources after import

Check that `IScriptFileProvider` can read the imported asset, not just that the file
exists in the project. Provider paths can differ from physical project paths.
[File provider operations](file-provider-operations) covers stream cleanup and
provider priority; [references and resources](references-and-resources) covers packaging.
