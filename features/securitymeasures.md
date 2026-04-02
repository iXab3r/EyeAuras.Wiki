---
title: Detection Evasion
description: Methods and guidance for avoiding detection
published: true
date: 2025-03-12T23:19:10.881Z
tags: безопасность, защита, программирование, ai-translated
editor: markdown
dateCreated: 2022-12-20T17:27:54.469Z
---
Because the program may be blocked by some anti-cheat systems (for example, Active Anticheat in Lineage 2), EyeAuras includes built-in tools to help reduce the risk of detection.

**IMPORTANT! EyeAuras must be started BEFORE launching your game.**

## No injection

Everything the app does, it does without modifying the game or its files. This means that any active protection system that periodically checks for installed hooks and similar changes will not find anything there.

The only way to detect the app is to find it on the system itself, and protection against that is being continuously improved.

## Container encryption — first layer of protection

The application is packaged as a single encrypted executable with no signatures, and all files required for its operation are embedded directly into the application itself.

## Module encryption — second layer of protection

Every operation the app can perform is implemented as a separate “module” — computer vision, input emulation, communication, and so on. These are packed into separate libraries, each with a unique signature for every new version.

## "Security Measures" option

This option is available in the application settings and enables several additional steps intended to protect the program from detection. Startup time will increase, and in some cases this may add up to 1 extra minute.

## Additional tips

- The safest way to use any bot is with multiple PCs and streaming. In that setup, EyeAuras never runs on the same PC as the game, which makes detection nearly impossible, especially if you also take extra steps such as choosing a hardware input emulation device (KMBox or Usb2Kbd).
- Whenever possible, prefer the [packed](https://wiki.eyeauras.net/en/changelogs/6736) version of scripts. By packing auras and scripts, we can make detection extremely difficult.