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
| Apply an observed warning delay before its cue | [Delay an observed warning](/en/recipes/intermediate/stable-warning-state): a manual state aura, Debounce and an audible output |
| Stop and restart a retained wait on your next tick | [Interrupt an owned wait](/en/recipes/intermediate/cancel-owned-wait): Interrupter, a stop aura and a manual2000 ms Wait |
| Choose a preferred cue or a fallback | [Choose a fallback cue](/en/recipes/intermediate/choose-a-fallback-cue): Selector, controlled checks and two distinct sounds |
| Find which layer hides a linked reminder | [Trace a dependent reminder](/en/recipes/intermediate/trace-dependent-reminder): your own linked Text set and property binding |
| Compare a pulse with its recorded transitions | [Inspect Timer transitions](/en/recipes/intermediate/inspect-timer-transitions): equal1000/1000 ms Timer, Text and Event Viewer |
| Keep failure evidence before restoring a profile | [Report before rollback](/en/recipes/intermediate/report-before-rollback): your own profile, local backups and a known history snapshot |
| Compare half-filled bars of different sizes | [Color coverage across sizes](/en/recipes/intermediate/color-coverage-across-sizes): own calibrated two-color bars and working capture |
| Decide whether a pack has understood prerequisites | [Review before import/enable](/en/recipes/intermediate/review-import-before-enable): an inspectable prepared file or available publication and its requirements |

The shared-source task ends with both previews following the intended window; recognition conditions remain separate. The OCR task inspects actual recognized words before matching them. The two tree tasks distinguish a failed branch from a retained Running retry, and both keep automatic execution off for their controlled examples.

If you need a direct reminder or your first local set, start with [Basic recipes](/en/recipes/basic). Return to [Recipes](/en/recipes) to choose by the final result. A source name, package or template alone does not make an unavailable capture or OCR engine ready; follow each recipe's prerequisites.
