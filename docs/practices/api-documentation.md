---
title: API documentation practice
description: Internal standard for complete operations and verified API contracts
published: false
date: 2026-11-06T00:00:00.000Z
tags: internal, practice, api
editor: markdown
dateCreated: 2026-11-06T00:00:00.000Z
---

# API documentation practice

Documentation should let a human or AI find a capability, understand its conditions
and complete an operation without guessing signatures, runtime context or lifetime.
The main explanatory unit is a complete operation with inputs and an observable result.
Scale the detail to the operation; a simple synchronous call needs less explanation
than a window with subscriptions, resources and cancellation.

This is the authoring standard used by the [API documentation author role](../roles/api-docs-author.md).
Domain routing remains in the [discovery maps](../../scripting/api/AGENTS.md).

## Basis and limits

The work in [EA-1830](https://eyeauras.myjetbrains.com/issue/EA-1830) and its
[production follow-up](https://eyeauras.myjetbrains.com/issue/EA-1835) supports
combining complete operations with a systematic coverage pass. Improvements
transferred more clearly to new combinations of documented operations than to
new standalone operations. Better composition does not establish complete API coverage.
The independent benefit of an exhaustive coverage pass remains unmeasured; it is
a workflow requirement, not a demonstrated effect of every rule in this guide.

Those observations concern combined changes to facts, organization and examples.
They do not isolate the benefit of a heading template or prove a universal format
winner. Keep experimental results, costs, unresolved judgments and limitations in
the owning issues and local evidence, not in this reusable practice.

## Three connected layers

| Layer | Reader's question | Content |
| --- | --- | --- |
| Discovery | Where can I solve this task? | User intents, exact symbols, contexts, relationships and direct links |
| Operation or guide | How do I perform it? | Prerequisites, complete code, expected outcome and material constraints |
| Contract reference | What is available and guaranteed? | Types, overloads, parameters, results, ownership and version |

Combine layers on a small page; split and link them when the domain is large.
Discovery maps route readers to APIs. Available SDK assemblies, XML docs and
generated metadata define the consumer surface; matching source explains behavior.
Do not maintain a divergent hand-written copy of a generated reference or treat
existing Wiki prose as proof when it conflicts with the supported contract.

## Establish facts and coverage before writing

Pin the application/source revision, SDK and optional package versions. Enumerate
the relevant public operations, including inherited members and extensions, from
the user tasks and source surface. Do not build the census from benchmark failures
or candidate answers; that produces answers to a test instead of product documentation.

For each operation, establish:

| Concern | Required author knowledge |
| --- | --- |
| Availability | Public type, namespace, assembly/package and service registration |
| Runtime | Top-level script, Action/Trigger, helper class, Razor, app/plugin or external host |
| Inputs | Types, units, coordinates and already-created dependencies |
| Invocation | Exact overload, execution order, async and threading behavior |
| Result | Meaning of the value or state change; absence versus failure |
| Ownership | Created versus borrowed objects and who releases them |
| Completion | Cancellation, Stop, window close, unsubscribe or disposal |
| Boundaries | Supported version, material constraints and unverified behavior |

Give every scoped operation an explicit disposition: adequate documentation,
a direct link to an adequate section, justified exclusion, or a remaining gap.
Uninvestigated is not unsupported. A member is a discovery starting point, not
a requirement to create one page per overload.

A type in an assembly does not prove its service is registered in every host.
Inspect both declarations and relevant implementation paths before asserting
ownership or behavior. If source and consumer assemblies differ, document the
confirmed surface and record the version mismatch.

## Write a complete operation

Use this order when it helps; do not force empty sections or identical boilerplate:

1. Task and observable result.
2. Runtime surface, packages, service acquisition and setup.
3. Existing inputs, types and owners.
4. Complete steps and code for that context, including required supporting files.
5. Expected output or state and how the reader recognizes success.
6. Material lifetime, threading, coordinate and cancellation rules.
7. Versioned contract links and related operations.

Choose a boundary that produces the promised result. Creating a window without
content or a lifetime is not a complete window example. Building an entire
automation system usually needs several operations connected by a guide.
Concept pages should explain definitions and boundaries instead of inventing an
executable sample; UI instructions should state the initial state and visible steps.

### Runtime and lifetime are part of the example

Top-level `Log`, `Variables`, `AuraTree`, `Sleep` and `cancellationToken` are host
capabilities, not globals in ordinary C# classes. Name the actual runtime and show
constructor/DI acquisition, an explicit parameter or the supported accessor.
Do not silently create a second service container to make an example compile.

For windows, subscriptions, timers, native wrappers and background tasks, include
the owner and termination event. Await the work, propagate the appropriate
cancellation token and show cleanup for owned resources. Do not dispose borrowed
host services. Show the complete scope of a `using` block in syntax supported by
the selected host; do not assert compiler restrictions without evidence.

Explain what persists after completion. Releasing a handle, deleting stored data
and stopping a running operation are different actions. The existing
[variable lifetime guide](../../scripting/api/scripting/variable-lifecycle-operations.md)
illustrates owner selection, inheritance, repeated runs and bounded verification.

### Explain result semantics and composition

For `bool`, say whether it means found, present, changed or accepted. For `Task`,
identify the event that completes it. For geometry, name coordinate spaces and
units. For collections, distinguish a snapshot from a live view and state ownership.
A local variable removal may expose an inherited value; do not infer `default(T)`
from the verb “remove”.

In a multi-operation guide, show how each result becomes the next input, where
types or coordinates change, what can be reused, and how the complete workflow
stops. Add a missing operation contract rather than linking to a vague API overview.

## Make sections independently useful

Use headings with the action, object and distinguishing condition. Include exact
declaring types for ambiguous method names and natural user terms for discovery.
Each code section should retain its runtime, input types and essential ownership
when read on its own. Required `#r`, service setup or coordinate conversion must
not exist only in a distant introduction.

Repeat short prerequisites that prevent misuse; keep detailed explanations in
one place with direct links. Avoid isolated keyword dumps and duplicated reference
blocks. Verify the actual task → operation → contract links, locale and version.
Reader-facing provenance must use accessible contract/source links at a fixed
revision, not the author's absolute checkout paths.

Preserve useful URLs, examples and media. Follow [repository metadata and language
rules](../../AGENTS.md) and [writing style](../../ai-writing-style-state.md).
A newer date or an RU/EN pair does not prove technical freshness. Translate only
the authorized scope and report remaining locale differences explicitly.

## Verify the claim, not just the page shape

| Evidence | What it establishes |
| --- | --- |
| Metadata, fences, links and anchors | Structural validity of the checked content |
| Source and contract review | Factual support for the pinned versions |
| Compilation with the declared dependencies | Compilation in that environment |
| Supported-host execution | Observed behavior of the specific executed scenario |
| Independent consumer reading or model evaluation | Retrieval and use under the recorded conditions |
| Live site and AI-cache checks | The version served by each separately checked pipeline |

These are separate evidence levels. Markdown checks do not establish compilation;
compilation does not prove native behavior. A plain C# project does not reproduce
all top-level script-host capabilities. State exact untested boundaries instead
of labeling an entire domain “runtime verified”.

Check cheap invariants throughout authoring. Resolve confirmed defects and make
unavailable checks visible; do not add speculative negative-test matrices.
Before completion, reconcile every scoped operation and read the result without
the author's hidden setup knowledge. Report covered scope and remaining work,
not just counts of pages or headings.

## Evaluate after a coherent authoring cycle

Run paid evaluations only within an authorized protocol and budget, after the
bounded content set and local QA are complete. Freeze questions, language, corpus,
source/SDK versions, models/effort, scoring, retries and cost accounting before
calls. Do not launch a new paid wave for every page or patch.

Keep candidate access to allowed documentation and questions; source and private
gold belong to the separate truth-evaluation path. Distinguish document support
from solution correctness and keep evaluators blind to candidate/arm identities.
Track serving and judging costs separately; unknown usage is not zero, and
reasoning tokens must not be charged twice as output.

Preserve correct/partial/incorrect/abstained/unknown outcomes, not only correct
counts. Fewer refusals with more errors needs explanation; unresolved judgments
are not automatically failures or successes. Outcome bounds and statistical
uncertainty are different limitations.

For transfer claims, derive fresh tasks from source before seeing candidate
answers. Have their novelty and criteria independently checked against used
questions. Distinguish new operations from new combinations. Generate fresh
answers for both document variants under the same access and evaluation protocol,
with a predeclared interleaved order. Once inspected, a task set is development
material; further transfer claims need fresh evidence. Do not change questions,
rubrics or parsers after observing scores to improve the reported result.

## Maintain the practice

Update affected contracts, examples and discovery links when public APIs change.
Inspect callers' examples even when they still compile; their promised behavior
may have changed. Route product retrieval/citation/renderer defects separately
from documentation authoring and do not infer AI-cache freshness from a live page.

Keep this practice as the shared rule source and the role as its workflow entry
point. Coverage ledgers, raw answers, run reports, risk assessments and sign-off
records stay in the owning issue and local git-ignored `.workspace/`. Do not commit
private gold or transient QA evidence to the Wiki.
