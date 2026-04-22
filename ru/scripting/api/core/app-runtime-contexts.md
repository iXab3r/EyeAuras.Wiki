---
title: AI Core Контексты выполнения приложения
description: Карта контекстов выполнения, которые используют скрипты, модули и сервисы приложения.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, core, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта контекстов выполнения приложения

Справочная карта, которая помогает различать код хоста EyeAuras, код только для SDK, top-level скрипты, обычные вспомогательные классы C#, object-style executors и Razor-компоненты.

## Что обычно хотят понять

- Где доступен доступ к зависимостям.
- Как вынести код из файла скрипта во вспомогательный класс.
- Нужно ли передавать сервис явно.
- Чем отличается код модуля приложения или плагина от кода проекта скрипта.

## Модель работы

- Код top-level скрипта выполняется с возможностями, которые предоставляет хост.
- Обычные файлы C# рядом со скриптом компилируются как обычные классы и не наследуют автоматически члены хоста скрипта.
- Object-style executors для action и trigger получают контекст через свои базовые классы.
- Razor-компоненты работают через Blazor `[Inject]` и правила жизненного цикла компонентов.
- Код приложения или плагина использует DI и систему модулей приложения.
- Код только для SDK может ссылаться на контракты, но не должен предполагать наличие активного хоста.

## Ключевые API

- `AuraScriptSandbox` / `IAuraScriptSandbox` — поверхность возможностей top-level скрипта.
- `ScriptContainerExtension` — точка регистрации DI для скрипта.
- `CsharpScriptActionExecutor` — точка входа для object-style action.
- `CsharpScriptTriggerExecutor` — точка входа для object-style trigger.
- `Prism.Modularity.IModule` — контракт модуля приложения или плагина.
- `[Inject]` — атрибут внедрения зависимостей для компонентов Blazor.
- `[Dependency]` — атрибут property injection из Unity, который используется в некоторых runtime-классах.

## Что предпочтительно

- Передавайте зависимости во вспомогательные классы через конструкторы или параметры.
- Документируйте API, завязанные на конкретные пакеты, в `nuget/`.
- Используйте модули приложения для регистраций приложения и плагинов.

## Чего избегать

- Не рассчитывайте, что `Log`, `AuraTree`, `Variables` или `cancellationToken` будут доступны в обычных helper-классах.
- Не используйте шаблоны доступа к зависимостям, предназначенные только для скриптов, внутри Razor-компонентов.

## Поисковые синонимы

- top-level script
- helper class
- ordinary C# class
- script globals
- app module
- plugin module
- Blazor component injection
- object-style action
- object-style trigger

## Связанные карты

- `scripting/runtime.md`
- `core/app-modules.md`
- `core/eyeauras-structure.md`
- `windows-subsystems/blazor-windows.md`