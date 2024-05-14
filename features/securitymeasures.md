---
title: Anti-detection
description: 
published: true
date: 2024-05-14T11:16:55.906Z
tags: 
editor: markdown
dateCreated: 2022-12-20T17:27:54.469Z
---

Considering the fact that program could be a subject to block for some anti-cheating systems (e.g. for Lineage 2 it is Active Anticheat), there are some built-in tools to avoid detection. 

**IMPORTANT! EyeAuras must be launched PRIOR to start of your game.** 

## No injection!

Everything that application does it does without altering game or its files. This ensures that any active kind of protection which periodically checks for installed hooks and such will show nothing. The only way to detect the app is by finding it in the system and counter-measures against it are constantly improving.

## Container encryption - first layer of protection

Application is packed into a single encrypted executable, which lacks any signatures and all the files that are needed for app to work are packed right into the app itself.

## Modules encryption - second layer of protection

Each and every operation that the app can do is shipped as a separate “module” - computer-vision, input simulation, communications, all of these are packed into separate libraries each of which has unique signature every new version.

## "Security Measures" option

This option sits in app Settings and enables few additional steps that try to protect the program from detection. Application start-up time will increase, in some cases it may take for up to 1 extra minute. 

## Additional tips

-   The safest way to bot is using multiple PCs and streaming - that way EyeAuras is never running on the same PC where a game resides, making detection practically impossible, especially if you'll do some extra steps such as pick hardware input emulator (KMBox or Usb2Kbd)
-   If possible, prefer to use [packed](https://wiki.eyeauras.net/en/changelogs/6736) version of scripts. This is the new development and is still at early stages, but by packing auras and scripts, we can make detection extremely hard.