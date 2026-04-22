---
title: API рантайма ИИ
description: AI-first обзор API для чат-сессий, профилей моделей, retrieval, MCP и интерфейса чата на Blazor.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ml, semantic-kernel, mcp, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта AI Runtime API

API для AI runtime позволяют создавать чат-сессии на базе моделей, подключать инструменты, добавлять локальный retrieval, выводить сессии в UI и при необходимости публиковать тот же набор инструментов через MCP.

## Что обычно нужно сделать

- Создать AI чат-сессию для функции приложения или редактора скриптов.
- Выбрать или проверить активный профиль модели.
- Добавить поиск по документации в чат-сессию.
- Зарегистрировать инструменты, которые может вызывать AI.
- Отрисовать переиспользуемый Blazor-компонент чата.
- Добавить speech-to-text для ввода в чат.
- Поднять MCP-host для инструментов, чтобы их могли использовать внешние клиенты.
- Построить интеграцию на базе coding agent или Responses API.

## Модель компонентов

- `AiEngine` — фабрика и реестр сессий.
- `IAiProfileRepository` хранит шаблоны и настроенные записи `AiModelProfile`.
- `AiChatSession` управляет историей чата, активным профилем, плагинами, retrieval, artifact store, политикой вызова функций и `AiConversationEngine`.
- `AiConversationEngine` отправляет ходы диалога, стримит обновления, применяет retrieval, отслеживает расход токенов, отправляет telemetry и направляет события вызова инструментов в sink.
- Объекты `AiKernelPlugin` предоставляют инструменты и инструкции для сессии. Регистрируются через `IAiSession.AddOrUpdatePlugin`.
- `IAiPluginHost` управляет каталогом плагинов, показывает список инструментов и умеет вызывать их по имени плагина и инструмента.
- `AiDocsKnowledgeBasePlugin` добавляет поиск и retrieval по markdown-документации на основе BM25.
- `AiChatViewModel` реализует `IAiEventSink` и превращает события сессии в элементы таймлайна.
- `AiChatComponent` отображает переписку, вызовы инструментов, telemetry, artifacts и область ввода.
- `AiMcpSession` и `AiMcpServerHost` публикуют зарегистрированные инструменты плагинов как MCP server.

## Где это используется во время выполнения

- Код приложения или плагина обычно получает `AiEngine`, `IAiProfileRepository`, `IAiSpeechToTextService`, фабрики и configurator-ы через dependency injection.
- Razor-компоненты получают AI-сервисы через обычный Blazor injection и сами управляют временем жизни session/view-model.
- Верхнеуровневые скрипты и script projects не должны рассчитывать, что AI-сервисы доступны как глобальные символы. Используйте host surface, доступный внутри конкретного script project.
- Обычные вспомогательные классы должны получать `IAiSession`, `AiEngine`, плагины и другие AI-зависимости явно.
- AI runtime — это не тот же самый subsystem, что CV/YOLO inference. Объединяйте их только там, где одной функции нужны и визуальное распознавание на модели, и orchestration для чата/инструментов.

## Подробности API

- `AiCoreServiceCollectionExtensions.AddAiCoreServices` — регистрирует базовые AI-сервисы: profile repository, transport events, API-key resolver, no-op speech service, Codex runtime host и `AiEngine`.
- `AiDesktopServiceCollectionExtensions.AddAiDesktopServices` — добавляет desktop scripting AI, окно script editor, desktop speech-to-text и configurator-ы чат-сессий для скриптов.
- `AiEngine.CreateSession` — создаёт обычную `AiChatSession`, применяет первый настроенный профиль, если он есть, и регистрирует сессию в engine.
- `AiEngine.CreateMcpSession` — создаёт `AiMcpSession` для публикации инструментов без UI-переписки.
- `AiEngine.AddCodexSession` — создаёт coding-agent session на базе Codex.
- `AiEngine.RemoveSession`, `RemoveMcpSession`, `ClearSessions` — освобождают принадлежащие engine сессии и удаляют их из реестра.
- `IAiChatSessionHandle` — disposable-обёртка владения, которую удобно использовать в UI tabs или scoped workflows.
- `AiSessionOptions.EnableArtifactStore` — управляет тем, будет ли сессия регистрировать встроенный плагин `artifact_store`.
- `AiFunctionInvocationPolicy` — allowlist, denylist, режим подтверждения по умолчанию и callback для подтверждения вызовов инструментов.
- `AiToolCallFilter` — Semantic Kernel invocation filter, который проверяет подтверждение, публикует telemetry по инструментам и применяет лимиты по длительности вызова.
- `IAiTransportEvents` — наблюдает за transport data запросов и ответов.
- `IAiSpeechToTextService` — UI-ориентированная абстракция speech-to-text; в core runtime регистрируется no-op реализация, в desktop runtime — настоящая служба.

