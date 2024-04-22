---
title: Permission Model
description: 
published: true
date: 2024-04-20T10:54:29.537Z
tags: permissions, folders, restrictions, settings
editor: markdown
dateCreated: 2024-04-20T10:52:21.002Z
---
## What is this about?
You can set specific restrictions for each folder:
- Default / No restrictions: no limitations, any user can do anything with the folder.
- Configurable: users can edit existing auras/trees but cannot add new ones or delete old elements.
- Read-Only: users can only view the folder's contents but cannot modify them.
- Private: users cannot even view the contents.

> The folder owner has full control over it; restrictions do not apply to them.
{.is-info}

## Why?
In some cases, especially if your pack is based on complex logic, it makes sense to impose restrictions on folders. This way, users can see where their intervention is expected and which parts should not be touched, thus avoiding the problem of "I changed something here and now it doesn't work." In some cases, you may want to hide how you implemented a particular functionality to prevent copying or resistance.

## How does it work?
In the context menu of each folder, there is a Permissions section where you can choose the level of restrictions you want to set.
> This feature is only available to authorized users.
{.is-info}

![](https://i.imgur.com/Z9qXakW.png)

After setting the level of restrictions, the folder's header will indicate the selected level and by whom.

This is how the header looks when you own the folder.
![](https://i.imgur.com/WhQhQou.png)
And this is how it looks when someone else owns it.
![](https://i.imgur.com/oAiE2Ws.png)

## More details on settings

# Default
By default, no restrictions are imposed on the folder - you can delete and add elements such as auras and behavior trees.
![](https://i.imgur.com/cqH4pvI.png)

# Configurable
At this level of restrictions, you cannot delete or add elements, but you can modify the settings of existing ones, for example, change the capture zone or window name.
![](https://i.imgur.com/49AsqnH.png)

# Read-Only
In this mode, the folder's contents cannot be modified - neither adding/deleting anything nor editing the settings of existing auras.
![](https://i.imgur.com/a8mrtb4.png)

# Private
The private mode hides auras' contents from view - they cannot be changed or exported.
![](https://i.imgur.com/Yjnrr82.png)