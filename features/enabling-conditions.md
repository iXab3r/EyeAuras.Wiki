---
title: Enabling Conditions
description: 
published: true
date: 2024-05-14T11:16:19.224Z
tags: 
editor: markdown
dateCreated: 2023-02-16T20:13:29.512Z
---

In many-many scenarios you do not really want for **ALL** your auras to work - process data, do image/text search, scan files, etc. You may need only a subset of them active at any given moment under some set of conditions.

> For example, imagine that you have a set of auras that scans your screen and tries to find some NPC name/image. But you know for a fact, that this NPC only spawns outside city area, which means that whenever you're standing in the city it does not make any sense to do the scanning. Moreover, outside the city doing the scan may lead to false-positive activations of your ImageSearch and nobody wants that.

To solve this problem **Enabling Conditions** were created. At the very core they are **Triggers,** but serve the different purpose. Triggers are responsible for Activating/Deactivating aura and Enabling Conditions are responsible for fully disabling aura. If aura is disabled Triggers are not calculated at all thus preserving CPU/GPU resources AND protecting your scripts from undesired activations. 

**Enabling Conditions** could be created either at:

-   **Folder level** - ALL auras withing this folder will be affected, even inside subfolders. 
-   **Aura level** - only this specific aura will be affected

Parent takes precedence, i.e. if **Folder's** conditions are not met **Aura's** conditions will not even be calculated and Aura will be considered **disabled.**

The same approach applies when there are multiple nested folders with different conditions - if parent folder is disabled (conditions are not met), then sub-folders will be considered disabled as well.