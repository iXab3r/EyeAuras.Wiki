---
title: ImGui - С чего начать?
description: 
published: true
date: 2025-06-22T11:12:23.456Z
tags: 
editor: markdown
dateCreated: 2025-06-21T21:51:07.137Z
---

# ImGui в контексте EyeAuras
**ImGui** это жутко мощная, но при этом очень простая и понятная библиотека для отрисовки _всякого_. Автор изначально ее планировал использовать для разработки UI в играх, однако очень быстро эта библиотека нашла свое применение и за его пределами - [список](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui) внушает уважение. 

Однако мы же тут занимаемся автоматизацией, правильно? Как нам ImGui помогает? 
Ответ - ImGui это самый простой и понятный способ реализовать свой кастомный UI. Даже проще чем [Blazor Windows](/scripting/blazor-windows/getting-started). 


## Как подключить
EyeAuras постепенно переходит на систему нугет-пакетов для того, чтобы пользователи могли подключать только тот функционал, который им требуется. На данный момент количество разнообразного функционала, которое присутствует в программе, уже слишком велико - работа с захватом изображения, анализом, эффекты, деревья поведения, симуляторы ввода, чтение памяти, работа со звуком, работа с Blazor. Нет ни одной известной мне мини-аппки, которая бы использовала хотя бы половину. 
Так что я буду постепенно выносить отдельные блоки функционала в NuGet пакеты, которые можно будет подключать в программу как и любые другие. 

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
 
using EyeAuras.ImGuiSdk; //root ImGuiSdk namespace needed to add registrations (see below)
using ImGuiNET; //that namespace is needed to get access to ImGui itself
using System.Numerics; //most of ImGui methods work with Vector2/3, so this comes in handy

AddNewExtension<ImGuiContainerExtensions>(); //this is register IImGuiExperimentalApi and other classes

var osd = GetService<IImGuiExperimentalApi>() //create ImGui API - this will show empty OSD
    .AddTo(ExecutionAnchors); //ensure that you'll hide OSD when script stops or gets stopped
```

## Hello, World
There are 3 things you have to do to start working with ImGui:
- import `ImGuiNET` namespace 
- create `IImGuiApi` via `GetService`
- invoke AddRenderer with a method which is responsible for rendering
That is basically it. EyeAuras will create the overlay and will manage rendering loop. All you have to do is add 
some logic into the method which you've passed to `AddRenderer`

p.s. Keep in mind, that ImGui will call that method ON EVERY render cycle. So no sleeps there. 

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
 
using EyeAuras.ImGuiSdk; //root ImGuiSdk namespace needed to add registrations (see below)
using ImGuiNET; //that namespace is needed to get access to ImGui itself
using System.Numerics; //most of ImGui methods work with Vector2/3, so this comes in handy

AddNewExtension<ImGuiContainerExtensions>(); //this is register IImGuiExperimentalApi and other classes

var osd = GetService<IImGuiExperimentalApi>() //create ImGui API - this will show empty OSD
    .AddTo(ExecutionAnchors); //ensure that you'll hide OSD when script stops or gets stopped

osd.AddRenderer(() =>
{
    //this method will be called many-many times per second
    //you can put any logic here
    ImGui.ShowDemoWindow();
});

//wait until script stops or gets stopped
cancellationToken.WaitHandle.WaitOne(); 
```

![ImGui Demo window](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)


## Creating a toggle
Давайте теперь что-нибудь сделаем свое. Демо-окошко это удобно, чтобы просто проверить, что все работает, но не особо полезно.
Как и в случае с [Blazor Windows](/scripting/blazor-windows/getting-started), давайте [создадим свой переключатель](/scripting/blazor-windows/4-toggle-hotkeyisactive)

### Что нужно сделать?
- как и в случае с OSD, создаем оверлей `IImGuiApi`
- передаем в `AddRenderer` наш метод, который и выполняет всю отрисовку
- в коде отрисовки рисуем чекбокс и немножко текста

На этом в принципе и все. Как видите очнеь просто - никакого хранения состояний, никаких задержек, обработки кликов и т.п. Синтаксис может поначалу вызывать вопросы, но чат гпт ОЧЕНЬ хорошо знает ImGui, так что не стеснятесь.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.0.6"
 
using EyeAuras.ImGuiSdk; 
using ImGuiNET;
using System.Numerics; 

[Inject] IAuraTreeScriptingApi AuraTree { get; init; }

IHotkeyIsActiveTrigger Trigger
{
    get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");
}

AddNewExtension<ImGuiContainerExtensions>(); 

var osd = GetService<IImGuiExperimentalApi>() //create ImGui API - this will show empty OSD
    .AddTo(ExecutionAnchors); //ensure that you'll hide OSD when script stops or gets stopped

osd.AddRenderer(() =>
{
    ImGui.Begin("My UI");

    ImGui.Text("Control window flags and interaction behavior.");

    var isActive = Trigger.TriggerValue ?? false;
    if (ImGui.Checkbox("Is Active", ref isActive))
    {
        Trigger.TriggerValue = isActive;
    }
    ImGui.SameLine();
    ImGui.TextDisabled("(Gets/Sets whether Trigger is active or not)");

    ImGui.Separator();

    if (Trigger.IsActive == true)
    {
        ImGui.TextColored(new Vector4(0f, 1f, 0f, 1f), "Trigger is currently ACTIVE");
    }
    else
    {
        ImGui.TextColored(new Vector4(1f, 0f, 0f, 1f), "Trigger is currently INACTIVE");
    }

    ImGui.End();
});

//wait until script stops or gets stopped
cancellationToken.WaitHandle.WaitOne();
```

![Toggle](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

## Что еще можно делать с помощью ImGui?
На самом деле помимо рисования интерактивных окон, можно еще делать и OSD - OnScreenDisplay, отрисовку чего-нибудь на экране. При этом, можно рисовать как 2D, так и 3D объекты. Вот пример - все, что вы видите реализовано на ImGui, как интерфейс, так и отрисовка на экране.


[L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg)