---
title: AI Writing Style State
description: Internal style snapshot for AI-assisted documentation work in EyeAuras.Wiki
published: false
date: 2026-04-02T18:18:26.815Z
tags: internal, style, translation
editor: markdown
dateCreated: 2026-04-02T10:32:07.901Z
---

# AI Writing Style State

This is an internal style snapshot for AI-assisted writing and translation in `Submodules/EyeAuras.Wiki`.

It is based primarily on existing Russian documents that do **not** appear to be AI-generated, plus a few stable translated pages where the tone already fits the wiki well.

## Current source references

Primary Russian style references used for this snapshot:

- `ru/faq.md`
- `ru/features/keylogin.md`
- `ru/scripting/getting-started.md`
- `ru/features/packs.md`
- `ru/BankaBot/getting-started.md`
- `ru/BankaBot/behavior-trees.md`
- `ru/BankaBot/rules.md`

Useful secondary references:

- `ru/features/eyepad.md`
- `ru/features/mini-app.md`
- `ru/features/sublicenses.md`

## Style summary

The preferred EyeAuras wiki style is:

- direct
- practical
- explanatory without being academic
- oriented toward normal users, not only developers
- comfortable with informal phrasing when it improves readability

## Preferred Russian writing patterns

- Start with the plain answer first.
- Explain difficult things in simple human language before introducing technical details.
- Prefer short paragraphs over long dense blocks.
- For product-specific docs, open with a practical definition and then move quickly into:
  - what it does
  - what it is useful for
  - what it cannot do yet
  - what to read next
- Use lists when they make steps or options easier to scan.
- Keep section names practical:
  - `Что это такое`
  - `Как начать`
  - `Что умеет`
  - `Когда использовать`
  - `Частые вопросы`
- Use explicit callouts for important limitations:
  - `Важно:`
  - warning block near the top for alpha features when relevant
- Prefer concrete examples early, especially links, buttons, commands, and screenshots.
- Write as if you are helping a capable user get something working, not defending a design document.
- If the page documents a concrete product or subsystem, it is fine to use a slightly more direct, grounded tone, as in the `BankaBot` pages.

## Tone rules

- Friendly and confident, but not overly formal.
- Avoid bureaucratic or legal-sounding wording unless the topic actually requires it.
- Avoid literal translation if it sounds unnatural in Russian.
- Keep product names, API names, UI labels, and code identifiers in their real form.
- If an English technical term appears in the UI, it is fine to keep it in backticks and explain it in Russian.

## Translation guidance

- If both languages exist, the newer version is the golden source.
- Update the older document surgically instead of replacing it wholesale.
- Preserve screenshots, examples, and core structure unless they are clearly obsolete.
- Prefer a natural Russian sentence over a mirrored English sentence.
- If the English original uses awkward headings, emoji shortcodes, or repetitive phrasing, normalize them into cleaner wiki-style Russian.
- When AI performs the translation or sync, add `ai-translated` to the document tags.

## Things to avoid

- Long literal calques from English
- overuse of abstract wording
- huge introductory paragraphs before the user learns what the feature actually does
- changelog-style writing inside feature articles
- unnecessary jargon if the same point can be made in simpler words

## Notes

This file should be updated gradually while translation work continues, especially when we discover better human-written Russian pages that represent the desired style more accurately.
