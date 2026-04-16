---
title: AGENTS
description: 
published: false
date: 2026-03-31T00:14:11.289Z
tags: 
editor: markdown
dateCreated: 2026-03-31T00:13:33.096Z
---

# EyeAuras.Wiki instructions

These instructions apply to everything under `Submodules/EyeAuras.Wiki`.

## Language layout

- The wiki uses **English as the default/root language**.
- English documents usually live directly in top-level folders such as:
  - `/features`
  - `/changelogs`
  - `/actions`
  - `/triggers`
  - `/behavior-trees`
  - `/macros`
  - `/overlays`
  - `/scripting`
- Russian documents live under `/ru/` and usually mirror the same structure:
  - `/ru/features`
  - `/ru/changelogs`
  - `/ru/actions`
  - `/ru/triggers`
  - `/ru/behavior-trees`
  - `/ru/macros`
  - `/ru/overlays`
  - `/ru/scripting`

Examples:

- English: `/features/ai-assistant.md`
- Russian: `/ru/features/ai-assistant.md`
- English: `/changelogs/9377.md`
- Russian: `/ru/changelogs/9377.md`

Not every page has a translation yet. Before creating a translated file, check whether the counterpart already exists.

## High-level section map

- `/features` and `/ru/features`
  Product-level features, workflows, onboarding for larger capabilities such as sublicenses, EyePad, mini-apps, AI Assistant, packs, and similar topics.

- `/changelogs` and `/ru/changelogs`
  Build-by-build release notes and patch notes.

- `/actions` and `/ru/actions`
  Documentation for EyeAuras actions.

- `/triggers` and `/ru/triggers`
  Documentation for trigger types and related workflows.

- `/behavior-trees` and `/ru/behavior-trees`
  Behavior tree concepts, node docs, and scripting integration notes.

- `/macros` and `/ru/macros`
  Macro-related documentation.

- `/overlays` and `/ru/overlays`
  Overlay documentation and examples.

- `/scripting` and `/ru/scripting`
  Scripting docs, API usage, IDE integration, examples, ImGui, Blazor Windows, embedded resources, and related developer workflows.

- Root-level files such as `/home.md`, `/faq.md`, `/contacts.md`, `/permission-model.md`
  General-purpose landing pages and site-wide informational documents.

- `/assets`
  Static assets used by the wiki.

- `/changelogs/draft`
  Draft or staging changelog material.

- `/YoloEase`, `/ru/YoloEase`, `/Lineage`, `/ru/BankaBot`, `/ru/dma`, `/ru/docs`
  Product-specific or niche documentation areas. Treat them as specialized sections and follow the local naming/style patterns already present there.

## Markdown document rules

For normal wiki pages, prefer this structure:

1. YAML frontmatter
2. Optional warning/info block
3. One top-level `#` heading
4. Then `##` / `###` sections as needed

Do not create markdown pages without a clear top-level heading after frontmatter.

## Frontmatter rules

Markdown files should include YAML frontmatter similar to this:

```yaml
---
title: Page title
description: Short page description
published: true
date: 2026-03-31T00:00:00.000Z
tags:
editor: markdown
dateCreated: 2026-03-31T00:00:00.000Z
---
```

Rules:

- Keep frontmatter present on normal wiki pages and changelogs.
- In frontmatter/header values, do **not** use `:` inside the value text because it breaks parsing. Rephrase the value instead.
- Do not omit the `tags:` field.
- For new files, prefer adding meaningful tags when the expected format is clear from nearby files.
- Preserve existing metadata unless there is a good reason to update it.

## Technical/internal files

Technical files such as `AGENTS.md` and similar workflow/instruction documents are treated differently from normal published wiki pages.

Rules:

- If a technical markdown file uses frontmatter, set `published: false`.
- Do **not** translate technical/internal files into other languages.
- Technical/internal files should stay in **English only**.
- Do not create `/ru/` copies of technical guidance files unless explicitly requested by the user.

## Changelog rules

Use `changelogs/9377.md` and `ru/changelogs/9377.md` as the current preferred format reference.

