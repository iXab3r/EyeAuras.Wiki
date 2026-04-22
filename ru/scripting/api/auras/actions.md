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