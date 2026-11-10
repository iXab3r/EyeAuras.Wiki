---
title: "Observe a typed counter until Stop"
description: "Observe one owned aura variable, increment it once per second and release the subscription when the script stops."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Observe a typed counter until Stop

Watch a known counter in **Event Log** while its script is running. The number lives on your own aura; the observer and loop belong to one Run.

1. Create an editable test aura through **Add new → New Aura**, name it `RecipeCounter`, and add **C# Script** under **Actions → On Enter**. Use its manual **Run** button for this exercise, with no automatic activation or other actions changing the counter.
2. Use the fresh variable name `recipeSessionCounter` on this aura and its ancestors. Replace the complete top-level **Script.csx** with the file below; no extra package is needed in this EyeAuras script host.
3. Wait for compilation, click **Run**, and open the action's **Event Log**. The observer first reports `0`, then `1`, `2`, `3` as the loop writes after each 1000 ms delay.
4. Click **Stop**. The cancellable delay ends, `Counter stopped` is logged, and leaving the block disposes the observer. Run again: the explicit assignment starts this session at `0`.

| Choice | Meaning |
| --- | --- |
| `AuraTree.Aura` | The aura containing this C# Script action; this recipe requires that aura context. |
| `Variables.Get<int>(owner, "recipeSessionCounter")` | A typed handle to that owner's integer entry, not a new independent container. |
| `counter.Listen()` | Reads the current value and observes distinct changes for this name. |
| `1000` | Milliseconds between writes after each completed delay; not a precise clock guarantee. |

## Script.csx

```csharp
using System;
using System.Reactive.Linq;
using System.Threading.Tasks;

{
    var owner = AuraTree.Aura;
    var counter = Variables.Get<int>(owner, "recipeSessionCounter");
    counter.Value = 0;
    using var observer = counter.Listen().Subscribe(
        value => Log.Info($"Observed counter: {value}"));
    try
    {
        while (true)
        {
            await Task.Delay(1000, cancellationToken);
            counter.Value++;
        }
    }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
    {
        Log.Info("Counter stopped");
    }
}
```


The integer is a supported simple configuration value: it can survive recompilation and participate in saved aura configuration. This recipe deliberately resets it on each Run. Stop does not remove the entry; inspect the aura's **Variables** to see the last stored value. For a purely temporary counter, a local C# variable would have a different lifetime.

The aura and variable handle are borrowed references; do not dispose the aura. Only the `Listen()` subscription is owned here. Awaiting the loop keeps that subscription alive until Stop. An independent variable edit can also produce an observed value while the loop is running.

[Variable lifetimes](/en/scripting/examples/basic/variables) explain storage choices; [finding your own aura](/en/scripting/examples/basic/find-aura) lets another script select the same owner explicitly. A variable write only reaches consumers that actually read or bind to it. `Log`, `AuraTree`, `Variables` and `cancellationToken` here are top-level script capabilities, not globals in an ordinary helper or Razor component.
