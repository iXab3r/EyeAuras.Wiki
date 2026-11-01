---
title: AI-карта действий аур
description: AI-ориентированная карта действий аур и связанной с ними инфраструктуры.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, actions, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта поиска по Aura Actions

Справочная карта по действиям аур — исполняемым блокам, которые вызываются из lifecycle-списков, скриптов, узлов behavior tree, макросов и пользовательских сценариев.

## Что это такое

- Actions выполняют работу.
- Actions — это сущности аур, зарегистрированные через `IAuraRegistrator`.
- В основе actions лежат сохраняемые свойства и, при необходимости, редакторы/метаданные.
- Логика выполнения обычно находится рядом с `ExecuteInternal`.
- В lifecycle-списках ауры actions чаще всего запускаются при входе, пока аура активна и при выходе.

## Разобрать выполнение настроенного действия

Начните с ауры, в которой действие уже находится в одном из списков `OnEnter`, `WhileActive` или `OnExit`. Найдите его тип в регистрации модуля, затем properties и реализацию `ExecuteInternal(CancellationToken)`. Например, для отправки последовательности ввода это `SendSequenceAction`, зарегистрированный модулем Roxy. Настройки принадлежат компоненту, а выполнение — его экземпляру в дереве.

`AuraActionBase<TProperties>` сериализует выполнение одного экземпляра семафором, выставляет `IsBusy` и передаёт в `ExecuteInternal` связанный токен родителя и собственной отмены. Сам компонент должен учитывать этот токен. Ошибки выполнения попадают в error provider и оборачиваются в `InvalidStateException`; отмена внутри выполнения перехватывается, но ожидание семафора может завершиться отменой раньше.

`Execute` и `ExecuteAsync` этой базовой реализации запрещены на UI-потоке. Наличие `Task` не означает автоматический перенос на другой поток. Для запуска списков ауры из C# Action используйте [IAuraAccessor](../IAuraAccessor); это другая операция, чем вызов одного компонента. Для простого нажатия из скрипта используйте [SendInput](../ISendInputScriptingApi).

## API

- `AuraActionBase<TProperties>` — базовый класс для actions.
- `ExecuteInternal` — основной метод, где обычно находится логика action.
- `CsharpScriptAction` — сущность script action.
- `CsharpScriptActionExecutor` — базовый класс для script action в object-style.
- `IAuraAccessor.Execute` / `ExecuteAsync` — запуск ауры из скриптов.

## Типовые сценарии

- Найти встроенный action:
  - найдите регистрацию модуля через `Register<SomeAction>`;
  - проверьте свойства и метаданные action, если важны настройки в UI;
  - откройте runtime-класс и `ExecuteInternal`.

- Добавить action:
  - определите properties;
  - определите runtime-модель;
  - при необходимости добавьте editor/metadata;
  - зарегистрируйте через `IAuraRegistrator`.

## Что предпочесть

- Для runtime-логики обычно используйте `ExecuteInternal`.
- Для поиска пользовательских actions начинайте с регистраций в модуле.
- Для запуска аур из скриптов используйте `IAuraAccessor`.

## Чего избегать

- Не используйте actions как state watchers; для состояния активации нужны triggers.
- Не создавайте action-модели напрямую из сохранённых метаданных.

## Опорные точки для изучения

- `AuraActionBase`, `ExecuteInternal`, `CsharpScriptAction`,
  `CsharpScriptActionExecutor`, `IAuraAccessor`, `IAuraRegistrator`,
  `SendInputAction`, `DelayAction`, `PlaySoundAction`.

## Синонимы для поиска

- action
- aura action
- execute action
- lifecycle action
- on enter
- while active
- on exit
- script action

## Связанные карты

- `auras/entities.md`
- `auras/triggers.md`
- `auras/overlays.md`
- `scripting/runtime.md`