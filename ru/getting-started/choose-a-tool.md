---
title: Выбрать инструмент под задачу
description: Таблица — какой триггер, действие или оверлей взять под вашу задачу.
published: true
date: 2026-11-11T00:00:00.000Z
tags: getting-started, reference, ai-translated
editor: markdown
dateCreated: 2026-11-11T00:00:00.000Z
---

# Выбрать инструмент под задачу

Найдите в таблице, что вам нужно, и откройте руководство. Чем отличаются макросы, ауры и деревья поведения, рассказано на [главной](/ru/home).

| Что нужно получить | С чего начать |
| --- | --- |
| Условие по окну | [Window Exists](/ru/triggers/window-exists), [Window Is Active](/ru/triggers/window-is-active), [выбор окна](/ru/features/window-matching-expressions) |
| Условие по тому, что видно на экране | [Захват изображения](/ru/triggers/images/imagecapturetriggers), затем [Image Search](/ru/triggers/images/image-search), [Color Search](/ru/triggers/images/color-search) или [Text Search](/ru/triggers/images/text-search) |
| Поиск своей моделью | [AI Search](/ru/triggers/images/ai-search-trigger). Нужна совместимая ONNX-модель, её задача ([детекция](https://docs.ultralytics.com/tasks/detect/), [классификация](https://docs.ultralytics.com/tasks/classify/) или [сегментация](https://docs.ultralytics.com/tasks/segment/)), классы и порог. Готового распознавания любых объектов нет |
| Ручное управление или время | [Fixed Value](/ru/triggers/fixed-value), [Hotkey Is Active](/ru/triggers/hotkey-is-active), [Timer](/ru/triggers/timer) |
| Связь с другой аурой | [Aura Is Active](/ru/triggers/aura-is-active) |
| Данные из файла или сообщения | [File Contains Text](/ru/triggers/file-contains-text), [Network Message](/ru/triggers/network-message), [Telegram Message](/ru/triggers/telegram-message) |
| Звук или уведомление | [Play Sound](/ru/actions/play-sound), [Send To Telegram](/ru/actions/send-telegram-message) |
| Сетевая команда другому EyeAuras | [Send Network Message](/ru/actions/send-network-message). Приём и реакцию настраивайте отдельно на стороне получателя |
| Клавиши, мышь или текст | [Send Sequence](/ru/actions/sendinput/send-sequence), [общие настройки ввода](/ru/actions/sendinput/options). На страницах [Send Input](/ru/actions/sendinput/send-input) и [Send Text](/ru/actions/sendinput/send-text) написано, чем прежние редакторы стали в текущем механизме |
| Ожидание и выбор активного окна | [Delay](/ru/actions/delay), [Win Activate](/ru/actions/win-activate) |
| Подсказка поверх окна | [Text](/ru/overlays/text), [Image](/ru/overlays/image), [Replica](/ru/overlays/replica) — живая копия окна или области |
| Свой интерфейс и код | [C# Script](/ru/scripting/getting-started), [Blazor-окна](/ru/scripting/blazor-windows/getting-started), [Custom UI](/ru/overlays/custom-ui) |
| Разобрать связи аур | [Bindings](/ru/features/bindings), [Default Properties](/ru/features/default-properties), [Dependencies Viewer](/ru/overlays/dependenciesviewer) |
| Условие по строке | [Text Match Expressions](/ru/features/text-match-expressions): текст, регулярное выражение или поддержанный контекст Lambda |
| Уровень звука | [Volume Level](/ru/triggers/volume-level) — справка о старом альфа-компоненте. Для первого знакомства не подходит |
| Перенести свой набор или найти готовый | [Экспорт и импорт](/ru/features/export-import), [библиотека аур](/ru/aura-library) |

Когда EyeAuras ищет что-то на экране, он смотрит на картинку, а не на внутренние данные игры. Получится ли захватить окно и отправить в него ввод, зависит от окна и выбранного механизма. Про совместимость, несколько окон и лицензию читайте в [FAQ](/ru/faq). Если что-то работает не так — в [известных проблемах](/ru/known-problems).
