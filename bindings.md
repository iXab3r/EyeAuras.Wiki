---
title: Bindings
description: interconnect properties between triggers, actions, and overlays to allow for easier change of group properties and to open up new capabilities
published: false
date: 2023-06-18T19:03:51.651Z
tags:
editor: markdown
dateCreated: 2023-06-18T19:03:50.558Z
---

# Inspect a binding in an older configuration

When an imported field no longer accepts a manual value, check whether it receives its value from another property. A binding connects a source to a target within one EyeAuras instance. [Bindings](/en/features/bindings) is the main current-editor guide; this page provides a short route for inspecting an older configuration.

## Link two text values

1. In your own active aura, add two **Text** overlays, **Source** and **Copy**. Set Source's **Content** to `Ready`.
2. Click the binding indicator for Copy's **Content**. In **Binding Editor**, select the aura, Source overlay and its **Content**, then **bind**.
3. Change Source's Content to `Paused`. Both overlays should show it. This one-way binding does not write Copy's changes back to Source.
4. To restore an independent target field, open its indicator's context menu and select **Un-bind**, then set its own text.

Earlier UI showed a black rectangle beside the field. Identify the property and indicator rather than relying on the rectangle's old position.

| Check | Meaning |
| --- | --- |
| Source | The object/property path, variable or default supplying the value; it must exist |
| Target | The property whose Binding Editor you opened; updates flow towards it |
| Value type | Choose compatible values and supported conversions; matching field names are not sufficient |
| Black indicator | No binding |
| Bound indicator color | Depends on property, variable or default binding; red indicates a failed binding |
| Editor error | Read the cause. A removed source and a conversion error need different corrections; arbitrary repair is not automatic |
| Bind to Default | Uses the corresponding [default property](/en/features/default-properties) |

## Apply the older examples correctly

| Goal | Required check |
| --- | --- |
| Share a window across triggers | Bind Target Window in the right direction or use a common folder setting |
| Share a checking rate | Take Target FPS from one source or variable. Overall cost also depends on the triggers' actual work |
| Act on a search result | Use the real found bounds and compatible screen/window coordinates. A binding alone does not click |
| Connect overlay position and search region | Check direction, coordinates and offset; one link is not bidirectional synchronization |
| Control userTargetFPS from custom UI | Have the UI change an explicitly supplied variable or property, then bind the target. Razor does not inherit Script.csx globals |
| Export or import a set | Binding settings travel with it, but the necessary objects must be included. Arbitrary code strings and external references are not automatically repaired |

Bindings observe changes and use expressions. They do not synchronize independent processes or profiles, and their cost is not universally zero. Conditional values and transformations need a supported context rather than an assumed future feature.

For a concrete result region, read the [current binding example](/en/features/bindings) and [coordinate system](/en/features/coordinate-system). [Dependencies Viewer](/en/overlays/dependencies-viewer) shows linked-aura conditions; it is not a complete view of every property binding.
