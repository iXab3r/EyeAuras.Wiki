---
title: Обзор AI-аур
description: Обзор сущностей аур, действий, триггеров, оверлеев и инфраструктуры выполнения для AI-сценариев.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, auras, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта раздела Auras

Краткая навигация по общей модели аур: `auras`, папки, триггеры, действия, overlays, behavior trees, script entities и встроенные aura packs.

## Модель

- Аура — это пользовательская единица автоматизации.
- Условия включения определяют, может ли аура активироваться.
- Триггеры отслеживают состояние и запускают активацию.
- Действия выполняют работу в списках жизненного цикла.
- Overlays отвечают за отображение и UI.
- Узлы behavior tree — это tick-based aura entities.
- Aura packs регистрируются модулями и описываются metadata assemblies.

## Детали API

- `DefaultAurasModule` - стандартные triggers/actions/overlays/settings.
- `AdvancedAurasModule` - расширенные интеграции, например Telegram.
- `CsScriptAurasModule` - C# script triggers, actions и overlays.
- `BehaviorTreeModule` - узлы behavior tree и интеграция с runtime.
- `IAuraRegistrator` - центральный сервис регистрации сущностей.
- `AuraActionBase<T>` - общая базовая реализация action; смотрите `ExecuteInternal`.
- `AuraTriggerBase<T>` - общая базовая реализация trigger; смотрите `CreateTriggerEventSource`.

## Куда смотреть в первую очередь

- Используйте `auras/entities.md` для регистрации и фабрик.
- Используйте `auras/actions.md` для выполнения actions.
- Используйте `auras/triggers.md` для activation/event sources.
- Используйте `auras/overlays.md` для overlay entities.

## Синонимы для поиска

- aura
- trigger
- action
- overlay
- aura pack
- behavior tree
- script action
- script trigger
- lifecycle action
- enabling condition

## Связанные карты

- `core/eyeauras-structure.md`
- `auras/entities.md`
- `auras/actions.md`
- `auras/triggers.md`
- `auras/overlays.md`
- `scripting/runtime.md`