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

## Выбрать поверхность для интерфейса

Если панель должна сохраняться в настройках ауры и управляться её жизненным циклом, начните с `CsharpScriptOverlay` и регистрации overlay-сущности. Свойства описывают конфигурацию; отображаемая модель `AuraOverlayContentBase` содержит видимость, границы, прозрачность и команды окна. Она создаётся на диспетчере оверлея и хранит свой `Scheduler`; произвольный фоновый поток для работы с UI не подходит.

Например, панель состояния бота, включаемая вместе с аурой, относится к этому уровню. Прямоугольник вокруг найденного изображения на время одного запуска — к [OSD canvas](../osd/screen-overlay). Отдельное окно с Razor — к [Blazor windows](../windows-subsystems/blazor-windows), немедленная отрисовка — к [ImGui SDK](../nuget/imgui-sdk), который подключается отдельно.

Выбор определяет владельца конфигурации и ресурсов. Ни наличие `IOnScreenCanvas`, ни ссылка на ImGui assembly сами по себе не создают overlay-сущность Aura Tree. Не переносите правила отмены или координаты между этими поверхностями без проверки соответствующего API.

## Основные API

- `CsharpScriptOverlay` — script overlay entity.
- `AuraOverlayPropertiesBase` — базовый класс общих свойств overlay.
- `AuraOverlayContentBase` — базовый класс общего content/view-model для overlay.
- `IOnScreenCanvas` — низкоуровневый canvas для экранных аннотаций.
- `IBlazorWindow` — нативное окно на базе Blazor.
- `IImGuiExperimentalApi` — точка входа в опциональный ImGui SDK.

## Что использовать

- Выбирайте aura overlay entities, если UI связан с конфигурацией и жизненным циклом ауры.
- Для экранных аннотаций и CV debug boxes используйте [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay).
- Для настоящих нативных окон используйте [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows).
- Для окон через ImGui SDK используйте [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk).

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

- [auras/entities.md](/ru/scripting/api/auras/entities)
- [auras/actions.md](/ru/scripting/api/auras/actions)
- [auras/triggers.md](/ru/scripting/api/auras/triggers)
- [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay)
- [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows)
- [nuget/imgui-sdk.md](/ru/scripting/api/nuget/imgui-sdk)