---
title: AI Recipes: Format
description: AI-first format for short EyeAuras recommendation recipes.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Recipe Format

Recipes are short recommendation cards. They are not tutorials, architecture
essays, or reproductions of private projects.

Use recipes to choose a direction. Use discovery maps to find exact APIs.

## Required Shape

```md
# Recipe Name

| Field | Value |
| --- | --- |
| Complexity | Low / Medium / High / Very High |
| Example | Public mini-app/product or short real-world example. |
| End Goal | One short sentence describing the desired final state. |
| Key Technologies | Public APIs, packages, or subsystems. |

## Use When

## Example Illustration

## Shape

## Choices

## APIs To Look Up

## Avoid

## Related Maps
```

Omit sections that do not apply.

## Style Rules

- Keep the whole recipe short enough to scan quickly.
- Name recipe files by user-facing category: `bot-*`, `tool-*`, `script-*`.
- Put the desired end state in the header before any implementation details.
- Use plain, concrete names. Prefer "Bot using Memory API and ImGui" over
  abstract labels such as "target state automation".
- Prefer concrete EyeAuras concepts over generic engineering advice.
- Do not explain ordinary code hygiene.
- Include an `Example` row when a real-world mini-app or product makes the
  recipe easier to understand. Prefer public names such as `BankaBot` or a short
  generic description.
- Use `Example Illustration` when a public pack page has screenshots that make
  the end result obvious.
- Do not describe private paths, DSLs, business logic, secrets, or exact file
  layouts.
- Use `Shape` for the intended runtime shape, not implementation steps.
- Use `Choices` only for decisions specific to this recipe.
- Use `APIs To Look Up` as search anchors, not a full API inventory.
- Link to maps for detail instead of repeating them.
- Avoid numbered build scripts unless the page is explicitly a tutorial.

## Filename Categories

- `bot-*` - automation/bot workflows, especially memory, CV, input, Behavior
  Tree, ImGui, and target-window control.
- `tool-*` - reusable tools, embedded integrations, helper products, and
  user-facing utilities.
- `script-*` - scripting workflows, script editors, script runtime helpers, and
  AI assistants for code/script authoring.

## Existing Recipes

- `recipes/bot-memory-imgui-interface.md` - bot using Memory API and ImGui UI.
- `recipes/bot-memory-behavior-tree.md` - bot using Memory API and Behavior
  Tree.
- `recipes/bot-memory-entity-list-reader.md` - primitive entity-list reader
  using Memory API and a small UI.
- `recipes/tool-embedded-eyeauras-host.md` - tool/integration that adds
  EyeAuras capabilities to another host app.
- `recipes/script-ai-editor-assistant.md` - AI chat assistant for script editors
  and mini-apps.
