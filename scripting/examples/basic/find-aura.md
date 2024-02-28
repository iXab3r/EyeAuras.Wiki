> You can import the ready-made example from here: [FindAura Example](https://eu.eyeauras.net/share/S202402232313367YDKhksLfySg)
{.is-info}

# Why?
To read the current state, name, or any actions and triggers inside the aura itself, you first need to find the aura, and then you can explore inside.

## What Will We Do?
It often happens that from a script, you need to obtain some results from trigger operations. For example, recognized text or coordinates of a found image. Let's start with the simplest - finding out the current state of the aura, i.e., whether it is active or not.

## Preliminary Steps
Let's first set up what we will work with from the script:
- Create a folder named `Examples` at the root of the program and a subfolder named `FindAura` within it.
- Create an aura named `Switch` in the subfolder.
- Add a `Fixed Value` trigger to the `Switch` aura. Essentially, this is just a manual switch.
- Now, create another aura `Script` next to it (you can use your imagination for the name of this aura; the name is not important).
- In the `Script` aura, create an `OnEnter` action `C# Script`.
- It should look something like this:
![](https://i.imgur.com/8nk8IOG.png =x150)

## Now
```csharp
var aura = AuraTree.GetAuraByPath(@".\Switch"); // or by absolute path AuraTree.GetAuraByPath(@"Examples\FindTrigger\Switch");

// print the status, it will be true/false or null (for undefined state)
Log.Info($"Aura {aura.FullPath} IsActive: {aura.IsActive}");
```

![](https://i.imgur.com/deQdFyB.png)

## Let's Break It Down
To access the aura tree (the left panel where your auras and folders are), we refer to the [AuraTree](/ru/scripting/api/IAuraTreeScriptingApi).
The `GetAuraByPath` method can search by absolute or relative path. If the aura is not found, it will halt the script with an error. There is a twin method called `FindAuraByPath`, which will return `null` if nothing is found. This `Get*` and `Find*` scheme will be encountered in many places, and you can always rely on this behavior.

Next, once we have found the [aura](/ru/scripting/api/IAuraAccessor), we can read its current state from the `IsActive` property.
In addition, there are several other important and useful things there, such as the aura's name, triggers, actions within it, and more. We will delve into these in the following examples.