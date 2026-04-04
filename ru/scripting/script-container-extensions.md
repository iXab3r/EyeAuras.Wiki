---
title: Script Container Extensions
description: Как регистрировать свои сервисы и подключать модульные библиотеки в скриптах EyeAuras
published: true
date: 2026-04-02T15:30:00.000Z
tags: c#, scripting, dependency-injection
editor: markdown
dateCreated: 2026-04-02T15:30:00.000Z
---
# Script Container Extensions

`ScriptContainerExtension` это способ зарегистрировать в DI-контейнере скрипта свои сервисы, helper-классы и API.

Если говорить совсем просто:

- обычный `GetService<T>()` получает уже зарегистрированный сервис
- `ScriptContainerExtension` позволяет **добавить новые регистрации**
- `AddNewExtension<T>()` это способ подключить такую extension во время работы скрипта

Эта тема особенно полезна, если вы:

- выносите код в отдельные классы и библиотеки
- делаете свой mini-app или крупный pack
- подключаете модульные пакеты вроде ImGui или Frida
- хотите, чтобы ваши helper-классы создавались через DI, а не через `new`

## Зачем это нужно

У EyeAuras уже есть sandbox и базовые сервисы. Но иногда вам хочется добавить в контейнер что-то свое:

- `IMyHelper -> MyHelper`
- `IBotState -> BotState`
- `IFridaExperimentalApi -> FridaExperimentalApi`
- `IImGuiExperimentalApi -> ImGuiExperimentalApi`

Для этого и нужен `ScriptContainerExtension`.

Без него вы часто упретесь в один из двух сценариев:

- придется вручную создавать граф объектов через `new`
- или нужный сервис вообще не будет известен контейнеру

## Где это находится в архитектуре

У каждого скрипта есть sandbox и связанный с ним DI-контейнер.

Также внутри есть `IScriptingApiContext`. Это внутренний объект контекста, который хранит:

- Roslyn `Solution`
- контейнер
- версию workspace
- `Anchors` для ресурсов этого контекста

Обычно вы не создаете `IScriptingApiContext` вручную. Но полезно понимать идею: container extensions расширяют именно этот слой сервисов, из которого потом работает `GetService<T>()`.

## Самое важное: `Script.csx` и обычные классы

В `Script.csx` вы можете прямо писать:

```csharp
Log.Info("Hello");
var helper = GetService<MyHelper>();
```

А вот `MyHelper` это уже обычный C# класс. У него нет прямого доступа к `Log`, `AuraTree`, `GetService<T>()` и другим возможностям sandbox, если вы сами их не передали.

Поэтому container extensions особенно полезны для связанных классов: они позволяют создавать такие классы через DI и автоматически получать зависимости в конструктор.

## Реалистичный пример из игрового бота

В реальном боте extension обычно регистрирует не "счетчик", а целый набор сервисов.

Типичный пример:

- `IEntityManager` хранит всех объектов вокруг персонажа, текущую цель, кэш сущностей и результаты чтения памяти
- `IGeodataManager` отвечает за геодату и навигацию
- `IBotBrain` принимает решения на основе уже готовых сервисов
- UI может жить в ImGui или Blazor и читать те же самые данные

Упрощенный пример такой extension может выглядеть так:

```csharp
public sealed class BotContainerExtensions : ScriptContainerExtension
{
    protected override void Initialize()
    {
        Container.AddNewExtensionIfNotExists<ImGuiContainerExtensions>();
        Container.AddNewExtensionIfNotExists<FridaContainerExtensions>();

        Container.RegisterSingleton<IEntityManager, EntityManager>();
        Container.RegisterSingleton<IGeodataManager, GeodataManager>();

        Container.RegisterType<IBotBrain, BotBrain>();
        Container.RegisterType<ILoginForm, ImGuiLoginForm>();
    }
}
```

Почему это хороший пример:

- `IEntityManager` имеет смысл держать как `Singleton`, потому что это единый источник правды для всего бота
- UI, логика боя, pathing и debug-инструменты могут читать одни и те же данные из одного менеджера
- `IBotBrain` часто удобнее регистрировать через `RegisterType`, если вы хотите создавать отдельный экземпляр под конкретную задачу

### Почему `IEntityManager` это типичный singleton

Если говорить игровыми терминами, `EntityManager` обычно отвечает за вещи вроде:

- список объектов вокруг персонажа
- текущая цель
- игрок
- кэш мобов, NPC, лута
- обновление снимка мира для других подсистем

Такой сервис почти всегда хочется иметь **один на весь бот**, а не создавать заново в каждом helper-классе.

Если сделать несколько отдельных `EntityManager`, очень легко получить:

- несколько несогласованных кэшей
- лишнее чтение памяти
- разное представление мира у разных частей бота

Поэтому регистрация такого менеджера через `RegisterSingleton<IEntityManager, EntityManager>()` обычно очень логична.

Пример интерфейса может выглядеть так:

```csharp
public interface IEntityManager
{
    ImmutableArray<EntitySnapshot> EntitiesAround { get; }
    EntitySnapshot? Target { get; }
    void Refresh();
}
```

А в `Script.csx` это потом выглядит уже очень просто:

```csharp
AddNewExtension<BotContainerExtensions>();

var entities = GetService<IEntityManager>();
var brain = GetService<IBotBrain>();

Log.Info($"Entities around: {entities.EntitiesAround.Length}");
brain.Tick();
```

После этого `GetService<IEntityManager>()` и `GetService<IBotBrain>()` начнут работать, потому что container extension уже зарегистрировала все нужные сервисы.

## Что делает `AddNewExtension<T>()`

`AddNewExtension<T>()` говорит sandbox:

- найти extension нужного типа
- добавить ее в контейнер
- выполнить ее `Initialize()`
- зарегистрировать новые сервисы

Минимальный пример:

```csharp
AddNewExtension<BotContainerExtensions>();
```

После этого можно получать сервисы, которые extension зарегистрировала:

```csharp
var entities = GetService<IEntityManager>();
var brain = GetService<IBotBrain>();
```

## Почему некоторые библиотеки просят явно вызвать `AddNewExtension<T>()`

Некоторые пакеты используют extensions как **явный opt-in**. То есть пакет подключен, но его сервисы не регистрируются, пока вы сами этого не попросите.

Так работают, например, некоторые модульные SDK.

### ImGui

```csharp
#r "nuget:EyeAuras.ImGuiSdk, 0.1.42"

using EyeAuras.ImGuiSdk;

AddNewExtension<ImGuiContainerExtensions>();

var imgui = GetService<IImGuiExperimentalApi>();
```

### Frida

```csharp
#r "nuget:EyeAuras.FridaSdk, 0.1.42"

using EyeAuras.FridaSdk;

AddNewExtension<FridaContainerExtensions>();

var frida = GetService<IFridaExperimentalApi>();
```

Это удобно, потому что вы подключаете только те подсистемы, которые реально нужны вашему скрипту.

Живые примеры:

- [Aim Trainer ML](/ru/scripting/examples/advanced/aimtrainer-ml)
- [YOLO11 ESP](/ru/scripting/examples/advanced/yolo11-esp)

## `AddNewExtension<T>()` и `Container.AddNewExtensionIfNotExists<T>()` это не одно и то же

Похожи по названию, но используются в разных местах:

- `AddNewExtension<T>()` вы вызываете из `Script.csx`, чтобы подключить extension к sandbox
- `Container.AddNewExtensionIfNotExists<T>()` обычно вызывается **внутри другой extension**, если одна extension зависит от другой

То есть:

```csharp
AddNewExtension<BotContainerExtensions>();
```

Это код уровня скрипта.

А вот это:

```csharp
Container.AddNewExtensionIfNotExists<ImGuiContainerExtensions>();
```

Это уже код уровня DI-контейнера внутри самой extension.

