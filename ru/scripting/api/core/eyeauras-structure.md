---
title: AI Core и структура EyeAuras
description: Карта структуры приложения EyeAuras и его runtime-контейнеров для AI-first сценариев.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, core, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта структуры EyeAuras

Справочная карта по модели продукта: Aura Tree, папки, ауры, триггеры, actions, overlays, behavior trees, macros, variables и script workspaces.

## Что обычно хотят понять

- В каком именно host-контексте сейчас выполняется скрипт.
- Как найти текущую ауру, папку, behavior tree, macro, trigger, action или overlay.
- Как отличить product runtime API, script runtime API, SDK metadata и optional package surface.
- Как безопасно вынести код из top-level script в обычные helper-классы.

## Модель концепций

- EyeAuras — это automation host, а не просто C# library.
- Пользовательский проект — это Aura Tree, состоящее из папок и аур.
- Ауры содержат условия включения, triggers, overlays и списки actions.
- Triggers определяют активное состояние, actions выполняют работу, overlays показывают UI.
- Скрипты работают внутри host-контекста с живыми сервисами и metadata текущей ауры.
- SDK references дают доступ к символам, но живые host services по-прежнему зависят от runtime context и загруженных модулей.

## Основные API

- `IEyeContext` - общий runtime context для объекта EyeAuras.
- `IAuraContext` - runtime context конкретной ауры.
- `IFolderContext` - runtime context конкретной папки.
- `IEyeItem` - общая форма tree-элемента.
- `IAuraTreeScriptingApi` - script-facing API для поиска и навигации по дереву.
- `IAuraAccessor` - script handle для одной ауры.
- `IFolderAccessor` - script handle для одной папки.
- `IMacroAccessor` - script handle для одного macro.
- `IBehaviorTreeAccessor` - script handle для behavior trees.

## Что предпочитать

- Сначала определяйте текущий product context, и только потом выбирайте API.
- Для работы с aura, folder и macro из скриптов используйте accessors.
- Если разбираетесь, как регистрируются пользовательские компоненты, смотрите `auras/entities.md`.
- Если важна разница между top-level script и helper-классами, смотрите `scripting/runtime.md`.

## Чего избегать

- Не воспринимайте helper-методы из top-level script как глобальные C# API.
- Не используйте UI/editor-классы как основной источник runtime-семантики.
- Не предполагайте, что код, доступный только через SDK, может работать с живыми host services.

## Полезные поисковые запросы

- Aura Tree
- aura context
- folder context
- current aura
- current folder
- script workspace
- behavior tree
- macro
- action list
- overlay
- runtime context

## Связанные карты

- `scripting/runtime.md`
- `auras/overview.md`
- `auras/entities.md`
- `core/app-runtime-contexts.md`
- `core/deployment.md`