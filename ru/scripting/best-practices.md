---
title: FAQ и рекомендации
description: Краткие рекомендации по написанию C#-скриптов в EyeAuras
published: true
date: 2026-04-22T00:00:00.000Z
tags: c#, scripting, faq, best-practices, ai-translated
editor: markdown
dateCreated: 2026-04-02T12:00:00.000Z
---
# FAQ по скриптам EyeAuras и хорошие практики

Скрипты EyeAuras — это обычный C#-код, который выполняется внутри runtime-среды EyeAuras. Они одинаково хорошо подходят и для маленьких утилит на 20 строк, и для более крупных решений, которые потом могут вырасти в [`pack`](/ru/features/packs) или [`mini-app`](/ru/features/mini-app).

> Если вам нужно исследовать API с помощью AI, начните с [AI Discovery Maps](/scripting/api/AGENTS). Они разводят широкие вопросы по более узким картам и отделяют базовые концепции SDK от дополнительных пакетов, таких как ImGui SDK и Frida SDK.
{.is-info}

## Главное отличие — Script.csx и обычные классы

Это один из самых важных моментов во всей системе.

Код внутри `Script.csx` проходит специальную обработку EyeAuras:

- выполняется внутри [песочницы](/ru/scripting/sandbox)
- имеет прямой доступ к `Log`, `Sleep(...)`, `GetService<T>()`, `AuraTree`, `Variables`, `cancellationToken`
- для него применяются rewriter-ы, которые автоматически подстраивают некоторые конструкции

Например, прямо внутри `Script.csx` можно писать так:

```csharp
Log.Info("Script started");
Sleep(100);

var input = GetService<ISendInputScriptingApi>();
input.KeyPress(Key.F);
```

Но вспомогательные классы рядом со скриптом — это уже **обычный C#**. У них нет этого “магического” прямого доступа к песочнице.

Если вы пишете отдельный класс, он не может сам по себе вызывать `Log` или `AuraTree`:

```csharp
public sealed class Helper
{
    private readonly IFluentLog log;

    public Helper(IFluentLog log)
    {
        this.log = log;
    }

    public void DoWork()
    {
        log.Info("Helper is working");
    }
}
```

Правило простое:

- `Script.csx` — это специальная точка входа EyeAuras
- связанные классы — это обычные C#-классы
- если связанному классу нужны сервисы, получите их в `Script.csx` или в другой runtime-точке композиции и передайте через конструктор или свойства

Это важно и для людей, и для AI: не у всех частей проекта одинаковые “магические” возможности.

## Зачем вообще писать скрипты в EyeAuras

Короткий ответ: скрипты полезны не потому, что “писать софт сложно”, а потому что **EyeAuras уже является готовой платформой автоматизации**.

Если собирать отдельную программу с нуля, вокруг своей логики вам придется самостоятельно поднимать много инфраструктуры:

- захват изображения
- поиск текста и картинок
- симуляцию ввода
- hotkey-обработчики и lifecycle долгоживущего кода
- overlays и UI
- конфиг, обновления и доставку пользователю

В EyeAuras большая часть этой инфраструктуры уже есть. Значит, вы пишете только свою логику и сразу можете использовать готовые ауры, триггеры, переменные, CV API, ввод и UI.

На практике это дает несколько плюсов:

- очень низкий порог старта: идею можно быстро проверить в одном скрипте
- легко смешивать визуальную логику и код: часть собрать на триггерах и аурах, остальное написать на C#
- быстрый цикл разработки, особенно через [Export / Import / Live Import](/ru/scripting/ide-integration)
- нет тупика по масштабу: маленький скрипт может вырасти в `.sln`, затем в `pack`, а потом и в `mini-app`

Если ваш проект по сути не использует возможности EyeAuras и не зависит от его runtime-среды, то обычное standalone-приложение на .NET может быть более прямым выбором.

## Частые вопросы

### Что такое скрипт в EyeAuras

С точки зрения языка это обычный C# на .NET и Roslyn. С точки зрения продукта — это код, который работает внутри [песочницы](/ru/scripting/sandbox) и получает доступ к API EyeAuras: логам, переменным, аурам, вводу, CV, UI и другим сервисам.

Подробнее: [Быстрый старт](/ru/scripting/getting-started), [Песочница](/ru/scripting/sandbox)

Примеры:

- [Hello World](/scripting/examples/basic/hello-world)
- [Запуск процесса](/scripting/examples/basic/process-start)

### Что EyeAuras уже дает из коробки

Прежде чем делать отдельную программу, полезно понять, что EyeAuras уже умеет сама:

- поиск текста и изображений на экране
- ввод с клавиатуры и мыши
- ауры, триггеры и переменные
- overlays, Blazor Windows, ImGui и другой UI
- экспорт/импорт `.sln`
- [`pack`](/ru/features/packs) и [упаковку](/ru/features/packs) для распространения
- [`mini-app`](/ru/features/mini-app), чтобы строить свое приложение поверх EyeAuras
- [key login](/ru/features/keylogin) для входа по ключу
- [сублицензии](/ru/features/sublicenses) для лицензирования ваших pack-ов и mini-app-ов
- [защиту скриптов](/ru/features/script-protection) для защиты кода при распространении

Если вы делаете приватное или коммерческое решение, лицензирование, key login, pack-и и защита кода могут сэкономить очень много времени.

### Когда использовать Keybind и чем он похож на AutoHotkey

