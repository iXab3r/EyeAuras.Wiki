---
title: Timer
description: 
published: true
date: 2024-05-14T10:36:43.746Z
tags: 
editor: markdown
dateCreated: 2022-12-20T17:30:47.018Z
---

The Timer trigger in EyeAuras oscillates between Active and Not Active states over specified time intervals. This function can be incredibly useful in gaming contexts, where specific actions or sequences need to occur or cease after certain periods.

### **Configuration Options**

-   **Active Period**: This option lets you set the duration (in milliseconds) for which the trigger will remain active. For example, setting this to 5000 ms will keep the trigger active for 5 seconds before it reverts to the Inactive state.
-   **Inactive Period**: This sets the duration (in milliseconds) that the trigger will stay in the Inactive state before switching back to active. If set to 15000 ms, the trigger stays inactive for 15 seconds before becoming active again.

With these two settings, the Timer trigger works in a continuous cycle, switching between Active and Inactive states based on your preferences.

### **Gaming Applications**

-   **Automated Skill Usage**: In certain games, skills or abilities may have cooldown periods. The Active period can be set to coincide with the cooldown duration, automating the use of skills as soon as they become available.
-   **NPC Interaction**: For games requiring regular interaction with NPCs (like shop visits or dialogue), the Timer trigger can automate these interactions, using the Inactive period to time the intervals between visits or interactions.
-   **Resource Gathering**: In resource-intensive games, the Timer trigger can automate the collection or farming process, with the Active period determining the collection action, and the Inactive period setting the wait time between gatherings.

The Timer trigger's flexibility allows for a multitude of applications in gaming, providing an easy way to automate time-specific actions, and maximizing efficiency.