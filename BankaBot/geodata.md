---
title: Geodata
description: Why BankaBot uses geodata, why it is installed separately, and what it enables
published: true
date: 2026-03-08T15:40:00.000Z
tags: BankaBot, Lineage 2, геодата, навигация, маршруты, ai-translated
editor: markdown
dateCreated: 2026-03-08T15:40:00.000Z
---
# What Is Geodata

Geodata is data about the game world that helps the bot understand where it can move and where it cannot.

Put simply, it is the foundation of proper navigation. Without it, the bot may still see its target, but it will have a much harder time figuring out how to actually reach it.

## Why It Matters

Geodata becomes important anywhere that “just run in a straight line” stops working:

- walls
- height differences
- complex map layouts
- obstacle avoidance

This is what enables more reliable movement, route building, and navigation in general.

## Why It Is Downloaded Separately

Geodata is a separate data set, not part of the main program itself.

That is why it is distributed separately:

- the program does not have to include extra large files
- the geodata set can be updated independently
- if needed, you can import your own version from a folder or an archive

In `BankaBot`, you already have ready-made options for this:

- download a prepared set directly from the program
- import geodata from a folder
- import geodata from an archive

> Placeholder image: Geodata Management section in BankaBot settings

## What It Enables in Practice

Once geodata is connected, the bot gets a much more useful foundation for:

- route building
- movement between points
- limiting the farming area
- minimap and navigation features

So geodata is not just “another strange file” — it is a core part of routes and movement.

## Getting Started

The process is simple:

1. Open the bot settings.
2. Find the geodata section.
3. Download a prepared set or import your own.
4. Make sure the source is selected.
5. Then move on to routes, the minimap, and movement setup.

## Things to Keep in Mind

- If geodata is missing, some navigation features will be noticeably weaker.
- If the geodata does not match a specific server or chronicles version, pathing may behave strangely.
- If a route behaves illogically, check the geodata first before troubleshooting the bot logic itself.

> Placeholder image: minimap or route with a clear example of geodata helping the bot avoid an obstacle