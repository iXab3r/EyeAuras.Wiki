---
title: AI Core: Deployment And Distribution
description: AI-first map of EyeAuras export/import, packs, mini-apps, script protection, and sublicensing.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, deployment, packs, licensing
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Deployment / Distribution Discovery Map

Reference map for how EyeAuras work moves from development to another user,
another PC, a published pack, a portable pack, or a mini-app.

## User Intents

- Share a folder, aura set, script, behavior tree, or mini-app with users.
- Export/import work as a backup or transfer format.
- Publish a pack and later update it.
- Decide whether users should import source-like content or download a packed
  portable product.
- Build a mini-app where the user mostly sees custom UI instead of EyeAuras UI.
- Protect script source and licensing checks before distributing a paid product.
- Add paid access keys for a pack or mini-app.

## Concept Model

- `Export` publishes or saves a pack. `Import` loads a pack from a link, file,
  JSON, or install script.
- A published pack can be anonymous or owned. Content updates require effective
  `CanEdit` rights (owner, admin, or an explicit Editor/Manager grant).
- A pack is the distribution unit. It can contain auras, scripts, macros,
  behavior trees, app/config choices, and optional packed content.
- A portable pack is a downloadable ZIP-style product that can run without a
  normal installation.
- A mini-app is not a separate engine. It is a product mode where EyeAuras
  infrastructure runs underneath while the user's main flow is custom UI or a
  target script.
- EyePad is the common launch/runtime shell for scripts, solutions, imported
  packs, and mini-apps.
- Script protection and sublicenses are pack-author concerns, not normal local
  development defaults.

## Deployment Modes

- Local export: save or copy JSON for backups, messenger sharing, or transfer
  between personal devices.
- Published pack: upload to the EyeAuras share system and get a link.
- Import subscription: keep a local folder linked to the original pack so users
  can receive updates.
- Local clone: keep multiple subscribed copies side by side with separate local
  IDs.
- Aura Library listing: make a published pack discoverable instead of unlisted.
- Portable pack: distribute a packed application folder/ZIP with program,
  config, and content together.
- Mini-app: package a custom user flow where EyeAuras is mostly hidden behind
  the author's UI.

## Share gRPC permissions and listing

`EyeAuras.Loader.Api.EyeAurasService` returns `ShareData` from share reads,
metadata reads, subscriptions and uploads. Optional `canEdit` (field 19) and
`canManage` (field 20) describe the authenticated caller's effective rights
for the returned revision. Missing fields mean an older server; do not infer
rights from `userName`. Values supplied in upload requests are ignored.
`GetShareMetadata` returns neither source nor packed content.

`UpdateShareListing(UpdateShareListingRequest)` accepts `shareId` (field 1)
and `listingStatus` (field 2), using `ShareDataListingStatus.Unlisted/Public`.
It requires `CanManage`, changes discovery across the share's revisions, and
returns refreshed, content-free metadata. Content, active revision, ownership,
privacy and tags are preserved. An Editor can update content but cannot change
listing. Listing does not grant access to private source content.

`UpdateShare` preserves listing and derives privacy from uploaded content.
Anonymous creation remains supported; an ordinary caller cannot update an
anonymous share. The existing owner/admin/grant resolver governs mutations.
These are remote service contracts, not ambient top-level script capabilities.

## Choose the distributed pack contents

Start with Export on the desired folder, save or publish it, then check Import in
an isolated user environment. A published link and a portable application folder
are different deliverables; see [Export and Import](/en/features/export-import)
and [Packs](/en/features/packs).

`PackAurasConfig` in `EyeAuras.Shared.Sharing` defaults to `Any`, `ScriptOnly`,
`None`, `Embed` and `CurrentVersion` for distribution, compilation, protection,
packing and compatibility respectively. Packed download alone does not remove
source. For a prepared binary distribution select `PackedOnly` and `BinariesOnly`,
then choose protection separately and inspect the resulting artifact. Constructing
this config in a script does not invoke the packer.

## Pack Settings

- `PackDistributionPolicy.Any` - import or packed download can both be offered.
- `PackDistributionPolicy.PreferPacked` - packed content is preferred when it
  exists, while source-style import may still be available.
- `PackDistributionPolicy.PackedOnly` - users should receive only the packed
  version.
- `PackScriptCompilationMode.ScriptOnly` - include scripts as text; user side
  compiles when needed.
- `PackScriptCompilationMode.ScriptWithBinaries` - include both text scripts
  and compiled binaries.
- `PackScriptCompilationMode.BinariesOnly` - exclude script text and distribute
  compiled binaries.
- `PackScriptProtectionMode.None` - no extra script protection.
- `PackScriptProtectionMode.PerformanceFirst` - protection with stronger focus
  on speed and stability.
- `PackScriptProtectionMode.SecurityFirst` - stronger protection, including
  heavier obfuscation/encryption techniques.

