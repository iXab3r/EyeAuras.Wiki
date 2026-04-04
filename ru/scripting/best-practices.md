---
title: FAQ и лучшие практики
description: Краткие рекомендации по написанию C# скриптов в EyeAuras
published: true
date: 2026-04-02T12:00:00.000Z
tags: c#, scripting, faq, best-practices
editor: markdown
dateCreated: 2026-04-02T12:00:00.000Z
---
# FAQ и лучшие практики для скриптов EyeAuras

Скрипты EyeAuras это обычный C# код, который выполняется внутри готовой среды EyeAuras. Они подходят и для маленьких утилит на 20 строк, и для больших решений, которые позже можно вырастить в [pack](/ru/features/packs) или [mini-app](/ru/features/mini-app).

## Самое важное отличие: `Script.csx` и обычные классы

Это один из самых важных моментов во всей системе.

Код в `Script.csx` проходит через специальную обработку EyeAuras:

- он выполняется внутри [sandbox](/ru/scripting/sandbox)
- у него есть прямой доступ к `Log`, `Sleep(...)`, `GetService<T>()`, `AuraTree`, `Variables`, `cancellationToken`
- к нему применяются code rewriters, которые подправляют некоторые конструкции

Например, в самом `Script.csx` вы можете написать так:

```csharp
Log.Info("Script started");
Sleep(100);

var input = GetService<ISendInputScriptingApi>();
input.KeyPress(Key.F);
```

А вот связанные классы, которые лежат рядом со скриптом, это уже **самый обычный C#**. У них нет "магического" прямого доступа к sandbox.

Если вы напишете отдельный класс, он не сможет просто так обратиться к `Log` или `AuraTree`:

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

То есть правило простое:

- `Script.csx` это специальная точка входа EyeAuras
- связанные классы это обычные C# классы
- если связанному классу нужны сервисы, их нужно передать через конструктор, свойства или создать через `GetService<T>()`

Это важно помнить и людям, и AI: не весь код проекта имеет одинаковые "магические" возможности.

## Зачем вообще писать скрипты в EyeAuras

Самый важный ответ: скрипты нужны не потому, что "писать программу сложно", а потому, что **EyeAuras уже является готовой платформой автоматизации**.

Если писать отдельную программу с нуля, вам придется самостоятельно собрать вокруг вашей логики:

- захват изображения
- поиск текста и картинок
- симуляцию ввода
- горячие клавиши и жизненный цикл долгоживущего кода
- оверлеи и UI
- конфиг, обновления и распространение

В EyeAuras большая часть этой инфраструктуры уже есть. Поэтому вы пишете только свою логику и сразу можете использовать готовые ауры, триггеры, переменные, CV API, ввод и UI.

Это дает несколько практических плюсов:

- очень низкая цена старта: можно быстро проверить идею в одном скрипте
- удобно смешивать визуальную логику и код: часть собрать триггерами и аурами, часть дописать на C#
- быстрый цикл разработки: особенно через [Export / Import / Live Import](/ru/scripting/ide-integration)
- нет тупика по масштабу: маленький скрипт можно вырастить в `.sln`, потом в `pack`, потом в `mini-app`

Если же ваш проект вообще не использует возможности EyeAuras и по сути не зависит от ее среды выполнения, то обычная отдельная программа на .NET может быть более прямым вариантом.

## FAQ

### Что такое скрипт в EyeAuras

С точки зрения языка это обычный C# код на .NET и Roslyn. С точки зрения продукта это код, который запускается внутри [песочницы](/ru/scripting/sandbox) и получает доступ к API EyeAuras: логам, переменным, аурам, вводу, CV, UI и другим сервисам.

Подробнее: [С чего начать](/ru/scripting/getting-started), [Песочница](/ru/scripting/sandbox)

Примеры:

- [Hello World](/ru/scripting/examples/basic/hello-world)
- [Запуск процесса](/ru/scripting/examples/basic/process-start)

### Что EyeAuras уже дает "из коробки"

Перед тем как писать отдельную программу, полезно понимать, что в EyeAuras уже есть готовые механизмы:

- поиск текста и картинок на экране
- ввод с клавиатуры и мыши
- ауры, триггеры и переменные
- overlays, Blazor Windows, ImGui и другой UI
- export/import `.sln`
- [pack](/ru/features/packs) и [пакование](/ru/features/packs) для распространения
- [mini-app](/ru/features/mini-app) для сборки своего приложения на базе EyeAuras
- [key login](/ru/features/keylogin) для входа по ключу
- [sublicenses](/ru/features/sublicenses) для выдачи лицензий на ваши паки и mini-app
- [script protection](/ru/features/script-protection) для защиты кода при распространении

Если вы делаете приватное или коммерческое решение, то licensing, key login, packs и защита кода часто экономят очень много времени.

### Когда использовать `Keybind` и чем он похож на AutoHotkey

