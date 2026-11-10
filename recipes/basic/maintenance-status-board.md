---
title: "Switch a reminder group into maintenance mode"
description: "Use one manual mode aura to suspend a folder and show a separate maintenance message."
published: true
date: 2026-11-10T16:38:45.973Z
tags: recipes, basic
editor: markdown
dateCreated: 2026-11-10T16:38:45.973Z
---

# Pause a group of reminders with one shared mode

Use one **Maintenance** switch to suspend two reminders and show **Maintenance mode** instead. The switch lives outside the controlled folder, so it remains available when the folder is disabled. No script or external data is needed.

Create this as your own small, display-only set. Keep its auras loaded and EyeAuras unpaused. The text is entered separately in each overlay; changing the mode does not automatically bind words into Content.

## Create the switch and the normal reminders

1. Right-click an empty area of the tree, choose **New Aura**, and name it **Maintenance**. Add **Triggers → + → Fixed Value**, initially **Is NOT Active**. Give this source aura no actions or overlays.
2. At the root, create **New folder** named **Normal reminders**. Do not move Maintenance inside it.
3. In that folder, create an aura **Review notes**. Add **Fixed Value → Is Active** in Triggers and **Text** in Overlays. Set **Content** to `Review your notes`, **Font 24**, **Size to fit** off and **Window → Mode → Overlay**. Unlock, place a 450 × 80 area, then enable **Locked** and **Clickthrough**.
4. Create a second child aura **Save draft** in the same folder, with the same settings but **Content** `Save your draft`. Place it below the first reminder rather than over it. Leave both auras' action lists empty.
5. Select **Normal reminders**. In **Enabling Conditions**, click **+** and add **Aura Is Active**. Through **Links**, select only Maintenance. Set that link's required state to **Not Active** and choose **Logical operator → All must match (AND)**. This allows the folder only while the known maintenance state is off.

## Show which mode you chose

1. Outside Normal reminders, create another root aura **Maintenance notice**. Add **Aura Is Active** to its ordinary **Triggers**, link only Maintenance, require **Active**, and keep **All must match (AND)**.
2. Add **Text** with **Content** `Maintenance mode`, **Font 24**, **Size to fit** off and **Window → Mode → Overlay**. Position it separately, then enable **Locked** and **Clickthrough**. It has no actions.

| Consumer | Required Maintenance state |
| --- | --- |
| Normal reminders → Enabling Conditions | Not Active |
| Maintenance notice → Triggers | Active |

3. Set Maintenance's Fixed Value to **Is NOT Active**. Select an unrelated aura outside the folder and leave the editor. Expect both normal reminders and no maintenance notice.
4. Return to Maintenance, select **Is Active**, then leave the editor again. The normal reminders should hide and Maintenance mode should appear. Switch back to **Is NOT Active** to restore the normal group.

[Fixed Value](/en/triggers/fixed-value) gives the shared manual state; [Aura Is Active](/en/triggers/aura-is-active) reads it with an explicit expectation; folder [Enabling Conditions](/en/features/enabling-conditions) withdraw permission for child work. An ordinary false trigger would only change an aura's result, rather than serving as this group-level permission.

Keep both the source switch and maintenance notice outside the gated folder. Do not use **Not set** as “maintenance off”: Unknown is distinct from known Not Active. During editing, a selected child can still be evaluated and an unlocked overlay can remain visible. Check the two modes after locking, selecting outside the folder and returning to your working application. The [Text guide](/en/overlays/text) covers the separate display settings.
