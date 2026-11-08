---
title: 4. Creating a toggle
description:
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T14:24:53.840Z
---

# Controlling an aura through the UI
Let's solve a common task—we want a button somewhere on screen that enables or disables certain functionality.

## Solution using HotkeyIsActive Trigger
The standard approach:
- create an aura
- add a HotkeyIsActive trigger
- bind a hotkey

That's it: pressing the hotkey toggles the aura state.

## Solution using C# Overlay
Create another overlay. We'll draw the button there.

## Prepare the overlay and target auras

Create a **C# Overlay v3** aura and `TargetAura` in the same folder. Add `HotkeyIsActive` in toggle mode to each target and keep them loaded. The shown `./TargetAura` paths resolve relative to the overlay context; adjust them to your actual tree. If several triggers match, the first is selected.

Replace `UserOverlay.cs` and `UserOverlay.razor` with the corresponding complete blocks below. They are parts of one `public partial` class in the same namespace. `[Inject]` supplies `AuraTree`; Script.csx globals are not component globals.

## UserOverlay.cs
```csharp
using Microsoft.AspNetCore.Components;
using PoeShared.Blazor;
using EyeAuras.Scripting.Api;
using EyeAuras.DefaultAuras.Triggers.HotkeyIsActive;

public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    public IHotkeyIsActiveTrigger Trigger
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
    }

    public bool TriggerIsActive
    {
        get => Trigger.TriggerValue ?? false;
        set => Trigger.TriggerValue = value;
    }
}
```

## UserOverlay.razor
```csharp
@using PoeShared.Blazor
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center shadow-1">Toggle Trigger</h3>

<div class="text-center mt-4">
    <ToggleButton
              @bind-IsChecked="@TriggerIsActive"
              Class="btn btn-secondary">
       Trigger is Active
    </ToggleButton>
</div>

<p class="text-center mt-3 alert alert-info" style="font-size: 1.5rem;">
    @if (TriggerIsActive){
        <span class="shadow-1">Trigger is currently active</span>
    } else {
        <span class="text-warning shadow-1">Trigger is currently not active</span>
    }
</p>
```

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_HeGx0CejHB.gif)

---

## Breakdown
Let's go through it in detail.

## UserOverlay.cs
```csharp
 [Inject]
 public IAuraTreeScriptingApi AuraTree { get; init; }
```
EyeAuras heavily uses Dependency Injection. Read more about it [here](/scripting/dependency-injection). In short, it lets us access various parts of the program. Here we ask for access to the aura tree. EyeAuras ensures it's available when the script runs. Since we'll change the state of an aura, we need the aura tree.

```csharp
public IHotkeyIsActiveTrigger Trigger
{
   get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
}
```
This property looks up an aura named `TargetAura` located in the same folder (`./`) and extracts the trigger of type `IHotkeyIsActiveTrigger`. Path rules are the same as file systems—`./` current folder, `..` parent, etc. Both forward and backslashes are supported. If the aura or trigger isn't found, EyeAuras throws an exception.

```csharp
  public bool TriggerIsActive
    {
        get => Trigger.TriggerValue ?? false;
        set => Trigger.TriggerValue = value;
    }
```
Here we read and set the trigger state.
- `get` finds the trigger and reads its current value
- `set` writes a new value
> Not all triggers have a writable `TriggerValue`, but **all** triggers have `IsActive` to **read** their state. Useful for triggers like ImageSearch/MLSearch to check whether they found anything.

## UserOverlay.razor
```html
@using PoeShared.Blazor.Controls
```
`ToggleButton` is a component that renders a button with two states (ON/OFF). It's located in the `PoeShared.Blazor.Controls` namespace, so we add `@using PoeShared.Blazor.Controls` to access it.

```html
<ToggleButton
              @bind-IsChecked="@TriggerIsActive"
              Class="btn btn-secondary">
   Trigger is Active
</ToggleButton>
```
We tell Blazor to render a `ToggleButton`. The key part is `@bind-IsChecked="@TriggerIsActive"` which binds the button state to our property. When rendering, it reads `TriggerIsActive`, and on click it writes back.

```html
@if (TriggerIsActive){
   <span class="shadow-1">Trigger is currently active</span>
} else {
   <span class="text-warning shadow-1">Trigger is currently not active</span>
}
```
This block shows different text depending on whether the trigger is active. Note that clicking the button updates the text as well.

Blazor updates the button and text after its click event. External hotkey changes are not yet observed; add [UI refresh](/en/scripting/blazor-windows/reactive-toggle) next. Writing `TriggerValue` changes this trigger; other conditions still affect the aura’s final activity.
