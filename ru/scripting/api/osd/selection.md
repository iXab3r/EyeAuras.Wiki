---
title: AI OSD и выбор
description: AI-ориентированная карта сервисов выбора на базе OSD и данных о выбранном окне.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, osd, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта поиска для OSD-выбора

Справочная карта для интерактивного выбора на экране: окно, область, точка или цвет.

Постоянные аннотации и отрисовка поверх экрана описаны в `osd/screen-overlay.md`.

## Что пользователь хочет сделать

- Выбрать целевое окно.
- Выбрать область на экране.
- Выбрать точку на экране.
- Выбрать цвет под курсором.
- Использовать PID выбранного окна в сценариях CV, memory или input.

## Модель

- `IOsdSelectionService` — пользовательский сервис выбора.
- Выбор выполняется интерактивно и действует временно.
- `PickWindow()` возвращает `IWindowHandle`.
- Выбор области, точки и цвета можно ограничить конкретным окном.
- При выборе области можно получить преобразования координат между экраном и окном.

## API

- `IOsdSelectionService`
  - `PickWindow()`
  - `PickRegion(IWindowHandle targetWindow = default)`
  - `PickPoint(IWindowHandle targetWindow = default)`
  - `PickColor(IWindowHandle targetWindow = default)`
- `OsdRegionSelectionResult` — выбранная область, матрицы преобразования и окно под курсором.
- `OsdRegionTransformationMatrices` — `ScreenToWindow` и `WindowToScreen`.
- `OsdPointSelectionResult` — выбранная точка.
- `OsdColorSelectionResult` — считанный цвет.

## Что предпочтительно

- Для выбора пользователем используйте `IOsdSelectionService`.
- Вместо сырых хэндлов предпочитайте `IWindowHandle`, полученный из `PickWindow()`.
- Для преобразования и сопоставления хэндлов используйте `windows-subsystems/window-handles.md`.
- Для постоянных overlay-элементов используйте `osd/screen-overlay.md`.

## Чего лучше избегать

- Не используйте собственный polling курсора или скриншоты для поведения picker-а.
- Не используйте OSD selection как рендерер постоянных overlay-элементов.
- Не рассчитывайте на то, что выбранные окна останутся активными или вообще продолжат существовать.

## Опорные сущности для поиска

- `IOsdSelectionService`, `PickWindow`, `PickRegion`, `PickPoint`,
  `PickColor`, `OsdRegionSelectionResult`, `WindowUnderCursor`,
  `OsdRegionTransformationMatrices`.

## Синонимы для поиска

- select window
- pick window
- OSD picker
- region picker
- point picker
- color picker
- screen selection
- window under cursor

## Связанные карты

- `osd/screen-overlay.md`
- `windows-subsystems/window-handles.md`
- `computer-vision/images.md`
- `memory/processes.md`