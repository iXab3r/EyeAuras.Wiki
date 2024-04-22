---
title: Permission Model
description: 
published: true
date: 2024-04-22T09:32:18.152Z
tags: permissions, folder restrictions, user privileges, folder ownership, password protection
editor: markdown
dateCreated: 2024-04-20T10:52:21.002Z
---
## What is this about?
You can set specific restrictions for each folder:
- Default / No restrictions: no limitations, any user can do anything with the folder.
- Configurable: users can edit existing auras/trees but cannot add new ones or delete old elements.
- Read-Only: users can only view the folder's contents but cannot modify them.
- Private: users cannot even view the contents.

> The folder owner can do anything with it; restrictions do not apply to them.
{.is-info}

## Why?
In some cases, especially if your pack is based on complex logic, it makes sense to impose restrictions on folders. This way, users can see where their intervention is expected and which parts should not be touched, thus avoiding issues like "I changed something here and now it doesn't work."
In some cases, you may want to hide how you implemented a particular functionality to prevent copying or resistance.

## How does it work?
Currently, the permission mechanism consists of three things:
- Folder owner: the user who initially set the restrictions. They have full control over the folder, being able to change its contents in any way and add/remove restrictions.
- Folder password (optional): the folder owner can optionally set a password that temporarily elevates the current user's privileges to the maximum level. This can be used, for example, to make changes without logging back into their account.
- Level of restrictions: as mentioned above, the Default/Configurable/Read-Only/Private levels determine what is available to regular users.

In the context menu of each folder, there is a Permissions section where you can choose the level of restrictions you want to set.
> This feature is only available to authorized users.
{.is-info}

![](https://i.imgur.com/Z9qXakW.png)

After setting the level of restrictions, the folder's header will indicate the selected level and by whom.

This is how the header looks when you own the folder.
![](https://i.imgur.com/WhQhQou.png)
And this is how it looks when someone else owns it.
![](https://i.imgur.com/oAiE2Ws.png)

## How to set a password
If you have sufficient rights, there will be an `Add password` button in the folder's header.
![add password](https://i.imgur.com/SoOHI6y.png)

After setting the password, the "Unlock" functionality will be available, which unlocks the folder with the password.
![unlock](https://i.imgur.com/hfnrqwb.png)

If the folder is unlocked, you can lock it again or remove the password altogether.
![lock/remove password](https://i.imgur.com/7F3Rm7l.png)

## More details on settings

# Default
By default, no restrictions are imposed on the folder - you can delete and add elements such as auras and behavior trees.
![](https://i.imgur.com/cqH4pvI.png)

# Configurable
At this restriction level, you cannot delete or add elements, but you can modify the settings of existing ones, for example, change the capture zone or window name.
![](https://i.imgur.com/49AsqnH.png)

# Read-Only
In this mode, the folder's contents cannot be modified - neither adding/deleting anything nor editing the settings of existing auras.
![](https://i.imgur.com/a8mrtb4.png)

# Private
The private mode hides auras' contents from view - they cannot be changed or exported.
![](https://i.imgur.com/Yjnrr82.png)