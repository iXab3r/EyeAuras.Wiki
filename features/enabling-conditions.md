---
title: Enabling Conditions
description: 
published: true
date: 2024-05-14T11:16:19.224Z
tags: 
editor: markdown
dateCreated: 2023-02-16T20:13:29.512Z
---

# Enabling Conditions — run a group only when needed

A group of visual checks may only be useful while you are inspecting something. Put the auras in a folder and give that folder **Enabling conditions**. When permission is withdrawn, the child auras stop working, including their ordinary trigger calculations.

An ordinary trigger answers “is this aura's condition met?” An enabling condition answers “should this aura run at all?” This can avoid unnecessary image or text searches; it does not supply the data those searches need.

## Hold a key to enable a group of reminders

1. Create a folder named “Inspection mode”. In **Enabling conditions**, add [Hotkey Is Active](/en/triggers/hotkey-is-active), choose an unused F8 key and select **Hold**. Leave this as the only enabling condition for now.
2. Inside the folder, create a “Reminder” aura. In its ordinary **Triggers**, add [Fixed Value](/en/triggers/fixed-value) set to **Is Active**.
3. In **Overlays**, add [Text](/en/overlays/text). Set **Content** to “Check the selected region”, place it on screen and enable **Locked**.
4. Select an aura outside the folder, switch to your working application, then hold and release F8.

The reminder appears while F8 is held and disappears when released. Its words come from Content; the key controls whether the group is allowed to run.

You can now place a configured [Text Search](/en/triggers/images/text-search) in the same folder. First make sure the search works with the correct source window and region on its own.

When the whole group is only useful in your chosen foreground window, use [Window Is Active](/en/triggers/window-is-active) in its Enabling conditions instead of the key in this example. If that window check is already configured in another aura, [Aura Is Active](/en/triggers/aura-is-active) lets you reuse its state rather than duplicate the check.

## Choose the scope

| Location | Effect |
| --- | --- |
| Folder Enabling conditions | Controls its child auras and nested folders. |
| Aura Enabling Conditions | Controls that aura. |
| Aura Triggers | Determines Active / Not Active while the aura is allowed to run. A false ordinary trigger does not by itself stop all other trigger calculations. |

An empty enabling group adds no restriction. With several conditions, check the combination rule in the group header. An unknown combined result does not grant permission. The object must also be loaded to run.

Normally a disabled parent prevents its children's enabling conditions from being evaluated too. There is an editing exception: the selected object can continue evaluating while the EyeAuras window is active. An unlocked overlay also stays visible for placement. Test the restriction after locking the overlay, selecting another object and leaving the editor.