## Как runtime узнает про `ScriptContainerExtension`

EyeAuras сканирует загруженные сборки и ищет классы, которые наследуются от `ScriptContainerExtension`.

Также runtime во время setup скрипта умеет:

- анализировать свойства объекта скрипта
- заполнять свойства с `[Dependency]`
- заполнять свойства с `[Inject]`

То есть extension отвечает за регистрацию сервисов, а runtime потом помогает использовать эти сервисы в самом скрипте.

## `[Inject]`, `[Dependency]` и `GetService<T>()` рядом с extensions

Эти механизмы хорошо работают вместе.

Но здесь есть важный практический нюанс:

- если сервис уже был зарегистрирован к моменту старта скрипта, его удобно получать через `[Inject]` или `[Dependency]`
- если вы **прямо внутри `Script.csx`** сначала вызываете `AddNewExtension<T>()`, а потом хотите получить новый сервис, самый безопасный и понятный путь это `GetService<T>()`

Например, так корректно и понятно:

```csharp
[Inject] public IAuraTreeScriptingApi AuraTree { get; init; } // built-in service

AddNewExtension<BotContainerExtensions>();

var entities = GetService<IEntityManager>();
Log.Info($"Entities around: {entities.EntitiesAround.Length}");
```

Практическое правило:

- `[Inject]` и `[Dependency]` отлично подходят для уже доступных сервисов
- после ручного `AddNewExtension<T>()` чаще всего удобнее сразу делать `GetService<T>()`

## Важный нюанс: не `new`, а контейнер

Если класс зависит от других сервисов, лучше не писать:

```csharp
var entityManager = new EntityManager(game);
```

Такой код иногда работает, но очень быстро превращается в ручную прокладку зависимостей.

Лучше так:

```csharp
var entityManager = GetService<IEntityManager>();
```

Тогда DI сможет сам собрать объект и передать ему зависимости.

## Более жизненный пример

Большая extension может не только регистрировать свои сервисы, но и подключать другие extensions.

Упрощенная идея выглядит так:

```csharp
public sealed class BotContainerExtensions : ScriptContainerExtension
{
    protected override void Initialize()
    {
        Container.AddNewExtensionIfNotExists<ImGuiContainerExtensions>();
        Container.AddNewExtensionIfNotExists<FridaContainerExtensions>();
        Container.AsServiceCollection().AddAiServices();

        Container.RegisterSingleton<IEntityManager, EntityManager>();
        Container.RegisterSingleton<IBotControllers, BotControllers>();
        Container.RegisterType<IBotBrain, BotBrain>();
        Container.RegisterType<IProfileManager, ProfileManager>();

        Container.AsServiceCollection().AddBzGui();
    }
}
```

То есть одна extension может стать "точкой входа" для большого набора библиотек, bot-сервисов и UI.

## Когда это действительно стоит использовать

Container extensions особенно полезны, если:

- у вас уже несколько связанных классов
- вы хотите нормальную DI-сборку объектов
- вы пишете свой SDK или reusable helper-библиотеку
- вы делаете модульный UI или интеграцию с внешним движком

Если же у вас маленький скрипт на 20 строк, часто проще вообще ничего не усложнять и использовать обычный `GetService<T>()` прямо в `Script.csx`.

## Как это связано с pack и mini-app

Для крупных решений container extensions особенно удобны, потому что помогают:

- держать код модульным
- переносить логику из одного файла в нормальные классы
- подключать SDK по требованию
- собирать один и тот же набор сервисов и в обычном скрипте, и в mini-app

Это хороший промежуточный слой между "маленький `Script.csx`" и "полноценное приложение".

## Что читать дальше

- [FAQ и лучшие практики](/ru/scripting/best-practices)
- [Dependency Injection](/ru/scripting/dependency-injection)
- [Песочница](/ru/scripting/sandbox)
- [ImGui getting started](/ru/scripting/imgui/getting-started)
- [Mini-app](/ru/features/mini-app)
