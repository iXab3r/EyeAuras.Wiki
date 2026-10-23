---
title: AI Core Application Updater
description: Generic updater contracts and application ownership of targets and ZIP installation.
published: true
date: 2026-10-15T00:00:00.000Z
tags: scripting, api, updater, packs, deployment
editor: markdown
dateCreated: 2026-10-15T00:00:00.000Z
---
# Application Updater Discovery Map

## User Intents

- Find one application updater shared by standard UI and authored UI.
- Describe an update target without encoding a pack revision as System.Version.
- Supply an author protocol while leaving ZIP installation to the application.
- Understand source registration, progress, cancellation and installation ownership.

## Availability

The generic contracts are declared in `PoeShared.Squirrel`, namespace
`PoeShared.Squirrel.Updater`. Registered author channels have an app-owned
registrator and `CheckAsync`/`DownloadAsync`/`ApplyAsync` runtime on the shared updater. Registration does not
select a source or request data. One owner captures the source selection and
binding, returns Busy to an incompatible Check or Download and keeps its operation
until the actual handler task and owned cancellation callbacks drain. Download
requires an available target selected by Check and retains that opaque instance
and its labels. Its cycle-owned reporter publishes typed nullable progress and
legacy numeric progress; cancelled, invalidated or closed sinks cannot change a
later cycle. Source changes invalidate that operation; selected
target and display labels come from the current coherent snapshot. Disposing a
binding clears its target while retaining selection; Check then returns
NotConfigured rather than routing the author URI to native NUPKG.

Successful registered Download publishes `ReadyToApply` and
`CanApplyPreparedUpdate`; this means the author handler completed its preparation.
It does not establish a verified ZIP token, accepted local installation plan,
Apply or successor readiness. Disable or binding removal clears readiness and
progress with the target.

Public `ApplyAsync` dispatches that prepared target through the same operation
owner. During the actual handler task it publishes `Applying`, remains Busy and
clears `CanApplyPreparedUpdate`; competing generic Check/Download/Apply calls
return Busy. Caller cancellation before acceptance waits for the actual handler
and owned cancellation callbacks, then throws `OperationCanceledException` with
Idle/null target and no UI error. The selected source remains available for a new
Check. A normally returned arbitrary handler Task is not an application-owned
installation acceptance receipt: returning without a product-owned handoff fails
the operation. The application installer captures a local plan and waits for the
actual product helper to load it and acknowledge ownership. It then commits the
helper and publishes exactly one synchronous `HandedOff` notification before
shutting down the parent. During that notification the accepted target stays fixed
and incompatible generic and legacy operations remain Busy. Caller cancellation,
author disposal and source changes after acceptance cannot cancel or retarget the
plan. `ApplyAccepted` means ownership transfer, independently of successor readiness.

Registered `GetChangelogAsync` reads the selected opaque target and requested
culture without occupying mutation Busy or changing phase, progress, readiness
or error state. Check must first select an available target. Notes return the
handler's Markdown and link bases, including empty Markdown, and can overlap
Download. Same-language callers have independent lifetimes; a new language,
target, source or binding invalidates older requests. Each superseded caller
receives cancellation only after its actual handler and owned callbacks drain.

The application singleton `IApplicationZipUpdateService` resolves through DI.
Its `PrepareAsync` downloads the fixed artifact URL, verifies the actual archive's
SHA-256 and optional expected size, and extracts the relative ZIP payload into
profile-owned staging. Typed progress distinguishes unknown download progress
from measured zero and reports actual received bytes, then `Prepared` at 100.
The opaque token exposes the verified archive hash/size; its staged bytes outlive
the author's progress consumer, HTTP client and completed action in this app lifetime.
Preparation preserves live application/user files and is separate from installation.
`ApplyAsync` requires that service's own prepared token and a current app-owned
Apply operation. The application verifies a complete copy of the staged successor
under its handoff's `helper` directory and runs that image outside the immutable
payload. This keeps a packed launcher's virtual files out of payload verification.
The helper binds its own image to the captured launcher bytes, waits for the original
process generation to exit, replaces every supplied relative payload file and
starts the delivered launcher with the retained startup/profile arguments.
Files absent from the payload, including retained user/profile and updater state,
remain in place. A renamed launcher removes the previous launcher.

