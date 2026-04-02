---
title: Text File
description: A file containing plain text.
published: true
date: 2022-11-02T14:59:35.793Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T14:58:25.417Z
---
# File Contains Text

The name is fairly literal: this trigger scans a file for specific text. It supports regular expressions and lambdas, similar to **Text Search**.

When the file changes, the trigger automatically recalculates its state.

Be careful with large files: the current version loads the **entire** file into memory every time it changes in order to analyze it. In most cases this is not a problem, but some files can be very large and update very frequently. For example, the **Path Of Exile** log can be 100+ MB and may change constantly. If you try to scan a file like that, memory usage can become unreasonably high.

This trigger is mainly intended for configuration files and similar scenarios. Support for tracking and scanning only the **newly added** part of a file—for example, when a new line appears and the parser processes only that line without re-reading the rest of the file—will be added in a separate update.

![](https://eyeauras.net/uploads/Eye_Auras_G_Dg_ZZXCF_Iq_6de4aae847.png)