---
title: Permission Model
description: Overview of the EyeAuras permission model
published: true
date: 2024-04-22T09:35:30.260Z
tags: permissions, folder restrictions, user privileges, folder ownership, password protection, ai-translated
editor: markdown
dateCreated: 2024-04-20T10:52:21.002Z
---
# Why use folder restrictions?

In some cases—especially if your aura pack relies on complex logic—it makes sense to put restrictions on folders. This helps users clearly see where they are expected to make changes and which parts should be left alone, reducing the classic “I changed something here and now nothing works” problem.

Restrictions can also be useful if you want to hide how a particular feature is implemented, to make copying harder or to prevent users from working around your scripts.

# Available restriction levels

You can assign one of the following restriction levels to each folder:

- **Default / No restrictions**: no restrictions at all; the user can do anything with the folder
- **Configurable**: the user can edit existing auras/trees, but cannot add new items or delete existing ones
- **Read-Only**: the user can only view the folder contents and cannot modify them
- **Private**: the user cannot even view the folder contents

> The folder owner can always do anything with it. Restrictions do not apply to the owner.
{.is-info}

# How the permissions system works

At the moment, the permissions system consists of 3 parts:

- **Folder owner**: the user who originally applied the restrictions. This user has full control over the folder—they can change its contents in any way and can also add or remove restrictions.
- **Folder password (optional)**: the folder owner can set a password that temporarily raises the current user's privileges to the maximum level. This can be useful, for example, if you need to make changes without logging back into your own account.
- **Restriction level**: as described above, these are the Default / Configurable / Read-Only / Private modes that define what a regular user is allowed to do.

Each folder has a **Permissions** section in its context menu, where you can choose the restriction level you want to apply.

> This feature is only available to authorized users.
{.is-info}

![](https://i.imgur.com/Z9qXakW.png)

After you set a restriction level, the folder header will show which level is selected and who owns it.

This is what the header looks like when **you** own the folder.  
![](https://i.imgur.com/WhQhQou.png)

And this is how it looks when the folder is owned by **someone else**.  
![](https://i.imgur.com/oAiE2Ws.png)

# How to set a password for a folder

If you have sufficient permissions, the folder header will include an `Add password` button.

![add password](https://i.imgur.com/SoOHI6y.png)

Once a password is set, an `Unlock` option becomes available, allowing the folder to be unlocked with that password.

![unlock](https://i.imgur.com/hfnrqwb.png)

If the folder is currently unlocked, you can lock it again or remove the password entirely.

![lock/remove password](https://i.imgur.com/7F3Rm7l.png)

# Restriction levels in detail

## Default

By default, a folder has no restrictions. You can add and remove items such as auras and behavior trees.

![](https://i.imgur.com/cqH4pvI.png)

## Configurable

At this restriction level, you cannot add or delete items, but you can still modify the settings of existing ones—for example, changing the capture area or the window name.

![](https://i.imgur.com/49AsqnH.png)

## Read-Only

In this mode, the folder contents cannot be changed at all: you cannot add or remove anything, and you also cannot edit the settings of existing auras.

![](https://i.imgur.com/a8mrtb4.png)

## Private

Private mode hides the aura contents from view. They cannot be modified or exported.

![](https://i.imgur.com/Yjnrr82.png)