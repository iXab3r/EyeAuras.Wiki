---
title: "Intermediate recipes: shared sources and controlled execution"
description: "Reuse capture settings, filter recognized text and control notification routes with behavior trees."
published: true
date: 2026-11-10T16:38:45.973Z
tags: recipes, intermediate
editor: markdown
dateCreated: 2026-11-10T16:38:45.973Z
---

# Connect a shared source to a controlled result

Choose these tasks when you already know how to create an aura and want several parts to work together. Each recipe includes its own setup: shared capture choices, OCR filtering or a deliberately driven behavior-tree route.

| Your goal | Recipe and prerequisites |
| --- | --- |
| Change the source for two visual checks in one place | [Shared capture target](/en/recipes/intermediate/shared-capture-target): two of your own distinguishable windows and working capture |
| Read a visible status line before showing a reminder | [Own document status text](/en/recipes/intermediate/own-document-status-text): a clear non-sensitive document and an available English OCR engine/language |
| Admit one notification only after your own check passes | [Check before notify](/en/recipes/intermediate/check-before-notify): Behavior Tree templates, a manual state aura and one sound action |
| Keep retrying that check until one controlled pass completes | [Retry readiness](/en/recipes/intermediate/retry-readiness-check): Until Success and repeated manual ticks from the same selected tree |

The shared-source task ends with both previews following the intended window; recognition conditions remain separate. The OCR task inspects actual recognized words before matching them. The two tree tasks distinguish a failed branch from a retained Running retry, and both keep automatic execution off for their controlled examples.

If you need a direct reminder or your first local set, start with [Basic recipes](/en/recipes/basic). Return to [Recipes](/en/recipes) to choose by the final result. A source name, package or template alone does not make an unavailable capture or OCR engine ready; follow each recipe's prerequisites.
