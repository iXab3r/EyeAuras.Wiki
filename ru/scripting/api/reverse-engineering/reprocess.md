---
title: AI Reverse Engineering и ReProcess
description: AI-ориентированная карта интерфейса ReProcess и сценариев реверс-инжиниринга.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, reverse-engineering, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Reverse Engineering / карта ReProcess

Справочная карта по `ReProcess`: сборка RE-рабочего пространства, вкладки, действия, инспекторы, хранилище знаний и process-oriented RE UI.

## Типовые задачи

- Собрать RE UI вокруг `IProcess`.
- Встроить `ReProcess` в ImGui.
- Добавить RE-вкладки, действия и инспекторы.
- Подключить RE workspace после выбора окна и process reader.
- Использовать RE-инструменты с поддержкой AI.

## Как это устроено

- `ReProcess` — это рабочее пространство для reverse engineering, ориентированное на конкретный процесс.
- Оно ожидает уже проверенный `IProcess`.
- Вкладки, действия и инспекторы — это точки расширения.
- Обычный хост для UI — ImGui SDK.
- Выбор process reader относится к картам памяти и пакетов, а не к внутренней логике RE UI.

## Основные API

- `ReProcess` / `IReProcess` — объект RE workspace.
- `ReProcessBuilder` — собирает workspace и плагины.
- `ReTabRegistry`, `ReActionRegistry`, `ReAddressInspectorRegistry` — реестры расширений.
- `ReKnowledgeStore` — постоянное хранилище RE-знаний.
- `ReToolsPlugin` — добавляет RE-инструменты.
- `ICanBeDisplayedInImGui` — контракт для размещения в ImGui.

## Что предпочтительно

- Перед сборкой RE UI проверяйте `IProcess.IsValid` и ожидаемый PID.
- Для хостинга в ImGui используйте `nuget/imgui-sdk.md`.
- Для process reader используйте `memory/processes.md` или `nuget/frida-sdk.md`.

## Чего избегать

- Не создавайте `ReProcess`, пока не проверена identity процесса.
- Не смешивайте UI выбора process reader с внутренней логикой RE.

## Ключевые сущности для поиска

- `ReProcess`, `IReProcess`, `ReProcessBuilder`, `ReTabRegistry`,
  `ReActionRegistry`, `ReAddressInspectorRegistry`, `ReKnowledgeStore`,
  `ReToolsPlugin`, `ICanBeDisplayedInImGui`.

## Синонимы для поиска

- ReProcess
- reverse engineering
- RE workspace
- memory browser
- address inspector
- RE tab
- RE action
- process inspector

## Связанные карты

- `memory/processes.md`
- `nuget/frida-sdk.md`
- `nuget/imgui-sdk.md`
- `osd/selection.md`