Normal updater startup reclaims completed helper copies through
`DirectoryUpdateHandoff.CleanupCompletedHelpers`. It removes only an owned GUID
handoff's helper directory after its acknowledged process generation has exited;
live or unreadable generations remain for a later startup. Plans, acknowledgements,
logs and the original prepared payload remain available.

`ZipApplicationUpdateHandler` forwards Check and notes to the author's protocol
methods with the selected target and requested culture. Its Download resolves one
fixed artifact and awaits the supplied application ZIP service's real Prepare,
using the same progress reporter and cancellation token. Authors supply source
checks, notes and artifact resolution; the application downloads and verifies ZIP bytes.
The adapter retains the last successfully prepared token for that exact target
instance. Starting another Download clears the previous association; successful
preparation replaces it. Apply requires the same target reference and forwards
the retained token with its current reporter and cancellation token to the supplied
service, without resolving or preparing again, and completes with that service's Task.
The application owner supplies operation and source serialization. This forwarding
does not confer acceptance on author code. Staged files and the generic
`ReadyToApply` projection alone do not establish helper ownership or successful installation.

Ordinary unregistered native NUPKG sources use an internal adapter in the same
generic operation owner. Public Check captures the source and retains the native
engine's real `IPoeUpdateInfo`/release entries; Download uses that fixed source and
result. Apply awaits real native full/delta extraction and then uses the same
acknowledged helper boundary. Portable installation merges the extracted payload;
installed Squirrel installation starts the engine's actual versioned directory.
Generic native installation requires a non-debug runtime; Debug simulation is not
an installation. Native notes resolve the app's
`INativeApplicationUpdateChangelogProvider` lazily, use its existing backend RPC,
retain native languages/wiki/download links and combine Markdown entries in server
order with a blank line between them. Existing richer native News rendering remains
separate. On a native route, result projection keeps later legitimate legacy
results visible.
These bridges await actual model/RPC tasks even when those transports cannot cancel
in flight; they do not establish global legacy/native/author serialization or
private native HTTP-task correctness.

Public `FetchUpdate` retains the native model's exact returned Task. While that
call is starting or its Task is unfinished, registered `CheckAsync` and
`DownloadAsync` return `Busy` without changing the selected target or preparation
state, independently of UI scheduling. Public `DownloadUpdate(false)` similarly
keeps registered `CheckAsync` Busy through its full returned Task, including native
verification, download and completion, independently of queued UI notifications.
Public `PrepareForceUpdate` likewise keeps registered `CheckAsync` Busy while
force preparation starts or its returned Task remains unfinished, including
synchronous public `LatestUpdate` notifications on a background thread.
These cover Fetch-first, download-only-first and force-preparation-first ordering;
while a generic native or registered author's Download owns the updater, public `FetchUpdate` with
a valid native version returns a faulted `Task<IReleaseEntry>`, and public
`PrepareForceUpdate` with a valid native release returns a faulted
`Task<IPoeUpdateInfo>`, both with `InvalidOperationException`. `DownloadUpdate`
returns the same asynchronous refusal while that Download owns the updater. These occupancy
refusals do not throw synchronously, start native work, alter the selected target
or progress, cancel the Download or queue later work. Ownership lasts through
actual operation and cancellation drain even when presentation has already been
invalidated. A separately invoked Fetch or Force after that drain uses its normal
native workflow again. Other legacy entrypoints, author-Check-first ordering and
broader reverse ordering retain their ownership limits. While any generic Apply
owns the updater, `FetchUpdate`, `PrepareForceUpdate` and `DownloadUpdate` return
faulted `InvalidOperationException` tasks without starting or queuing native work.

An author registration for the current source URI owns its presentation even when
native results were checked earlier at that URI. Cached native results and release
entries are hidden while that route is author-owned; News uses the author's target,
notes and separate Download action. Disposing the registration leaves the remembered
author URI NotConfigured, so cached native results do not become a fallback.
Ordinary native routes retain their existing rich release presentation.