`[Keybind]` это способ повесить обработчик клавиши прямо на метод скрипта.

Если вы раньше писали на AutoHotkey, то это очень похожая идея:

- `F1::` в AHK похоже на `[Keybind("F1")]`
- `*F1::` похоже на `[Keybind("F1", IgnoreModifiers = true)]`
- `~F1::` похоже на `[Keybind("F1", SuppressKey = false)]`
- `d up::` похоже на `[Keybind("D", ActivationType = KeybindActivationType.KeyUp)]`

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

Зачем это нужно на практике:

- быстро включать и выключать бота
- показывать debug overlay
- дергать тестовые действия без отдельного UI
- делать "внутренние" developer hotkeys

Два важных нюанса:

- keybind работает только пока сам скрипт запущен
- обработчики keybind по умолчанию могут выполняться параллельно, если вы быстро нажимаете клавишу несколько раз

Если вам нужно не пускать второй обработчик, пока не закончился первый, можно сделать так:

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

Небольшой полезный бонус: обработчик keybind тоже может принимать зависимости как параметры метода, если они уже доступны через DI.

Если же hotkey должен быть виден в дереве аур, сочетаться с условиями и жить как часть общей визуальной логики, часто удобнее использовать `HotkeyIsActive` trigger, а не `[Keybind]`.

Подробнее: [Горячие клавиши](/ru/scripting/keybinds)

Примеры:

- [YOLO11 ESP](/ru/scripting/examples/advanced/yolo11-esp)
- [Создание toggle через HotkeyIsActive](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive)

### Какой UI выбрать: Blazor Windows или ImGui

Для пользовательского интерфейса в EyeAuras чаще всего есть два основных пути: `Blazor Windows` и `ImGui`.

#### ImGui

`ImGui` обычно проще всего для старта.

- UI и код можно держать прямо в одном `Script.csx`
- не нужно глубоко погружаться в реактивность и bindings
- отлично подходит для tool windows, debug-панелей, OSD и внутренних окон бота
- render-метод вызывается каждый кадр, поэтому внутри него не стоит делать `Sleep(...)` или тяжелый код
- вся логика обычно описывается в immediate mode: вы просто каждый кадр заново "рисуете" текущее состояние
- тяжелые данные, модели, файлы и сервисы лучше подготовить **до** `AddRenderer(...)`, а внутри render-метода только использовать уже готовое состояние

Это хороший выбор, если вы хотите быстро сделать рабочий интерфейс и не заводить много файлов.

#### Blazor Windows

`Blazor Windows` обычно сложнее по структуре, но заметно богаче по визуальным возможностям.

- можно использовать HTML, CSS и Razor
- UI обычно раскладывается на несколько файлов: `Script.csx`, `*.razor`, `*.cs`
- удобнее делать красивые окна настроек, формы, панели управления и login/widget UI
- тут чаще приходится думать про bindings, component lifecycle и общую реактивную модель
- в реальных проектах часто удобнее держать разметку в `*.razor`, а код в `*.cs`, потому что так проще читать, и сейчас там лучше ожидается IntelliSense
- `Script.csx` обычно только создает окно или оверлей, а дальше состояние живет уже в самом компоненте
- для Blazor полезно помнить, что `Script.csx` это скорее entry point создания окна, а не место, которое "рисует UI каждый кадр"
- поля и состояние компонента обычно живут столько же, сколько живет само окно или overlay
- CSS удобно подгружать в `OnInitializedAsync`, а JavaScript, которому нужен уже существующий DOM, обычно в `OnAfterFirstRenderAsync`

Практически это значит, что Blazor обычно требует чуть больше структуры, но и результат можно сделать намного "продуктовее".

Если очень коротко:

- `ImGui` проще, быстрее и ближе к "все в одном файле"
- `Blazor Windows` сложнее, но красивее и гибче в оформлении

Еще один важный момент:

- в Blazor `Script.csx` обычно выступает как entry point, а реальный UI живет в Razor-компонентах
- в ImGui UI часто прямо рисуется из метода `AddRenderer(...)`

Минимальный пример жизненного цикла в Blazor:

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

Подробнее: [Blazor Windows](/ru/scripting/blazor-windows/getting-started), [ImGui getting started](/ru/scripting/imgui/getting-started)

Примеры:

- [Blazor intro](/ru/scripting/blazor-windows/1-intro)
- [Blazor basic elements](/ru/scripting/blazor-windows/3-hello-world)
- [Blazor toggle](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive)
- [ImGui getting started](/ru/scripting/imgui/getting-started)
- [Aim Trainer ML](/ru/scripting/examples/advanced/aimtrainer-ml)

### Особенности синтаксиса именно в `Script.csx`

Есть несколько мелких особенностей, которые часто удивляют людей, потому что `Script.csx` компилируется не как обычный `.cs`-файл, а как Roslyn submission script.

