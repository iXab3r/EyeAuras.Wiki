---
title: "Observe a typed counter until Stop"
description: "Watch one variable of your own aura, add one to it every second and release the subscription when the script stops."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Observe a typed counter until Stop

While the script runs, **Event Log** shows the counter changing. The number is stored in a variable of your own aura. The observer and the loop live within one Run.

1. Create an editable test aura through **Add new → New Aura** and name it `RecipeCounter`. Add **C# Script** under **Actions → On Enter**. Start it by hand with its **Run** button. You need no automatic activation and no other actions that change the counter.
2. Use a new variable name, `recipeSessionCounter`, that is not taken on this aura or its ancestors. Replace the whole top-level **Script.csx** with the file below.
3. Wait for compilation, click **Run** and open the action's **Event Log**. First `0` appears, then `1`, `2`, `3`: the loop writes a new number after each 1000 ms delay.
4. Click **Stop**. The delay is cancelled, `Counter stopped` is logged, and leaving the block disposes the observer. The next **Run** starts from `0` again.

| Choice | Meaning |
| --- | --- |
| `AuraTree.Aura` | The aura that contains this C# Script action. The recipe works only in that context. |
| `Variables.Get<int>(owner, "recipeSessionCounter")` | A typed handle to the integer variable of that owner. |
| `counter.Listen()` | Reads the current value and reports when this variable changes to a different value. |
| `1000` | Milliseconds between writes, counted from the end of each delay. |

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


The integer is a simple configuration value: it can survive recompilation and be saved with the aura's configuration. Here each Run resets it on purpose. Stop does not remove the entry: the last number is visible in the aura's **Variables**.

The script only borrows the aura and the variable handle from the host, so do not dispose the aura. The only thing the recipe owns is the `Listen()` subscription. The loop keeps it alive until Stop. If something else changes this variable in the meantime, that change can show up in the log too.

[Variable lifetimes](/en/scripting/examples/basic/variables) explains which storage to choose. [Finding your own aura](/en/scripting/examples/basic/find-aura) shows how another script can select the same owner explicitly. `Log`, `AuraTree`, `Variables` and `cancellationToken` are available to the top-level script here, but not to an ordinary class or a Razor component.
