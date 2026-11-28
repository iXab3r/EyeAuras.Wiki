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

This is an internal style snapshot for AI-assisted writing and translation in EyeAuras.Wiki,
opened either as a standalone checkout or a submodule. Paths are relative to this repository.

It uses established Russian reference pages and stable translations whose tone fits the wiki. These are style references, not a claim of verified human authorship.

## Current source references

Primary Russian style references used for this snapshot:

- `ru/faq.md`
- `ru/features/keylogin.md`
- `ru/scripting/getting-started.md`
- `ru/features/packs.md`

Useful secondary references:

- `ru/features/eyepad.md`
- `ru/features/mini-app.md`
- `ru/features/sublicenses.md`

## Retired scope

BankaBot is retired and its 14 English/Russian user pages are outside the current editorial
backlog. Do not recreate or promote that section. Keep historical release facts and
protected API examples separate from current feature guidance.

## Style summary

The preferred EyeAuras wiki style is:

- direct
- practical
- explanatory without being academic
- oriented toward normal users, not only developers
- comfortable with informal phrasing when it improves readability

## Preferred Russian writing patterns

- For user articles, open with one concrete task, explain where its condition or data
  comes from, and carry it through prerequisites, numbered setup steps and a visible
  result. Keep meaningful alternatives and limits after that first working path.
- These user-article conventions do not replace the separate API author role/practice
  for discovery, operation contracts and reference pages, wherever those pages live.
  Practical scripting examples still need their exact context, dependencies and code.
- Use real UI labels and supported behavior. Avoid decorative emoji, invented personal
  experience, fake game integrations and repeated lists of hypothetical uses. Historical
  release notes retain their changelog shape and facts rather than acquiring a tutorial.
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
- For annotated UI screenshots, use short, rounded amber corner marks and dark rounded labels. Align the marks to the visible control: give text even top and left clearance, center on the painted socket, and leave a gap where its connection passes through. Check the crop at native size. The Position panel and My Tree ports in `assets/callouts/batch1/en/` are the references.
- Write as if you are helping a capable user get something working, not defending a design document.
- If the page documents a concrete product or subsystem, use a direct, grounded tone.

## Tone rules

- Friendly and confident, but not overly formal.
- Avoid bureaucratic or legal-sounding wording unless the topic actually requires it.
- Avoid literal translation if it sounds unnatural in Russian.
- Keep product names, API names, UI labels, and code identifiers in their real form.
- If an English technical term appears in the UI, it is fine to keep it in backticks and explain it in Russian.
- Avoid gratuitous English words in Russian prose. Use English only when it is a real UI label, API name, product name, file format, command, or term the user must search for. Prefer natural Russian words in ordinary prose: `руководство`, `набор данных`, `метки`, `задачи`, `предсказания`, `авторазметка`.

## Translation guidance

- Follow an explicitly selected source page/language. Otherwise compare substantive authored
  changes and history; newer frontmatter or translation-sync dates alone do not establish
  which counterpart is authoritative.
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

## Settings and parameter layout

Accepted owner preference from the AI Assistant pilot: use Markdown tables for settings, parameters, properties, and comparable named options. Default to two columns: the exact UI name and a concise explanation. Keep examples or conditions in the same row when they help the reader choose a value.

- Use the same table format for comparable sections throughout an article. Do not mix tables with definition lists, one heading per field, or name/description bullet lists for the same kind of content.
- Use a collapsible details block around a table when the entire group is optional or advanced; essential setup information stays visible.
- Numbered lists remain appropriate for ordered instructions. Ordinary lists remain appropriate for content that is not a settings or parameter reference.
- Keep ELI5 explanations adult and direct. One useful sentence is enough for a simple field; avoid filler, repeated introductions, and decorative icons.
- Check long names, code values, links, and wrapping on narrow screens when publishing a table.

Example:

```markdown
| Setting | What it does |
| --- | --- |
| Name | Name shown in the profile list. |
| Endpoint | API server address. Keep the template value for the default provider. |
```

Use the same structure in Russian pages, with localized column headings such as
`Настройка` and `Что делает`. When revising an article, remove repeated benefits,
obvious explanations, and redundant sections; preserve meaningful conditions and
limitations. Existing article structure may be rewritten to improve clarity.

## Plain language pass

Accepted by the owner on 2026-11-27 with `ru/home.md` as the reference page. The owner's
complaint about the previous AI rewrite: the text is robotic, over-complicated, hard to read
and simply longer than it needs to be. Write the way a competent person explains the
program to a friend.

Rules:

- Say what the thing is and what it does in the first one or two sentences. No marketing openers and no imperative slogans.
- Short sentences in everyday words. One thought per sentence. If a sentence needs to be read twice, split or rewrite it.
- Cut everything that does not help the reader do the task: restated benefits, obvious remarks, summaries of what was just said, announcements of what comes next, disclaimers about how the page or screenshots were made.
- Keep every fact the reader needs: steps, exact UI names, values, limits, warnings, code, tables, links and images. Shorter must not mean less accurate. Never invent behavior.
- Prefer concrete verbs and examples to abstractions: name the key, the window, the picture.
- Talk to the reader directly (`вы`, `нажмите`, `берите`). Mild conversational phrasing is welcome; slang, jokes and exclamation marks are not.
- Introduce a term once in plain words, then use it. Do not stack several new terms into one sentence.
- No decorative italic captions under screenshots. Alt text is a short plain description.
- Link text says what the reader gets: `Как собрать макрос`, not `Руководство по макросам`.

Bad, then good:

> Следите за условиями, выполняйте шаги по порядку и стройте логику с ветвлением в одном рабочем пространстве. Скачайте EyeAuras и начните с небольшой задачи, которую хотите автоматизировать.

> EyeAuras — это кликер с компьютерным зрением. Он смотрит на экран и сам нажимает клавиши, двигает мышь, включает звук или пишет вам в Telegram.

> Соберите последовательность с ожиданиями, условиями и повторами. Начните с макроса, если задачу можно описать как «сначала это, затем то».

> «Нажми, подожди, проверь, повтори». Если задачу можно так описать — берите макрос.

> Связывайте узлы, чтобы описать условия, выбор и повторяющуюся работу. Узлы возвращают Success, Failure или Running, а тики продвигают выполнение.

> Это «мозг» бота. Дерево само решает, что делать дальше: проверить условие, выбрать ветку, попробовать ещё раз. Берите его, когда в макросе стало тесно.

Typical robotic patterns to remove: chains of three imperatives or three nouns, `в одном рабочем пространстве`, `позволяет`, `обеспечивает`, `предоставляет возможность`, `данный`, `является`, `осуществляется`, `в рамках`, `при необходимости`, `следует отметить`, participle pile-ups, and semicolon-joined sentences.
