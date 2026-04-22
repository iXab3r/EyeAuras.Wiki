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
- A published pack has an owner. Only the owner can update that pack revision.
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

Mini-apps commonly use EyePad launch arguments:

```text
EyeAuras.exe --pad --read-only --publish-single-file --ui splashOnly --readiness script --acceptLicense "path/to/Script.json"
```

- `--pad` starts EyePad mode.
- `--read-only` avoids persisting aura/script changes between launches.
- `--publish-single-file` asks the packing pipeline for a more self-contained
  build.
- `--ui splashOnly` hides the main EyeAuras UI and keeps only the splash screen.
- `--readiness script` treats the product as ready when the target script is
  ready.
- `--acceptLicense` skips the standard license agreement window for mini-app
  scenarios.
- The final path points to the target script/config that should start.

## Protection

- Source scripts are convenient during development but should not be treated as
  protected distribution artifacts.
- Precompilation improves startup and can remove script text from the packaged
  product.
- `BinariesOnly` hides script text but does not by itself make code impossible
  to reverse engineer.
- `PerformanceFirst` and `SecurityFirst` add protection/obfuscation on top of
  compiled scripts.
- Public classes and public members are kept as public contract. Prefer
  `internal` for implementation details that should be transformed more
  aggressively.
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

- `core/eyeauras-structure.md`
- `core/app-runtime-contexts.md`
- `core/configuration-persistence.md`
- `scripting/runtime.md`
- `recipes/bot-memory-imgui-interface.md`
- `recipes/bot-memory-behavior-tree.md`
