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

## Выбрать уровень автоматизации

Для сценария «условие выполняется — нажать F1 — показать панель» аура хранит настройки и связывает триггеры, списки действий и оверлеи. Триггер сообщает состояние, runtime ауры учитывает условия включения, действия выполняют работу, а оверлей отображает интерфейс. Неизвестное состояние `bool?` нельзя считать активным.

Если задача — единожды отправить F1 из C# Action, достаточно внедрённого `ISendInputScriptingApi` и `SendInput.KeyPress(Key.F1)`. Если пользователь должен настраивать условие и действие в дереве, изучайте сущности аур. Это разные владельцы состояния и времени жизни, даже когда конечный эффект одинаков.

Сначала выберите [контекст выполнения](../core/app-runtime-contexts), затем соответствующую карту ниже. Точные контракты сверяйте с SDK/XML своей версии: базовые сведения здесь относятся к EyeAuras `20fd3d4`, PoeEye `0e02c98`.

## Детали API

- `DefaultAurasModule` - стандартные triggers/actions/overlays/settings.
- `AdvancedAurasModule` - расширенные интеграции, например Telegram.
- `CsScriptAurasModule` - C# script triggers, actions и overlays.
- `BehaviorTreeModule` - узлы behavior tree и интеграция с runtime.
- `IAuraRegistrator` - центральный сервис регистрации сущностей.
- `AuraActionBase<T>` - общая базовая реализация action; смотрите `ExecuteInternal`.
- `AuraTriggerBase<T>` - общая базовая реализация trigger; смотрите `CreateTriggerEventSource`.

## Куда смотреть в первую очередь

- Используйте [auras/entities.md](/ru/scripting/api/auras/entities) для регистрации и фабрик.
- Используйте [auras/actions.md](/ru/scripting/api/auras/actions) для выполнения actions.
- Используйте [auras/triggers.md](/ru/scripting/api/auras/triggers) для activation/event sources.
- Используйте [auras/overlays.md](/ru/scripting/api/auras/overlays) для overlay entities.

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

- [core/eyeauras-structure.md](/ru/scripting/api/core/eyeauras-structure)
- [auras/entities.md](/ru/scripting/api/auras/entities)
- [auras/actions.md](/ru/scripting/api/auras/actions)
- [auras/triggers.md](/ru/scripting/api/auras/triggers)
- [auras/overlays.md](/ru/scripting/api/auras/overlays)
- [scripting/runtime.md](/ru/scripting/api/scripting/runtime)