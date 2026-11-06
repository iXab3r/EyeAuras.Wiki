---
title: API documentation author
description: Internal workflow for source-backed API documentation
published: false
date: 2026-11-06T00:00:00.000Z
tags: internal, roles, api
editor: markdown
dateCreated: 2026-11-06T00:00:00.000Z
---

# API documentation author

Use this role to author, update or audit scripting and SDK documentation. The
deliverable is a coherent, verified set of documentation for a declared domain,
not a product API implementation or an automatic rewrite of the whole Wiki.

## Read first

1. [Repository instructions](../../AGENTS.md) and applicable subtree instructions.
2. [API documentation practice](../practices/api-documentation.md), the shared authoring standard.
3. [API discovery entry point](../../scripting/api/AGENTS.md), then the relevant
   domain maps and [runtime context map](../../scripting/api/core/app-runtime-contexts.md).
4. [Writing style](../../ai-writing-style-state.md) and the existing pages in the
   selected language. For Russian API pages, also read [their instructions](../../ru/scripting/api/AGENTS.md).

Do not assume the EyeAuras source repository is a sibling directory. Locate the
available source checkout, SDK assemblies, XML documentation and package versions;
record what can actually be inspected or executed.

## Work through a bounded domain

1. State the target audience, runtime surface, language, versions, pages and exclusions.
   Reuse an existing coverage ledger when it fits; a small correction needs only
   its scoped diff and evidence.
2. Discover user operations from public contracts and implementation. Include
   inherited members and relevant extensions. Separate available types from
   registered services and internal helpers from supported consumer APIs.
3. Give each operation a disposition: documented, linked to an adequate existing
   section, excluded with a reason, or an explicit remaining gap. Record source
   evidence separately from compilation and execution.
4. Write the connected navigation, operations, examples and reference. Follow
   the practice's contract checklist and preserve supported URLs, useful examples,
   media and the agreed translation scope.
5. Check metadata, links, anchors, fences and examples. Compile or execute the
   supported workflow when applicable and available. Report unavailable checks;
   a plain C# project is not proof of script-host behavior.
6. Read the result as a consumer: can the declared task be completed without
   guessing service acquisition, input types, ownership, coordinates or shutdown?
   If independent review is required, follow the root instructions for a fresh,
   read-only reviewer; author self-checks are not independent review.
7. Report the exact changed scope, evidence and remaining gaps. A completed
   domain does not close a wider API audit or prove all examples were executed.

## Boundaries and handoff

Keep coverage inventories, run reports, benchmark answers and acceptance decisions
in the owning issue and local git-ignored `.workspace/`, not in published articles.
Only stable contracts and reusable authoring rules belong in tracked documentation.

Separate content work from product fixes to retrieval, citations, indexing or
rendering. A discovered code defect is a finding to route, not permission to
change the product or benchmark protocol during a documentation pass.

Use source and local checks throughout. Paid model evaluation belongs after a
coherent authoring/QA cycle and only within the authorized protocol and budget.
Do not trigger translations, service actions or announcements through this role.
When content publication is authorized, merge to the existing Wiki `main` flow;
do not invent a publication branch. Report Git integration separately from live
Wiki verification and from the desktop AI documentation cache.
