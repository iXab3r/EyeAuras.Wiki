---
title: Rules and OSD
description: How object show, hide, and highlight rules work in BankaBot
published: true
date: 2026-03-08T15:40:00.000Z
tags: BankaBot, Lineage 2, правила, радар, OSD, подсветка, ai-translated
editor: markdown
dateCreated: 2026-03-08T15:40:00.000Z
---

# Highlight objects with BankaBot rules

Make an object display easier to read by giving one group of players a neutral style and a more specific group a visible accent.

These are the display rules described for the historical BankaBot edition, not licensing rules. They require object attributes supplied by the matching component. A rule name does not make ordinary EyeAuras read a game's player, clan or health data.

## Start with two rules

1. In the edition's rule editor, define a general rule for players and give it a neutral appearance.
2. Add a specific exception for players who are neither in your clan nor in an allied clan. Use the supplied clan and alliance attributes rather than assuming that an object named “enemy” exists.
3. Place the exception above the general rule and give it a distinct color or emphasis. The documented priority is top to bottom, with more specific rules above general ones.
4. Compare an object from each group. Check its supplied attributes and the winning rule before adding more conditions.

The expected display distinguishes the selected groups. Highlighting an object does not choose it as a target or issue an attack command.

## Choose conditions and appearance

| Documented condition | What to establish first |
| --- | --- |
| Name or clan | Which supplied object fields the rule compares |
| Distance | The edition's distance units and reference point; a condition such as “players within 1000” is not a universal distance in metres |
| Player or NPC | The supplied object category |
| In combat, alive or dead | The component's actual state values |
| HP, MP or CP | The availability and meaning of the supplied values |
| Own or allied clan | The edition's clan and alliance information |

| Display choice | Purpose |
| --- | --- |
| Show or hide | Reduce clutter or keep a category visible |
| Color, background or border | Distinguish the matching group |
| Font emphasis | Draw attention to an important label |
| OSD markers, lines, highlights and service information | Apply visual emphasis where the edition supports those displays |

The historical description included base categories for players, NPCs, clan members and allies, as well as help identifying the winning rule. Use that information to explain an unexpected appearance; do not infer an undocumented rule-merging algorithm from the result.

<details>
<summary>Build a more complex rule gradually</summary>

Rules can combine several condition blocks and exceptions. First make two or three simple rules understandable, then add one condition at a time. For example, add distance to the non-clan, non-allied player group only after the basic classification is correct.

The order of display rules determines visual priority. It is separate from the order of actions in a [behavior tree](/en/BankaBot/behavior-trees) or [script](/en/BankaBot/scripting/getting-started). An OSD or radar can display supplied object information without controlling those objects.

</details>

Return to [Getting started](/en/BankaBot/getting-started) if the required object data is unavailable in your edition.