Expected changelog shape:

1. YAML frontmatter with version, description, dates, and `tags:`
2. One H1 heading that includes:
   - release label
   - version number
   - RU/EN cross-links
3. A short intro paragraph
4. Optional image
5. `## Bugfixes/Improvements` or the localized equivalent
6. Flat bullet list of user-facing changes

Preferred changelog header format:

- English:
  `# AI patch - 1.9.9377 [RU](/ru/changelogs/9377)/[EN](/en/changelogs/9377)`
- Russian:
  `# AI patch - 1.9.9377 [RU](/ru/changelogs/9377)/[EN](/en/changelogs/9377)`

When working on changelogs:

- Prefer updating or creating **both** language versions together.
- Keep the build number the same in both files.
- In changelog frontmatter, `title` must be **only** the full version string, for example `1.6.8123`.
- Do **not** prefix changelog `title` with localized or descriptive labels such as `Version`, `Release`, `Patch`, `Changelog`, `Версия`, `Патч`, `Обновление`, or `Сборка`.
- Do **not** translate or localize changelog `title` between EN and RU. The `title` should stay identical in both languages because it is just the version number.
- Focus on user-facing changes, not raw commit noise.
- Keep the format concise unless the release is clearly a larger milestone.

## Links and images

- Links to `s3.eyeauras.net` images must be inserted as **full absolute URLs**.
- Do not shorten or localize those image links.
- Prefer existing `s3.eyeauras.net` media links over adding new local image files unless explicitly requested.
- Preserve working internal links and keep language-specific links aligned:
  - English pages usually link to `/features/...`, `/scripting/...`, `/changelogs/...`
  - Russian pages usually link to `/ru/features/...`, `/ru/scripting/...`, `/ru/changelogs/...`
- For changelog RU/EN cross-links, use the explicit `/ru/...` and `/en/...` style already used in recent changelogs.

## Image workflow

When creating, redrawing, or substantially editing images for the wiki:

- always delegate the image creation/editing step to a sub-agent rather than doing it inline in the main rollout
- always validate the final image by actual visual inspection, not only by reading the source file contents
- if the source format is not directly previewable in the current tools, convert it to a previewable format first and then inspect it visually
- before considering the image work complete, show the final image result in chat so the user can visually confirm it
- repeated visual elements of the same kind should use consistent sizing and spacing
- label-boxes and chips that represent the same kind of data should use the same width/padding rule unless there is a strong reason not to
- arrows, connectors, labels, and text boxes must not overlap each other unless the overlap is clearly intentional and visually clean
- labels and captions inside images should be in English unless the user explicitly asks for another language

These rules apply especially to:

- locally created SVG diagrams
- generated screenshots, mockups, and visual explainers
- any image where layout, centering, clipping, or text fit matters

### Diagram style for technical SVGs

For custom technical diagrams such as `memory-*`, `pointer-*`, `struct-*`, and similar explainer SVGs, prefer one consistent visual language so new diagrams can be generated quickly and still match the existing set.

- use a dark background with a subtle grid and one rounded outer frame
- use rounded cards, panels, chips, and badges; avoid sharp-cornered boxes unless the diagram specifically needs a harsher look
- keep typography monospace for technical labels inside the image
- keep labels very short; prefer symbols, type names, offsets, and compact identifiers over sentence-like captions
- put stage names above the main rectangles/cards rather than inside them when that improves clarity
- put longer explanation in the markdown below the image, not inside the SVG
- prefer practical examples over jargon-heavy labels; `string`, `IntPtr`, `ByValTStr`, `Vector3`, `HP`, `Entity`, `Monster` are better than overly abstract placeholders
- when contrasting two APIs or two concepts, prefer a side-by-side layout with mirrored panels and a clear center divider such as `VS`
- use small badges for conceptual domains when helpful, for example `C`, `C#`, `x64`, `DMA`, `API`
- use color as semantic grouping, not decoration:
  - teal/cyan for native or low-level flows
  - blue for managed or higher-level flows
  - rose/red for final values, hot fields, or warning-like targets
