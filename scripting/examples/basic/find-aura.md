---
title: How to Find an Aura
description: A guide on how to find an aura and access its properties and triggers within a script.
published: true
date: 2024-02-23T23:14:03.060Z
tags: aura, scripting, triggers, properties, C#, ai-translated
editor: markdown
dateCreated: 2024-02-20T20:35:06.280Z
---
# Read a neighbouring aura's state

Create a manual switch and inspect it from a script. A **Fixed Value** trigger supplies the state; the log reports the aura's path, ID and **true**, **false** or **null** state. Looking it up creates no aura and executes none of its actions.

You can [import the original example](https://eu.eyeauras.net/share/S202402232313367YDKhksLfySg) or prepare this structure in the main EyeAuras tree:

1. Create **Examples**, then **FindAura** inside it.
2. Create **Switch** in FindAura, add **Fixed Value**, select **Is Active (true)** and ensure the aura is enabled.
3. Beside Switch, create **Script** and add **C# Script** to its **On Enter** list.

![Sibling auras in the earlier tree editor](https://i.imgur.com/8nk8IOG.png =x150)

4. Put the complete program below in **Script.csx** and click **Run**:

```csharp
var aura = AuraTree.GetAuraByPath(@".\Switch"); // or by absolute path AuraTree.GetAuraByPath(@"Examples\FindAura\Switch");

// print the status, it will be true/false or null (for undefined state)
Log.Info($"Aura {aura.FullPath} IsActive: {aura.IsActive}");
Log.Info($"Aura ID: {aura.Id}");
```

5. The log should report `Examples\FindAura\Switch`, `True` and a separate ID. Set Fixed Value to **Is NOT Active (false)**, wait for the aura to update, and run again to get `False`.

![Aura state in the earlier log view](https://i.imgur.com/deQdFyB.png)

The older images illustrate the arrangement and log. Check current values on your own Switch.

## Select the intended item

| Lookup | Meaning |
| --- | --- |
| `@".\Switch"` | A sibling relative to this script's tree context, here Examples\FindAura. |
| `@"Examples\FindAura\Switch"` | An absolute path within the current tree, without a leading separator or the root tree's own name. |
| `"."` | The current aura in an aura context; another host may have no current aura. |
| GetAuraByPath | Requires an aura and throws ArgumentException when lookup returns no item. |
| FindAuraByPath | Returns null for an absent item. Malformed paths or inconsistent context can still cause an error. |

These are tree paths, not filesystem paths or a global first-name match. In EyePad, they belong to the selected workspace's tree rather than every tab.

<details>
<summary>Optional auras and matching a known ID</summary>

Use this separate alternative when the aura is optional:

```csharp
var aura = AuraTree.FindAuraByPath(@".\Switch");
if (aura == null) { Log.Info("Switch not found"); return; }
Log.Info($"{aura.FullPath}: {aura.IsActive}");
```

The logged ID identifies the item; it is not another path syntax. To search the available aura collection by that ID, use this separate top-level fragment and replace the placeholder with your own Switch ID:

```csharp
using System.Linq;

var expectedId = "ID from your Switch log";
var aura = AuraTree.Auras.Items.FirstOrDefault(x => x.Id == expectedId);
Log.Info(aura == null ? "No aura with this ID" : $"Found: {aura.FullPath}");
```

</details>

**IsActive** is a **bool?** snapshot at read time. Null means unknown, not false; continuous observation would need a separately owned subscription. The borrowed [aura accessor](/en/scripting/api/IAuraAccessor) needs no Dispose and exposes its triggers, actions and variables.

If another aura only needs to follow Switch, configure [Aura Is Active](/en/triggers/aura-is-active) with a link to it and the required state. This reuses the configured condition instead of keeping a script polling IsActive.

The top-level C# Script host supplies **AuraTree** and **Log**. Pass the [tree service](/en/scripting/api/IAuraTreeScriptingApi) explicitly to ordinary classes; see [script-host context](/en/scripting/api/scripting/runtime).
