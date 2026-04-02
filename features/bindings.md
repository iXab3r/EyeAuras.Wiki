---
title: Bindings
description: connect trigger, action, and overlay properties to simplify editing shared settings and enable more advanced workflows
published: true
date: 2024-05-14T19:33:23.176Z
tags: eyeauras, привязки, динамические связи, пользовательский интерфейс, ai-translated
editor: markdown
dateCreated: 2023-06-18T19:03:50.558Z
---
# Bindings

Bindings are an advanced EyeAuras feature used to create links between properties of triggers, auras, and actions.

They let EyeAuras keep properties in sync, so when one property changes, the linked property updates automatically.

For example, you might have an [Image Search](/triggers/imagecapturetriggers/imagesearch) trigger and want to configure a click on the detected image.

![](https://s3.eyeauras.net/media/2024/05/EyeAuras_UI8lFRWwXXDhwU3C.png =x600)

A binding is one of the ways to tell the `Send Sequence` action exactly where it should click.

![](https://s3.eyeauras.net/media/2024/05/EyeAuras_tvwf43szJFbWMDuc.png =x600)

## How bindings appear in the UI

Most trigger and action properties have a small black rectangle to the right of the control. This means the property is not currently bound.

Clicking this rectangle opens the Bindings Editor. When you select a trigger or folder, the UI shows a list of triggers, actions, and their available bindable properties.

## FAQ

**Q: Can bindings connect properties across different EyeAuras profiles?**

- A: No. Different profiles in EyeAuras are effectively different running instances of the application. Bindings only work within a single instance.

**Q: Do bindings affect performance?**

- A: No. The bindings system is highly optimized and has no noticeable impact on performance.

**Q: What happens if an error occurs?**

- A: If a binding error occurs, the black rectangle next to the property turns red in the UI. This can happen if the binding source was deleted or if the data types are incompatible. More details are shown in the tooltip.

**Q: Are bindings preserved during export/import?**

- A: Yes.