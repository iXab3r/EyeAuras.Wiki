---
title: С чего начать?
description: Краткое руководство для начала работы.
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2024-11-04T00:26:45.232Z
---
# Blazor в контексте EyeAuras

Начать можно с C# Overlay v3, видимостью которого управляет аура, или с окна, созданного действием C# Script.

## C# Overlay

До недавнего времени (октябрь 2024) это был единственный вариант. Всё просто: создаёте ауру, добавляете **C# Overlay** — и готово. EA сама рисует окно на экране и размещает внутри ваш код. В остальном это обычный оверлей: можно задавать условия отображения через триггеры, настраивать цвет, фон и другие параметры.

Вот пара примеров оверлеев:  
![D](https://i.imgur.com/iaKm2Br.png) ![TL](http://files.eyesquad.net/screenshots/31-10-2024/1YWZKXCaFhEh7SNnSx8YMWjAf.png)

### Пример

Сделаем маленький оверлей с кнопкой и счётчиком.

- Создайте ауру
- Добавьте **C# Overlay**
![Add C# Overlay](https://s3.eyeauras.net/media/2024/11/msedge_zVrveCuFgBbtBB68.png)
- Готово — отрисуется оверлей с кликабельной кнопкой
![C# Overlay Example](https://s3.eyeauras.net/media/2024/11/Code_MJvkplH0Iiqmm9SV.png)

Для новых примеров выбирайте C# Overlay v3. Его файлы разобраны в [серии об оверлеях](/ru/scripting/blazor-windows/1-intro).

## C# Script Action

А теперь к основному варианту. Здесь можно создавать не один-два оверлея, управляемых триггерами, а целую оконную систему, работающую через скрипты. Такие окна могут появляться где угодно и когда угодно, выглядеть как угодно, а EA берёт на себя значительную часть типичной боли WPF или WinForms, особенно вокруг многопоточности.

### Пример

Посмотрим, как скрипты могут работать с окнами.

- Создайте ауру
- Добавьте действие **OnEnter** **C# Script**
![OnEnter C#](https://s3.eyeauras.net/media/2024/11/EyeAuras_xCVTs8bdg1Y7ZU8T.png)
- Создайте новый **Razor Component**, имя по умолчанию **UserComponent** можно оставить
![New Razor Component](https://s3.eyeauras.net/media/2024/11/EyeAuras_I6MYDieptaZe5a8u.png)
- В **Script.csx** добавьте:
```csharp
using EyeAuras.Shared.Scripting;
using PoeShared.Scaffolding;

var window = GetService<IDialogWindowUnstableScriptingApi>() // get DialogWindow API
    .CreateWindow<UserComponent>() //create new window with UserComponent inside
    .AddTo(ExecutionAnchors); //destroy when script is stopped

window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
window.ShowDialog(cancellationToken);
```
- В `UserComponent.razor` оставьте один компонент счётчика (если такой же метод есть в `UserComponent.cs`, удалите дубликат):

```razor
@using Microsoft.AspNetCore.Components.Web
@using PoeShared.Blazor
@inherits BlazorReactiveComponent

<button class="btn btn-primary" @onclick="Increment">Click Me</button>
<p>Clicks: @count</p>

@code {
    private int count;
    private void Increment() => count++;
}
```

- Нажмите **Run** — и получите своё первое диалоговое окно через Blazor Windows API! Обратите внимание: пока окно открыто, скрипт продолжает работать, а при остановке скрипта окно закрывается.
![Blazor window](https://s3.eyeauras.net/media/2024/11/EyeAuras_fmFnsjgMCW8P6Z4b.png)

### Что такое IDialogWindowUnstableScriptingApi?

Это основной интерфейс для работы с диалоговыми окнами. Есть и другие варианты, но сейчас это самый высокоуровневый и безопасный способ: он берёт на себя выгрузку окон при выгрузке ауры, очистку ресурсов и прочие служебные задачи. Название **Unstable** означает не то, что интерфейс плохой, а то, что он новый и в нём ещё возможны breaking changes. Это имя не гарантирует будущую совместимость.
## Передать данные из скрипта в компонент

Если окну нужны начальные данные, создайте в этом же проекте обычный файл `WindowModel.cs`:

```csharp
public sealed class WindowModel
{
    public string Title { get; set; } = "Настройки";
}
```

В `Script.csx` передайте `new WindowModel { Title = "Моё окно" }` аргументом `CreateWindow<UserComponent>(...)`. В Razor используйте `@inherits BlazorReactiveComponent<WindowModel>` и выводите `@DataContext.Title`. Хост передаёт именно этот объект; переменные `Script.csx` и его `cancellationToken` не становятся полями компонента. Простое изменение свойства модели извне не даёт автоматической подписки: для этого нужен механизм обновления.

[Операции оконного API](/ru/scripting/api/IDialogWindowUnstableScriptingApi) и [карта Blazor](/ru/scripting/api/core/blazor) помогут перейти от примера к нужному контракту вашей версии SDK.
