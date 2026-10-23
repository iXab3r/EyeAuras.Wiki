---
title: AI Core Pack Preparation
description: Exact revision preparation jobs shared by Web downloads and updater clients.
published: true
date: 2026-10-15T00:00:00.000Z
tags: scripting, api, packs, updates, preparation
editor: markdown
dateCreated: 2026-10-15T00:00:00.000Z
---
# Pack Preparation Discovery Map

## User Intents

- Prepare a downloadable ZIP for an already selected mini-app revision.
- Poll build progress without changing the selected revision.
- Resolve a stored legacy artifact with a final ZIP SHA-256.

## Concept Model

Metadata checks use the existing read-only `GET /api/share/{shareId}/{revision}`
and artifact resolver. A missing artifact does not mean the revision is missing.
`POST /api/share/{shareId}/{revision}/prepare` checks the caller's download access
and starts or joins preparation for that explicit revision. No client-supplied
artifact URL, configuration fingerprint or latest-revision lookup is accepted.

`GET /api/share/{shareId}/{revision}/prepare/{jobId}` returns `jobId`, `shareId`,
`revision`, `state`, `stage`, `progress`, `url` and `sha256`. States are `Queued`,
`Running`, `Ready` and `Failed`. A verified Ready includes the final ZIP URL and
SHA-256 together. A trusted stored hash is retained; a legacy missing hash or
new publisher result is hashed from the actual final response stream.

`progress` is a nullable percentage. Zero is measured zero; explicit `null` means
the current stage has no measured percentage. Stage and percentage come from the
same accepted producer report. Web status uses an indeterminate animated bar,
hides the numeric label and uses neutral waiting text until measured progress
resumes. Ready reports 100 regardless of the last preparation stage.

## Host and Runtime Contexts

These routes run in the Web server. Ordinary scripts do not own server jobs or
their trusted build identity. Desktop download and Apply remain separate
operations; this API does not install the ZIP.

## API Details

`EyeAuras.Web.Share.ISharePackPreparationCoordinator.StartVerifiedAsync` accepts
an authorized `SharePackPreparationRequest` and an exact server-resolved artifact
snapshot. `StartAsync` preserves the browser preparation flow without requiring
an additional ZIP fetch. `SharePackPreparationSnapshot.Sha256` belongs to the
verified result; `FindStatus` binds job lookup to route and original caller.

`SharePackPreparationSnapshot.IsProgressIndeterminate` marks pending unknown
progress while its legacy numeric `ProgressPercent` retains the last measured
value. The coordinator accepts one inline stream per shared publication and
ignores reports after that publication completes, including during ZIP hashing.
`IPackingServiceWeb.Pack` retains its optional five-argument signature and adds a
six-required-argument overload taking `IProgress<PackPreparationProgress>`. Its
default adapter forwards measured legacy aggregate reports synchronously and
detaches on completion; it never disposes a caller-provided tracker. Producers
with unknown stages implement the typed overload and report nullable percentages
directly. The compatibility adapter does not infer unmeasured remote progress.

`SharePackPreparationRequest.PackConfigKey` is a server-derived fingerprint.
The server combines it with exact share/revision, public tag metadata and locked
generation scope to share one active publication. Caller jobs and accounting
remain separate: the first publisher keeps its own identity. The common
`SharePackPreparationInputs` policy preserves the Web private-content/artifact
and locked-management download rules.

## Common Flows

1. Check metadata and select one revision.
2. POST preparation for that revision; poll its caller-owned job while pending.
3. Retain its Ready URL/hash for the download cycle. GET never replaces that
   result with a later artifact or revision.
4. An explicit new POST may resolve the current artifact for the same revision.
   An earlier Ready job remains immutable during its bounded retention.
5. After server restart, POST again. Job IDs are in-process receipts, while the
   normal publisher's artifact storage survives independently.

## Related Maps

- [Deployment and distribution](deployment.md)
- [Pack update notes](pack-update-notes.md)

## Search Synonyms

prepare pack, selected revision, artifact resolver, final ZIP hash, shared build,
mini-app update, preparation status, caller job, immutable Ready
