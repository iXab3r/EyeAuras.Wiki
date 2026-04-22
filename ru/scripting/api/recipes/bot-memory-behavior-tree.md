---
title: AI-рецепт бота на Memory API и Behavior Tree
description: Короткий рецепт по чтению памяти и передаче данных в автоматизацию Behavior Tree.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, blazor, memory, behavior-tree, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Бот на Memory API и Behavior Tree

| Поле | Значение |
| --- | --- |
| Сложность | Средняя |
| Пример | POE2 Helper |
| Конечная цель | Прочитать небольшой набор значений из памяти, показать их пользователю и дать `Behavior Tree` использовать те же данные. |
| Ключевые технологии | Memory API, Behavior Tree, окно Blazor, общие переменные скрипта |

## Когда использовать

- Основная логика бота уже находится в `Behavior Tree`.
- Скрипту нужно читать память и передавать несколько значений в это дерево.
- Пользователю также нужно небольшое окно, где эти значения видны.
- Полноценная панель бота на ImGui для такой задачи была бы избыточной.

## Пример

[Path of Exile 2 Helper - Auto HP/MP](https://eyeauras.net/share/S20241213181401RaWLZLE430e6)
показывает этот подход: небольшое окно статуса и настроек, чтение памяти на C# и
узлы `Behavior Tree`, которые используют эти значения.

![Небольшое окно статуса и конфигурации](https://s3.eyeauras.net/media/2025/01/EyeAuras_iSuJSK1pHGNKt6oe.png)

![Значения из памяти передаются в Behavior Tree](https://s3.eyeauras.net/media/2024/12/NVIDIA_Overlay_6AQq69FcnRKIaom4.png)

![Behavior Tree использует значения, полученные из памяти](https://s3.eyeauras.net/media/2024/12/NVIDIA_Overlay_ZETbjmdKSZXdNyWt.png)

## Общая схема

- Читайте только те значения из памяти, которые действительно нужны `Behavior Tree`.
- Сохраняйте или публикуйте эти значения в небольшом общем объекте значений или в переменных скрипта.
- Показывайте те же значения в компактном окне Blazor.
- Дайте узлам `Behavior Tree` читать эти значения и решать, что делать дальше.
- Явно показывайте в интерфейсе потерю процесса или окна.

## Что нужно решить заранее

- Как пользователь будет выбирать процесс или окно.
- Какие значения нужно передавать в `Behavior Tree`.
- Какие значения нужны только для отображения.
- Каким должно быть окно: обычным, поверх всех окон или компактным.
- Будет ли `Behavior Tree` читать переменные скрипта или вызывать скрипт/сервис.

## Какие API посмотреть

- `IBlazorWindow`
- `BlazorReactiveComponent<T>`
- `IDialogWindowUnstableScriptingApi`
- `IWindowHandle`
- `IWindowSelector`
- `IWindowMatcher`
- `IBehaviorTreeAccessor`
- `ScriptVariable<T>`
- `IProcess`

## Чего избегать

- Больших панелей управления.
- Использования окна как слоя рендера для overlay.
- Скрытия ошибок привязки к процессу или чтения памяти.
- Сохранения сырых handle, id процесса или runtime-адресов.

## Что почитать дальше

- `windows-subsystems/blazor-windows.md`
- `windows-subsystems/window-handles.md`
- `memory/processes.md`
- `auras/overview.md`
- `scripting/runtime.md`