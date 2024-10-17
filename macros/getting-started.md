---
title: Where to Begin?
description: 
published: true
date: 2024-09-11T21:05:31.704Z
tags: Macros, Automation, Logic, Auras, C# Scripts, Behavior Trees
editor: markdown
dateCreated: 2024-09-11T13:25:48.468Z
---
# What are Macros?
This is one of the four ways to customize automation logic and make decisions on when, what, and where to click.

With them, you can build both linear sequences of actions, for example, a keyboard macro
![Send sequence](https://s3.eyeauras.net/media/2024/09/EyeAuras_BFkTE1sqgpZIrxU0.png)

and create logic of any complexity level with nested loops, conditions, calls to other macros, and C# scripts
![Rebuff](https://s3.eyeauras.net/media/2024/09/EyeAuras_3PAVQO9Zk7JLqDjz.png)

# Why Choose This Option?
The program offers you a choice of 4 ways to model logic:

## 1) [Auras](https://wiki.eyeauras.net/en/home)
Auras appeared at the very beginning when the program was just emerging. The idea is simple - we configure Triggers that react to something, for example, the appearance of an image on the screen, a character's HP drop, or receiving a network message. Once the trigger is activated, the Aura triggers a sequence of commands.

This scheme worked well when the program needed to react specifically to external influences, but it was not suitable for building bots since events tend to occur simultaneously, and it was necessary to solve this with workarounds; otherwise, the bot would be torn between two fires.

![Main window](https://eyeauras.net/assets/img/appimages/EyeAuras_OzDyUnmzFH.webp =x400)

## 2) [C# scripts](https://wiki.eyeauras.net/en/scripting/getting-started)
As a universal solution, support for C# scripts was added. This removed any restrictions and, in general, allowed writing any logic as the user desired. The only drawback was that this option required programming skills, and in some cases, it was easier to do nothing than to deal with scripts.
Moreover, the logic of building bots does not always fit well into code; for example, describing rotations is quite challenging - cooldowns need to be tracked, a priority system needs to be built, and so on. Yes, this can be solved with code, but it complicates life. It was desired to have a tool that would address these shortcomings.

![](https://upload.wikimedia.org/wikipedia/commons/d/d2/C_Sharp_Logo_2023.svg =x100) ![](https://devblogs.microsoft.com/aspnet/wp-content/uploads/sites/16/2019/04/BrandBlazor_nohalo_1000x.png =x100) ![](https://upload.wikimedia.org/wikipedia/commons/2/2a/Roslyn.png =x100)

## 3) [Behavior Trees](https://wiki.eyeauras.net/en/behavior-trees/gettings-started)
This is how behavior trees emerged. This mechanism has proven its viability in games and is actively used in game engines like Unity and Unreal for building NPC logic. They are simply ideal for some situations - for example, setting up skill rotations. For others, scripts are still better. And there has always been a problem with trees - they are very powerful but quite complex to understand; it takes some time before the "click" idea comes. If you multiply this by the fact that the program itself is also not simple, we get a multiplication of complexities, which deters a huge part of users and essentially makes the tool inaccessible.
Something simultaneously simpler yet with similar capabilities was needed.

![bt_l2.spoil.old.png](/assets/bt_l2.spoil.old.png)

## 4) Macros (you are reading about them right now)
And this brings us to the current option. Macros differ from auras, behavior trees, and scripts. However, they allow combining ALL existing methods in one place.
Essentially, they are just a sequence of command blocks that you can run using triggers - via a hotkey or when finding an image. In this sense, macros are somewhat similar to auras - they also need to be activated somehow.
The key difference is that macros are not required to execute quickly; they can last as long as needed and can combine any number of commands, transitions, loops, and conditions.
That is, you can write a macro that simply sends a chain of key presses, or you can dive deep and describe the entire bot logic in one macro.

![](https://s3.eyeauras.net/media/2024/09/EyeAuras_T3Uzq8Dvahwa1sTq.png)

# How are Macros Activated?
Like auras and behavior trees, macros are activated using [Enabling Conditions](https://wiki.eyeauras.net/en/features/enabling-conditions) - you create an aura, add a trigger to it, for example, [HotkeyIsActive](https://wiki.eyeauras.net/en/triggers/hotkey-is-active). Then you link this aura as a condition to trigger the macro. Once the condition is met, for example, you press a button, the macro will run.

![Enabling conditions](https://s3.eyeauras.net/media/2024/09/EyeAuras_cTJ0Uf3NQzi7gF1u.png)

There are several options for what will happen when the macro is triggered. This is configured in the **When Activated** block.
![When activated](https://s3.eyeauras.net/media/2024/09/EyeAuras_A48Sp2u234hI9o3F.png)

## Execute Once
The option speaks for itself. Upon meeting the condition, the macro will run once and then end.

## Execute Repeatedly
This option allows you to set up a mode where your macro will run periodically, with some delay between cycles. This will happen only as long as the activation condition is met.