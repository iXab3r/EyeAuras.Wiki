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

## Показать рабочее пространство выбранного процесса

Для интеграции нужны уже открытый `IProcess`, настроенный `AiEngine`, `IAiSpeechToTextSessionFactory` хоста и действующий ImGui-кадр. Это зависимости приложения, их наличие не следует из одной metadata-ссылки. В обычном C#-классе создайте `new ReProcess(process, aiEngine, speechToTextSessionFactory)` из namespace `EyeAuras.AI.Desktop.RE`, удерживайте его живым и вызывайте `ToImGui()` внутри окна в callback рендера. Перед созданием проверьте ожидаемый PID; `IsValid` не доказывает читаемость всех адресов.

Этот публичный конструктор в EyeAuras `20fd3d4` собирает стандартные вкладки, scanner и AI. Наблюдаемый результат — вкладки выбранного процесса в вашем ImGui-окне. UI сам не выбирает backend и не открывает процесс. При остановке снимите renderer, освободите `ReProcess`, затем reader, если он принадлежит вам. `ReProcess.Dispose()` освобождает принадлежащие workspace рендереры вкладок и инспекторов, но не переданные `IProcess` и `AiEngine`. Это схема интеграции с существующим UI-хостом, не самостоятельный запуск RE-приложения.

## Собрать другой набор вкладок

`ReProcessBuilder.UseDefaults()` задаёт обычный набор, `UseMinimalDefaults()` оставляет минимальную композицию с вкладкой памяти. Затем добавляйте публичные providers через `AddTab`, `AddAction`, `AddAddressInspector`; generic-перегрузки создают их через предоставленный `IServiceProvider`. Передайте свой объект, реализующий `IReProcessBuilderContext`, в `Build(context)`. Он предоставляет процесс, AI engine, фабрику речи, реестры и `IReKnowledgeStore`. Конкретный `ReProcessBuilderContext` внутренний и недоступен обычному клиентскому коду.

`Build` возвращает `IReProcess`, копирует реестры и создаёт отдельное хранилище знаний для workspace. Интерфейс `IReProcess` сам не объявляет `ToImGui` или `Dispose`: для рисования и освобождения учитывайте дополнительные интерфейсы фактического объекта (`ICanBeDisplayedInImGui`, `IDisposable`), не вызывайте методы внутренней реализации. `ReKnowledgeStore` также внутренний; публичный доступ идёт через `IReKnowledgeStore`. В исходниках это хранилище в памяти, сохранение между запусками не обещано. Потоки исполнения/доступ к UI согласует хост; декларации API не доказывают нативную или AI-совместимость установленной версии.

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
- `IReTabRegistry`, `IReActionRegistry`, `IReAddressInspectorRegistry` — публичные контракты реестров расширений.
- `IReKnowledgeStore` — хранилище RE-знаний одного workspace в памяти.
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
  `ReActionRegistry`, `ReAddressInspectorRegistry`, `IReKnowledgeStore`,
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