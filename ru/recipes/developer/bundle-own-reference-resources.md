---
title: "Вложить справку и своё изображение в проект"
description: "Упакуйте текст и собственный PNG со скриптом, прочитайте текст через файловый сервис и покажите оба ресурса в своём окне."
published: true
date: 2026-11-10T17:35:11.000Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T17:35:11.000Z
---

# Вложить справку и своё изображение в проект

Небольшая справочная карточка может храниться вместе с проектом, без личного пути на диске разработчика. Скрипт прочитает вложенный текст, а Razor-компонент покажет его рядом с вашим PNG.

Нужен настольный EyeAuras с [сервисами Blazor-окна для скрипта и WebView2 Runtime](/ru/scripting/blazor-windows/getting-started). Используйте **действие C# Script**: его Run остаётся активным, пока открыто окно. Это не короткий подготовительный скрипт C# Overlay.

1. Создайте свою ауру `RecipeHelp`, добавьте **Actions → On Enter → C# Script** для ручного Run. В проекте выберите **New file → Component**, имя `MainWindow`, и замените `MainWindow.razor` приведённым ниже файлом. Если шаблон также создал `MainWindow.cs`, удалите этот сгенерированный файл из нового проекта: здесь весь компонент находится в одном Razor-файле.
2. Подготовьте UTF-8-файл `help.txt` с полным текстом ниже и настоящий несекретный справочный PNG, которым вы вправе пользоваться. В Wiki такого изображения нет. В дереве файлов скрипта выберите **Add → Existing File(s)...**, импортируйте оба файла как ресурсы и через **Rename** задайте пути проекта `docs/help.txt` и `images/reference.png`.
3. Полностью замените **Script.csx**. Оставьте ровно один ресурс, соответствующий каждому логическому пути; сохраните написание и регистр папок. Namespace компонента — `RecipeHelp`; он не обязан совпадать с namespace сгенерированного проекта.
4. Дождитесь компиляции, нажмите **Run**. В окне **Project reference** должны появиться все три строки справки и ваш PNG. При изменении размера изображение сохраняет пропорции и вписывается в доступную ширину.
5. Закройте окно, чтобы завершить Run, либо нажмите **Stop** действия. Ожидание закрытия закончится или отменится, после чего собственное окно будет освобождено. Новый Run заново прочитает вложенный текст.

## Script.csx

```csharp
using System;
using System.Reactive.Linq;
using System.Reactive.Threading.Tasks;
using PoeShared.Blazor.Wpf;
using RecipeHelp;
using System.IO;
using EyeAuras.Repl;

{
    var files = GetService<IScriptFileProvider>();
    var helpFile = files.GetFileInfo("docs/help.txt");
    var imageFile = files.GetFileInfo("images/reference.png");
    if (!helpFile.Exists || !imageFile.Exists)
        throw new FileNotFoundException("Add docs/help.txt and images/reference.png to this project.");
    string help;
    using (var stream = helpFile.CreateReadStream())
    using (var reader = new StreamReader(stream))
        help = await reader.ReadToEndAsync(cancellationToken);
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.DataContext = help;
    window.Title = "Project reference";
    window.Width = 480;
    window.Height = 320;
    var closed = window.WhenClosed.Take(1).ToTask(cancellationToken);
    window.Show();
    try { await closed; }
    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { }
}
```

## MainWindow.razor

```razor
@namespace RecipeHelp
@using PoeShared.Blazor
@inherits BlazorReactiveComponent<string>

<h2>Project reference</h2>
<pre style="white-space: pre-wrap;">@DataContext</pre>
<img src="images/reference.png" alt="My supplied reference image"
     style="max-width: 100%; height: auto;" />
```

## docs/help.txt

```text
Project reference
This help text belongs to this script project.
Compare the image below with your own original PNG.
```


| Часть | За что отвечает |
| --- | --- |
| `IScriptFileProvider` | Заимствованный сервис ресурсов проекта; освобождать его не нужно. |
| `CreateReadStream()` и `StreamReader` | Собственные средства чтения, закрываемые до показа окна. |
| `DataContext = help` | Явно передаёт строку компоненту `BlazorReactiveComponent<string>`. |
| `images/reference.png` | Относительный URL ресурса, который оконный механизм проекта раздаёт от базового URI страницы; не путь Windows. |
| `WhenClosed`, затем `Show()` | Подписка появляется до показа, а ожидание закрытия остаётся внутри блока владения окном. |

Текущий файловый сервис умеет находить уникальный суффикс manifest-имени с папкой, например у `ProjectName.docs.help.txt`. Не допускайте неоднозначности: в полное имя входит namespace проекта, а не `@namespace` компонента. Если файл не найден, выведите `typeof(MainWindow).Assembly.GetManifestResourceNames()` в журнал скрипта и проверьте импорт. [Встроенные ресурсы](/ru/scripting/embedded-resources) объясняют полные имена и упаковку при экспорте. У прямого `Assembly.GetManifestResourceStream` отдельное требование точного регистра.

Изменение исходного файла на диске не заменяет вложенные байты. Замените или импортируйте ресурс заново и перекомпилируйте проект. Экспорт и импорт полного проекта переносят его ресурсы; перенос одного `.csx` этого не делает. В [примере файлового сервиса](/ru/scripting/examples/basic/file-provider) разобрано отдельное чтение физического файла. `Show()` немодальный. Ожидание закрытия удерживает окно в блоке владения текущего Run.