`[Keybind]` позволяет привязать обработчик hotkey напрямую к методу скрипта.

Если вы раньше работали с AutoHotkey, идея очень похожа:

- `F1::` в AHK похож на `[Keybind("F1")]`
- `*F1::` похож на `[Keybind("F1", IgnoreModifiers = true)]`
- `~F1::` похож на `[Keybind("F1", SuppressKey = false)]`
- `d up::` похож на `[Keybind("D", ActivationType = KeybindActivationType.KeyUp)]`

Минимальные примеры:

```csharp
[Keybind("F1")]
public void OnF1()
{
    Log.Info("F1 pressed");
}
```

```csharp
[Keybind("F1", IgnoreModifiers = true)]
public void OnF1WithAnyModifiers()
{
    Log.Info("Works for F1, Shift+F1, Ctrl+F1");
}
```

```csharp
[Keybind("D", ActivationType = KeybindActivationType.KeyUp)]
public void OnDReleased()
{
    Log.Info("D released");
}
```

Чем это удобно на практике:

- быстро включать и выключать бота
- показывать debug overlay
- запускать тестовые действия без отдельного UI
- добавлять “внутренние” hotkey для разработки

Две важные детали:

- keybind работает только пока сам скрипт запущен
- по умолчанию обработчики keybind могут выполняться параллельно, если быстро нажать клавишу несколько раз

Если нужно не запускать второй обработчик, пока не закончился первый, можно сделать так:

```csharp
System.Threading.SemaphoreSlim hotkeyGate = new(1, 1);

[Keybind("F2")]
public void RunSingleHotkey()
{
    if (!hotkeyGate.Wait(0))
    {
        Log.Info("Hotkey is already being processed");
        return;
    }

    try
    {
        Log.Info("Handling F2");
        Sleep(300);
    }
    finally
    {
        hotkeyGate.Release();
    }
}
```

Небольшой полезный бонус: обработчик keybind также может принимать зависимости через параметры метода, если они уже доступны через DI.

Если hotkey должна быть видна в дереве аур, сочетаться с условиями и жить как часть общей визуальной логики, то вместо `[Keybind]` часто удобнее использовать триггер `HotkeyIsActive`.

Подробнее: [Hotkeys](/ru/scripting/keybinds)

Примеры:

- [YOLO11 ESP](/scripting/examples/advanced/yolo11-esp)
- [Как сделать toggle через HotkeyIsActive](/scripting/blazor-windows/4-toggle-hotkeyisactive)

### Какой UI выбрать — Blazor Windows или ImGui

Для UI в EyeAuras обычно есть два основных пути: `Blazor Windows` и `ImGui`.

#### ImGui

`ImGui` — обычно самый простой вариант для старта.

- UI и код могут жить прямо в одном `Script.csx`
- не нужно глубоко погружаться в реактивность и bindings
- отлично подходит для tool windows, debug-панелей, OSD и внутренних окон бота
- render-метод вызывается каждый кадр, поэтому не кладите внутрь него `Sleep(...)` или тяжелый код
- большая часть логики пишется в immediate mode: вы просто заново “рисуете” текущее состояние на каждом кадре
- тяжелые данные, модели, файлы и сервисы лучше подготовить **до** `AddRenderer(...)`, а внутри render-метода использовать только уже готовое состояние

Это хороший выбор, если вы хотите быстро собрать рабочий UI без лишних файлов.

#### Blazor Windows

`Blazor Windows` обычно требует чуть больше структуры, но дает намного более богатый UI.

- можно использовать HTML, CSS и Razor
- UI обычно разнесен по нескольким файлам: `Script.csx`, `*.razor`, `*.cs`
- лучше подходит для аккуратных окон настроек, форм, control panel и login/widget UI
- чаще приходится думать о bindings, lifecycle компонентов и реактивной модели
- в реальных проектах обычно чище держать markup в `*.razor`, а код в `*.cs`, потому что так проще читать, и IntelliSense там сейчас лучше
- `Script.csx` обычно только создает окно или overlay, а состояние потом живет уже внутри самого компонента
- для Blazor полезно помнить, что `Script.csx` здесь скорее точка входа для создания окна, а не место, которое “рендерит UI каждый кадр”
- поля и состояние компонента обычно живут столько же, сколько само окно или overlay
- CSS удобно загружать в `OnInitializedAsync`, а JavaScript, которому нужен уже существующий DOM, обычно загружается в `OnAfterFirstRenderAsync`

На практике это значит, что Blazor обычно требует чуть больше структуры, зато результат гораздо больше похож на законченный продукт.

Коротко:

- `ImGui` проще, быстрее и ближе к формату “все в одном файле”
- `Blazor Windows` сложнее, но красивее и гибче

Еще одно важное различие:

- в Blazor `Script.csx` обычно выступает как точка входа, а реальный UI живет в Razor-компонентах
- в ImGui UI часто рисуется прямо из метода `AddRenderer(...)`

Минимальный пример lifecycle для Blazor:

```csharp
[Inject] public PoeShared.Blazor.Services.IJsPoeBlazorUtils PoeBlazorUtils { get; init; }

protected override async Task OnInitializedAsync()
{
    await base.OnInitializedAsync();
    await PoeBlazorUtils.LoadCss("Styles.css");
}

protected override async Task OnAfterFirstRenderAsync()
{
    await base.OnAfterFirstRenderAsync();
    await PoeBlazorUtils.LoadScript("Script.js");
}
```

