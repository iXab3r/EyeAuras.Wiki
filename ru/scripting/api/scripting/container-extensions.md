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
- На опциональные SDK-пакеты можно сослаться, но они не будут зарегистрированы, пока не добавлено их container extension.
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

## Типовые сценарии

### Регистрация сервисов mini-app

1. Создайте класс, унаследованный от `ScriptContainerExtension`.
2. Добавьте опциональные SDK-расширения, которые нужны mini-app.
3. Зарегистрируйте общее состояние и менеджеры как singleton.
4. Зарегистрируйте короткоживущие coordinators/tools как обычные типы.
5. Подключите extension из кода верхнего уровня скрипта.
6. Получайте или внедряйте зарегистрированные сервисы в зависимости от текущего контекста.

### Подключение опционального SDK-пакета

1. Добавьте ссылку на пакет в коде верхнего уровня скрипта или в файле проекта.
2. Импортируйте namespace пакета.
3. Добавьте container extension этого пакета.
4. Получайте и используйте возможности пакета через DI или через явное создание объекта.

### Перенос кода в классы

1. Оставьте настройку host в коде верхнего уровня скрипта.
2. Вынесите доменную логику в обычные классы.
3. Зарегистрируйте эти классы в контейнере.
4. Передавайте script API в конструкторы вместо прямого обращения к членам host.
5. Оставляйте владение временем жизни у script run, sandbox или app service.

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

## Связанные карты

- `scripting/runtime.md`
- `scripting/references-and-resources.md`
- `scripting/project-workflow.md`
- `core/app-runtime-contexts.md`
- `nuget/imgui-sdk.md`
- `nuget/frida-sdk.md`