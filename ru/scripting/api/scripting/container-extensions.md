---
title: AI-скриптинг — расширения контейнера
description: Карта AI-first по DI-композиции скриптов, расширениям контейнера, регистрации сервисов и доступу к возможностям.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, dependency-injection, container, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта по расширениям контейнера скрипта

Справочная карта по DI, которым владеет скрипт, `ScriptContainerExtension`, подключению опциональных SDK и границе между кодом верхнего уровня скрипта и обычными C#-классами.

## Типовые задачи

- Зарегистрировать сервисы mini-app внутри проекта скрипта.
- Подключить опциональные SDK-пакеты, например ImGui или Frida.
- Вынести логику из `Script.cs` / `Script.csx` в обычные классы.
- Собрать переиспользуемый граф сервисов для бота, UI или утилит.
- Разделить менеджеры, состояние, ридеры и UI-сервисы между несколькими панелями.
- Не собирать большой граф объектов вручную через `new`.

## Как это устроено

- У каждого script runtime есть sandbox и DI-контейнер.
- Код верхнего уровня скрипта — это composition root для возможностей script-host.
- Обычные C#-классы не получают автоматически члены верхнего уровня скрипта.
- `ScriptContainerExtension` добавляет регистрации в контейнер скрипта.
- `AddNewExtension<T>()` подключает расширение из кода верхнего уровня скрипта.
- `Container.AddNewExtensionIfNotExists<T>()` используется внутри одного расширения, чтобы опционально подключить другое расширение.
- Ссылка на SDK даёт типы, а регистрация даёт сервисы. Расширения, производные от `ScriptContainerExtension`, runtime обнаруживает в сборке скрипта автоматически; для других расширений следуйте инструкции пакета.
- В проектах mini-app обычно есть одно script-level расширение, которое связывает все доменные сервисы и опциональные SDK-расширения.
- Скрипту не обязательно нужен отдельный extension только потому, что в нём есть несколько локальных helper-классов. Для небольших утилит на 300–500 строк прямой setup в `Script.cs` / `Script.csx` часто проще и понятнее, чем отдельный слой контейнера.

## Контексты хоста и рантайма

- Код верхнего уровня скрипта может обращаться к возможностям script-host, которые предоставляет sandbox.
- Helper-класс должен получать зависимости через параметры конструктора, явные параметры методов или framework injection.
- Компонент Razor использует паттерны Blazor/DI, а не глобальные сущности верхнего уровня скрипта.
- Код app/plugin должен использовать свой composition root и переиспользовать scripting extensions только там, где это поддерживает host context.
- Object-style executors для action/trigger используют собственные базовые классы executor и не должны рассчитывать на члены верхнего уровня скрипта.

## Ключевые API

- `ScriptContainerExtension` — базовый класс для script DI extensions.
- `Initialize()` — override, в котором добавляются регистрации.
- `AuraScriptSandbox.AddNewExtension<T>()` — подключение расширения на уровне скрипта.
- `UnityContainerExtensions.AddNewExtensionIfNotExists<T>()` — подключение зависимости на уровне extension.
- `IScriptingApiContext` — runtime context, содержащий container, solution, версию workspace и context anchors.
- `[Inject]` — стиль property injection, который часто используется в компонентах и сервисах.
- `[Dependency]` — Unity-style маркер зависимости для свойства, который используется при runtime wiring.
- `Container.RegisterSingleton<TInterface, TImplementation>()` — один общий экземпляр на контейнер.
- `Container.RegisterType<TInterface, TImplementation>()` — обычные экземпляры, создаваемые через DI.
- `Container.AsServiceCollection()` — мост для пакетов, которые публикуют регистрации через Microsoft.Extensions.DependencyInjection.

## Зарегистрировать общее состояние проекта

Если несколько классов должны работать с одним счётчиком, зарегистрируйте его
как singleton. В проекте скрипта создайте обычный файл `Registrations.cs`:

```csharp
using EyeAuras.Scripting.Api;
using Unity;

public sealed class Registrations : ScriptContainerExtension
{
    protected override void Initialize()
    {
        Container.RegisterSingleton<RunCounter>();
    }
}

public sealed class RunCounter
{
    public int Value { get; private set; }
    public int Increment() => ++Value;
}
```

А в `Script.csx` получите состояние и выполните работу:

```csharp
var counter = GetService<RunCounter>();
Log.Info($"Запуск номер {counter.Increment()}");
```

Runtime обнаруживает конкретные наследники `ScriptContainerExtension` в
скомпилированной сборке при создании контекста. Регистрация происходит до
выполнения тела скрипта. Повторный Run в том же контексте использует общий
счётчик; перекомпиляция и создание нового контекста не являются сохранением
данных на диск. Для параллельного изменения счётчика нужна синхронизация.