Подробнее: [Blazor Windows](/ru/scripting/blazor-windows/getting-started), [Начало работы с ImGui](/ru/scripting/imgui/getting-started)

Примеры:

- [Введение в Blazor](/scripting/blazor-windows/1-intro)
- [Базовые элементы Blazor](/scripting/blazor-windows/3-hello-world)
- [Blazor toggle](/scripting/blazor-windows/4-toggle-hotkeyisactive)
- [Начало работы с ImGui](/scripting/imgui/getting-started)
- [Aim Trainer ML](/scripting/examples/advanced/aimtrainer-ml)

### Особенности синтаксиса Script.csx

Есть несколько мелких синтаксических деталей, которые часто удивляют, потому что `Script.csx` компилируется не так, как обычный `.cs`-файл. Он компилируется как Roslyn submission script.

#### using Namespace; и using для IDisposable — это не одно и то же

Обычные namespace-директивы работают как обычно:

```csharp
using System.Text;
using OpenQA.Selenium;
```

Но конструкции для освобождения ресурсов на верхнем уровне `Script.csx` требуют немного больше внимания.

#### Для top-level using с IDisposable лучше делать отдельный scope

Если вы хотите освобождать ресурсы прямо на верхнем уровне `Script.csx`, лучше создать явный scope через `{}`.

Это относится и к `using var`, и к `using (...) { ... }`.

Самый простой вариант:

```csharp
{
    using var canvas = GetService<IOnScreenCanvasScriptingApi>().Create();
    Log.Info("Canvas created");
}
```

Или так:

```csharp
{
    using (var stream = GetService<IScriptFileProvider>().GetFileInfo("docs/help.md").CreateReadStream())
    {
        Log.Info("Stream opened");
    }
}
```

Почему так:

- `Script.csx` компилируется особым образом
- верхний уровень скрипта не полностью совпадает с телом обычного метода
- без отдельного scope такие конструкции могут не скомпилироваться

Внутри обычных методов, local function, `try`, `if`, `while` и других блоков `using` обычно работает без проблем.

Практическое правило:

- `using Some.Namespace;` в начале файла пишите как обычно
- `using var resource = ...` на верхнем уровне `Script.csx` помещайте внутрь `{ ... }`
- `using (...) { ... }` на верхнем уровне `Script.csx` тоже помещайте внутрь внешнего `{ ... }`
- если у вас уже есть `try { ... }`, отдельный scope обычно не нужен, потому что он уже есть

Примеры:

- [Рендер курсора в OSD](/scripting/examples/basic/osd-cursor)
- [Профилирование CV](/scripting/examples/advanced/profiling-cv)

#### async/await можно использовать свободно

В `Script.csx` можно нормально использовать `async/await`.

Например:

```csharp
var text = await File.ReadAllTextAsync("input.txt");
Log.Info(text);
```

Или так:

```csharp
async Task<int> LoadValue()
{
    await Task.Delay(100);
    return 42;
}

var value = await LoadValue();
Log.Info(value);
```

На практике это значит:

- если в скрипте есть `await`, компилятор сам подстроит сигнатуру
- снаружи EyeAuras все равно всегда ждет завершения скрипта через `await`
- вам не нужно вручную менять top-level return type на `Task<T>`

Поэтому в повседневной работе можно думать очень просто:

- нужен `await` — просто используйте `await`
- нужен результат — просто делайте `return`
- компилятор и runtime подстроятся
- снаружи скрипт все равно await-ится, так что для автора скрипта это ощущается естественно

И еще одна рекомендация: по возможности избегайте `async void` и предпочитайте `async Task`, даже несмотря на то, что некоторые внутренние rewriter-ы EyeAuras умеют автоматически подправлять такие случаи.

#### Top-level состояние скрипта может переживать повторные запуски

Это еще один частый источник путаницы.

Внутри EyeAuras `Script.csx` не всегда ведет себя так, будто при каждом запуске создается заново. Если скрипт не перекомпилировался и его runtime-контекст остался тем же, часть top-level состояния может переживать повторные вызовы.

На практике это значит:

- поля и свойства объекта скрипта могут жить дольше одного запуска
- иногда это удобно как “локальный кэш скрипта”
- для общего или важного состояния `Variables` все равно остается лучшим выбором

Хорошее практическое правило:

- временное внутреннее состояние текущего экземпляра скрипта можно держать в полях
- состояние, которое должно быть явно видно, редактируемо и доступно из других частей EyeAuras, лучше хранить в `Variables`

### Что такое песочница и зачем она нужна

Песочница — это среда, в которой выполняется ваш скрипт. Она:

- дает базовые возможности вроде `Log`, `Sleep(...)`, `GetService<T>()`
- хранит состояние между запусками там, где это предусмотрено
- помогает корректно останавливать скрипты и правильно освобождать их ресурсы

Если коротко, песочница — это host, который вам не нужно писать самостоятельно.

Подробнее: [Песочница](/ru/scripting/sandbox)

### Как получить доступ к API программы

Есть три основных варианта:

- `[Inject]` + `init` — хороший вариант для базовых зависимостей, которые задаются один раз при старте
- `[Dependency]` + `set` — удобно, когда зависимость должна быть свойством, которое при необходимости можно заменить
- `GetService<T>()` — когда сервис нужен прямо здесь и прямо сейчас

Минимальные примеры:

```csharp
[Inject] public IAuraTreeScriptingApi AuraTree { get; init; }
```

