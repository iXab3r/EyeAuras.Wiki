---
title: "Basic recipes without programming"
description: "Build window reminders, visual checks and notification cues with ordinary EyeAuras settings."
published: true
date: 2026-11-10T16:05:04.371Z
tags: recipes, basic
editor: markdown
dateCreated: 2026-11-10T16:05:04.371Z
---

# Build a useful result without code

Everything here is built in the ordinary aura, trigger, action and overlay editors. The recipes do not depend on each other: each one lists what it needs and covers the whole setup.

## Start with a window or a reference

| Task | What you combine |
| --- | --- |
| [Show a recording checklist in your notes window](/en/recipes/basic/recording-reminder) | Foreground-window condition and fixed Text content |
| [Hear separate viewer-open and viewer-close cues](/en/recipes/basic/viewer-open-close-cues) | Window presence, On Enter and On Exit sounds |
| [Keep a reference card beside an editor](/en/recipes/basic/reference-card) | Your imported PNG, a foreground condition and overlay placement |
| [Limit a notification key to your application](/en/recipes/basic/application-only-shortcut) | A separate window-state aura, hotkey interception Links and one sound |

The card needs your own readable PNG. The notification key also needs a key that is unused in the windows where you test.

## Observe a visual source

| Task | What you combine |
| --- | --- |
| [Hold a key to inspect a colored panel](/en/recipes/basic/hold-to-inspect) | Folder enabling condition, bounded Color Search and a Text answer |
| [Hear one alert for your Ready icon](/en/recipes/basic/ready-icon-alert) | Captured source, cropped image sample and an On Enter sound |
| [Watch a warning color while working elsewhere](/en/recipes/basic/off-focus-color-indicator) | A separately selected capture window, color comparison and a visible reminder |
| [Watch a live status crop](/en/recipes/basic/live-status-crop) | Replica's own source and region, window presence and display placement |

First check that the source gives a fresh picture in the window state you plan to use.

## Manage your own state and local set

| Task | What you combine |
| --- | --- |
| [Show a warning while a saved checklist contains TODO](/en/recipes/basic/checklist-file-warning) | UTF-8 file snapshot, text matching and a visible reminder |
| [Switch reminders into maintenance mode](/en/recipes/basic/maintenance-status-board) | One manual source aura, expected-state links and folder permission |
| [Play start and finish cues for a short routine](/en/recipes/basic/two-stage-audible-cue) | Prepared sound actions, a finite macro and a 1500 ms wait |
| [Copy your reminder set without replacing it](/en/recipes/basic/copy-own-reminder-set) | Local JSON export, Import Preview, Copy and link verification |

The file and copy tasks need a local folder you can write to. The short routine also needs the Macro templates and sound you can hear. For shared capture, OCR and controlled tree routes, go to [Intermediate recipes](/en/recipes/intermediate).

[Recipes](/en/recipes) lets you choose by outcome. [Home](/en/home) has the feature overview.