Mini-apps resolve the stock `EyeAuras.Shared.Sharing.IShareApplicationUpdateHandler`
through application DI. Startup discovers the owned pack from its installed local
sync metadata and application name before publishing default channels. An ordinary
mini-app defaults to that pack's Share source on its selected hub; intentional
source selection, explicit disable and the author configuration gate retain their
meaning. The handler compares installed and remote pack Revision, displays `R…`
labels and prepares the exact selected revision through the Share preparation API.
Polling stays with the original job; a Ready URL and SHA-256 snapshot feeds the
same app-owned ZIP service. Revision selection is independent of engine version.
Local installation records the owned pack's authored IDs separately from the live
tree. Before loading a changed Embed base or running the existing InstallFile queue,
it removes obsolete authored file paths,
including the old path of a renamed ID. User-only objects, LocalOnly subtrees and
separate nested syncs remain locally owned. Repeated startup with the same base
preserves local edits. An installation without prior membership is enrolled without
guessing which existing files can be removed.
This cleanup preserves local-clone content without synthesizing clone ID mappings.
The owned root's normal Folder Check with revision `Any` invokes the ordinary
application Check command using the currently selected updater channel and its
normal News navigation. An explicit folder revision and foreign folders retain
their JSON synchronization route.

The common News tab, titlebar update label and News badge use the selected
target's opaque labels and availability. For an available target without a
current native projection, News reads source notes for the exact target, source
and chosen language while selected. Markdown uses the returned optional
`BaseUri`; its optional `DownloadUri` remains an independent source link.
An absent or failed notes response does not block the separate Download button,
which awaits the shared `DownloadAsync` preparation task. Unknown progress has
no numeric percentage; measured progress and the actual Prepared state use the
shared updater's projection. On a native route, results retain their richer release
cards and existing combined Install/Restart commands. This UI choice does not establish
source-family provenance for simultaneous legacy force-native/author operations.
For a prepared generic target, News exposes a separate Install action calling
`ApplyAsync`. After a no-update Check, the installed opaque label remains available
even though `SelectedUpdate` is null.

Existing combined native members retain their legacy implementation and broader
ownership limitations outside the generic Apply boundary.
The profile's initial
`AwaitAuthorUpdateConfiguration=true` defers effective native source selection
and native Check until successful public `ConfigureSources` in that provider
lifetime. The catalog remains available; persisted explicit null stays disabled.
This native projection does not establish the generic `Phase` or process-wide
network exclusion, timer, mini-app or CLI startup guarantees.

For the native lane, deliberate `IUpdateSourceProvider.UpdateSourceId = null`
clears the selected native target, available releases and visible notes, and
makes Check unavailable. After a background setter returns, current native
target, version, release-list and readiness getters already project the disabled
source; they do not wait for queued UI cleanup. Choosing another valid native
source also immediately invalidates the previous source's current projection.
Until the current generation's UI cleanup runs, old target/release/readiness
values are hidden and native status/error/progress project neutral values.
The real release collection is cleared only on the UI scheduler. Cleanup uses
the generation captured at source change and abandons a superseded generation
before validating the cleared projection; live notifications then reconnect
bindings to the current view. Previously retained collection references remain
ordinary observable views. A subsequent ordinary Check for the new source can
publish its own target and notes. Notification delivery and Check availability
still require normal dispatcher progress.

Disable does not start a native check against a missing source. In the ordinary
UI-dispatcher workflow without reentrant source writes, an already-running
native Check keeps its lifetime until completion and generation guards suppress
obsolete result/status/error publication. The native Check also rechecks its
generation after public release-collection notifications, before publishing the
target/status, so a synchronous collection consumer can disable the source at
that boundary. Native Check commit during concurrent source changes and other
reentrant callback boundaries still have an unresolved coherent source-snapshot
and atomic publication ownership gap. Actual native client-task cancellation
and callback drain, premature-idle correctness and process-wide native/generic
serialization remain outside this projection guarantee. This is an implementation
limit, not a UI-thread requirement for the public provider API. Already-applied
update metadata belongs to the accepted native work and is retained. This native
projection does not implement generic handler lifecycle or cancellation of an
in-flight caller.

## Targets and Sources

`IApplicationUpdateInfo` is an opaque target selected by a handler. Its
`InstalledVersionText` and `TargetVersionText` are display labels;
`IsUpdateAvailable`, `IsDowngrade` and nullable `DownloadSize` describe the target.
Generic consumers do not compare labels or manufacture System.Version values.

