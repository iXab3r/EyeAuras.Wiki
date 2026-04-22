---
title: AI Auras — оверлеи
description: AI-ориентированная карта оверлеев аур и поверхностей визуального вывода.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, overlays, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта API для aura overlays

Справочная карта по overlay-сущностям аур — это настраиваемые визуальные поверхности, которыми управляют workflow аур.

## Модель

- Overlays — это aura-сущности, которые отвечают за отображение.
- Overlays регистрируются через `IAuraRegistrator`.
- Свойства overlay сохраняют конфигурацию.
- Overlays не активируют ауры и не выполняют списки действий.
- Blazor OSD screen overlay — это более низкоуровневая отрисовка, и она не равна aura overlay entity.
- ImGui windows — это UI-поверхности из опционального пакета.

## Основные API

- `CsharpScriptOverlay` — script overlay entity.
- `AuraOverlayPropertiesBase` — базовый класс общих свойств overlay.
- `AuraOverlayContentBase` — базовый класс общего content/view-model для overlay.
- `IOnScreenCanvas` — низкоуровневый canvas для экранных аннотаций.
- `IBlazorWindow` — нативное окно на базе Blazor.
- `IImGuiExperimentalApi` — точка входа в опциональный ImGui SDK.

## Что использовать

- Выбирайте aura overlay entities, если UI связан с конфигурацией и жизненным циклом ауры.
- Для экранных аннотаций и CV debug boxes используйте `osd/screen-overlay.md`.
- Для настоящих нативных окон используйте `windows-subsystems/blazor-windows.md`.
- Для окон через ImGui SDK используйте `nuget/imgui-sdk.md`.

## Чего избегать

- Не путайте overlays с triggers или actions.
- Не используйте документацию по overlay entities для низкоуровневой OSD-отрисовки.

## Опорные сущности для поиска

- `CsharpScriptOverlay`, `AuraOverlayPropertiesBase`,
  `AuraOverlayContentBase`, `IOnScreenCanvas`, `IBlazorWindow`,
  `IImGuiExperimentalApi`, `ImGuiWindowManager`.

## Синонимы для поиска

- overlay
- aura overlay
- script overlay
- visual overlay
- Blazor overlay
- ImGui overlay
- screen annotation

## Связанные карты

- `auras/entities.md`
- `auras/actions.md`
- `auras/triggers.md`
- `osd/screen-overlay.md`
- `windows-subsystems/blazor-windows.md`
- `nuget/imgui-sdk.md`