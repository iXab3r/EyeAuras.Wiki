---
title: AI Recipes — Format
description: AI-first format for short EyeAuras recommendation recipes.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Recipe Format

Recipes combine APIs for a concrete task. This suggested shape does not impose
a mandatory standard on the whole Wiki. Start with the task and prerequisites,
then show a useful operation or complete integration design. Discovery maps
route to domains; the versioned reference supplies precise contracts.

## Describe the operation

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

## Context and Inputs

## Operation

## Result and Constraints

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
  recipe easier to understand. Prefer public pack names or a short generic
  description.
- Use `Example Illustration` when a public pack page has screenshots that make
  the end result obvious.
- Do not describe private paths, DSLs, business logic, secrets, or exact file
  layouts.
- Put runtime context, required services/packages and input sources beside the operation.
- Code must perform the useful core; do not substitute an undefined helper or invented engine.
- An architecture recipe may omit executable code when inputs, composition, data flow, observable result and resource ownership are explicit.
- State result, address/thread/cancellation limits and contract version with the operation.
- Use `Choices` only for decisions specific to this recipe.
- Use `APIs To Look Up` for discovery; it does not replace setup and the main operation.
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

- [recipes/bot-memory-imgui-interface.md](/en/scripting/api/recipes/bot-memory-imgui-interface) - bot using Memory API and ImGui UI.
- [recipes/bot-memory-behavior-tree.md](/en/scripting/api/recipes/bot-memory-behavior-tree) - bot using Memory API and Behavior
  Tree.
- [recipes/bot-memory-entity-list-reader.md](/en/scripting/api/recipes/bot-memory-entity-list-reader) - primitive entity-list reader
  using Memory API and a small UI.
- [recipes/tool-embedded-eyeauras-host.md](/en/scripting/api/recipes/tool-embedded-eyeauras-host) - tool/integration that adds
  EyeAuras capabilities to another host app.
- [recipes/script-ai-editor-assistant.md](/en/scripting/api/recipes/script-ai-editor-assistant) - AI chat assistant for script editors
  and mini-apps.
