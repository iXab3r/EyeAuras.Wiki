---
title: Bindings
description: connect trigger, action, and overlay properties to simplify editing shared settings and enable more advanced workflows
published: true
date: 2024-05-14T19:33:23.176Z
tags: eyeauras, привязки, динамические связи, пользовательский интерфейс, ai-translated
editor: markdown
dateCreated: 2023-06-18T19:03:50.558Z
---

# Bindings — edit a shared value in one place

If the same reminder belongs in two places on screen, bind one Text overlay's content to the other's. Updating the source text then updates the destination. Each aura keeps its own visibility conditions.

## Show the same text in two overlays

1. Create two auras named “Original reminder” and “Copy reminder”. Give each a [Fixed Value](/en/triggers/fixed-value) trigger set to Is Active and a [Text](/en/overlays/text) overlay.
2. In the first overlay, set **Content** to “Check the microphone before recording”. Place the two overlays apart so you can see both.
3. Click the small binding indicator beside **Content** in the second overlay. This opens **Binding editor**.
4. In the tree on the left, select “Original reminder”. On the right, expand **Overlays → Text**, find **Content** and click **bind** on that row.
5. Change Content in the first overlay to “Check complete”.

Both overlays show the new text. The second field is now controlled by the binding, so edit the source. The connection runs from the first Content to the second; it does not create a reverse connection.

To give the second overlay its own text again, open its indicator's context menu, choose **Un-bind**, then enter the value manually.

## Read and change a binding

| Control | Meaning or action |
| --- | --- |
| Black indicator | No binding. Click to open Binding editor; in older interfaces the indicator is to the right of the field. |
| Property row and bind | Selects the source value. The editor offers compatible types and available conversions. |
| Variables | Selects a variable rather than a component property as the source. |
| Bind to Default | Connects the property to its corresponding [default value](/en/features/default-properties). |
| Un-bind | Removes the selected property's connection. |
| Red indicator or error message | The binding cannot supply its value. Open the editor and read the cause, such as a missing source or a failed conversion. |

A source can be a trigger, action or overlay property, a variable, or a default setting. For one target window shared by a whole folder, defaults are usually the simpler starting point.

## Pass a found region to an action

Another use is connecting [Send Sequence](/en/actions/sendinput/send-sequence) coordinates to an [Image Search](/en/triggers/images/image-search) result. First configure the search and verify that it finds the intended sample.

![Image Search finds the sample in the captured window](https://s3.eyeauras.net/media/2024/05/EyeAuras_UI8lFRWwXXDhwU3C.png =x600)

In the older editor below, the action's coordinate binding uses **BoundsScreen**, the found region in screen coordinates. **BoundsWindow** belongs to the window coordinate space; do not substitute one for the other without matching the action's coordinate settings.

![BoundsScreen selected as the coordinate source for Send Sequence](https://s3.eyeauras.net/media/2024/05/EyeAuras_tvwf43szJFbWMDuc.png =x600)

A coordinate binding does not perform a click or decide when to run it. Put the action in the appropriate group, such as the search aura's On Enter, and configure its [coordinate system](/en/features/coordinate-system) separately.

Bindings work within one EyeAuras instance, not across profiles running as separate instances. Export/import preserves them with the configuration; include their source objects when transferring it. Values update when the source changes, but the cost of the complete setup also depends on what its components do.