- keep cards of the same role the same size
- keep chips of the same role the same size
- center labels inside cards and chips both horizontally and vertically
- avoid empty placeholder boxes when a realistic example can be shown instead
- arrows and pointers should align to the meaningful anchor point of the target element rather than approximately to its visual middle
- when the target is a specific cell, chip, byte-box, or similar discrete rectangle, the default anchor should usually be the nearest meaningful edge while keeping the arrow tip outside the rectangle
- leave a small visible gap between the arrow tip and the target border unless the diagram specifically needs direct contact or penetration into the target
- for label-to-target callout arrows, prefer a clean single axis when possible, for example a straight vertical line from the label to the target
- center the arrow relative to the intended target anchor, for example centered over the target cell when pointing to its top edge
- keep arrowheads compact; they should feel like a continuation of the shaft rather than a detached triangle
- if needed, move the label/pill slightly so the arrow can stay clean, aligned, and readable instead of forcing an awkward diagonal
- for locally created SVG diagrams under `/assets`, do not force markdown image width caps unless the user explicitly asks for them

For memory-chain diagrams specifically:

- prefer left-to-right flow
- show stable entry point first, then pointer hops, then the final value
- use consistent hex notation for addresses and offsets
- prefer a real-looking static address over an unexplained leading offset when that makes the chain easier to understand
- if the image shows only the route, add a short numbered walkthrough right below the image in markdown

## Numeric notation

When documenting technical concepts such as memory, pointers, offsets, RVAs, addresses, masks, and binary-related values:

- use hexadecimal notation consistently
- include the `0x` prefix
- when a leading plus sign is needed for an offset, format it as `+0x20`, not `+20`
- do not mix `0x20`, `+20`, `20h`, or bare `20` for the same kind of technical value inside the same page or image

Use decimal notation only for normal human-facing counts or values where decimal is the clearer default, such as:

- version numbers
- counts of items
- time in seconds or milliseconds when written as plain UI text
- human-readable example values such as `HP = 742`, unless the context specifically requires hexadecimal

## Working with translations

- English root pages are the default source unless the task clearly starts from Russian content.
- When both English and Russian versions exist, treat the **newer** one as the golden source.
- When syncing an older counterpart to a newer one, do **not** rewrite the older document from scratch unless that is truly necessary.
- Prefer incremental sync:
  - add missing sections
  - update changed facts
  - fix stale links, screenshots, examples, and wording where needed
- When translating, preserve:
  - section order
  - screenshots
  - examples
  - links, adjusted for language path where needed
- Keep the Russian and English pages conceptually aligned, but do not force word-for-word translation if a cleaner phrasing is better in that language.
- Add `ai-translated` to the `tags:` field of any document created or updated through AI-assisted translation/sync.
- When processing translation backlog, start from the **newest** unsynced documents first.
- Maintain `ai-writing-style-state.md` as the current style snapshot for AI-assisted writing and translation.

## Writing style

- Prefer the Russian wiki style as the main writing reference when a Russian version exists.
- Use `ai-writing-style-state.md` as the evolving style snapshot derived from non-AI-authored documents.
- Follow that style when creating new translated pages or syncing older ones.
- Treat brevity as a hard requirement. If a point is already clear, do not restate it in nearby sections.
- Prefer one strong explanation over three similar ones. Merge overlapping sections instead of repeating the same contrast or caveat.
- When editing, actively remove low-value recap, duplicated framing, and repeated “why this matters” paragraphs unless each repetition adds new information.
- Favor:
  - simple, direct phrasing
  - short paragraphs
  - practical structure
  - clear “what it is / how to start / when to use” sectioning
  - user-facing explanations over literal translation
  - practical product-doc flow when relevant:
    - what it is
    - what it does
    - what it cannot do yet
    - what to read next

## Legacy and generated files

- There are `.html` files alongside some markdown pages. Treat them as legacy/generated artifacts unless the task explicitly asks to edit them.
- Prefer editing `.md` sources.

