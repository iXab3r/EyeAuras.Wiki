---
title: Rules and OSD
description: How object show, hide, and highlight rules work in BankaBot
published: true
date: 2026-03-08T15:40:00.000Z
tags: BankaBot, Lineage 2, правила, радар, OSD, подсветка, ai-translated
editor: markdown
dateCreated: 2026-03-08T15:40:00.000Z
---
# What Rules Are

In `BankaBot`, rules control how the bot displays objects around you.

You can use them to:
- show the targets you actually care about
- hide unnecessary clutter
- highlight players, `NPC`s, clan members, and allies separately
- change colors, backgrounds, and visual emphasis for important objects

In short, rules are the system for filtering and highlighting objects.

# What OSD Is

`OSD` is everything the bot draws on top of the game: markers, lines, highlights, and service information.

Rules and `OSD` work together:
- a rule decides what should be considered important
- `OSD` makes that importance visible on screen

For example, you can make dangerous targets stand out more clearly, while keeping secondary objects from cluttering the interface.

> Placeholder image: example of radar and OSD where dangerous targets are highlighted more brightly than the others

# What You Can Filter By

Rules can be built using straightforward conditions:
- name
- clan
- distance
- whether the object is a player or an `NPC`
- whether the target is in combat
- whether the target is alive or dead
- `HP`, `MP`, and `CP` values
- whether the clan is your own or allied

That is already enough for most common use cases.

# What a Rule Can Change

When a rule matches, it can:
- show an object
- hide an object
- change text color
- add a background
- add a border
- add font emphasis

So a rule does more than filter — it also defines the visual style.

# Rule Priority

The order of rules matters. Rules higher in the list have higher priority than rules below them.

In practice, a good setup looks like this:
- keep broad, general rules lower in the list
- place more specific and important exceptions above them

For example, you can first show all players, then place a higher rule above that to recolor enemy characters with a more noticeable color.

# Simple and Advanced Rules

There are two convenient ways to work with rules.

1. **Simple rule**  
   Useful when you need one clear condition, such as “all players within 1000” or “all `NPC`s of this type.”

2. **More advanced rule**  
   Useful when you want to combine multiple condition blocks and define exceptions separately.

This is helpful when you do not just want to “show everyone,” but instead want to show all players except clan members and allies.

> Placeholder image: rule editor with one simple rule and one more advanced exception rule

# Other Useful Notes

`BankaBot` includes built-in basic categories for players, `NPC`s, clan, and alliance. That makes a good starting point, even if you do not want to dive into fine-tuning yet.

Another useful detail: if highlighting or hiding does not work the way you expected, the editor helps you understand which rule actually won. That makes setup much easier.

# Where to Start

- Start with 2–3 simple rules, not ten at once
- Begin by hiding clutter and highlighting what really matters
- Do not try to color everything, or the interface will become noisy
- Add complex exceptions only after the simple setup already works