```csharp
[Dependency] public ISendInputScriptingApi SendInput { get; set; }
```

```csharp
var input = GetService<ISendInputScriptingApi>();
```

Если вы только начинаете, `GetService<T>()` обычно самый понятный вариант. В больших кодовых базах свойства с `[Inject]` или `[Dependency]` часто делают скрипт чище.

Подробнее: [Dependency Injection](/ru/scripting/dependency-injection), [Script Container Extensions](/ru/scripting/script-container-extensions)

Примеры:

- [Трекинг мыши с overlay](/scripting/examples/basic/mouse-track-with-overlay)
- [Вывод переменных на экран](/scripting/examples/basic/print-variables-on-screen)

### Что такое cancellationToken и откуда он берется

`cancellationToken` автоматически доступен в каждом скрипте. EyeAuras передает его в песочницу до старта скрипта.

Очень коротко: `CancellationToken` в .NET — это стандартный объект, которым коду говорят: “пора остановиться”. Официальная документация: [CancellationToken](https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtoken?view=net-9.0).

На практике это значит:

- когда скрипт нужно остановить, программа посылает сигнал отмены
- `Sleep(...)` завершается раньше
- долгоживущий код может остановиться корректно и освободить ресурсы

Важно: EyeAuras умеет автоматически внедрять часть логики отмены, но в реальном коде все равно лучше писать явную, читаемую логику с учетом cancellation самостоятельно.

### Как правильно держать долгоживущий скрипт запущенным

Здесь есть два основных сценария.

#### 1. Скрипту нужно просто жить, пока его не остановят

Если вы уже создали overlay, окно, renderer, subscription или другой фоновый объект, и после этого скрипту не нужен активный polling, обычно достаточно вот этого:

```csharp
cancellationToken.WaitHandle.WaitOne();
```

Это хорошо подходит для:

- ImGui render loops
- Blazor / overlay окон
- subscription-ов, которые уже работают сами по себе
- сервисов, которым нужно просто жить до остановки скрипта

Главный плюс в том, что вы не крутите пустой цикл и не тратите CPU без причины.

#### 2. Скрипт должен активно что-то делать в цикле

Если у вас есть активный цикл, используйте явную проверку отмены:

```csharp
while (!cancellationToken.IsCancellationRequested)
{
    DoSomething();
    Sleep(50);
}
```

Это хорошо подходит для:

- периодических проверок состояния
- polling API триггеров и их результатов
- обновления координат, HUD и вспомогательной логики

Важные моменты:

- не делайте busy loop без `Sleep(...)`, если только у вас нет очень веской причины
- если цикл внутри чего-то ждет, постарайтесь сделать это ожидание aware к отмене
- `Sleep(...)` в EyeAuras уже умеет завершаться раньше при остановке скрипта

Коротко:

- используйте `WaitOne()` для сценария “все уже работает, просто живи до остановки”
- используйте `while (!cancellationToken.IsCancellationRequested)` для сценария “пока жив — продолжай работать”

Примеры:

- [Начало работы с ImGui](/scripting/imgui/getting-started)
- [Трекинг мыши с overlay](/scripting/examples/basic/mouse-track-with-overlay)
- [UOPilot eat3](/scripting/examples/porting/UOPilot-eat3)
- [YOLO11 ESP](/scripting/examples/advanced/yolo11-esp)

### Почему в скриптах Sleep(...) лучше, чем Thread.Sleep(...)

В `Script.csx` почти всегда лучше использовать sandbox-версию `Sleep(...)`.

Почему:

- `Sleep(...)` связан с `cancellationToken` и может завершиться раньше при остановке
- EyeAuras специально оптимизирует этот механизм под сценарии автоматизации
- `Thread.Sleep(...)` внутри `Script.csx` дополнительно переписывается rewriter-ом в `Sleep(...)`

Подробнее: [Переработка Sleep()](/ru/changelogs/7533)

Ниже — изображение со сравнением точности разных способов ожидания:

![Сравнение точности методов ожидания](https://s3.eyeauras.net/media/2026/04/JtC5Nto2rZ.png)

Практическое правило:

- в `Script.csx` пишите `Sleep(...)`
- не используйте `Thread.Sleep(...)`
- `Task.Delay(...)` используйте только если вам действительно нужна async-модель и вы понимаете зачем

### Какие rewriter-ы EyeAuras применяет к Script.csx

EyeAuras применяет code rewriter-ы к `Script.csx`. Это еще одна причина, почему важно отделять код скрипта от обычных классов.

На практике достаточно помнить хотя бы следующее:

- EyeAuras старается защищать бесконечные циклы вроде `while (true)`, добавляя проверку `cancellationToken`
- `Thread.Sleep(...)` в коде скрипта заменяется на `Sleep(...)`
- некоторые вызовы, которые умеют принимать `CancellationToken`, runtime может автоматически подстроить

Это полезная страховка, но не повод писать небрежный код. Лучшая практика все равно такая:

- сами пишите `while (!cancellationToken.IsCancellationRequested)`
- сами пишите `Sleep(...)`
- не полагайтесь полностью на “магию” rewriter-ов

### Зачем нужны Anchors, ExecutionAnchors и disposable-ресурсы

В EyeAuras полезно думать не только в терминах “какой объект я создал”, но и “когда он должен умереть”.

Если объект потом нужно корректно очистить, его обычно привязывают к `CompositeDisposable`. Официальная справка: [CompositeDisposable](https://learn.microsoft.com/en-us/previous-versions/dotnet/reactive-extensions/hh228980(v=vs.103)).

Важные уровни lifecycle такие:

- `Anchors` — это якоря песочницы или объекта. Если добавить туда ресурс, он будет жить столько, сколько живет сама песочница или объект
- `ExecutionAnchors` — это якоря **текущего запуска скрипта**. При остановке и повторном старте скрипта они создаются заново
- локальный `CompositeDisposable` удобен внутри ваших helper-классов, когда вы хотите собрать несколько ресурсов в один cleanup-“пакет”

Короткое правило:

- если ресурс должен умереть вместе с текущим запуском, добавляйте его в `ExecutionAnchors`
- если ресурс должен жить дольше — пока не выгрузится сам скрипт или helper, используйте `Anchors`

Пример:

```csharp
var overlay = GetService<IImGuiExperimentalApi>()
    .AddTo(ExecutionAnchors);
```

Это значит, что overlay живет только в рамках текущего запуска скрипта.

Примеры:

- [Вывод переменных на экран](/scripting/examples/basic/print-variables-on-screen)
- [Трекинг мыши с overlay](/scripting/examples/basic/mouse-track-with-overlay)
- [Aim Trainer ML](/scripting/examples/advanced/aimtrainer-ml)

### Что такое IScriptingApiContext

`IScriptingApiContext` — это внутренний объект контекста скрипта. В нем есть:

- Roslyn `Solution` текущего скрипта
- DI-контейнер, привязанный к этому контексту
- версия workspace
- `Anchors` для ресурсов этого контекста

Обычному автору скрипта обычно не нужно создавать `IScriptingApiContext` вручную. Но общую идею полезно понимать:

- с одной песочницей может быть связано несколько контекстов
- сервисы могут резолвиться не только из “главного” контейнера
- у самого контекста есть собственный lifecycle и свои `Anchors`

Это становится особенно важно, если вы делаете собственные библиотеки, расширения или переносите код из одного файла в более крупную структуру.

### Когда именно использовать ExecutionAnchors

Если ваш скрипт создает ресурсы, которые должны умереть вместе с **текущим запуском скрипта**, привязывайте их к `ExecutionAnchors`.

Типичные примеры:

- overlays
- renderers
- временные subscriptions
- helper-объекты, которые не должны переживать stop/start

Идея простая: если ресурс относится именно к текущему выполнению скрипта, привяжите его к lifetime этого выполнения.

Примеры:

- [UOPilot eat3](/scripting/examples/porting/UOPilot-eat3)
- [YOLO11 ESP](/scripting/examples/advanced/yolo11-esp)

### Какие бывают переменные

На практике удобно думать о трех уровнях:

- локальные переменные C# внутри метода
- свойства песочницы: живут, пока скрипт не будет перекомпилирован
- переменные скрипта/ауры/папки: внешнее хранилище, видимое в UI и доступное другим скриптам

Для большинства сценариев лучший API — это `ScriptVariable<T>` через `Variables.Get<T>(...)`.

```csharp
var attempts = Variables.Get<int>("attempts");
attempts.Value++;
```

Плюсы этого подхода:

- безопаснее по типам, чем работа через `object`
- код проще читать и писать
- легко делиться состоянием между скриптами

Подробнее: [Переменные](/ru/scripting/variables), [IVariablesScriptingApi](/scripting/api/IVariablesScriptingApi)

Примеры:

- [Работа с переменными](/scripting/examples/basic/variables)
- [Вывод переменных на экран](/scripting/examples/basic/print-variables-on-screen)

### Ауры и доступ к ним из скриптов

Скрипт обычно имеет доступ к текущей ауре и текущей папке:

- `AuraTree.Aura`
- `AuraTree.Folder`

Также можно находить другие объекты по пути:

- `FindAuraByPath(...)` / `GetAuraByPath(...)`
- `FindFolderByPath(...)` / `GetFolderByPath(...)`
- `GetTriggerByPath<T>(...)`

Полезное правило:

- используйте `Find*`, когда отсутствие объекта — нормальная ситуация
- используйте `Get*`, когда отсутствие объекта — это ошибка

Важно: у аур тоже есть свои переменные. То есть данные можно хранить не только на уровне текущего скрипта, но и на уровне ауры или папки.

```csharp
var aura = AuraTree.GetAuraByPath(@".\Gameplay\Boss");
var phase = Variables.Get<string>(aura, "phase");
```

Подробнее: [IAuraTreeScriptingApi](/scripting/api/IAuraTreeScriptingApi), [IAuraAccessor](/scripting/api/IAuraAccessor), [Как найти ауру](/scripting/examples/basic/find-aura)

Примеры:

- [Как найти ауру](/scripting/examples/basic/find-aura)
- [Поиск текста](/scripting/examples/basic/text-search)
- [Как найти изображение](/scripting/examples/basic/image-search)

### Что такое AddNewExtension<T>() и когда он нужен

Некоторые возможности EyeAuras упакованы как отдельные container extensions. Именно так в DI-контейнер подключается новый набор сервисов.

Например, некоторые библиотеки ожидают явной активации прямо из `Script.csx`:

```csharp
AddNewExtension<ImGuiContainerExtensions>();
var imgui = GetService<IImGuiExperimentalApi>();
```

```csharp
AddNewExtension<FridaContainerExtensions>();
var frida = GetService<IFridaExperimentalApi>();
```

Это особенно удобно для модульных пакетов, которые не хочется держать включенными всегда.

Подробнее: [Script Container Extensions](/ru/scripting/script-container-extensions), [Начало работы с ImGui](/ru/scripting/imgui/getting-started)

Примеры:

- [Aim Trainer ML](/scripting/examples/advanced/aimtrainer-ml)
- [YOLO11 ESP](/scripting/examples/advanced/yolo11-esp)

### Когда использовать NuGet-пакеты

Если библиотека уже существует как NuGet-пакет, это обычно **лучший** вариант.

Почему:

- проще подключать и обновлять
- лучше переносимость
- лучше работает с export/import и IDE workflow
- в новых ревизиях `pack` EyeAuras заранее подгружает NuGet-зависимости и включает их в pack

Базовый синтаксис:

```csharp
#r "nuget: Some.Package, 1.2.3"
```

Минимальный пример:

```csharp
#r "nuget: Newtonsoft.Json, 13.0.3"

using Newtonsoft.Json;

Log.Info(JsonConvert.SerializeObject(new { Hello = "World" }));
```

Важно: директивы `#r` должны быть написаны в `Script.csx`. В обычных связанных `*.cs`-классах они не работают.

Подробнее: [NuGet и сборки](/ru/scripting/nuget), [Упаковка NuGet внутрь pack-ов](/ru/changelogs/8047)

### Когда использовать локальные сборки

Локальные сборки полезны, когда:

- нет NuGet-пакета
- библиотека внутренняя или приватная
- вы хотите положить DLL рядом со скриптом как часть проекта

Обычно самый переносимый вариант такой:

1. добавить DLL в файлы скрипта как embedded resource
2. сослаться на нее через `#r "assemblyPath: MyLib.dll"`

Минимальный пример:

```csharp
#r "assemblyPath: MyLib.dll"

using MyLib;

var helper = new SomeLibraryHelper();
Log.Info(helper.ToString());
```

Это намного лучше, чем абсолютный путь вроде `D:\\Work\\Something\\MyLib.dll`, потому что такой путь работает только на машине автора.

Абсолютные пути лучше оставлять для локальных экспериментов и отладки. Для переносимых решений предпочитайте:

- NuGet
- embedded resources

Подробнее: [Embedded resources](/ru/scripting/embedded-resources), [NuGet и сборки](/ru/scripting/nuget)

### Что такое pack и что происходит с зависимостями при упаковке

[`Pack`](/ru/features/packs) — это переносимая версия вашего решения на базе EyeAuras. Обычно он включает:

- совместимую версию программы
- конфиг
- ауры, скрипты, макросы, behavior tree
- связанные ресурсы

Что важно для скриптов:

- в новых ревизиях pack NuGet-пакеты заранее подгружаются и включаются в pack
- ресурсы проекта тоже включаются в pack
- если вы хотите переносимое решение, не завязывайтесь на абсолютные пути на локальном диске

Если скрипт должен запускаться где-то еще, кроме вашей собственной машины, хорошее базовое правило такое:

- `NuGet > embedded DLL > absolute DLL path`

Подробнее: [Packs](/ru/features/packs), [Упаковка NuGet внутрь pack-ов](/ru/changelogs/8047), [ресурсы в pack-ах](/ru/changelogs/7477)

### Что такое mini-app

[`Mini-app`](/ru/features/mini-app) — это уже не просто “скрипт внутри EyeAuras”, а ваш собственный продукт поверх EyeAuras.

Коротко:

- обычный скрипт или pack: пользователь все еще много взаимодействует с UI EyeAuras
- mini-app: пользователь в основном работает с вашим UI и вашей логикой

Mini-app подходит, если вы хотите:

- сделать свой интерфейс
- собрать tool, helper, launcher, bot или utility
- жестче контролировать UX
- позже добавить лицензирование, KeyLogin и другие продуктовые возможности

Подробнее: [Mini-app](/ru/features/mini-app), [EyePad](/ru/features/eyepad)

### Может ли скрипт вырасти в полноценное приложение

Да. Это одна из ключевых сильных сторон всей системы.

Типичный путь роста выглядит так:

- быстрый `.csx` или `C# Action`
- экспорт в `.sln`
- разработка в Rider / Visual Studio
- `Import` / `Live Import`
- публикация как `pack`
- переход в `mini-app`, если это понадобится

То есть скрипт EyeAuras — это не тупиковый “встроенный макрос”. Это обычная точка входа в более крупный проект.

Подробнее: [Интеграция с IDE](/ru/scripting/ide-integration), [Mini-app](/ru/features/mini-app)

### Что насчет лицензирования

Если вы строите свой продукт поверх EyeAuras, тут есть несколько связанных тем:

- [`pack`](/ru/features/packs) для распространения
- [сублицензии](/ru/features/sublicenses) для платного доступа к вашему pack или mini-app
- [key login](/ru/features/keylogin) для быстрого входа пользователя по ключу
- [защита скриптов](/ru/features/script-protection), если нужно скрыть детали реализации

Для обычных локальных скриптов об этом можно вообще не думать. Для коммерческих или приватных решений это уже становится важной частью архитектуры.

## Практические рекомендации

### Сначала используйте встроенные механизмы EyeAuras, потом добавляйте код там, где он действительно нужен

Если задачу можно чисто собрать на готовых триггерах, аурах, переменных и actions, обычно с этого и лучше начинать. Скрипты особенно хорошо работают как “умная прослойка” между уже готовыми частями платформы.

Обычно проще и надежнее:

- взять существующий trigger
- получить его результат через `AuraTree`
- добавить сверху свою логику

чем писать всю механику вручную с нуля.

### Предпочитайте явную логику с учетом cancellation

Хотя EyeAuras местами умеет помогать автоматически, явный код обычно лучше:

- его проще читать
- его проще поддерживать
- и людям, и AI проще менять его без ошибок

Хорошие базовые шаблоны:

- `cancellationToken.WaitHandle.WaitOne();`
- `while (!cancellationToken.IsCancellationRequested) { ... }`

### Используйте возможности песочницы в Script.csx, а в связанных классах пишите обычный C#

Правило простое, но очень полезное.

В `Script.csx` совершенно нормально писать:

- `Log.Info(...)`
- `Sleep(...)`
- `GetService<T>()`
- `AuraTree.Get...(...)`

А в helper-классах лучше либо:

- принимать зависимости через конструктор
- либо создавать сам helper через `GetService<T>()`, чтобы контейнер собрал зависимости за вас

### Не завязывайте переносимые скрипты на локальные пути автора

Если решение потом будут запускать другие люди, избегайте:

- `D:\\...`
- ссылок на локальные папки с ресурсами
- DLL, которые лежат “где-то у вас на компьютере”

Для переносимых решений почти всегда лучше использовать:

- `#r "nuget: ..."`
- embedded resources
- pack

### Предпочитайте стабильный API ввода

В старых примерах и документации вам еще может встретиться `ISendInputUnstableScriptingApi`, но для нового кода лучше использовать [ISendInputScriptingApi](/scripting/api/ISendInputScriptingApi).

Старый API полезно знать в основном потому, что он все еще может попадаться в legacy-скриптах.

`Unstable` в названии API обычно не значит “сломанный” или “опасный”. Обычно это лишь значит, что интерфейс еще может меняться между версиями. Если уже есть стабильный аналог — выбирайте его. Если нужная вам возможность пока есть только в `Unstable`, использовать ее нормально — просто учитывайте возможные breaking changes при обновлении.

Примеры с новым API:

- [Aim Tracker ML EA](/scripting/examples/advanced/aimtracker-ml-ea)
- [Aim Trainer ML](/scripting/examples/advanced/aimtrainer-ml)
- [Profiling CV](/scripting/examples/advanced/profiling-cv)

### Для переменных предпочитайте Variables.Get<T>()

Можно работать и через строковый индексатор, но типизированный доступ через `ScriptVariable<T>` обычно заметно чище и безопаснее.

### Для необязательных объектов используйте Find*, для обязательных — Get*

Это простое правило сильно снижает количество случайных падений и делает намерение кода заметно понятнее.

### Если скрипт создает ресурсы на один запуск, привязывайте их к ExecutionAnchors

Это особенно важно для:

- renderers
- overlay-объектов
- временных subscriptions

Так stop/start ведет себя предсказуемо, и скрипт оставляет после себя меньше мусора.

Примеры:

- [Вывод переменных на экран](/scripting/examples/basic/print-variables-on-screen)
- [Трекинг мыши с overlay](/scripting/examples/basic/mouse-track-with-overlay)
- [YOLO11 ESP](/scripting/examples/advanced/yolo11-esp)

### Не забывайте про AddNewExtension<T>() для библиотек, которым нужна отдельная регистрация

Если пакет явно говорит вызвать `AddNewExtension<T>()`, это не просто `using`. Это реальная регистрация нового набора сервисов в контейнере.

Типичный пример:

```csharp
AddNewExtension<ImGuiContainerExtensions>();
var imgui = GetService<IImGuiExperimentalApi>();
```

Без регистрации сервис может просто не появиться в контейнере.

Примеры:

- [Aim Trainer ML](/scripting/examples/advanced/aimtrainer-ml)
- [YOLO11 ESP](/scripting/examples/advanced/yolo11-esp)

### Когда скрипт вырастает, переходите в .sln

Если код уже стал большим, не пытайтесь бесконечно держать все в одном файле.

Хороший момент для перехода — когда:

- у вас уже несколько классов
- нужен нормальный поиск по коду
- вы хотите писать тесты
- появились ресурсы, Razor, несколько проектов или много зависимостей

Именно для этого и нужны [Export / Import / Live Import](/ru/scripting/ide-integration).

Для script-проектов, которые уже больше похожи на приложение — с bot loop, собственным script runtime, корневым ImGui UI, Blazor tool windows, профилями и буферизованным сохранением конфига — используйте рецепт [ImGui memory bot recipe](/scripting/api/recipes/imgui-memory-bot-custom-scripting).

И еще одна практическая деталь: `Export` очищает целевую папку перед экспортом проекта, поэтому не экспортируйте в директорию, где лежат важные файлы.

Если вы регулярно пишете или поддерживаете большие скрипты, очень рекомендуется работать в связке вроде `IDE + AI + EyeAuras MCP`. Мой текущий выбор — `Rider + AI Assistant/Codex + EyeAuras MCP`, но `Visual Studio` и `VS Code` тоже вполне подходят.

Подробнее: [Интеграция IDE, AI и MCP](/ru/scripting/ide-integration)

## Частые задачи

### Как найти изображение на экране

Для большинства задач самый простой и надежный вариант — использовать настроенный trigger `Image Search` и читать его результат из скрипта.

```csharp
var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>(@".\ImageSearch");
var result = trigger.Refresh();

if (!result.Detected.Success)
{
    Log.Warn("Image not found");
    return;
}

var screenRect = result.ToScreen(result.Detected.Bounds.Value);
Log.Info($"Image found @ {screenRect}");
```

Подробнее: [Как найти изображение](/scripting/examples/basic/image-search)

См. также:

- [Поиск по цвету](/scripting/examples/basic/color-search)
- [Поиск текста](/scripting/examples/basic/text-search)

### Как нажать кнопку или отправить клавишу

Для этого обычно нужен `ISendInputScriptingApi`:

```csharp
var input = GetService<ISendInputScriptingApi>();
input.KeyPress(Key.F);
input.MouseLeftClick();
```

В зависимости от задачи можно использовать:

- `KeyPress(...)`
- `KeyDown(...)` / `KeyUp(...)`
- `MouseMoveTo(...)`
- `MouseLeftClick()` / `MouseRightClick()`

Подробнее: [ISendInputScriptingApi](/scripting/api/ISendInputScriptingApi)

Примеры:

- [Нажать случайную клавишу](/scripting/examples/basic/press-random-key)
- [Отправка текста](/scripting/examples/basic/send-text)
- [Переместить мышь в центр](/scripting/examples/basic/send-mouse-center)

### Как кликнуть по найденному изображению или слову

Общий шаблон почти всегда один и тот же:

1. получить границы найденного объекта
2. перевести их в экранные координаты
3. взять центр
4. переместить мышь и кликнуть

```csharp
var input = GetService<ISendInputScriptingApi>();
var trigger = AuraTree.GetTriggerByPath<IImageSearchTrigger>(@".\ImageSearch");
var result = trigger.Refresh();

if (!result.Detected.Success)
{
    return;
}

var screenRect = result.ToScreen(result.Detected.Bounds.Value);
input.MouseMoveTo(screenRect.Center());
input.MouseLeftClick();
```

Для текста логика такая же, просто источником данных будет `Text Search`.

Подробнее: [Как кликнуть по распознанному тексту](/scripting/examples/basic/click-on-text)

См. также:

- [Поиск текста](/scripting/examples/basic/text-search)
- [Как найти изображение](/scripting/examples/basic/image-search)

### Как работать с координатами

Это один из самых частых источников ошибок.

В EyeAuras обычно приходится иметь дело с тремя типами координат:

- локальные координаты viewport / capture window
- координаты относительно окна
- экранные координаты

Безопасное правило простое:

- если данные пришли из image/text/color trigger, не спешите кликать по ним напрямую
- сначала убедитесь, в какой вы системе координат
- если у вас raw-результат, переводите координаты через `ToScreen(...)` или `ToScreenPoint(...)`

Самые полезные методы:

- `ToScreen(rect)`
- `ToScreenPoint(rect)`
- `Center()`

Подробнее: [WindowImageProcessedEventArgs](/scripting/api/WindowImageProcessedEventArgs)

Примеры:

- [Как найти изображение](/scripting/examples/basic/image-search)
- [Как кликнуть по распознанному тексту](/scripting/examples/basic/click-on-text)
- [Поиск по цвету](/scripting/examples/basic/color-search)

### Как проще работать с embedded resources

Embedded resources удобны, когда нужно поставлять файлы вместе со скриптом:

- изображения для Blazor UI
- локальные markdown- или html-инструкции
- json-конфиг
- DLL, которую неудобно тянуть через NuGet

Два самых простых сценария:

Показать изображение в Blazor:

```html
<img src="Images/logo.png" />
```

Прочитать текстовый файл из скрипта:

```csharp
var files = GetService<IScriptFileProvider>();
var helpText = files.ReadAllText("docs/help.md");
Log.Info(helpText);
```

Небольшая практическая деталь, которая часто экономит время: лучше писать `Images/logo.png` или `docs/help.md`, а не просто `logo.png` или `help.md`. Короткие имена удобны, но если окончания путей совпадут, легко случайно взять не тот файл.

Если библиотека уже есть в NuGet, почти всегда лучше подключать ее через `#r "nuget: ..."`. Embedded resources особенно хороши для ваших собственных файлов и переносимых DLL.

Подробнее: [Embedded resources](/ru/scripting/embedded-resources)

Примеры:

- [File Provider](/scripting/examples/basic/file-provider)

## Что читать дальше

- [Быстрый старт](/ru/scripting/getting-started)
- [Песочница](/ru/scripting/sandbox)
- [ImGui memory bot recipe](/scripting/api/recipes/imgui-memory-bot-custom-scripting)
- [Hotkeys](/ru/scripting/keybinds)
- [Dependency Injection](/ru/scripting/dependency-injection)
- [Script Container Extensions](/ru/scripting/script-container-extensions)
- [Переменные](/ru/scripting/variables)
- [NuGet и сборки](/ru/scripting/nuget)
- [Embedded resources](/ru/scripting/embedded-resources)
- [Blazor Windows](/ru/scripting/blazor-windows/getting-started)
- [Начало работы с ImGui](/ru/scripting/imgui/getting-started)
- [Интеграция с IDE](/ru/scripting/ide-integration)
- [Packs](/ru/features/packs)
- [Mini-app](/ru/features/mini-app)
- [Лицензии для pack-ов](/ru/features/sublicenses)
- [Защита скриптов](/ru/features/script-protection)