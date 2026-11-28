---
title: "Intermediate recipes: shared sources and controlled execution"
description: "Share capture settings, filter recognized text and control notifications with behavior trees."
published: true
date: 2026-11-10T16:38:45.973Z
tags: recipes, intermediate
editor: markdown
dateCreated: 2026-11-10T16:38:45.973Z
---

# Connect a shared source to a controlled result

These recipes are for when you already know how to create an aura and want several parts to work together: shared capture settings, OCR text filtering or a behavior tree that you run by hand.

| Your goal | Recipe and what you need |
| --- | --- |
| Change the source for two visual checks in one place | [Shared capture target](/en/recipes/intermediate/shared-capture-target): two of your own windows that are easy to tell apart, and working capture |
| Read a visible status line before showing a reminder | [Own document status text](/en/recipes/intermediate/own-document-status-text): a clear non-sensitive document and an available OCR engine with English |
| Allow one notification only after your own check passes | [Check before notify](/en/recipes/intermediate/check-before-notify): Behavior Tree templates, a manual state aura and one sound action |
| Keep retrying that check until one controlled pass completes | [Retry readiness](/en/recipes/intermediate/retry-readiness-check): Until Success and manual ticks of the same tree |
| Hold a warning for a while before its cue | [Delay an observed warning](/en/recipes/intermediate/stable-warning-state): a manual state aura, Debounce and an audio output you can hear |
| Stop a wait and restart it on your next tick | [Interrupt an owned wait](/en/recipes/intermediate/cancel-owned-wait): Interrupter, a stop aura and a manual 2000 ms Wait |
| Choose a preferred cue or a fallback | [Choose a fallback cue](/en/recipes/intermediate/choose-a-fallback-cue): Selector, controlled checks and two different sounds |
| Find which layer hides a linked reminder | [Trace a dependent reminder](/en/recipes/intermediate/trace-dependent-reminder): your own linked Text set and a property binding |
| Compare a pulse with its recorded transitions | [Inspect Timer transitions](/en/recipes/intermediate/inspect-timer-transitions): a Timer with equal 1000/1000 ms, Text and Event Viewer |
| Keep failure evidence before restoring a profile | [Report before rollback](/en/recipes/intermediate/report-before-rollback): your own profile, local backups and a known history snapshot |
| Compare half-filled bars of different sizes | [Color coverage across sizes](/en/recipes/intermediate/color-coverage-across-sizes): your own calibrated two-color bars and working capture |
| Decide whether a pack's requirements are clear | [Review before import/enable](/en/recipes/intermediate/review-import-before-enable): a file you can inspect or an available publication with its requirements |

If you need a simple reminder or your first local set, start with [Basic recipes](/en/recipes/basic). In [Recipes](/en/recipes) you can pick a task by its final result.