## Import Semantics

- `Prefer packed version` asks EyeAuras to load the prepared packed content
  variant when available.
- `Subscribe to Updates` links the imported folder to the source pack URL.
- `Local Clone` keeps a subscribed copy with separate local IDs.
- Conflicts are user choices: replace existing items, copy as new items, or
  ignore conflicts.
- Import currently works at pack level; do not assume partial import is
  available.

## Mini-app Launch

The following argument shape requires an exported script/config and a supporting
EyePad build; it does not launch an arbitrary SDK project:

```text
EyeAuras.exe --pad --read-only --publish-single-file --ui splashOnly --readiness script --acceptLicense "path/to/Script.json"
```

- `--pad` starts EyePad mode.
- `--read-only` avoids persisting aura/script changes between launches.
- `--publish-single-file` asks the packing pipeline for a more self-contained
  build.
- `--ui splashOnly` hides the main EyeAuras UI and keeps only the splash screen.
- `--readiness script` requires the script to call
  `IApplicationAccessor.ReportIsLoaded()` explicitly; script compilation alone
  does not report readiness.
- `--acceptLicense` skips the standard license agreement window for mini-app
  scenarios.
- The final path points to the target script/config that should start.

Console-oriented EyePad launches can use the same shell with an explicit script
source selector:

```text
EyeAuras.exe --pad --ui headless --readiness script --run path/to/Script.csx -- arg1 arg2
EyeAuras.exe --pad --ui headless --readiness script --eval "Console.WriteLine(string.Join(\"|\", args))" -- arg1 arg2
```

- Positional `inputFile` remains the legacy source selector.
- `--run path` selects a script file; `--run -` reads the script source from
  stdin.
- `--eval source` selects inline source and leaves stdin available as script
  data through `Console.In`.
- Use `--` before script arguments so host flags do not leak into `args`.
- Do not combine positional `inputFile`, `--run`, and `--eval`; conflicting
  sources should exit with validation code `2`.
- `Console.Write*` and `Console.Error.Write*` are the process stdout/stderr
  contract. `Log` is for script diagnostics and event-viewer breadcrumbs.

## Protection

- Source scripts are convenient during development but should not be treated as
  protected distribution artifacts.
- Precompilation improves startup and can remove script text from the packaged
  product.
- `BinariesOnly` hides script text but does not by itself make code impossible
  to reverse engineer.
- `PerformanceFirst` and `SecurityFirst` add protection/obfuscation on top of
  compiled scripts.
- Keep only consumer contracts public and implementation details internal.
  Exact renaming/exclusion behavior depends on the deployed protection rules;
  public visibility alone is not proof of what the resulting binary preserves.
- Protection is not an absolute security guarantee and should be combined with
  careful licensing and server-side design for paid products.

## Licensing / Sublicenses

- Sublicenses are pack-author access keys for a specific pack or mini-app.
- EyeAuras itself does not need a separate user license for sublicenses; keys
  grant access to the author's product.
- Users can activate a key on an existing account or sign in directly with the
  key.
- Authors configure duration model, freezes, session count, and optional
  hardware binding.
- Modern packs should request access through `ISublicenseManager.Rent(...)`.
  Do not rely on old passive checks such as reading
  `ILicenseAccessor.ShareSublicenses` as the main mechanism.
- A lease starts pending and updates in the background. Treat access as granted
  only when `ISublicenseLease.IsGranted` is true.
- Keep the lease alive for as long as that logical session should consume
  access.
- Semi-offline behavior may preserve already granted access through temporary
  disconnects or crashes, but it is not full offline licensing.

For paid mini-apps, the usual hardening direction is:

- `PackDistributionPolicy.PackedOnly`
- `PackScriptCompilationMode.BinariesOnly`
- `PackScriptProtectionMode.PerformanceFirst` or
  `PackScriptProtectionMode.SecurityFirst`
- custom UI / mini-app flow when the author needs more control over onboarding
  and licensing UX.

## API Details

- `PackAurasConfig` - pack configuration object.
- `PackDistributionPolicy` - Any / PreferPacked / PackedOnly.
- `PackScriptCompilationMode` - ScriptOnly / ScriptWithBinaries / BinariesOnly.
- `PackScriptProtectionMode` - None / PerformanceFirst / SecurityFirst.
- `IShareProvider` - converts share ids to URIs, fetches share metadata/content,
  and updates pack config.
- `AuraShareId` - stable id of a published share/pack.
- `ShareInfo` / `ShareInfoMetadata` - published share payload and metadata.
- `ShareDataPackDownloadPolicy` - request-side choice of source-like or packed
  content.
- `ISublicenseManager` - creates live runtime sublicense lease intents.
- `ISublicenseLease` - live lease state: share id, grant status, message, and
  change stream.
- `IEyeHubService` - hub connection, login, logout, token refresh, and license
  key activation.