#### `using Namespace;` и `using` для IDisposable это разные вещи

Обычные директивы namespace работают как обычно:

```csharp
using System.Text;
using OpenQA.Selenium;
```

А вот конструкции для освобождения ресурсов на верхнем уровне `Script.csx` требуют чуть больше аккуратности.

#### Top-level `using` для disposable лучше оборачивать в отдельный scope

Если вы хотите использовать освобождение ресурсов прямо на верхнем уровне `Script.csx`, лучше создать явный scope через `{}`.

Это касается и `using var`, и `using (...) { ... }`.

Простейший вариант:

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
- без отдельного scope такие конструкции могут не собраться

Внутри обычных методов, local functions, `try`, `if`, `while` и других блоков с `using` проблем обычно нет.

Практическое правило:

- `using Some.Namespace;` в начале файла пишите как обычно
- `using var resource = ...` на верхнем уровне `Script.csx` лучше помещать внутрь `{ ... }`
- `using (...) { ... }` на верхнем уровне `Script.csx` тоже лучше помещать внутрь внешнего `{ ... }`
- если уже есть `try { ... }`, отдельный scope обычно не нужен, потому что scope у вас уже есть

Примеры:

- [OSD-отрисовка курсора](/ru/scripting/examples/basic/osd-cursor)
- [Профилирование CV](/ru/scripting/examples/advanced/profiling-cv)

#### `async/await` можно использовать свободно

В `Script.csx` можно спокойно использовать `async/await`.

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

Практически это значит следующее:

- если в скрипте появляется `await`, компилятор сам адаптирует сигнатуру
- снаружи EyeAuras все равно всегда ждет завершения скрипта через `await`
- вам не нужно вручную "подгонять" верхнеуровневый возвращаемый тип под `Task<T>`

То есть в обычной жизни можно мыслить очень просто:

- нужен `await` — просто используйте `await`
- нужен результат — просто `return` значение
- компилятор и рантайм подстроятся под этот сценарий
- снаружи скрипт все равно `await`-ится, так что для автора скрипта это обычно выглядит очень естественно

Отдельная рекомендация: `async void` лучше по возможности избегать и предпочитать `async Task`, даже если некоторые внутренние rewriter'ы EyeAuras умеют подправлять такие случаи автоматически.

#### Верхнеуровневое состояние скрипта может жить между запусками

Это еще одна частая точка путаницы.

`Script.csx` внутри EyeAuras не всегда ведет себя так, будто его полностью создают заново на каждый вызов. Если скрипт не перекомпилировался и его runtime-контекст остался тем же, часть верхнеуровневого состояния может переживать повторные запуски.

Практически это значит:

- поля и свойства script object могут жить дольше одного вызова
- для "локального кэша скрипта" это иногда удобно
- для разделяемого или важного состояния все равно лучше использовать `Variables`

Хорошее практическое правило:

- временное внутреннее состояние текущего script instance можно держать в полях
- состояние, которое должно быть явно видно, редактируемо и доступно другим частям EyeAuras, лучше хранить в `Variables`

### Что такое sandbox и зачем он нужен

Песочница это среда, в которой запускается ваш скрипт. Она:

- дает базовые возможности вроде `Log`, `Sleep(...)`, `GetService<T>()`
- хранит состояние между запусками там, где это предусмотрено
- помогает корректно завершать скрипт и убирать за ним ресурсы

Если коротко, sandbox это тот самый host, который вам не нужно писать самостоятельно.

Подробнее: [Песочница](/ru/scripting/sandbox)

### Как получать доступ к API программы

Есть три основных варианта:

- `[Inject]` + `init`: хороший выбор для основных зависимостей, которые задаются один раз при старте
- `[Dependency]` + `set`: когда зависимость должна быть свойством, которое при желании можно заменить
- `GetService<T>()`: когда сервис нужен точечно и прямо сейчас

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

Если вы только начинаете, `GetService<T>()` обычно самый понятный. Для более крупного кода свойства с `[Inject]` или `[Dependency]` часто делают скрипт чище.

Подробнее: [Dependency Injection](/ru/scripting/dependency-injection), [Script Container Extensions](/ru/scripting/script-container-extensions)

Примеры:

- [Отслеживание мыши с overlay](/ru/scripting/examples/basic/mouse-track-with-overlay)
- [Печать переменных прямо на экране](/ru/scripting/examples/basic/print-variables-on-screen)

### Что такое `cancellationToken` и откуда он берется

`cancellationToken` уже доступен в любом скрипте автоматически. EyeAuras сам пробрасывает его в sandbox перед запуском скрипта.

Если совсем коротко, `CancellationToken` в .NET это стандартный объект, через который программе можно аккуратно сказать коду: "пора останавливаться". Официальная документация: [CancellationToken](https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtoken?view=net-9.0).