`IApplicationUpdateHandler` supplies `CheckAsync`, `GetChangelogAsync`,
`DownloadAsync` and `ApplyAsync` over that selected target. All operations take
an explicit cancellation token. `ApplicationUpdateChangelog` carries Markdown
and optional `BaseUri`/`DownloadUri` for that target and requested culture.

`IApplicationUpdateHandlerRegistrator.Register(Uri, IApplicationUpdateHandler)`
binds an exact source URI. Registration and its disposable binding are separate
from source selection, network requests and ownership of the updater singleton.
Source catalog and explicit-disable persistence belong to `IUpdateSourceProvider`.

The app-specific `EyeAuras.Shared.Sharing.IShareApplicationUpdateHandler` contract
is in `EyeAuras.Shared`. It identifies the application-owned stock Share handler;
it does not introduce another updater manager or put pack P/R into the generic
target interface.

## ZIP Ownership

`ZipApplicationUpdateHandler` has a protected constructor accepting
`IApplicationZipUpdateService`. Authors implement `CheckSourceAsync`,
`ReadChangelogAsync` and `ResolveArtifactAsync`; its four public handler methods
are nonvirtual. `ZipUpdateArtifact` fixes a URL, expected SHA-256 and optional size.
That descriptor alone is not proof of downloaded or verified bytes.

`IApplicationZipUpdateService` owns preparation and installation.
`PreparedZipUpdate` is an application-owned token with read-only hash and size,
no public constructor and no public staging paths. Preparation is separate from
installation. An accepted local plan must outlive its source handler, HTTP client
and author script scope; cancellation before acceptance is a different boundary.

## Shared State and Progress

The additive `IApplicationUpdaterViewModel` contract exposes `SelectedUpdate`,
display labels, `Phase`, `CanApplyPreparedUpdate`, `ProgressStage` and
`IsProgressIndeterminate`, plus generic `CheckAsync`, `DownloadAsync`, `ApplyAsync`
and `GetChangelogAsync`. Existing native commands, release entries and numeric
`ProgressPercent` remain part of the same interface.

Native checks from the ordinary updater and its recurring timer use this same
operation owner. Automatic download prepares the selected target without applying
it. Further automatic checks retain that source's `ReadyToApply` target and verified
payload; an explicit `CheckAsync` can select a fresh publication.

`UpdateOperationOutcome` distinguishes `Completed`, `Busy`, `Disabled`,
`NotConfigured`, `Invalidated` and `ApplyAccepted`. Acceptance does not prove
successful replacement or successor readiness. Caller cancellation throws;
source invalidation has its own outcome. Superseded target/language notes cancel
without becoming a UI error.

`ApplicationUpdatePhase.HandedOff` describes accepted installation work before parent
shutdown. Its contract requires one synchronous phase notification with the
accepted selected target retained and incompatible operations still Busy.
An observer can dispose author resources or configure a later source without
changing the accepted plan. This lifecycle contract does not replace successor
verification or promise asynchronous observer completion.

Native preparation builds a separate staging snapshot; it does not publish local
RELEASES or change shell integration. After the ready helper is reserved, the
application owns uncancellable native finalization for the captured source and
release. Only successful finalization commits the helper and shuts down the
parent. A finalization error faults Apply, remains visible while the accepted
operation holds Busy, and leaves the parent running; an uncommitted helper
aborts instead of starting a partially finalized successor.

`IApplicationUpdateProgressReporter` extends the existing numeric
`IProgressReporter` with `ReportStage(string, double?)`. Null means unknown and
zero means measured zero. Reports belong to their updater cycle; closed-cycle
reports cannot revive stale state. Numeric legacy reporters remain compatible.

## Runtime Contexts

The application owns the updater. Ordinary C# helpers and Razor components
receive services explicitly through their context or dependencies. Top-level
script accessors are not global APIs in ordinary classes. Declaring a handler
type does not register it, select its source or start a request.

## Related Maps

- [Updater source selection](updater-source-selection.md)
- [Deployment and distribution](deployment.md)
- [Pack preparation](pack-preparation.md)
- [Pack update notes](pack-update-notes.md)
- [Application runtime contexts](app-runtime-contexts.md)

## Search Synonyms

application updater, generic update handler, ZIP updater, selected target,
author updater UI, stock Share handler, HandedOff, nullable progress,
prepared update, source registration, cancellation, mini-app update