- `ILicenseAccessor` - current license projection and legacy sublicense list.
- `LoginWidget` - ready-made Blazor login widget for custom UI.

For the detailed custom login/profile flow, including key login via
`LoginWithLicenseKey(key)`, see [core/login-and-licensing.md](/en/scripting/api/core/login-and-licensing).

## Publication tags

`EyeAuras.Loader.Api.ShareData.TagUpdate` is a write-only `ShareTagUpdate`
payload for `UpdateShare`. Each optional `ShareTagNameList` category distinguishes
omission (preserve) from a present empty `Names` list (clear editable assignments).
The older `UserTags`, `GameTags`, and `SystemTags` arrays remain response metadata.
Assignment is atomic with publication or a new revision.

Ordinary publication editors may create visible User tags, select visible Game
tags, and select System `Game Profile`. Other System tags and invisible assignments
belong to administrators. Protected existing assignments survive ordinary edits.
`IsLocked` means soft deletion; `IsInvisible` controls presentation independently.
Public projections omit both; administrator library tags expose both flags.

PoE2 profile publishing combines visible Game `Path Of Exile 2` and System
`Game Profile`. `AuraLibraryQueryRequest.GameTagName` and `SystemTagNames` apply
these predicates together before paging. Classification does not replace profile
payload validation. These are transport APIs, not global top-level script members.

## Prefer

- Prefer local export for backups and one-off transfer.
- Prefer published packs for updates and sharing by link.
- Prefer import subscriptions when users should receive future revisions.
- Prefer portable packs or mini-apps when the user should not work inside the
  normal EyeAuras UI.
- Prefer `BinariesOnly` plus protection for paid code.
- Prefer `ISublicenseManager.Rent(...)` for new paid packs.
- Prefer user-facing mini-app UI for commercial products where onboarding,
  login, and licensing need to feel like one product.

## Avoid

- Avoid publishing secrets, tokens, passwords, or private server data in packs.
- Avoid assuming packed content and source import mean the same thing.
- Avoid assuming a non-owner can update a published pack.
- Avoid relying on old passive sublicense checks for new packs.
- Avoid storing volatile handles, live process ids, or runtime session objects
  in pack settings.
- Avoid treating protection as a complete replacement for careful product
  design.

## Source Docs

- [Export and Import](../../../features/export-import.md)
- [Packs](../../../features/packs.md)
- [Mini-app](../../../features/mini-app.md)
- [EyePad](../../../features/eyepad.md)
- [C# Script Protection](../../../features/script-protection.md)
- [Sublicenses](../../../features/sublicenses.md)
- [Aura Library](../../../aura-library.md)

## Search Synonyms

- export pack
- import pack
- share link
- published pack
- pack owner
- update subscription
- local clone
- packed content
- portable pack
- mini-app
- EyePad
- script protection
- binaries only
- packed only
- sublicense
- license key
- lease
- key login
- hardware binding
- semi-offline license

## Related Maps

- [core/eyeauras-structure.md](/en/scripting/api/core/eyeauras-structure)
- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [core/login-and-licensing.md](/en/scripting/api/core/login-and-licensing)
- [core/configuration-persistence.md](/en/scripting/api/core/configuration-persistence)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [recipes/bot-memory-imgui-interface.md](/en/scripting/api/recipes/bot-memory-imgui-interface)
- [recipes/bot-memory-behavior-tree.md](/en/scripting/api/recipes/bot-memory-behavior-tree)

## Source-backed distribution boundaries

At `c8b2304`, upload preparation retains the original source tree as `Content` and
builds a separate `PackedContent`. `BinariesOnly` replaces C#/Razor source for
projects found in the active script repository; invalid/missing project IDs or
unresolved scripts are skipped. Other assets can remain. Inspect the produced
artifact instead of treating the option as a whole-package source scrubber.

For non-owners, `PackedOnly` rejects program download and directs the consumer to
the website. `PreferPacked` depends on actual packed content availability; it is
not compilation or protection by itself. Protection sends compiled resources to
ShadowForge with levels 0/1/2 for None/PerformanceFirst/SecurityFirst. A selected
level does not prove that a remote protection job or target-host launch succeeded.

`--read-only` disables normal EyePad content change persistence; it does not sandbox
arbitrary filesystem writes by scripts. `--publish-single-file` is a server packing
request, not an instruction to repack a locally launched executable. Splash-only
closes the splash when application readiness is reported. The command above needs
the script-controlled readiness call, otherwise startup can stay pending.

[Upload preparation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Sharing/Services/ShareUploadPreparationService.cs),
[precompilation](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Sharing/Services/PackingServiceCompiler.cs),
[download policy](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Web/Services/DownloadPolicyCalculator.cs),
[readiness contract](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.Shared.Metadata/Modularity/EyeAurasReadinessMode.cs).
