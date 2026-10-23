---
title: AI Core Updater Source Selection
description: Update source catalog, explicit selection and app-owned persistence.
published: true
date: 2026-10-15T00:00:00.000Z
tags: scripting, api, updater, sources, configuration
editor: markdown
dateCreated: 2026-10-15T00:00:00.000Z
---
# Updater Source Selection Discovery Map

## User Intents

- Find the effective updater channel and available mirrors.
- Distinguish an explicit disable from legacy default selection.
- Configure an author-owned runtime source catalog atomically.

## Concept Model

`PoeShared.Squirrel.Updater.IUpdateSourceProvider` retains `KnownSources`,
`UpdateSourceId` and `UpdateSource`. Each `UpdateSourceInfo` has an ID, display
name and `Uris` mirrors. Configuring a source catalog is separate from registering
its handler, downloading an update or applying an installation.

The additive `IsSourceSelectionConfigured` and
`ConfigureSources(IReadOnlyList<UpdateSourceInfo>, string?)` members describe
intentional selection. A null selected ID means an explicit disable, rather than
permission to choose the first source. Runtime source objects are not serialized
as the selection record.

## Host and Runtime Contexts

The provider belongs to the application updater. Top-level scripts obtain
services through their script host; ordinary helper classes receive dependencies
explicitly. A source URI does not grant filesystem or installation ownership.

## API Details

`UpdateSourceProviderFromConfig` restores intentional selection from
`AppDataDirectory/.updater/selection.json` before resolving the legacy combined
config's channel. The small record contains `configured` and `selectedSourceId`,
including an explicit JSON null. Source objects and handler instances stay in memory.

`ConfigureSources` commits catalog and selection together. The public
`UpdateSourceId` setter intentionally selects or disables; clearing `KnownSources`
also disables. Loading a nonempty catalog retains a previously configured ID/null.
Only an unconfigured legacy profile falls back to the first available source,
unless its initial `UpdateSettingsConfig.AwaitAuthorUpdateConfiguration` is true.
In that case the provider retains the catalog and saved intentional ID/null but
holds the effective native source until public `ConfigureSources` successfully
commits author configuration for this provider lifetime. Readiness and selection
are committed together before notifications. Persisted configured-null remains
disabled; the flag's default false preserves legacy selection.
The effective ID is mirrored into the existing `UpdateSettingsConfig` without
resetting its Version or other preferences. Runtime metadata takes precedence
if a publisher-supplied combined config still contains an older channel.

The existing configuration listener changes only unconfigured legacy selection.
Notifications expose the completed catalog/selection state, avoiding intermediate
fallback during a configuration save. Normal application DI supplies its owned
profile path; direct construction without app arguments remains in memory and
never guesses a personal filesystem location.

## Common Flows

1. Load the ordinary catalog; a legacy profile retains its old ID or default.
2. Select a channel intentionally, or pass null/clear the catalog to disable.
3. Restart services over the same profile. Restore the effective runtime choice
   before populating the catalog; a saved disable does not select the first item.
4. Routine author configuration reads `IsSourceSelectionConfigured` and retains
   the effective `UpdateSourceId`, including null. An intentional later nonnull
   choice re-enables that source selection.

Provider persistence is separate from desktop operation cancellation, handler
registration, network exclusion and installation. Those workflows require the
application updater runtime and their own supported-entrypoint verification.

## Related Maps

- [Application updater contracts](application-updater.md)
- [Deployment and distribution](deployment.md)
- [Configuration persistence](configuration-persistence.md)
- [Pack preparation](pack-preparation.md)

## Search Synonyms

updater source, channel selection, KnownSources, UpdateSourceId, explicit disable,
legacy fallback, author bootstrap, configure sources, mirrors