Практически это значит следующее:

- если скрипт нужно остановить, программа подаст сигнал отмены
- `Sleep(...)` завершится раньше
- долгоживущий код может корректно закончить работу и освободить ресурсы

Важно: часть cancellation-логики EyeAuras умеет добавлять автоматически, но в реальном коде лучше все равно писать явные и понятные cancellation-aware конструкции.

### Как правильно "держать" долгоживущий скрипт

Есть два основных сценария.

#### 1. Скрипт просто должен жить, пока его не остановят

Если вы уже создали оверлей, окно, renderer, подписки или другой фоновой объект, и дальше от скрипта не требуется активный polling, обычно достаточно:

```csharp
cancellationToken.WaitHandle.WaitOne();
```

Это хороший вариант для:

- ImGui render loop
- Blazor / overlay окон
- подписок, которые уже работают сами
- сервисов, которым просто нужно дать пожить до остановки скрипта

Плюс этого подхода в том, что он не крутит пустой цикл и не тратит CPU без необходимости.

#### 2. Скрипт должен сам что-то делать в цикле

Если у вас активный цикл, используйте явную проверку отмены:

```csharp
while (!cancellationToken.IsCancellationRequested)
{
    DoSomething();
    Sleep(50);
}
```

Это хороший вариант для:

- периодической проверки состояния
- опроса trigger API и их результатов
- обновления координат, HUD и вспомогательной логики

Что важно:

- не делайте пустой цикл без `Sleep(...)`, если на то нет очень веской причины
- если внутри цикла есть ожидание, старайтесь делать его cancellation-aware
- `Sleep(...)` в EyeAuras уже умеет завершаться раньше при остановке скрипта

Если коротко:

- `WaitOne()` для сценария "все уже запущено, просто живем до stop"
- `while (!cancellationToken.IsCancellationRequested)` для сценария "пока живем, продолжаем работать"

Примеры:

- [ImGui getting started](/ru/scripting/imgui/getting-started)
- [Mouse track with overlay](/ru/scripting/examples/basic/mouse-track-with-overlay)
- [UOPilot eat3](/ru/scripting/examples/porting/UOPilot-eat3)
- [YOLO11 ESP](/ru/scripting/examples/advanced/yolo11-esp)

### Почему в скриптах лучше использовать `Sleep(...)`, а не `Thread.Sleep(...)`

Для кода в `Script.csx` почти всегда лучше использовать именно `Sleep(...)` из sandbox.

Почему:

- `Sleep(...)` связан с `cancellationToken` и умеет завершаться раньше при stop
- EyeAuras отдельно оптимизирует этот механизм под сценарии автоматизации
- `Thread.Sleep(...)` в `Script.csx` дополнительно переписывается rewriter'ом в `Sleep(...)`

Подробнее: [Переработка Sleep()](/ru/changelogs/7533)

Ниже сравнительная картинка по точности разных подходов:

