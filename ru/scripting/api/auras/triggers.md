---
title: AI Auras — триггеры
description: AI-ориентированная карта триггеров аур и связанной с ними инфраструктуры.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, triggers, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта триггеров аур

Справочная карта по триггерам аур — сущностям, которые отслеживают состояние или события и управляют активацией ауры.

## Модель

- Триггеры наблюдают за состоянием и создают события активации.
- Триггеры — это сущности аур, зарегистрированные через `IAuraRegistrator`.
- Логика триггера обычно находится рядом с `CreateTriggerEventSource`.
- Редакторы триггеров и их метаданные описывают пользовательские настройки.
- Actions выполняют работу после изменения состояния триггера.

## Детали API

- `AuraTriggerBase<TProperties>` — общая базовая реализация триггера.
- `CreateTriggerEventSource` — стандартный метод-источник событий триггера.
- `CsharpScriptTrigger` — сущность триггера на скрипте.
- `CsharpScriptTriggerExecutor` — базовый класс для скриптовых триггеров в object-style.
- `ILifecycleEventsProvider` — источник lifecycle-событий для lifecycle-триггеров.

## Типовые сценарии

- Найти встроенный триггер:
  - найдите регистрацию модуля через `Register<SomeTrigger>`.
  - проверьте properties и metadata для настроек в UI.
  - изучите runtime-класс и `CreateTriggerEventSource`.

- Добавить триггер:
  - определите properties.
  - определите runtime-модель триггера.
  - при необходимости добавьте editor/metadata.
  - зарегистрируйте через `IAuraRegistrator`.

## Что предпочесть

- Для семантики активации в первую очередь смотрите `CreateTriggerEventSource`.
- Для деталей по input/window/CV используйте карты соответствующих подсистем.
- Для скриптовых триггеров в object-style предпочитайте `CsharpScriptTriggerExecutor`.

## Чего избегать

- Не смешивайте побочные эффекты actions с исследованием триггеров.
- Не уходите в низкоуровневый polling, пока не проверили существующие триггеры и сервисы.

## Опорные точки для исследования

- `AuraTriggerBase`, `CreateTriggerEventSource`, `CsharpScriptTrigger`,
  `CsharpScriptTriggerExecutor`, `TimerTrigger`, `HotkeyIsActiveTrigger`,
  `WinActiveTrigger`, `WinExistsTrigger`, `ImageSearchTrigger`,
  `TextSearchTrigger`, `ColorSearchTrigger`, `MLSearchTrigger`.

## Синонимы для поиска

- trigger
- aura trigger
- activation
- active state
- event source
- script trigger
- hotkey trigger
- window trigger
- image trigger

## Связанные карты

- `auras/entities.md`
- `auras/actions.md`
- `windows-subsystems/input-hooks-hotkeys.md`
- `windows-subsystems/window-handles.md`
- `computer-vision/images.md`