## Профили

- `IAiProfileRepository.Load` / `Save` сохраняют и загружают состояние профилей моделей.
- `GetAllTemplates`, `GetBuiltInTemplates`, `GetCustomTemplates` описывают доступные шаблоны профилей.
- `GetConfiguredProfiles`, `FindConfiguredProfile`, `AddOrUpdateConfiguredProfile`, `RemoveConfiguredProfile` управляют конкретными профилями, которые можно использовать в сессиях.
- Поля `AiModelProfile` включают `DisplayName`, `Provider`, `ModelId`, `Endpoint`, `ApiKeyRef`, `SupportsFunctionCalling`, `OrganizationId`, `ApiType`, `ReasoningEffort` и `MaxContextTokens`.
- Среди поддерживаемых provider anchors есть `AiProvider.OpenAi`, `AiProvider.AzureOpenAi`, `AiProvider.Ollama` и сценарии с OpenAI-compatible endpoint.
- `AiApiType.ChatCompletions` использует обвязку Semantic Kernel chat completions.
- `AiApiType.Responses` обрабатывается через путь адаптера Responses.

## Retrieval и документация

- `AiDocsKnowledgeBasePlugin` предоставляет `doc_search`, `doc_get_chunk_preview`, `doc_get_chunk_full`, `doc_list_documents`, `doc_list_pinned_documents`, `doc_get_index_status` и `doc_reindex`.
- `IBm25KnowledgeBase.AddOrUpdateDocument` регистрирует один markdown-документ.
- `IBm25KnowledgeBase.AddOrUpdateDirectory` — расширенный сценарий для добавления каталога markdown-документов, если он доступен.
- `Bm25Document` содержит `IFileInfo`, timestamp, необязательный hash, description, kind, tags, source name и pinned flag.
- Pinned docs рассматриваются `AiDocsKnowledgeBasePlugin` как постоянные инструкции.
- `IAiRetrievalService` может добавлять локальный контекст в запрос к модели перед отправкой хода диалога.
- `AiKernelPlugin.GetRetrievalServices` позволяет плагину добавить retrieval в сессию.

## UI

- `AiChatViewModel` связывает `IAiChatSession` с состоянием UI чата и реализует `IAiEventSink`.
- `AiChatViewModel.SendAsync`, `CancelAsync`, `ClearAsync`, `RetryRequestAsync` — основные handlers команд.
- `AiChatViewModel.Session.SetEventSink(this)` связывает события runtime с UI.
- `AiChatComponent` отображает элементы таймлайна, фазы запроса, вызовы инструментов, telemetry, reasoning, artifacts и компонент ввода.
- `AiChatComponent.BeforeSend` позволяет выполнить логику приложения перед отправкой.
- `AiChatComponent.InputFooterContent` позволяет добавить элементы управления, специфичные для host.
- `AiChatInputComponent` обрабатывает текстовый ввод и UI, связанный с голосовым вводом.

## Типовые сценарии

### Обычная чат-сессия

1. Загрузите профили через `IAiProfileRepository.Load`.
2. Создайте сессию через `AiEngine.CreateSession`.
3. При необходимости задайте или замените `ActiveProfile` через `IAiChatSession.SetProfile`.
4. Зарегистрируйте плагины через `session.AddOrUpdatePlugin`.
5. Создайте `AiChatViewModel(session, speechToTextService)`.
6. Отрисуйте `AiChatComponent`, передав view model как data context.
7. Освобождайте view model и session handle вместе.

### Ассистент в редакторе скриптов

