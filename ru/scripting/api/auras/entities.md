---
title: Сущности AI Auras
description: Карта сущностей аур для AI с регистрацией, фабриками, evaluators и логированием.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, auras, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта сущностей аур и регистрации

Справочная карта по `IAuraRegistrator`, сопоставлениям aura entities, фабрикам, proxy-объектам, evaluators для связанных аур, журналу событий и lifecycle events.

## Когда это нужно

- Зарегистрировать новый trigger, action, overlay, behavior-tree node или editor для переменной.
- Понять, что такое aura entity.
- Создавать runtime-объекты из сохранённых метаданных.
- Сохранять неизвестные метаданные сущностей через proxy.
- Открывать UI выбора связанной ауры или папки.
- Логировать пользовательские события аур.

## Модель концепции

- Triggers, actions, overlays и behavior-tree nodes — это aura entities.
- Aura entities реализуют `IAuraObject` и используют `IAuraProperties` как основу данных.
- Модули регистрируют сопоставления через `IAuraRegistrator`.
- `IAuraRepository` хранит сопоставления и descriptors.
- `IAuraObjectFactory` создаёт runtime-модели, proxy-объекты, editors и variable editors из зарегистрированных сопоставлений.
- `IEyeEntityFactory` — это граница между persistence и runtime.
- `IAuraListStateEvaluator` объединяет состояние связанных аур и папок.

## Подробности API

- `IAuraRegistrator`
  - `Register<TAuraModel>()` регистрирует сопоставление модели и properties.
  - `Register<TAuraModelEditor, TAuraModel>()` регистрирует editor.
  - `RegisterProxy<TAuraModel, TProxy>()` регистрирует реализацию proxy.
  - `RegisterVariableEditor<TAuraVariableEditor>()` регистрирует editor для переменной.

- `IAuraRepository`
  - Runtime-реестр, который заполняется через registrations.
  - Разрешает типы моделей, типы editors, descriptors, proxy и значения по умолчанию.

- `IAuraObjectFactory`
  - Создаёт runtime-модели и editors из уже материализованных properties.

- `IEyeEntityFactory`
  - Десериализует `PoeConfigMetadata<IAuraProperties>`.
  - Сохраняет недоступные сущности как proxy metadata.
  - Очищает child ids при создании child runtime-объектов.

- `IAuraListStateEvaluator`
  - Владеет evaluators для связанных аур, папок и элементов и объединяет их состояние.

- `IAuraListEvaluator`, `IAuraListEvaluatorForAura`, `IAuraListEvaluatorForFolder`
  - Представляют цели в дереве связанных аур.

- `IAuraEventLoggingService`, `AuraEvent`, `AuraEventCategory`
  - Контракты журнала runtime-событий, видимых пользователю.

- `ILifecycleEventsProvider`, `LifecycleEventArgs`, `LifecycleEventType`
  - Контракты высокоуровневых lifecycle events приложения.

## Типовые сценарии

- Регистрация сущности:
  - модуль получает `IAuraRegistrator`;
  - вызывает `Register<TAuraModel>()`;
  - при необходимости регистрирует editor и proxy.

- Создание из сохранённых метаданных:
  - используйте `IEyeEntityFactory`;
  - десериализуйте метаданные;
  - создайте runtime-модель или proxy.

- Создание из properties:
  - используйте `IAuraObjectFactory`, если properties уже материализованы;
  - используйте `IEyeEntityFactory`, если важна обработка identity родителя и дочерних объектов.

## Что предпочесть

- Используйте `IAuraRegistrator` для обнаружения и регистрации сущностей.
- Используйте `IEyeEntityFactory` для сохранённых метаданных.
- Используйте `IAuraObjectFactory` для материализованных properties.
- Используйте API журнала событий для пользовательских runtime-событий.

## Чего избегать

- Не создавайте runtime-модели аур вручную из сохранённых метаданных.
- Не отбрасывайте неизвестные сохранённые сущности.
- Не обходите зарегистрированные сопоставления для editors и моделей.

## Опорные точки для исследования

- `IAuraRegistrator`, `IAuraRepository`, `IAuraObjectFactory`,
  `IEyeEntityFactory`, `PoeConfigMetadata<IAuraProperties>`,
  `ProxyAuraProperties`, `IAuraListStateEvaluator`,
  `IAuraEventLoggingService`, `AuraEvent`, `ILifecycleEventsProvider`.

## Синонимы для поиска

- aura entity
- entity registration
- aura registrator
- aura repository
- aura object factory
- proxy properties
- linked aura
- event log
- lifecycle event

## Связанные карты

- `auras/actions.md`
- `auras/triggers.md`
- `auras/overlays.md`
- `auras/overview.md`
- `core/configuration-persistence.md`
- `core/app-modules.md`