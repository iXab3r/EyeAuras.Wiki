---
title: ImGui — Начало работы
description: Краткое руководство по началу работы с ImGui
published: true
date: 2026-02-14T16:30:30.911Z
tags: ai-translated
editor: markdown
dateCreated: 2025-06-21T21:51:07.137Z
---
# ImGui в контексте EyeAuras

**ImGui** — это на удивление мощная, но при этом простая и интуитивная библиотека для отрисовки *разных вещей*. Изначально автор создавал её для разработки UI в играх, но со временем область применения стала гораздо шире — [список проектов, которые используют её](https://github.com/ocornut/imgui/wiki/Software-using-dear-imgui), действительно впечатляет.

Но здесь мы говорим про **автоматизацию**, верно? Тогда чем ImGui полезен нам?

Ответ простой: ImGui — это **самый простой и интуитивный** способ собрать собственный UI. Освоить его даже проще, чем [Blazor Windows](/ru/scripting/blazor-windows/getting-started).

---

## Установка

EyeAuras постепенно переходит на модульную систему на базе NuGet, чтобы пользователь мог подключать **только те возможности, которые ему действительно нужны**. Текущая функциональность стала слишком большой: захват изображений, анализ, эффекты, деревья поведения, эмуляция ввода, чтение памяти, обработка аудио, Blazor UI… и почти ни одно mini-app не использует даже половину этого набора.

Поэтому разные возможности выносятся в отдельные NuGet-пакеты, которые можно установить так же, как любые другие.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"
 
using EyeAuras.ImGuiSdk; // required for registration methods
using ImGuiNET;          // access to ImGui APIs
using System.Numerics;   // for Vector2/Vector3 use with ImGui

AddNewExtension<ImGuiContainerExtensions>(); // registers IImGuiExperimentalApi and others

var osd = GetService<IImGuiExperimentalApi>() // creates the ImGui overlay
    .AddTo(ExecutionAnchors); // ensures cleanup when script stops
```

---

## Hello, World

Чтобы начать работать с ImGui, нужно сделать всего 3 вещи:

* Подключить namespace `ImGuiNET`
* Получить `IImGuiApi` через `GetService`
* Вызвать `AddRenderer()` и передать в него ваш метод отрисовки

На этом всё. EyeAuras сам создаст overlay и запустит render loop. Вам остаётся только поместить свою логику в метод, который передаётся в `AddRenderer`.

>  Примечание: ваш метод будет вызываться **на каждом кадре**, поэтому избегайте `sleep` и любого долгого блокирующего кода.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"
 
using EyeAuras.ImGuiSdk;
using ImGuiNET;
using System.Numerics;

AddNewExtension<ImGuiContainerExtensions>();

var osd = GetService<IImGuiExperimentalApi>()
    .AddTo(ExecutionAnchors);

osd.AddRenderer(() =>
{
    ImGui.ShowDemoWindow();
});

cancellationToken.WaitHandle.WaitOne(); // keep running until script is stopped
```

![ImGui Demo window](https://s3.eyeauras.net/media/2025/06/EyeAuras_KXCTkIyw7EU3oo3q.gif)

---

## Создаём переключатель

Теперь сделаем что-то своё. Demo window полезно для тестов, но в реальной работе от него мало пользы.

Как и в [Blazor Windows](/ru/scripting/blazor-windows/getting-started), давайте [создадим toggle](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive).

### Что для этого нужно

* Создать overlay через `IImGuiApi`
* Передать метод отрисовки в `AddRenderer`
* Внутри render-метода нарисовать checkbox и текст

И это всё. Никакого отдельного управления состоянием, никаких `sleep`, никакой ручной обработки кликов — всё работает в immediate mode. Поначалу синтаксис может показаться непривычным, но ChatGPT **очень хорошо** знает ImGui, так что смело задавайте вопросы.

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"

using EyeAuras.ImGuiSdk; 
using ImGuiNET;
using System.Numerics;

[Inject] IAuraTreeScriptingApi AuraTree { get; init; }

IHotkeyIsActiveTrigger Trigger => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura");

AddNewExtension<ImGuiContainerExtensions>();

var osd = GetService<IImGuiExperimentalApi>()
    .AddTo(ExecutionAnchors);

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

cancellationToken.WaitHandle.WaitOne();
```

![Toggle](https://s3.eyeauras.net/media/2025/06/EyeAuras_950pfgdzIy4pe780.gif)

---

## Что ещё можно делать с ImGui?

Помимо интерактивных окон, ImGui можно использовать и для **OSD (On-Screen Display)** — отрисовки overlay прямо поверх экрана. Причём можно рисовать как **2D**, так и **3D** объекты.

Вот пример — всё, что вы видите, включая UI и экранные overlay, отрисовано с помощью ImGui:

 [L2 Demo](https://www.youtube.com/watch?v=y0u20InSjbg)

---

Если нужно, этот материал можно оформить как полноценную страницу документации или встроить в шаблоны скриптов EyeAuras.