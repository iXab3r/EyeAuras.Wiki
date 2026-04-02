---
title: Execute Aura
description: Reference page for Execute Aura.
published: true
date: 2022-11-02T15:04:00.781Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T15:03:59.667Z
---
# Execute Aura

As auras grow more and more complex over time, EyeAuras keeps adding tools borrowed from classic programming. The new **ExecuteAura** action type is essentially a method call, or simply a function call.

It runs **all** actions declared in the linked aura, one after another. If any one of them finishes with an error, the whole chain is interrupted.

In practice, this lets you define separate logical blocks such as “Go to town” or “Store items in the warehouse”, while keeping the logic that calls those actions elsewhere.

This has actually been available for a long time through the **C# Script** action, which can do this and much more. But sometimes writing a script is overkill. Besides, nothing stops you from