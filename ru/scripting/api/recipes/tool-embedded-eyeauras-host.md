---
title: AI-рецепт по интеграции инструментов EyeAuras в другое приложение
description: Короткий рецепт с рекомендациями по встраиванию UI, автоматизации или OSD на базе EyeAuras в другое приложение или хост плагинов.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, recipes, embedded, blazor, behavior-tree, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Как добавить инструменты EyeAuras в другое приложение

| Поле | Значение |
| --- | --- |
| Сложность | Очень высокая |
| Пример | Плагин или host-приложение, которое открывает окна на базе EyeAuras и запускает редактируемую автоматизацию. |
| Конечная цель | Host-приложение получает окна на базе EyeAuras, экранную визуализацию, скриптинг или автоматизацию. |
| Ключевые технологии | `EyeAuras.SDK.Embedded`, модули приложения, `IBlazorWindow`, API Behavior Tree, API OSD |

## Когда это использовать

- Функция работает внутри другого приложения или plugin host.
- Host передаёт ticks, render callbacks или domain events.
- Пользователю нужны окна на базе EyeAuras, экранная визуализация, скриптинг или автоматизация внутри этого host.
- Обычный скрипт EyeAuras не является точкой входа.

## Общая схема

- Запустите embedded SDK runtime из host или плагина.
- Свяжите события host с сервисами, которые видит EyeAuras.
- Показывайте сложные элементы управления через Blazor windows.
- Рисуйте визуализацию через рендеринг host или API OSD.
- Добавляйте Behavior Tree или hosted scripting только если пользователю нужна редактируемая автоматизация.

## Что нужно решить заранее

- Какую часть SDK runtime вообще загружать.
- В каком потоке можно безопасно создавать UI.
- Должна ли визуализация использовать рендеринг host, OSD, Blazor windows или смешанный UI.
- Где должна жить автоматизация — в callbacks host, Behavior Tree, скриптах или сервисах.

## Какие API посмотреть

- `EyeAuras.SDK.Embedded`
- `EyeAurasEmbeddedBootstrapper`
- `EyeAurasWebAppBootstrapper`
- `IDynamicModule`
- `IBlazorWindow`
- `IBlazorWindowAccessor`
- `IOnScreenCanvas`
- `IBehaviorTreeRootNode`
- `IReactiveBehaviorTreeEditor`
- `IAuraScriptFactory`

## Чего избегать

- Не рассматривайте код embedded-host как обычный контекст скрипта.
- Не создавайте UI-окна из неправильного потока.
- Не блокируйте callbacks host для tick или render задачами SDK или UI.
- Не отдавайте внутренние объекты host напрямую в пользовательские скрипты.
- Не сохраняйте volatile host handles, pointers или session objects.

## Связанные материалы

- `core/app-runtime-contexts.md`
- `core/app-modules.md`
- `windows-subsystems/blazor-windows.md`
- `osd/screen-overlay.md`
- `scripting/runtime.md`