1. Получите активный `IAuraScriptRunner` из контекста редактора или вкладки.
2. Создайте сессию через `IScriptAiChatSessionFactory.CreateSession`.
3. Дайте экземплярам `IScriptAiChatSessionConfigurator` подключить инструменты рабочего пространства.
4. Создайте docs plugin, добавьте файлы документации и вызовите `ReindexAsync`.
5. Зарегистрируйте docs через `session.AddOrUpdatePlugin`.
6. Создайте `AiChatViewModel`.
7. Храните `AiChatViewModel` и `IAiChatSessionHandle` в одном disposable lifetime.

### MCP host для инструментов

1. Создайте `AiMcpSession` через `AiEngine.CreateMcpSession`.
2. Зарегистрируйте те же экземпляры `AiKernelPlugin`, которые использовались бы в чат-сессии.
3. Создайте `AiMcpServerHost` с нужными listener options.
4. Запустите host и передайте внешним MCP-клиентам URL endpoint.
5. При отключении функции остановите и освободите host/session.

## Подсказки по assembly и package

- Core namespace: `EyeAuras.AI`.
- Plugin namespace: `EyeAuras.AI.SemanticKernel`.
- Retrieval namespace: `EyeAuras.AI.BM25`.
- UI namespace: `EyeAuras.AI.UI`.
- Desktop scripting namespace: `EyeAuras.AI.Desktop.Scripting`.
- MCP namespace: `EyeAuras.AI.Mcp`.
- Responses namespace: `EyeAuras.AI.ResponsesAPI`.
- AI runtime зависит от пакетов Semantic Kernel и Model Context Protocol в коде приложения или модуля. Не рассчитывайте, что эти assembly подключены в каждом script project.

## Что лучше использовать

- Используйте композицию через factory/configurator для сессий, завязанных на конкретную функцию.
- Используйте `IAiChatSessionHandle`, чтобы владение сессией было явным.
- Используйте `AiDocsKnowledgeBasePlugin` для локальной markdown-документации вместо ручного prompt stuffing.
- Используйте `AiChatViewModel` + `AiChatComponent` для переиспользуемого Blazor UI чата.
- Используйте `AiFunctionInvocationPolicy` для потенциально опасных инструментов.
- Используйте события `IAiEventSink` для UI и telemetry вместо разбора логов.

## Чего лучше избегать

- Не создавайте сессии без загрузки профилей, если host ожидает сохранённую конфигурацию профилей.
- Не регистрируйте инструменты плагинов с повторяющимися явными именами.
- Не предполагайте, что `SupportsFunctionCalling` равен `true` у каждого профиля.
- Не делайте долгие методы инструментов без поддержки `CancellationToken`.
- Не добавляйте machine-local пути к документации в общие docs или prompts.
- Не смешивайте lifetime AI чат-сессии с lifetime посторонних UI-компонентов.

## Опорные сущности для исследования

- `AiEngine`
- `IAiSession`
- `IAiChatSession`
- `AiChatSession`
- `AiConversationEngine`
- `IAiChatSessionHandle`
- `IAiSessionContext`
- `AiSessionOptions`
- `IAiProfileRepository`
- `AiModelProfile`
- `AiKernelPlugin`
- `IAiPluginHost`
- `AiDocsKnowledgeBasePlugin`
- `IBm25KnowledgeBase`
- `Bm25Document`
- `AiChatViewModel`
- `AiChatComponent`
- `IAiSpeechToTextService`
- `IScriptAiChatSessionFactory`
- `IScriptAiChatSessionConfigurator`
- `AiMcpSession`
- `AiMcpServerHost`
- `ResponsesConversationAdapter`
- `AiFunctionInvocationPolicy`
- `AiToolCallFilter`

## Синонимы для поиска

- AI runtime
- AI chat
- AI assistant
- chat session
- model profile
- profile repository
- tool calling
- function calling
- kernel plugin
- Semantic Kernel
- Responses API
- MCP server
- local docs
- docs search
- BM25
- retrieval augmented generation
- RAG
- artifact store
- speech to text
- coding agent

## Связанные карты

- `ml/ai.md`
- `ml/ai-kernel-plugins.md`
- `scripting/runtime.md`
- `windows-subsystems/blazor-windows.md`
- `recipes/script-ai-editor-assistant.md`