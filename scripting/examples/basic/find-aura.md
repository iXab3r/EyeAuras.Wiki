---
title: How to Find an Aura
description: How to find an aura from a script and read its state, properties and triggers.
published: true
date: 2024-02-23T23:14:03.060Z
tags: aura, scripting, triggers, properties, C#, ai-translated
editor: markdown
dateCreated: 2024-02-20T20:35:06.280Z
---
# Read a neighbouring aura's state

Let's create a manual switch and read it from a script. The switch is a **Fixed Value** trigger in a neighbouring aura. The script logs that aura's full path, its ID and its state: **true**, **false** or **null**.

You can [import the original example](https://eu.eyeauras.net/share/S202402232313367YDKhksLfySg) or build this structure in the main EyeAuras tree:

1. Create a folder **Examples**, then **FindAura** inside it.
2. In FindAura, create an aura **Switch** and add **Fixed Value**. Select **Is Active (true)** and check that the aura is enabled.
3. Next to Switch, create an aura **Script** and add **C# Script** to its **On Enter** list.

4. Paste the whole program into **Script.csx** and click **Run**:

```csharp
var aura = AuraTree.GetAuraByPath(@".\Switch"); // or by absolute path AuraTree.GetAuraByPath(@"Examples\FindAura\Switch");

// print the status, it will be true/false or null (for undefined state)
Log.Info($"Aura {aura.FullPath} IsActive: {aura.IsActive}");
Log.Info($"Aura ID: {aura.Id}");
```

5. The log shows `Examples\FindAura\Switch` with state `True` and a separate line with the ID. Now set Fixed Value to **Is NOT Active (false)**, wait for the aura to update and click **Run** again. You get `False`.

## Select the intended item

| Lookup | What it finds |
| --- | --- |
| `@".\Switch"` | A sibling relative to the script's current context. Here that is the Examples\FindAura folder. |
| `@"Examples\FindAura\Switch"` | A path from the root of the current tree. No leading separator and no name of the root tree itself. |
| `"."` | The current aura, if the script runs in an aura context. Other hosts may have no current aura. |
| GetAuraByPath | Requires the aura to exist. Throws ArgumentException if the lookup returns nothing. |
| FindAuraByPath | Returns null if the item is not found. A malformed path or inconsistent context can still cause an error. |

These are paths in the aura tree, not in the filesystem. In EyePad a path is limited to the tree of the selected workspace and does not reach every tab.

<details>
<summary>Optional auras and matching a known ID</summary>

Instead of the main example, you can check explicitly that the aura is missing:

```csharp
var aura = AuraTree.FindAuraByPath(@".\Switch");
if (aura == null) { Log.Info("Switch not found"); return; }
Log.Info($"{aura.FullPath}: {aura.IsActive}");
```

The ID in the log identifies the item that was found. To find an aura by a known ID, use the aura collection. This is a separate fragment for the same top-level host. Replace the placeholder with your own ID:

```csharp
using System.Linq;

var expectedId = "ID from your Switch log";
var aura = AuraTree.Auras.Items.FirstOrDefault(x => x.Id == expectedId);
Log.Info(aura == null ? "No aura with this ID" : $"Found: {aura.FullPath}");
```

</details>

**IsActive** is a **bool?**, the value at the moment of reading. Null means "unknown", not false. To watch the state all the time you need a separate subscription with its own lifetime. The [aura accessor](/en/scripting/api/IAuraAccessor) you get is borrowed and needs no Dispose. It gives access to the aura's triggers, actions and variables.

If another aura only needs to follow Switch, set up [Aura Is Active](/en/triggers/aura-is-active): link it to Switch and choose the state you need. Then you do not need a script that keeps polling IsActive.

The top-level C# Script host gives you **AuraTree** and **Log**. An ordinary class needs the [tree service](/en/scripting/api/IAuraTreeScriptingApi) passed in explicitly. More in [script-host context](/en/scripting/api/scripting/runtime).
