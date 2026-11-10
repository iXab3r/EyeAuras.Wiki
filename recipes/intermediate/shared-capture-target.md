---
title: "Reuse one window choice across two visual checks"
description: "Bind two capture selectors to one folder default and verify that both previews follow it."
published: true
date: 2026-11-10T16:38:45.973Z
tags: recipes, intermediate
editor: markdown
dateCreated: 2026-11-10T16:38:45.973Z
---

# Change two capture sources in one place

Choose a window once and have two visual-check previews follow it. This is useful before building several recognizers for the same application: each still has its own search settings, while the source expression has one owner.

Prepare two separate windows of your own text editor. Display **SOURCE A** in large letters in one and **SOURCE B** in the other. Keep both restored and visible, with a supported capture method that supplies current pixels. These are your own windows and text, not files supplied by the Wiki. This recipe ends with correctly routed previews; a preview alone does not prove an Image Search or Color Search condition matched.

## Make the folder own the choice

1. Right-click an empty area of the tree, create **New folder**, and name it **Shared visual source**. Open its **Triggers/Actions/Overlays Defaults** section.
2. Enable the **Target Window** checkbox. Use **Click to select Window** to pick SOURCE A. Inspect the selected-window information so you know which window is actually resolved. A picked handle can change when the window is recreated; keep both windows open for this exercise.
3. Inside the folder, create **New Aura → Icon check** and add **Triggers → + → Image Search**. Create another child aura **Color check**, with **Color Search**. Keep their action lists empty.
4. In **Capture settings → Target Window** of Icon check, right-click the small binding indicator beside the field and choose **Bind to Default**. Do the same for Color check. This explicitly connects each capture selector to the corresponding folder default, even if a new component already had that binding.

| Connection | Direction |
| --- | --- |
| Folder default Target Window | Supplies the window-matching expression |
| Icon check → capture Target Window | Receives that default through Bind to Default |
| Color check → capture Target Window | Receives the same default through its own binding |

5. Set **Image Capture Rate 5 FPS** in each trigger. Leave effects empty and use **Crop region → Reset** to begin with the full source. Open each **Preview captured image** in turn. Both selected-window displays and previews should identify SOURCE A.
6. Return to the folder and change only its enabled **Target Window** to SOURCE B with the picker. Inspect both trigger previews again: both should now show SOURCE B without retyping their selectors. Keep the auras loaded and enabled and EyeAuras unpaused during this comparison.
7. Change the folder back to SOURCE A. Both previews should return to it. If only one follows, inspect that target property's binding for a manual override, another source or an error. An Image Search with no template may have no usable match result even while its capture preview is correct.

[Default Properties](/en/features/default-properties) owns the shared value, [Bindings](/en/features/bindings) connects source to destination, and [capture](/en/triggers/images/imagecapturetriggers) supplies observable pixels. The selected property accepts a window-matching expression; a found rectangle or plain status text is not a substitute for the right property type. Do not create a reverse connection from a trigger into the folder.

To give one check its own window, use its indicator's **Un-bind**, then enter its own Target Window. Editing that unbound field should no longer change the other check. Avoid **Apply to All** here: it can replace additional checked defaults and existing descendant bindings.

For a lasting selector, use a stable [matching expression](/en/features/window-matching-expressions) and recheck the resolved window after reopening it. Finish the recognizers separately with [Image Search](/en/triggers/images/image-search) or [Color Search](/en/triggers/images/color-search). This setup has no input action. An input action added later may have its own or an inherited default binding; inspect its resolved target, backend and focus requirements separately rather than treating capture selection as permission to deliver input.
