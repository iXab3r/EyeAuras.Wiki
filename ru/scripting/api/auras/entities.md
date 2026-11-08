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

## Проследить загрузку сохранённого компонента

Предположим, пак содержит настроенное действие. Сначала модуль регистрирует модель через `IAuraRegistrator`, отдельно — редактор и при необходимости proxy. `Register<TAuraModel>()` планирует регистрацию на фоновом планировщике; вызов не создаёт экземпляр действия и не гарантирует немедленное обновление реестра.

При загрузке `IEyeEntityFactory` десериализует `PoeConfigMetadata<IAuraProperties>`, сохраняя неизвестный тип через `ProxyAuraProperties`. Далее фабрика проверяет свойства и identity дочернего объекта согласно стратегии контейнера. Это не безусловное удаление всех child ids. `IAuraObjectFactory` разрешает зарегистрированный runtime-тип через контейнер и назначает ему свойства и описание.

Результат — компонент с состоянием и временем жизни внутри дерева, либо proxy с сохранёнными данными недоступного типа. В обычном скрипте для ввода или поиска окна эти фабрики не нужны. В модуле используйте уже зарегистрированные сервисы host; собственный `new` с метаданными обходит необходимую сборку зависимостей.

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
  - Проверяет и преобразует child ids согласно стратегии контейнера.

- `IAuraListStateEvaluator`
  - Хранит evaluators для связанных аур, папок и элементов и объединяет их состояние.

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

- [auras/actions.md](/ru/scripting/api/auras/actions)
- [auras/triggers.md](/ru/scripting/api/auras/triggers)
- [auras/overlays.md](/ru/scripting/api/auras/overlays)
- [auras/overview.md](/ru/scripting/api/auras/overview)
- [core/configuration-persistence.md](/ru/scripting/api/core/configuration-persistence)
- [core/app-modules.md](/ru/scripting/api/core/app-modules)

## Identity дочерних объектов и связанные условия

При `IndependentChildren` существующий непустой ID сохраняется. При
`LinkedToContainer` родителю нужен ID; пустой ID ребёнка, отсутствие префикса
родителя или совпадение с живым дочерним объектом без proxy приводят к генерации
нового ID. Proxy и уже освобождённый дочерний объект допускают повторное
использование ID. Создание дочернего объекта может изменить переданные properties;
защитная копия не гарантируется.

Результат связанных условий — `bool?`. Без элементов он равен `true`, а при
`IsRequired` — `null`. Режим `All` возвращает `null`, если хотя бы один элемент
неизвестен; иначе нужны все `true`. В режиме `Any` достаточно одного `true`, иначе
результат `false`, в том числе когда все элементы неизвестны. Добавление того же
ID заменяет запись. `Remove` и `Clear` меняют состав списка; не считайте их
гарантированным завершением освобождения переданных evaluator-объектов.

[EyeEntityFactory](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/Core/Models/EyeEntityFactory.cs),
[AuraListStateEvaluator](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/AuraListEvaluator/AuraListStateEvaluator.cs).
