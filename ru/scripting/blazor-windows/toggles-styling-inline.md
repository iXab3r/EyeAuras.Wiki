---
title: 8. Добавление CSS — inline
description: Как добавить встроенный CSS прямо в документ
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T15:48:02.521Z
---
# Что такое CSS

CSS (Cascading Style Sheets) описывает **внешний вид** интерфейса: цвета, размеры и многое другое.

Этот механизм очень мощный, и за годы вокруг него накопилось столько деталей, что полное описание заняло бы целую толстую книгу. К счастью, основы при этом довольно простые — *легко начать, сложно довести до совершенства*. Чтобы эффективно использовать CSS, не нужно глубоко разбираться во всех его внутренних тонкостях.

## [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/)

Bootstrap — это большая коллекция полезных CSS-классов для большинства типовых задач: цветные кнопки, редакторы и многое другое. EyeAuras автоматически загружает Bootstrap CSS/JS, поэтому все классы из документации по умолчанию доступны в любом overlay. Мы уже использовали их в предыдущих примерах.

Но иногда стандартных стилей недостаточно, и хочется сделать что-то свое. Возьмем код, который переключает trigger, и просто перекрасим кнопку с помощью CSS.

![Demo](https://s3.eyeauras.net/media/2025/05/3UAeooHWHD.png)

## UserOverlay.cs

```csharp
public partial class UserOverlay : BlazorReactiveComponent {

    [Inject]
    public IAuraTreeScriptingApi AuraTree { get; init; }

    public bool TriggerIsActive
    {
        get => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura").TriggerValue ?? false;
        set => AuraTree.GetTriggerByPath<IHotkeyIsActiveTrigger>("./TargetAura").TriggerValue = value;
    }

    protected override void OnInitialized()
    {
        ChangeTrackers.Add(Observable.Timer(DateTimeOffset.Now, TimeSpan.FromSeconds(1)));
        base.OnInitialized();
    }
}
```

## UserOverlay.razor

```html
@using PoeShared.Blazor.Controls
@inherits BlazorReactiveComponent

<style>
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
</style>

<h3 class="text-center shadow-1">Toggle Trigger</h3>

<div class="text-center mt-4">
    <ToggleButton
        @bind-IsChecked="@TriggerIsActive"
        Class="btn custom-button">
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

![Demo](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_WPu1ZGwKwS.gif)

---

## Разбор

### UserOverlay.razor

```html
<style>
.custom-button {
    background: lime;
    color: black;
    width: 80%;
}
</style>
```

Это inline-стиль: вы определяете CSS-класс прямо внутри компонента и сразу же его используете. Для небольших проектов это просто и удобно, но у такого подхода есть свои минусы. Когда проект становится больше, лучше переходить на отдельные CSS-файлы — это стандартный подход в веб-разработке.

## Дополнительно

ChatGPT и другие боты хорошо справляются с CSS и могут генерировать самые разные классы. Например, вот CSS от ChatGPT 4o, который добавляет градиент. Оптимальность сейчас не обсуждаем — это уже оставим профессионалам :)

```css
.custom-button {
    background: linear-gradient(90deg, red, darkred);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border-radius: 0.3rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: background 0.3s ease;
}

.custom-button::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1));
    transition: left 0.6s ease-in-out;
    z-index: 1;
}

.custom-button:hover::before {
    left: 100%;
}

.custom-button > * {
    position: relative;
    z-index: 2;
}
```

![Demo 1](https://s3.eyeauras.net/media/2025/05/J0g2tAOpQa.gif)