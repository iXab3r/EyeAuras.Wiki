---
title: "Inspect a one-second pulse and its recorded state changes"
description: "Combine an equal 1000/1000 ms Timer, locked Text and Event Viewer to follow the same aura through a restart."
published: true
date: 2026-11-10 T 17:01:45.000 Z
tags: recipes, intermediate
editor: markdown
dateCreated: 2026-11-10 T 17:01:45.000 Z
---

# Follow a pulse in the overlay and event messages

Make **Pulse active** appear for roughly one second and hide for roughly one second, then compare it with the state-change records for that aura. Disable and re-enable it to distinguish a new cycle from continuation of an old phase.

Use a new display-only aura, with EyeAuras unpaused. No external window, script or action is needed. Keep **both** Timer values equal; this recipe does not infer the unequal-duration mapping from editor captions.

## Prepare the display and event collection

1. Create **New Aura → Pulse check**. Add only **Triggers → Timer**. Set **Active for = 1000** and **Not Active for = 1000**, both in **ms**. Leave inversion and extra activation/deactivation delays off; leave action lists empty.
2. Under **Overlays**, add **Text**: **Content** `Pulse active`, **Font 24**, **Size to fit** off. Keep **Window → Mode → Overlay**; unlock and place a readable rectangle, then enable **Locked**. Select another aura before observing visibility so the editing preview does not hold the text on screen.
3. Use **Show event log** in the main window and open **Event Viewer** before restarting the cycle. Show its filters, enable **Auras**, set **Level → Info**, clear the text filter and unpause the panel. Keep it open rather than collapsed.
4. Disable Pulse check with its aura switch, then enable it again. The new cycle starts Inactive: initially the text is hidden, then appears after roughly one second, hides after roughly another second, and repeats.
5. In Event Viewer enter `Aura state changed to` in the text filter. Find entries whose **context** is Pulse check and compare their timestamps with the observed transitions. The message is emitted by the aura model in category Auras; it reports that aura's combined state, not a special Timer action. Other auras can produce the same message, so do not identify it by text alone.

| Observation | Meaning |
| --- | --- |
| Initial inactive wait, then alternating visible/hidden Text | Timer's equal-duration condition controls normal overlay visibility |
| Reported state changes for Pulse check | The aura model reported its transitions; not confirmation of an external operation |
| Disabled trigger or unavailable/null state | Work is stopped/unavailable; not another ordinary timed Inactive phase |
| Re-enabled aura | A fresh inactive wait, not the old phase's remaining time |

Disable the aura again and confirm periodic display stops; select away and leave the editor if its preview remains visible. Re-enable for another deliberate cycle. A full repeat is about two seconds, with scheduling overhead, not an exact stopwatch guarantee. Changing a duration restarts the cycle too; values below 100 ms are clamped, and zero is not a phase-disable command. Keep this exercise at 1000/1000.

[Timer](/en/triggers/timer) supplies the condition, [Text](/en/overlays/text) and [common options](/en/overlays/common-options) make it visible, and [Event Viewer](/en/features/event-viewer) helps inspect reported transitions. Its text filter searches messages, not context names. The panel retains only 250 accepted entries and misses events while paused, collapsed or filtered out by category; missing history alone does not prove the Timer stopped. Clear filters and repeat with collection open when needed. A [Wait](/en/behavior-trees/nodes/wait) would delay one tree route, not create this periodic aura pulse.
