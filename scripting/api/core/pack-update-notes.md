---
title: AI Core Pack Update Notes
description: Pack revision notes wire contracts and trusted server source configuration.
published: true
date: 2026-10-15T00:00:00.000Z
tags: scripting, api, packs, updates, changelog
editor: markdown
dateCreated: 2026-10-15T00:00:00.000Z
---
# Pack Update Notes Discovery Map

## User Intents

- Address release notes for the exact pack revision selected for an update.
- Find WikiJs and Banka source configuration without exposing server credentials.
- Distinguish pack revisions from native EyeAuras engine versions.

## Concept Model

`EyeAuras.Loader.Api.ChangelogRequest` and `ChangelogResponse` use the existing
`EyeAurasService.GetChangelog` protobuf envelope. An empty `ShareId` retains the
native `FromVersion` and `ToVersion` address. A pack address uses its exact
`ShareId` and `Revision`; numeric revision text is not an engine `System.Version`.

The additive request fields are `shareId=6` and `revision=7`. Response fields
`shareId=2`, `revision=3` and `baseUri=4` accompany the existing `changes=1`.
Field declarations alone do not establish server support. An older server may
ignore new request fields; a pack consumer must correlate the returned pack
identity before accepting its notes.

The server's pack branch resolves the exact revision through ordinary Share
metadata visibility/ownership policy before calling `IPackChangelogProviderService`
in `EyeAuras.Web.WikiJs.Services`. Its per-request provider snapshots the configured
source and language without reusing the native cache. Unconfigured notes return
the addressed ShareId and Revision with an empty Changes collection. Native
requests retain their existing version-range and language behavior.

A configured source keeps its public BaseUri when the selected revision has no
published notes. Both requested and actual document cultures normalize to their
two-letter language before comparison, so a matching regional locale is accepted.

## Host and Runtime Contexts

These are remote wire contracts and trusted server configuration types.
Configuration credentials belong to the server deployment, never the packed
profile, Share metadata, script-owned UI or public response. Ordinary C# helper
classes receive their clients and dependencies explicitly; top-level script
members do not become global APIs.

## API Details

In `EyeAuras.Web.WikiJs.Services`:

- `PackChangelogSourcesConfig.Sources` maps exact ShareId strings to
  `PackChangelogSourceDefinition`. Its config version is a reset boundary.
- `PackChangelogSourceKind` selects `WikiJs` or `Banka`; only that kind's typed
  settings address the request.
- `WikiJsPackChangelogSourceConfig` supplies `Endpoint`, server `ApiKey`,
  language-neutral `PublicBaseUri` and exact revision/language page IDs in
  `PageIdsByRevision`.
- `BankaPackChangelogSourceConfig` supplies the public `Endpoint`,
  `PublicSiteBaseUri`, explicit `VersionsByRevision` and `LocaleDirectories`.
  An empty directory names the configured root locale; array order does not
  determine language fallback.

`ChangelogResponse.BaseUri` carries a public notes root, not credentials or the
selected ZIP download address. Request language/format keep their existing
fields. Native note-range and language behavior remain a separate contract.

WikiJs uses the mapped `GetPageById` operation without parsing its title as an
engine version. Banka uses its configured external version and requested locale
in one GraphQL snapshot. Banka Markdown destinations resolve from sourcePath and
configured locale directories; public assets retain the snapshot identity.
Markdown URL rewriting changes parsed destination spans only, preserving code,
reference syntax and sized-image dimensions. HTML uses the same resolved URLs.
Document timestamps are not synthesized release dates. Cancellation follows the RPC.

## Assembly Hints

- `EyeAuras.Loader.Shared` contains the generated `EyeAuras.Loader.Api` wire
  types and service client.
- `EyeAuras.Web.WikiJs` contains the source configuration types. It is a server
  module, not a client SDK package or author source registration service.

## Avoid

- Replacing an exact selected revision with active/latest or an engine version.
- Accepting uncorrelated native notes as a pack result from an older server.
- Shipping provider settings or API credentials inside a mini-app.
- Treating a new config property as a reason to reset existing config versions.

## Search Synonyms

pack changelog, selected revision, release notes, self update notes, WikiJs,
Banka GraphQL, server source mapping, native version range, protobuf compatibility

## Related Maps

- [Deployment and distribution](deployment.md)
- [Configuration persistence](configuration-persistence.md)
- [App runtime contexts](app-runtime-contexts.md)
