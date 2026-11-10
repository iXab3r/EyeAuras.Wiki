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

These tasks use ordinary aura, trigger, action and overlay editors. Each recipe includes its own prerequisites and setup; you do not have to complete the other recipes first. Keep each exercise in a small set with your own windows and data.

## Start with a window or a reference

| Task | What you combine |
| --- | --- |
| [Show a recording checklist in your notes window](/en/recipes/basic/recording-reminder) | Foreground-window condition and fixed Text content |
| [Hear separate viewer-open and viewer-close cues](/en/recipes/basic/viewer-open-close-cues) | Window presence, On Enter and On Exit sounds |
| [Keep a reference card beside an editor](/en/recipes/basic/reference-card) | Your imported PNG, a foreground condition and overlay placement |
| [Limit a notification key to your application](/en/recipes/basic/application-only-shortcut) | A separate window-state aura, hotkey interception Links and one sound |

The first task only needs a notes window. For the card, supply your own readable PNG. For audio tasks, choose sounds you can hear; the notification-key task also needs an unused key in your own test windows.

## Observe a visual source

| Task | What you combine |
| --- | --- |
| [Hold a key to inspect a colored panel](/en/recipes/basic/hold-to-inspect) | Folder enabling condition, bounded Color Search and a Text answer |
| [Hear one alert for your Ready icon](/en/recipes/basic/ready-icon-alert) | Captured source, cropped image sample and an On Enter sound |
| [Watch a warning color while working elsewhere](/en/recipes/basic/off-focus-color-indicator) | A separately selected capture window, color comparison and a visible reminder |
| [Watch a live status crop](/en/recipes/basic/live-status-crop) | Replica's own source and region, window presence and display placement |

For a visual check, first confirm that the selected source supplies current pixels in the window state you intend to use. An image match, an average-color comparison and a live copy answer different questions. None of these tasks requires sending keys or clicking a detected region.

## Manage your own state and local set

| Task | What you combine |
| --- | --- |
| [Show a warning while a saved checklist contains TODO](/en/recipes/basic/checklist-file-warning) | UTF-8 file snapshot, text matching and a visible reminder |
| [Switch reminders into maintenance mode](/en/recipes/basic/maintenance-status-board) | One manual source aura, expected-state links and folder permission |
| [Play start and finish cues for a short routine](/en/recipes/basic/two-stage-audible-cue) | Prepared sound actions, a finite macro and a 1500 ms wait |
| [Copy your reminder set without replacing it](/en/recipes/basic/copy-own-reminder-set) | Local JSON export, Import Preview, Copy and link verification |

The file and copy tasks need a writable local directory. Maintenance uses only your own state and Text; the short routine also needs the Macro templates and audible output. These recipes do not require scripts. For shared capture, OCR or controlled tree routes, continue to [Intermediate recipes](/en/recipes/intermediate).

Return to [Recipes](/en/recipes) to choose by outcome, or [Home](/en/home) for the feature overview.