`RegisterType` создаёт обычную регистрацию вместо общего экземпляра.
`GetService<T>()` разрешает тип через доступные контейнеры; он не гарантирует,
что произвольный интерфейс из SDK зарегистрирован.

## Подключить расширение из пакета

Для расширения Unity, которое не обнаруживается как `ScriptContainerExtension`,
используйте `AddNewExtension<T>()` на верхнем уровне. Метод проверяет, настроен
ли этот тип расширения, и возвращает текущую песочницу. Внутри собственного
расширения есть `Container.AddNewExtensionIfNotExists<T>()`.

Пакет, его версия, namespace расширения и последующее получение сервиса
зависят от SDK: полная подготовка приведена в [ImGui](/ru/scripting/imgui/getting-started)
и [карте Frida](/ru/scripting/api/nuget/frida-sdk). Сам `using` регистрацию не делает.

## Передать зависимость обычному классу

Для пары небольших классов отдельный контейнер не обязателен. Передайте
готовые зависимости явно, как в [примере с логгером](logging).
`[Inject]` в Razor обрабатывает Blazor, а свойства тела скрипта runtime
заполняет в `OneTimeSetupScript`. Это разные механизмы; они не означают
автоматического заполнения любого объекта, созданного через `new`.

Освобождайте собственные ресурсы на выбранной границе времени жизни.
Не выводите универсальное автоматическое освобождение из одного вызова
`GetService`: [ресурсы запуска и объекта](reactive-lifetime) имеют разных владельцев.

## Что лучше делать

- Лучше иметь одно понятное mini-app composition extension, чем разрозненные регистрации.
- Лучше использовать зависимости через конструктор в обычных классах.
- Лучше использовать singleton для общего состояния, например entity cache, process reader или app-wide configuration manager.
- Лучше использовать обычные типы для task coordinator, которые должны быть независимыми в каждом запуске.
- Лучше явно подключать опциональные SDK через extension.
- Лучше держать верхнеуровневые скрипты маленькими, чтобы они только собирали и запускали mini-app.
- Лучше не делать отдельный container extension для маленьких скриптов, если в этом нет пользы от общих сервисов, регистрации опциональных SDK или повторяющегося setup.

## Чего лучше избегать

- Не рассчитывайте, что `Log`, `AuraTree`, `Variables`, `Sleep` или члены отмены host будут доступны внутри обычных C#-классов.
- Не регистрируйте одно и то же опциональное SDK-расширение много раз без идемпотентного helper-метода.
- Не превращайте container extension в свалку несвязанных глобальных сущностей.
- Не скрывайте требования пакетов; для опциональных SDK всё равно нужны пакет и reference setup.
- Не навязывайте один и тот же способ доступа к сервисам везде. Используйте паттерн, который подходит текущему host context.
- Не превращайте каждый скрипт в app framework. Добавляйте DI-границы только тогда, когда они реально убирают дублирование или делают владение временем жизни понятнее.

## Опорные сущности для поиска

- `ScriptContainerExtension`
- `AuraScriptSandbox`
- `IAuraScriptSandbox`
- `IScriptingApiContext`
- `AuraScriptingApiContext<TGlobals>`
- `AddNewExtension`
- `AddNewExtensionIfNotExists`
- `ScriptContainerExtensionScriptVisitor`
- `ScriptContainerExtensionRuntimeVisitor`
- `ImGuiContainerExtensions`
- `FridaContainerExtensions`
- `UnityContainer`
- `RegisterSingleton`
- `RegisterType`
- `AsServiceCollection`
- `InjectAttribute`
- `DependencyAttribute`

## Синонимы для поиска

- script DI
- dependency injection
- container extension
- composition root
- service registration
- mini-app services
- optional SDK registration
- constructor injection
- property injection
- Unity container
- script service graph

## Версия и связанные карты

Контракты сверены со срезом EyeAuras `20fd3d4`, PoeEye `0e02c98`.
Точные перегрузки и доступность пакетов проверяйте по SDK/XML своей версии.


- [scripting/runtime.md](/ru/scripting/api/scripting/runtime)
- [scripting/references-and-resources.md](/ru/scripting/api/scripting/references-and-resources)
- [scripting/project-workflow.md](/ru/scripting/api/scripting/project-workflow)
- [core/app-runtime-contexts.md](/ru/scripting/api/core/app-runtime-contexts)
- [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk)
- [nuget/frida-sdk.md](/ru/scripting/api/nuget/frida-sdk)