![Сравнение точности методов ожидания](https://s3.eyeauras.net/media/2026/04/JtC5Nto2rZ.png)

Практическое правило:

- в `Script.csx` пишите `Sleep(...)`
- `Thread.Sleep(...)` не используйте
- `Task.Delay(...)` используйте только если вам действительно нужна именно асинхронная модель, и вы понимаете зачем

### Какие rewriter'ы EyeAuras применяет к `Script.csx`

К `Script.csx` применяются code rewriters. Это еще одна причина, почему важно отделять код скрипта от обычных классов.

На практике полезно помнить как минимум про такие вещи:

- бесконечные циклы вроде `while (true)` EyeAuras пытается защитить, добавляя проверку `cancellationToken`
- `Thread.Sleep(...)` в коде скрипта заменяется на `Sleep(...)`
- часть вызовов, которые умеют принимать `CancellationToken`, может быть автоматически подправлена runtime

Это полезная страховка, но не повод писать небрежный код. Лучшая практика все равно такая:

- сразу писать `while (!cancellationToken.IsCancellationRequested)`
- сразу писать `Sleep(...)`
- не полагаться полностью на "магию" rewriter'ов

### Что такое `Anchors`, `ExecutionAnchors` и зачем нужны disposable-ресурсы

В EyeAuras очень полезно мыслить не только "какой объект я создал", но и "когда он должен умереть".

Если объект надо потом корректно убрать, его обычно привязывают к `CompositeDisposable`. Официальная справка: [CompositeDisposable](https://learn.microsoft.com/en-us/previous-versions/dotnet/reactive-extensions/hh228980(v=vs.103)).

Важные уровни жизни такие:

- `Anchors` это якоря sandbox или объекта. Если добавить ресурс туда, он живет пока жив сам sandbox или сам объект
- `ExecutionAnchors` это якоря **текущего запуска** скрипта. Stop/start скрипта их пересоздает
- локальный `CompositeDisposable` полезен внутри ваших helper-классов, когда вы сами собираете группу ресурсов в один "пакет"

Короткое правило:

- если ресурс должен умереть при остановке текущего запуска, добавляйте его в `ExecutionAnchors`
- если ресурс должен жить дольше, пока не выгружен сам скрипт или helper, используйте `Anchors`

Пример:

```csharp
var overlay = GetService<IImGuiExperimentalApi>()
    .AddTo(ExecutionAnchors);
```

Это значит: overlay живет только пока жив текущий запуск скрипта.

Примеры:

- [Печать переменных прямо на экране](/ru/scripting/examples/basic/print-variables-on-screen)
- [Отслеживание мыши с overlay](/ru/scripting/examples/basic/mouse-track-with-overlay)
- [Aim Trainer ML](/ru/scripting/examples/advanced/aimtrainer-ml)

### Что такое `IScriptingApiContext`

`IScriptingApiContext` это внутренний объект контекста скрипта. В нем лежат:

- Roslyn `Solution` текущего скрипта
- DI container, связанный с этим контекстом
- версия workspace
- `Anchors` для ресурсов этого контекста

Обычно обычному автору скрипта не нужно создавать `IScriptingApiContext` вручную. Но полезно понимать идею:

- sandbox может быть связан с несколькими контекстами
- сервисы можно резолвить не только из "основного" контейнера
- у контекста тоже есть свой жизненный цикл и свои `Anchors`

Эта тема особенно важна, если вы пишете свои библиотеки, extensions или выносите код из одного файла в более крупную структуру.

### Когда именно использовать `ExecutionAnchors`

Если скрипт создает ресурсы, которые должны умереть вместе с **текущим запуском** скрипта, их стоит привязывать к `ExecutionAnchors`.

Типичные примеры:

- оверлеи
- renderers
- временные подписки
- хелперы, которые не должны переживать stop/start

Идея простая: если ресурс относится именно к текущему выполнению скрипта, привязывайте его к жизни этого выполнения.

Примеры:

- [UOPilot eat3](/ru/scripting/examples/porting/UOPilot-eat3)
- [YOLO11 ESP](/ru/scripting/examples/advanced/yolo11-esp)

### Какие бывают переменные

На практике полезно различать три уровня:

- локальные переменные C# внутри метода
- свойства sandbox: живут, пока скрипт не был перекомпилирован
- script/aura/folder variables: внешнее хранилище, которое видно в UI и доступно другим скриптам

Для большинства сценариев лучший API это `ScriptVariable<T>` через `Variables.Get<T>(...)`.

```csharp
var attempts = Variables.Get<int>("attempts");
attempts.Value++;
```

Преимущества такого подхода:

- типобезопаснее, чем работа через `object`
- удобнее читать и писать
- легко делиться состоянием между скриптами

Подробнее: [Переменные](/ru/scripting/variables), [IVariablesScriptingApi](/ru/scripting/api/IVariablesScriptingApi)

Примеры:

- [Работа с переменными](/ru/scripting/examples/basic/variables)
- [Печать переменных прямо на экране](/ru/scripting/examples/basic/print-variables-on-screen)

### Ауры и доступ к ним из скрипта

У скрипта обычно есть доступ к текущей ауре и текущей папке:

- `AuraTree.Aura`
- `AuraTree.Folder`

Также можно находить другие элементы по пути:

- `FindAuraByPath(...)` / `GetAuraByPath(...)`
- `FindFolderByPath(...)` / `GetFolderByPath(...)`
- `GetTriggerByPath<T>(...)`

Полезное правило:

- `Find*` используйте, когда отсутствие объекта нормально
- `Get*` используйте, когда отсутствие объекта это ошибка

Важно: у аур тоже есть свои переменные. То есть можно хранить данные не только на уровне текущего скрипта, но и на уровне ауры или папки.

```csharp
var aura = AuraTree.GetAuraByPath(@".\Gameplay\Boss");
var phase = Variables.Get<string>(aura, "phase");
```

Подробнее: [IAuraTreeScriptingApi](/ru/scripting/api/IAuraTreeScriptingApi), [IAuraAccessor](/ru/scripting/api/IAuraAccessor), [Как найти ауру](/ru/scripting/examples/basic/find-aura)

Примеры:

- [Как найти ауру](/ru/scripting/examples/basic/find-aura)
- [Поиск текста](/ru/scripting/examples/basic/text-search)
- [Как найти изображение](/ru/scripting/examples/basic/image-search)

### Что такое `AddNewExtension<T>()` и когда он нужен

Некоторые возможности EyeAuras оформлены как отдельные container extensions. Это способ подключить в DI-контейнер новый набор сервисов.

Например, некоторые библиотеки предполагают явное подключение прямо из `Script.csx`:

```csharp
AddNewExtension<ImGuiContainerExtensions>();
var imgui = GetService<IImGuiExperimentalApi>();
```

```csharp
AddNewExtension<FridaContainerExtensions>();
var frida = GetService<IFridaExperimentalApi>();
```

Это особенно полезно для модульных пакетов, которые не хочется тащить "всегда включенными".

Подробнее: [Script Container Extensions](/ru/scripting/script-container-extensions), [ImGui getting started](/ru/scripting/imgui/getting-started)

Примеры:

- [Aim Trainer ML](/ru/scripting/examples/advanced/aimtrainer-ml)
- [YOLO11 ESP](/ru/scripting/examples/advanced/yolo11-esp)

### Когда использовать NuGet-пакеты

Если библиотека уже существует как NuGet-пакет, это обычно **лучший** вариант.

Почему:

- проще подключить и обновлять
- лучше переносимость
- лучше сочетается с export/import и IDE
- для новых ревизий `pack` EyeAuras заранее подтягивает NuGet-зависимости и включает их в pack

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

Важно: директивы `#r` пишутся именно в `Script.csx`. В обычных связанных `*.cs`-классах они не работают.

Подробнее: [NuGet и сборки](/ru/scripting/nuget), [упаковка NuGet в pack](/ru/changelogs/8047)

### Когда использовать локальные сборки

Локальные сборки нужны, когда:

- пакета на NuGet нет
- библиотека внутренняя или приватная
- вы хотите положить DLL рядом со скриптом как часть проекта

Лучший переносимый вариант обычно такой:

1. добавить DLL в файлы скрипта как embedded resource
2. сослаться на нее через `#r "assemblyPath: MyLib.dll"`

Минимальный пример:

```csharp
#r "assemblyPath: MyLib.dll"

using MyLib;

var helper = new SomeLibraryHelper();
Log.Info(helper.ToString());
```

Это заметно лучше, чем абсолютный путь вроде `D:\\Work\\Something\\MyLib.dll`, потому что такой путь хорош только на машине автора.

Используйте абсолютные пути в основном для локальных экспериментов и отладки, а для переносимого решения предпочитайте:

- NuGet
- embedded resources

Подробнее: [Встроенные ресурсы](/ru/scripting/embedded-resources), [NuGet и сборки](/ru/scripting/nuget)

### Что такое pack и что происходит с зависимостями при паковании

[Pack](/ru/features/packs) это portable-версия вашего решения на базе EyeAuras. Обычно она включает:

- совместимую версию программы
- конфиг
- ауры, скрипты, макросы, behavior trees
- связанные ресурсы

Что важно для скриптов:

- NuGet-пакеты в новых ревизиях pack заранее подтягиваются и включаются в pack
- ресурсы проекта тоже попадают в pack
- если вы хотите переносимое решение, не завязывайтесь на абсолютные пути на локальном диске

Если скрипт распространяется дальше вашей машины, хорошее базовое правило такое:

- `NuGet > embedded DLL > абсолютный путь к DLL`

Подробнее: [Packs](/ru/features/packs), [упаковка NuGet в pack](/ru/changelogs/8047), [ресурсы в packs](/ru/changelogs/7477)

### Что такое mini-app

[Mini-app](/ru/features/mini-app) это уже не просто "скрипт в EyeAuras", а ваш продукт, построенный на базе EyeAuras.

Если коротко:

- обычный скрипт или pack: пользователь все еще много взаимодействует с UI EyeAuras
- mini-app: пользователь в основном работает уже с вашим UI и вашей логикой

Mini-app хорош, когда вы хотите:

- сделать свой интерфейс
- собрать тул, helper, launcher, бот или утилиту
- управлять UX более жестко
- позже добавить лицензирование, KeyLogin и другие product-level вещи

Подробнее: [Mini-app](/ru/features/mini-app), [EyePad](/ru/features/eyepad)

### Можно ли вырастить скрипт в полноценную программу

Да. Это один из главных плюсов всей системы.

Типовая лестница роста выглядит так:

- быстрый `.csx` или `C# Action`
- экспорт в `.sln`
- разработка в Rider / Visual Studio
- `Import` / `Live Import`
- публикация как `pack`
- при необходимости переход в `mini-app`

То есть EyeAuras-скрипт это не тупиковый "встроенный макрос", а нормальная точка входа в более крупный проект.

Подробнее: [Интеграция с IDE](/ru/scripting/ide-integration), [Mini-app](/ru/features/mini-app)

### Что с лицензированием

Если вы делаете свой продукт на базе EyeAuras, есть несколько связанных тем:

- [packs](/ru/features/packs) для распространения
- [sublicenses](/ru/features/sublicenses) для платного доступа к вашему pack или mini-app
- [key login](/ru/features/keylogin) для быстрого входа пользователя по ключу
- [script protection](/ru/features/script-protection) если нужно скрыть реализацию

Для обычных локальных скриптов об этом можно вообще не думать. Для коммерческих или приватных решений это уже важная часть архитектуры.

## Практические рекомендации

### Сначала используйте готовые механизмы EyeAuras, потом дописывайте код

Если задачу можно удобно собрать через готовые триггеры, ауры, переменные и действия, обычно так и стоит делать. Скрипт особенно хорош как "умный клей" между готовыми частями платформы.

Обычно проще и надежнее:

- взять существующий триггер
- получить его результат через `AuraTree`
- дописать поверх него нестандартную логику

Чем сразу писать всю механику целиком вручную.

### Предпочитайте явную cancellation-aware логику

Даже если часть вещей EyeAuras умеет подстраховать автоматически, явный код обычно лучше:

- его проще читать
- его легче сопровождать
- AI и людям проще не ошибиться при доработке

Хорошие базовые шаблоны:

- `cancellationToken.WaitHandle.WaitOne();`
- `while (!cancellationToken.IsCancellationRequested) { ... }`

### В `Script.csx` используйте возможности sandbox, а в связанных классах пишите обычный C#

Это очень простое, но очень полезное правило.

В `Script.csx` нормально писать:

- `Log.Info(...)`
- `Sleep(...)`
- `GetService<T>()`
- `AuraTree.Get...(...)`

А вот в helper-классах лучше либо:

- принимать зависимости через конструктор
- либо создавать сам helper через `GetService<T>()`, чтобы контейнер сам собрал зависимости

### Не делайте переносимые скрипты зависящими от локальных путей автора

Если решение потом будут запускать другие люди, избегайте:

- `D:\\...`
- ссылок на локальные папки с ресурсами
- DLL, лежащих "где-то рядом на вашем компьютере"

Для переносимого решения почти всегда лучше:

- `#r "nuget: ..."`
- embedded resources
- pack

### Для ввода предпочитайте стабильный API

В старых примерах и документации еще можно встретить `ISendInputUnstableScriptingApi`, но для нового кода лучше ориентироваться на [ISendInputScriptingApi](/ru/scripting/api/ISendInputScriptingApi).

Старый API полезно знать только потому, что он может встречаться в старых скриптах.

`Unstable` в названии API обычно не означает "сломанный" или "опасный". Обычно это значит только то, что интерфейс еще может меняться между версиями. Если стабильный аналог уже есть, предпочитайте его. Если нужная возможность пока есть только в `Unstable`, пользоваться ей нормально, просто учитывайте возможные breaking changes при обновлении.

Примеры с более современным API:

- [Aim Tracker ML EA](/ru/scripting/examples/advanced/aimtracker-ml-ea)
- [Aim Trainer ML](/ru/scripting/examples/advanced/aimtrainer-ml)
- [Profiling CV](/ru/scripting/examples/advanced/profiling-cv)

### Для переменных предпочитайте `Variables.Get<T>()`

Работа через строковый индексатор возможна, но типизированный доступ через `ScriptVariable<T>` обычно заметно чище и безопаснее.

### Для необязательных объектов используйте `Find*`, для обязательных `Get*`

Это простое правило очень сильно снижает количество случайных падений и делает намерение кода понятнее.

### Если скрипт создает ресурсы текущего запуска, привязывайте их к `ExecutionAnchors`

Это особенно важно для:

- renderer-ов
- overlay-объектов
- временных подписок

Так stop/start ведет себя предсказуемо, а за скриптом остается меньше мусора.

Примеры:

- [Печать переменных прямо на экране](/ru/scripting/examples/basic/print-variables-on-screen)
- [Отслеживание мыши с overlay](/ru/scripting/examples/basic/mouse-track-with-overlay)
- [YOLO11 ESP](/ru/scripting/examples/advanced/yolo11-esp)

### Для библиотек с отдельной регистрацией не забывайте про `AddNewExtension<T>()`

Если пакет явно просит вызвать `AddNewExtension<T>()`, значит это не просто `using`, а реальная регистрация нового набора сервисов в контейнере.

Типичный пример:

```csharp
AddNewExtension<ImGuiContainerExtensions>();
var imgui = GetService<IImGuiExperimentalApi>();
```

Без регистрации сервис может просто не появиться в контейнере.

Примеры:

- [Aim Trainer ML](/ru/scripting/examples/advanced/aimtrainer-ml)
- [YOLO11 ESP](/ru/scripting/examples/advanced/yolo11-esp)

### Когда скрипт вырос, переходите на `.sln`

Если код стал большим, не пытайтесь бесконечно удерживать его в одном файле.

Хороший момент для перехода:

- когда уже несколько классов
- когда нужен нормальный поиск по коду
- когда хочется писать тесты
- когда появились ресурсы, Razor, несколько проектов или много зависимостей

Для этого как раз и существует [Export / Import / Live Import](/ru/scripting/ide-integration).

Практический нюанс: `Export` очищает целевую папку перед выгрузкой проекта, поэтому не экспортируйте в каталог, где лежат важные файлы.

Если вы регулярно пишете или поддерживаете большие скрипты, очень рекомендую сразу работать в связке `IDE + AI + EyeAuras MCP`. Мой личный выбор сейчас - `Rider + AI Assistant/Codex + EyeAuras MCP`, но `Visual Studio` и `VS Code` тоже вполне рабочие варианты.

Подробнее: [Интеграция с IDE, AI и MCP](/ru/scripting/ide-integration)

## Типовые задачи

### Как найти картинку на экране

Для большинства задач самый простой и надежный путь это использовать уже настроенный `Image Search` trigger и из скрипта забрать его результат.

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

Подробнее: [Как найти изображение](/ru/scripting/examples/basic/image-search)

Смотрите также:

- [Поиск цвета](/ru/scripting/examples/basic/color-search)
- [Поиск текста](/ru/scripting/examples/basic/text-search)

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

Подробнее: [ISendInputScriptingApi](/ru/scripting/api/ISendInputScriptingApi)

Примеры:

- [Нажать случайную клавишу](/ru/scripting/examples/basic/press-random-key)
- [Отправить текст](/ru/scripting/examples/basic/send-text)
- [Переместить мышь в центр](/ru/scripting/examples/basic/send-mouse-center)

### Как кликнуть по найденной картинке или слову

Общий шаблон почти всегда одинаковый:

1. получить bounds найденного объекта
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

Для текста логика такая же, только источником данных будет `Text Search`.

Подробнее: [Как нажать на распознанное слово](/ru/scripting/examples/basic/click-on-text)

Смотрите также:

- [Поиск текста](/ru/scripting/examples/basic/text-search)
- [Как найти изображение](/ru/scripting/examples/basic/image-search)

### Как работать с координатами

Это одна из самых частых точек ошибок.

Обычно в EyeAuras встречаются три вида координат:

- локальные координаты viewport / окна захвата
- координаты относительно окна
- экранные координаты

Правило безопасности простое:

- если данные пришли из image/text/color trigger, не спешите кликать ими напрямую
- сначала явно проверьте, в какой системе координат вы сейчас находитесь
- если есть raw result, переводите координаты через `ToScreen(...)` или `ToScreenPoint(...)`

Самые полезные методы:

- `ToScreen(rect)`
- `ToScreenPoint(rect)`
- `Center()`

Подробнее: [WindowImageProcessedEventArgs](/ru/scripting/api/WindowImageProcessedEventArgs)

Примеры:

- [Как найти изображение](/ru/scripting/examples/basic/image-search)
- [Как нажать на распознанное слово](/ru/scripting/examples/basic/click-on-text)
- [Поиск цвета](/ru/scripting/examples/basic/color-search)

### Как проще использовать embedded resources

Embedded resources полезны, когда вы хотите "нести с собой" файлы вместе со скриптом:

- картинки для Blazor UI
- локальный markdown или html-гайд
- json-конфиг
- DLL, которую неудобно тянуть через NuGet

Два самых простых сценария:

Показать картинку в Blazor:

```html
<img src="Images/logo.png" />
```

Прочитать текстовый файл из скрипта:

```csharp
var files = GetService<IScriptFileProvider>();
var helpText = files.ReadAllText("docs/help.md");
Log.Info(helpText);
```

Практическая мелочь, которая часто экономит время: лучше писать `Images/logo.png` или `docs/help.md`, а не просто `logo.png` или `help.md`. Короткие имена удобны, но при совпадении окончаний путей легко поймать не тот файл.

Если библиотека уже есть на NuGet, почти всегда лучше брать ее через `#r "nuget: ..."`. Embedded resources особенно хороши для ваших собственных файлов и переносимых DLL.

Подробнее: [Встроенные ресурсы](/ru/scripting/embedded-resources)

Примеры:

- [File Provider](/ru/scripting/examples/basic/file-provider)

## Что читать дальше

- [С чего начать](/ru/scripting/getting-started)
- [Песочница](/ru/scripting/sandbox)
- [Горячие клавиши](/ru/scripting/keybinds)
- [Dependency Injection](/ru/scripting/dependency-injection)
- [Script Container Extensions](/ru/scripting/script-container-extensions)
- [Переменные](/ru/scripting/variables)
- [NuGet и сборки](/ru/scripting/nuget)
- [Встроенные ресурсы](/ru/scripting/embedded-resources)
- [Blazor Windows](/ru/scripting/blazor-windows/getting-started)
- [ImGui getting started](/ru/scripting/imgui/getting-started)
- [Интеграция с IDE](/ru/scripting/ide-integration)
- [Packs](/ru/features/packs)
- [Mini-app](/ru/features/mini-app)
- [Лицензии на паки](/ru/features/sublicenses)
- [Защита скриптов](/ru/features/script-protection)
