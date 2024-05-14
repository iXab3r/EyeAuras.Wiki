---
title: Image Search
description: allows you to specify an image for EyeAuras to search within a captured window or region. Supporting transparent images, it employs optimization techniques for efficient, fast search.
published: true
date: 2024-05-14T11:17:25.420Z
tags: 
editor: markdown
dateCreated: 2023-06-18T13:24:03.149Z
---

Image Search Trigger is a powerful tool within EyeAuras that allows you to specify an image that EyeAuras will search for within a captured window or a specific region of it. This feature even supports the search for transparent images, making it versatile and easy to use. While it's equipped with several image search optimization techniques for speed and resource efficiency, try to narrow down the search region as much as possible for optimal performance.

### **Target Window**

This field lets you specify the window where EyeAuras should look for the image. You can do this by providing a [_Window Match Expression_](https://wiki.eyeauras.net/e/en/window-match-expressions).

### **Image**

This field is where you load the image you want EyeAuras to search for within the target window. This image is preserved within the trigger and it can be loaded from a file. The file itself won't affect the operation of EyeAuras once the image is loaded. Transparent images are also supported and EyeAuras will discard parts which are marked as transparent during comparison.

### **Match Threshold**

The Match Threshold represents the level of similarity between the selected image and the captured image content from the target window. If this similarity percentage reaches or exceeds the threshold, the trigger will activate. If it falls below, it will deactivate.

### **Capture Options**

These options, which include Max/Min FPS, region, and more, are similar to those in Color Search, ML Search, and Text Search. Use these options to refine the search process. [/en/triggers/images/imagecapturetriggers](/en/triggers/images/imagecapturetriggers)

Remember, the Image Search Trigger, like all other triggers in EyeAuras, can be used in combination with any other triggers and actions. This makes it a highly versatile tool in your EyeAuras toolkit.

Note: While this trigger is designed for high performance, even in negative scenarios (where the image isn't found), the cost of a search can still be significant. Therefore, refining your search region as much as possible is recommended. If your use-case involves the rotation or scaling of the image, consider using ML Search, a machine-learning-powered image search that doesn't mind such transformations.

**Gaming Applications Examples:**

-   **Gameplay Automation:** In a game where you need to interact with a particular icon or character, you can use the Image Search Trigger to identify the presence of that icon or character within the game window. Once identified, you can couple this trigger with an action to automate gameplay.
-   **Monitoring Application States:** If a particular image or icon appears only when an application is in a certain state, you can use the Image Search Trigger to monitor that state. For example, a specific icon might appear on your email application only when you have unread mail. You could use the Image Search Trigger to activate an action when the icon appears, notifying you of the unread emails.
-   **Ability Cooldown Detection:** In games with abilities or spells that go on cooldown after use, you can set an Image Search Trigger to identify the 'on-cooldown' icon. When it disappears, you can activate an action to notify you that the ability is ready.
-   **Loot Detection:** In loot-based games, you can use the trigger to identify rare loot drop icons. Once identified, you can automatically play a notification, alerting you
-   **Enemy Recognition:** If you're playing a game where specific enemies need to be targeted, this trigger can recognize the enemy's icon or image and then use the "Send Input" action to target them.
-   **Health/Mana Bar Monitoring:** Use it to detect the 'low-health' or 'low-mana' icon in games. When detected, it can trigger an action to automatically use a health or mana potion.
-   **Player Status Monitoring:** Monitor player statuses like 'Stunned', 'Silenced', etc., in MOBA or MMORPG games. When the status icon disappears, an action can be triggered to resume attack or casting spells.
-   **Mini-Map Monitoring:** You can detect specific events on the mini-map such as enemy movement, pings, etc., and trigger a 'Send Network Message' action to alert your team.
-   **Item or Resource Gathering:** In games where you gather resources or items, you can use the trigger to detect the 'resource depleted' or 'inventory full' icon and automatically switch to a different task.
-   **Menu Navigation:** For games that require complex menu navigation, you can use the Image Search Trigger to detect specific menu icons or elements and automate the navigation process with "Send Input" action.
-   **AFK Detection:** Some games display a specific icon or image when the player is AFK. You can set a trigger to detect this and automatically perform an action to prevent the AFK state.
-   **Game State Monitoring:** In a game that has different phases (day/night cycle, safe zone/war zone, etc.), you can use the trigger to detect the icons representing these states and perform appropriate actions. For example, in a day/night cycle game, you could use the Image Search Trigger to activate 'night vision' when the 'night-time' icon appears.