---
title: Documentation search and snapshot identity
description: Documentation search and snapshot identity
published: true
date: 2026-11-06T00:00:00.000Z
tags: scripting, api, ai, retrieval, ai-translated
editor: markdown
dateCreated: 2026-11-06T00:00:00.000Z
---
# Find a contract through documentation tools

EyeAuras Standard Chat searches a local Wiki snapshot. Publishing a page on the
website and refreshing that snapshot are separate operations.

## Find an operation and read its source text

1. Enable the knowledge base in AI settings and start a **Standard Chat** session.
2. Ask it to call `doc_search` with the exact API name and task, such as
   `ScriptVariable Listen lifetime`.
3. Read the returned `chunkId` with `doc_get_chunk_full`. A heading and short
   preview help select a result; they do not replace the contract and code.
4. Cite the result's `Link`. English pages use `/en/...` and Russian pages use
   `/ru/...`; the repository path ending in `.md` remains the internal document ID.

Use `docName` to restrict `doc_search` to one document. `kind` and `tagsCsv`
filter metadata actually loaded into the index. Inspect `doc_list_documents`
instead of inferring available tags from the page text.

A long chunk may require several calls. `doc_get_chunk_full` returns up to
20,000 characters per call and includes a continuation offset when text remains.
Pass that `offset` with the same `chunkId` until no continuation remains; a partial
response can end inside code and must not be treated as the complete example.

## Which pages are indexed

Desktop and bot providers exclude pages explicitly marked `published: false`.
An absent flag does not mean unpublished. Published `scripting/api/AGENTS.md`
maps remain documentation; a filename alone does not make a page internal.

The loader reads flat `description`, `kind`, `tags` and `published` frontmatter
fields. Tags accept comma-separated text or a bracket-wrapped list. Frontmatter
is removed from searchable chunk text. Nested YAML objects are outside this
metadata format.

## Refresh the desktop snapshot and identify its version

For **Standard Chat**, click **Save** in AI settings, then start a new session
or reset the current one. Saving resets the prepared knowledge base; the next
initialization updates the Git directory and builds a new index. An existing
session keeps its snapshot until it is recreated.

`doc_get_index_status` returns:

- `SourceRevision`: the Git SHA loaded by the desktop provider;
- `IndexHash`: the identity of indexed content and indexing settings;
- `DocumentCount`, `ChunkCount`, `IsIndexed` and `IsDirty`: the state of this index.

A generic `AiDocsKnowledgeBasePlugin` created by another application may have no
source revision: the source owner supplies it. `doc_reindex` rebuilds the index
from documents already loaded; it **does not fetch Git updates**.

**Rebuild** under **Guidance pack** refreshes a separate set of files for external
tools. That pack's SHA does not prove an existing Standard Chat session uses the
same index. The website's 15-minute refresh from `main` also does not refresh an
open desktop chat.

## Contracts and related areas

`AiDocsKnowledgeBasePlugin`, `Bm25Document`, `Bm25SearchHit` and `Bm25IndexStatus`
are in `EyeAuras.AI.BM25`. A document's `SourceUrl` supplies its canonical link
independently of its index name; generic loaders can supply their own URL.
Publication policy belongs to the source adapter, not the ranking algorithm.

- [AI runtime](/en/scripting/api/ml/ai-runtime)
- [AI tools](/en/scripting/api/ml/ai-kernel-plugins)
- [Runtime contexts](/en/scripting/api/core/app-runtime-contexts)
