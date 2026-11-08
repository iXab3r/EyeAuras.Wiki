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

## Добавить Memory API в существующий WPF-хост

Вход этой интеграции — Windows-приложение с WPF `Application`, живым UI dispatcher, Prism/Unity-композицией и собственным порядком запуска/остановки. Одного атрибута STA недостаточно для работающего dispatcher и времени жизни host: bootstrapper опирается на инфраструктуру приложения и модулей.

Подключите `EyeAuras.SDK.Runtime` и пакет возможностей памяти. В наследнике `EyeAurasRuntimeBootstrapper` переопределите `ConfigureEmbeddedModules(IEyeAurasModuleSetBuilder modules)` и вызовите `modules.UseMemory()`. `EyeAurasEmbeddedBootstrapper` из `EyeAuras.SDK.Embedded` — совместимый наследник этого runtime bootstrapper; это альтернативная упаковка, не дополнительный обязательный этап. Host-сервисы зарегистрируйте при композиции Unity до их использования модулями.

Хост запускает bootstrapper своим WPF/Prism-путём и затем ожидает `EnsureReadyAsync(cancellationToken)`. Только после этого вызывайте `LocalProcess.GetProcesses()` и передавайте выбранный reader потребителям. `UseMemory()` добавляет UiCore, `PlusLoaderModule` и `MemoryModule`; metadata-фасад `LocalProcess` без загруженного модуля builder не имеет. Ожидаемый результат — список локальных процессов и работающий reader внутри существующего приложения.

Readiness добавляет static web assets и ждёт инициализации заявленных модулей, но токен не откатывает запуск и не отменяет любую операцию модуля. Создание UI остаётся на dispatcher; события tick/render хоста не должны блокироваться ожиданием UI. На завершении сначала остановите потребителей и reader, затем освобождайте принадлежащие хосту runtime/container. Рецепт не обещает произвольный `GetService<T>` или автоматически доступные scripting/BT-сервисы. Эти границы сверены с EyeAuras `20fd3d4`; версия csproj не доказывает наличие совместимых опубликованных пакетов.

## Общая схема

- Подключите `EyeAuras.SDK.Embedded` из host-приложения или плагина и создайте
  собственный subclass `EyeAurasEmbeddedBootstrapper`.
- Запускайте embedded SDK runtime явно из host или плагина, обычно в STA-потоке,
  который может владеть UI-работой EyeAuras.
- Регистрируйте host-сервисы в bootstrapper/container перед запуском runtime.
- Объявите нужные capabilities через `ConfigureEmbeddedModules`, затем дождитесь
  `EnsureReadyAsync`: этот путь добавляет static web assets и загружает выбранные
  модули. REPL и scripting services доступны только после регистрации их
  владельцем-модулем; вручную вызывать методы инициализации модулей не нужно.
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
- Не ожидайте script globals вроде `Log`, `AuraTree`, `Variables`, `Sleep` или
  `cancellationToken` в обычных embedded host classes.
- Не добавляйте sandbox-style wrapper APIs вокруг bootstrapper; embedded host
  code — это app/plugin infrastructure, а не script infrastructure.
- Не предполагайте, что REPL или scripting services уже существуют до
  инициализации host-модуля, который их регистрирует.
- Не создавайте UI-окна из неправильного потока.
- Не блокируйте callbacks host для tick или render задачами SDK или UI.
- Не отдавайте внутренние объекты host напрямую в пользовательские скрипты.
- Не сохраняйте volatile host handles, pointers или session objects.

## Связанные материалы

- [core/app-runtime-contexts.md](/ru/scripting/api/core/app-runtime-contexts)
- [core/app-modules.md](/ru/scripting/api/core/app-modules)
- [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows)
- [osd/screen-overlay.md](/ru/scripting/api/osd/screen-overlay)
- [scripting/runtime.md](/ru/scripting/api/scripting/runtime)

[Полный пример выбора возможностей и получения процессов](/ru/scripting/api/nuget/embedded-sdk).
