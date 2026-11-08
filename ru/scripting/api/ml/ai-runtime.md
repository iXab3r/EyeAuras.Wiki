---
title: API среды выполнения ИИ
description: Карта AI-first API для чат-сессий, профилей моделей, retrieval, MCP и Blazor chat UI.
published: true
date: 2026-04-25T00:00:00.000Z
tags: scripting, api, ai, ml, semantic-kernel, mcp, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта discovery для AI Runtime

API AI runtime позволяют создавать чат-сессии на базе моделей, подключать к ним инструменты, добавлять локальный retrieval, выводить сессии в UI и при необходимости публиковать тот же набор инструментов через MCP.

## Что здесь обычно нужно сделать

- Создать AI-чат-сессию для функции приложения или редактора скриптов.
- Выбрать или проверить активный профиль модели.
- Добавить поиск по документации в чат-сессию.
- Зарегистрировать инструменты, которые AI может вызывать.
- Отрисовать переиспользуемый Blazor-компонент чата.
- Поднять переиспользуемую поверхность Codex thread/workspace/chat так, чтобы жизненный цикл Codex не зависел от Blazor.
- Добавить speech-to-text для ввода в чат.
- Опубликовать инструменты через MCP для внешних клиентов.
- Собрать интеграцию на базе coding agent или Responses API.
- Собрать, экспортировать или скопировать EyeAuras guidance pack для внешних coding agents.

## Модель компонентов

- `AiEngine` — фабрика и реестр сессий.
- `IAiProfileRepository` хранит шаблоны и настроенные записи `AiModelProfile`.
- `AiChatSession` хранит историю чата, активный профиль, плагины, retrieval, artifact store, политику вызова функций и `AiConversationEngine`.
- `AiConversationEngine` отправляет ходы диалога, стримит обновления, применяет retrieval, отслеживает расход токенов, отправляет telemetry и маршрутизирует события tool-call в sink.
- Объекты `AiKernelPlugin` публикуют инструменты и инструкции сессии. Регистрируются через `IAiSession.AddOrUpdatePlugin`.
- `IAiPluginHost` владеет каталогом плагинов, умеет перечислять инструменты и вызывать их по имени плагина/инструмента.
- `AiDocsKnowledgeBasePlugin` добавляет поиск и retrieval по markdown-документации на базе BM25.
- `AiChatViewModel` реализует `IAiEventSink` и превращает события сессии в элементы таймлайна.
- `AiChatComponent` отображает историю чата, tool calls, telemetry, artifacts и область ввода.
- `AiMcpSession` и `AiMcpServerHost` публикуют зарегистрированные инструменты плагинов как MCP-сервер.
- `AiCodexManager` отвечает за runtime-операции Codex, включая список моделей, список тредов, чтение/создание тредов, архив и разрешение live sessions.
- `AiCodexSession` — реализация `AiCodingAgentSession` на базе Codex, которая при этом укладывается в обычную модель `AiChatSession`/plugin/event-sink.
- `ICodexChatController` / `CodexChatController` — UI-agnostic контроллеры оболочки Codex. Они управляют start/stop, состоянием браузера тредов, жизненным циклом активного треда, выбором model/reasoning, подтверждением архивации и workspace attachments.
- `CodexChatOptions` — точка адаптации хоста для валидации профиля, `CodexSessionOptions`, контекста сессии, регистрации плагинов, обновления перед отправкой, выбора файлов/папок и дефолтных feature-флагов. Делегат session-options вызывается повторно перед активными ходами, чтобы хост мог обновить readable/writable roots на границе запроса.
- `CodexThreadListItem` преобразует сырые значения `AiCodexThreadSummary` в строки выбора тредов, не зависящие от конкретного UI.
- `CodexWorkspaceAttachment` преобразует выбранные файлы/директории в правила доступа к workspace для Codex. Для директории выбранная папка становится writable root; для файла сохраняется точный путь к выбранному файлу, а writable root берётся из родительской директории.
- `IEyeAurasAiGuidanceService` собирает и экспортирует переносимый EyeAuras `guidance-pack` для внешних coding agents. Его публичный контракт находится в `EyeAuras.UI.Metadata`, а desktop-реализация — в `EyeAuras.UI`.
- `EyeAurasAiGuidanceContext` описывает разрешённый snapshot репозитория документации и пути к сгенерированному pack. Методы с явным контекстом переиспользуют этот snapshot, а export/copy-методы без контекста сначала обновляют docs-репозиторий и пересобирают pack.

## Контексты хоста и runtime

- Код приложения/плагина обычно получает `AiEngine`, `IAiProfileRepository`, `IAiSpeechToTextService`, фабрики и configurators через dependency injection.
- Razor-компоненты получают AI-сервисы через обычный Blazor injection и сами владеют временем жизни session/view-model.
- Верхнеуровневые скрипты или script projects не должны рассчитывать, что AI-сервисы существуют как глобальные символы. Используйте host surface, доступный в этом script project.
- Обычные helper-классы должны явно получать `IAiSession`, `AiEngine`, плагины или другие AI-зависимости.
- AI runtime — это не тот же самый subsystem, что CV/YOLO inference. Объединяйте их только там, где фиче нужны и визуальная детекция на базе модели, и оркестрация чата/инструментов.

## Детали API

- `AiCoreServiceCollectionExtensions.AddAiCoreServices` — регистрирует базовые AI-сервисы: repository профилей, transport events, resolver API key, no-op speech service, Codex runtime host и `AiEngine`.
- `AiDesktopServiceCollectionExtensions.AddAiDesktopServices` — добавляет desktop scripting AI, показ окна script editor, desktop speech-to-text и configurators чат-сессий для скриптов.
- `AiEngine.CreateSession` — создаёт обычную `AiChatSession`, применяет первый настроенный профиль, если он есть, и регистрирует сессию в engine.
- `AiEngine.CreateMcpSession` — создаёт `AiMcpSession` для хостинга инструментов без UI с историей чата.
- `AiEngine.AddCodexSession` — создаёт coding-agent session на базе Codex.
- `AiEngine.RemoveSession`, `RemoveMcpSession`, `ClearSessions` — освобождают управляемые сессии и удаляют их из реестра engine.
- `IAiChatSessionHandle` — disposable-обёртка владения, которую используют UI tabs или scoped workflows.
- `AiSessionOptions.EnableArtifactStore` — управляет тем, будет ли сессия регистрировать встроенный плагин `artifact_store`.
- `AiFunctionInvocationPolicy` — allowlist, denylist, режим одобрения по умолчанию и callback одобрения для tool calls.
- `AiToolCallFilter` — invocation filter из Semantic Kernel, который применяет approval, публикует telemetry по инструментам и ограничивает длительность tool-call.
- `IAiTransportEvents` — наблюдает transport data запросов и ответов.
- `IAiSpeechToTextService` — UI-ориентированная абстракция speech-to-text; core runtime регистрирует no-op реализацию, desktop runtime — реальный сервис.
- `IAiCodingAgentManager` / `AiCodexManager` — жизненный цикл Codex и операции с сохранёнными тредами.
- `ICodexChatController` — переиспользуемый, UI-agnostic контроллер поверхности Codex. `PrepareActiveSessionForRequestAsync` запускает host pre-send callback и обновляет активные `CodexSessionOptions` перед следующим ходом.
- `CodexChatOptions` — record с host-делегатами конфигурации для запуска Codex controller, создания сессий, плагинов, подготовки запроса и выбора workspace.
- `CodexThreadListItem.FromSummary` — переиспользуемый mapper из сырых сводок Codex в состояние отображения браузера тредов.
- `CodexWorkspaceAttachment.CreateValidated` — валидирует и нормализует выбранные файлы/папки workspace.
- `IEyeAurasAiGuidanceService.RefreshAsync` — создаёт или обновляет managed guidance pack из настроенного docs-репозитория, необязательного статуса MCP и времени генерации.
- `IEyeAurasAiGuidanceService.ExportPackFolderAsync`, `ExportPackArchiveAsync`, `CopyPackToCsharpProjectAsync` и `CopyPackToSolutionProjectAsync` — экспортируют или копируют pack. Перегрузки без `EyeAurasAiGuidanceContext` предполагают, что вызывающей стороне нужна самая свежая документация, и перед экспортом или копированием пересобирают pack.

## Создать сессию для функции приложения и закрыть её

Ниже — операция для обычного C#-класса приложения/плагина. Хост передаёт
зарегистрированный `AiEngine` параметром. В композиции `IServiceCollection`
метод `AddAiCoreServices()` регистрирует engine, профили, resolver ключей,
transport events и no-op speech service. Хост также должен предоставить
`IConfigProvider<AiProfileRepositoryConfig>` из своей конфигурационной системы:
одного вызова регистрации AI недостаточно для пустого контейнера.
`AddAiDesktopServices()` добавляет desktop-сервисы, а compatibility-метод
`EyeAuras.AISdk.AI.AddAiServices()` объединяет core и desktop.

Этот пример не отправляет запрос провайдеру. Он создаёт сессию, подключает
встроенный инструмент и возвращает его локальный результат:

```csharp
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.AI;
using EyeAuras.AI.PluginHost;
using Microsoft.SemanticKernel;

public static class SessionExample
{
    public static async Task<AiToolInvocationResult> RunAsync(
        AiEngine engine, CancellationToken cancellationToken)
    {
        var session = engine.CreateSession(
            options: new AiSessionOptions { EnableArtifactStore = false });
        try
        {
            session.AddOrUpdatePlugin("hello", new AiHelloWorldPlugin());
            return await session.PluginHost.InvokeToolAsync(
                "hello", "echo_with_time",
                new KernelArguments { ["request"] = "Привет" },
                cancellationToken: cancellationToken);
        }
        finally
        {
            engine.RemoveSession(session.SessionId);
        }
    }
}
```

Результат содержит `AiHelloWorldResponse`: исходную строку, сообщение и
локальное/UTC-время хоста. `RemoveSession` удаляет запись из engine и освобождает
сессию; один `Dispose` без удаления не описывает очистку реестра.
Не вызывайте `ClearSessions()` при закрытии отдельной вкладки: он затрагивает
и чужие сессии этого engine.

`CreateSession` выбирает первый настроенный профиль, если он есть, иначе
`ActiveProfile` остаётся `null`. Перед настоящим диалогом хост загружает профили
через `IAiProfileRepository.Load()`, выбирает профиль, настраивает resolver ключа,
инструменты и UI/event sink. Пример выше не проверяет эти интеграции и не доказывает
совместимость провайдера. Прямой вызов `PluginHost` также не проходит session
approval policy — границы описаны в [инструментах AI](ai-kernel-plugins).

Верхнеуровневый скрипт не получает `engine` автоматически. Сначала нужна
явная композиция проекта и передача зависимостей. Razor-компоненту их передают
через DI или модель. Эта карта относится к EyeAuras `20fd3d4`, а не обещает
одинаковую поверхность во всех версиях NuGet.

## Профили

- `IAiProfileRepository.Load` / `Save` сохраняют и загружают состояние профилей моделей.
- `GetAllTemplates`, `GetBuiltInTemplates`, `GetCustomTemplates` описывают доступные шаблоны профилей.
- `GetConfiguredProfiles`, `FindConfiguredProfile`, `AddOrUpdateConfiguredProfile`, `RemoveConfiguredProfile` управляют конкретными профилями, которые могут использоваться сессиями.
- Поля `AiModelProfile` включают `DisplayName`, `Provider`, `ModelId`, `Endpoint`, `ApiKeyRef`, `SupportsFunctionCalling`, `OrganizationId`, `ApiType`, `ReasoningEffort` и `MaxContextTokens`.
- Поддерживаемые provider anchors включают `AiProvider.OpenAi`, `AiProvider.AzureOpenAi`, `AiProvider.Ollama` и потоки с OpenAI-compatible endpoint.
- `AiApiType.ChatCompletions` использует wiring Semantic Kernel для chat completions.
- `AiApiType.Responses` обрабатывается через путь адаптера Responses.

## Retrieval и документация

- `AiDocsKnowledgeBasePlugin` публикует `doc_search`, `doc_get_chunk_preview`, `doc_get_chunk_full`, `doc_list_documents`, `doc_list_pinned_documents`, `doc_get_index_status` и `doc_reindex`.
- `IBm25KnowledgeBase.AddOrUpdateDocument` регистрирует один markdown-документ.
- `IBm25KnowledgeBase.AddOrUpdateDirectory` — extension-поток для добавления директории markdown-документов, если он доступен.
- `Bm25Document` оборачивает `IFileInfo`, timestamp, необязательный hash, description, kind, tags, source name и pinned flag.
- Pinned docs рассматриваются `AiDocsKnowledgeBasePlugin` как постоянные guidance-материалы.
- `IAiRetrievalService` может внедрять локальный контекст в запросы к модели до отправки хода.
- `AiKernelPlugin.GetRetrievalServices` позволяет плагину добавлять retrieval в сессию.

## UI

- `AiChatViewModel` привязывает `IAiChatSession` к состоянию чат-UI и реализует `IAiEventSink`.
- `AiChatViewModel.SendAsync`, `CancelAsync`, `ClearAsync`, `RetryRequestAsync` — основные обработчики команд.
- `AiChatViewModel.Session.SetEventSink(this)` связывает события runtime с UI.
- `AiChatComponent` отображает элементы таймлайна, фазы запроса, tool calls, telemetry, reasoning, artifacts и компонент ввода.
- `AiChatComponent.BeforeSend` может выполнять логику приложения перед отправкой.
- `AiChatComponent.InputFooterContent` позволяет добавлять элементы управления, специфичные для хоста.
- `AiChatInputComponent` отвечает за текстовый ввод и speech-related UI.
- `CodexChatComponent` — Blazor-оболочка для Codex, которая собирает вместе состояние загрузки, `CodexThreadBrowser`, необязательный `CodexWorkspacePanel` и существующий универсальный `AiChatComponent`.
- `CodexThreadBrowser` отображает фильтрацию активных/архивных тредов, переключение compact/all, busy/status badges и двухшаговое подтверждение архивации из `ICodexChatController`.
- `CodexWorkspacePanel` отображает выбранные file/folder attachments и делегирует действия add/remove обратно в `ICodexChatController`.
- Держите Codex-specific lifecycle в `ICodexChatController`; `AiChatComponent` должен оставаться provider-agnostic.

## Типовые сценарии

### Обычная чат-сессия

1. Загрузите профили через `IAiProfileRepository.Load`.
2. Создайте сессию через `AiEngine.CreateSession`.
3. При необходимости задайте или замените `ActiveProfile` через `IAiChatSession.SetProfile`.
4. Зарегистрируйте плагины через `session.AddOrUpdatePlugin`.
5. Создайте `AiChatViewModel(session, speechToTextService)`.
6. Отрисуйте `AiChatComponent`, передав view model как data context.
7. Освободите view model и session handle вместе.

### Ассистент в редакторе скриптов

1. Получите активный `IAuraScriptRunner` из контекста редактора/вкладки.
2. Создайте сессию через `IScriptAiChatSessionFactory.CreateSession`.
3. Дайте экземплярам `IScriptAiChatSessionConfigurator` подключить инструменты workspace.
4. Соберите docs plugin, добавьте файлы документации и вызовите `ReindexAsync`.
5. Зарегистрируйте docs через `session.AddOrUpdatePlugin`.
6. Создайте `AiChatViewModel`.
7. Храните `AiChatViewModel` и `IAiChatSessionHandle` в одном disposable lifetime.

### MCP-хост для инструментов

1. Создайте `AiMcpSession` через `AiEngine.CreateMcpSession`.
2. Зарегистрируйте те же `AiKernelPlugin`, которые использовались бы в чат-сессии.
3. Создайте `AiMcpServerHost` с listener options.
4. Запустите хост и передайте внешним MCP-клиентам URL endpoint.
5. Остановите и освободите host/session при отключении функции.

### Переиспользуемая поверхность Codex-чата

1. Создайте `CodexChatController`, передав `AiEngine`, `IAiCodingAgentManager` и host-specific `CodexChatOptions`.
2. Реализуйте делегаты options для валидации profile/auth, `CodexSessionOptions`, необязательного `IAiSessionContext`, регистрации плагинов, pre-send refresh и необязательного выбора файлов/папок.
3. Запустите controller и отображайте состояние thread/workspace через любую UI-технологию. Хосты на Blazor могут использовать `CodexChatComponent`.
4. Если используется Blazor-чат, адаптируйте `ICodexChatController.ActiveSession` в `AiChatViewModel`, заполните `CodexActiveThread.TranscriptItems` и передайте view model в `CodexChatComponent`.
5. Вызывайте `ICodexChatController.PrepareActiveSessionForRequestAsync` из `AiChatComponent.BeforeSend`; host-делегат `CreateSessionOptions` должен включать текущий файл или корень workspace, который Codex понадобится в следующей sandbox policy.
6. Освобождайте chat adapters, привязанные к view, когда срабатывает `SessionRemoving`, затем освобождайте controller.

### Guidance Pack для внешнего агента

1. Получите `IEyeAurasAiGuidanceService` из dependency container приложения/плагина.
2. Для проверки статуса в UI вызовите `ResolveExistingContextAsync` и посмотрите пути из возвращённого `EyeAurasAiGuidanceContext`.
3. Чтобы явно пересобрать managed pack, вызовите `RefreshAsync`; передайте `EyeAurasAiGuidanceRefreshOptions.Mcp`, если в pack нужно встроить live MCP status.
4. Чтобы передать pack внешнему агенту без ручного управления контекстом, используйте перегрузку export/copy без контекста. Эти методы сначала обновляют docs-репозиторий и пересобирают pack.
5. Используйте перегрузки с явным контекстом, если pack уже был обновлён и вы хотите избежать второго обновления docs.

## Подсказки по assembly и package

- Базовый namespace: `EyeAuras.AI`.
- Namespace плагинов: `EyeAuras.AI.SemanticKernel`.
- Namespace retrieval: `EyeAuras.AI.BM25`.
- UI namespace: `EyeAuras.AI.UI`.
- Namespace runtime/controller для Codex: `EyeAuras.AI.CodingAgents.Codex`.
- Namespace Blazor-оболочки Codex: `EyeAuras.AI.UI.Codex`.
- Namespace desktop scripting: `EyeAuras.AI.Desktop.Scripting`.
- MCP namespace: `EyeAuras.AI.Mcp`.
- Namespace Responses: `EyeAuras.AI.ResponsesAPI`.
- Namespace контракта guidance-pack: `EyeAuras.UI.AI.Services` в `EyeAuras.UI.Metadata`.
- AI runtime зависит от пакетов Semantic Kernel и Model Context Protocol в коде приложения/модуля. Не предполагается, что эти assembly подключены в каждом script project.

## Что предпочитать

- Предпочитайте композицию через factory/configurator для feature-specific сессий.
- Предпочитайте `IAiChatSessionHandle`, чтобы владение было явным.
- Предпочитайте `AiDocsKnowledgeBasePlugin` для локальной markdown-документации вместо ручного stuffing промпта.
- Предпочитайте `AiChatViewModel` + `AiChatComponent` для переиспользуемого Blazor chat UI.
- Предпочитайте `ICodexChatController` + `CodexChatOptions` для переиспользуемых поверхностей Codex lifecycle/thread/workspace.
- Предпочитайте `CodexThreadListItem` и `CodexWorkspaceAttachment` вместо дублирования app-specific DTO для тредов и workspace.
- Предпочитайте `IEyeAurasAiGuidanceService` для сценариев export/copy guidance-pack вместо ручного копирования docs или правки пользовательского [AGENTS.md](/ru/scripting/api/AGENTS) в проекте.
- Предпочитайте `AiFunctionInvocationPolicy` для рискованных инструментов.
- Предпочитайте события `IAiEventSink` для UI/telemetry вместо парсинга логов.

## Чего избегать

- Не создавайте сессии без загрузки профилей, если хост ожидает сохранённую конфигурацию профилей.
- Не регистрируйте инструменты плагинов с дублирующимися явными именами.
- Не считайте, что `SupportsFunctionCalling` равен true для каждого профиля.
- Не делайте долгие методы инструментов без поддержки `CancellationToken`.
- Не помещайте machine-local пути к документации в общую документацию или prompts.
- Не смешивайте lifetime AI chat session с lifetime несвязанных UI-компонентов.
- Не добавляйте Codex-specific lifecycle или поведение браузера тредов в `AiChatComponent`.
- Не делайте логику Codex controller зависимой от типов Blazor, таких как `RenderFragment`, Razor-компоненты или UI view models.
- Не используйте перегрузки guidance-pack с явным контекстом, если вызывающая сторона ещё не обновила и не проверила pack.

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
- `ICodexChatController`
- `CodexChatController`
- `CodexChatOptions`
- `CodexThreadListItem`
- `CodexWorkspaceAttachment`
- `CodexChatComponent`
- `CodexThreadBrowser`
- `CodexWorkspacePanel`
- `IAiSpeechToTextService`
- `IScriptAiChatSessionFactory`
- `IScriptAiChatSessionConfigurator`
- `IEyeAurasAiGuidanceService`
- `EyeAurasAiGuidanceContext`
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
- Codex chat
- Codex thread browser
- Codex workspace attachment
- agent guidance
- guidance pack
- external coding agent

## Связанные карты

- [ml/ai.md](/ru/scripting/api/ml/ai)
- [ml/ai-kernel-plugins.md](/ru/scripting/api/ml/ai-kernel-plugins)
- [scripting/runtime.md](/ru/scripting/api/scripting/runtime)
- [windows-subsystems/blazor-windows.md](/ru/scripting/api/windows-subsystems/blazor-windows)
- [recipes/script-ai-editor-assistant.md](/ru/scripting/api/recipes/script-ai-editor-assistant)
См. [поиск документации и версию снимка](/ru/scripting/api/ml/documentation-retrieval): чтение контракта, метаданные, ссылки и обновление базы.

## Границы жизненного цикла

В срезе `c8b2304` `CodexChatController.StartAsync` перехватывает ошибку запуска и выставляет `StartSessionError`; завершение Task само по себе не означает готовность. Проверьте `IsStarted` и состояние ошибки. `StopAsync` очищает свои workspaces и останавливает manager; освобождение controller очищает workspaces, но не заменяет явную остановку manager. `SessionRemoving` вызывается до удаления сессии из engine: здесь освобождают UI-адаптеры. Перед запросом `PrepareActiveSessionForRequestAsync` готовит вложения, вызывает host callback и обновляет options; у выбранного файла writable root — родительский каталог, а не один файл.

MCP фиксирует каталог инструментов и инструкции при старте. Для изменения набора остановите host, измените регистрации и запустите заново. `StopAsync` останавливает и освобождает web app; `Dispose` вызывает этот маршрут синхронно. Сам host не владеет реестром сессий engine. MCP-инструкции не заменяют проверку разрешений инструмента.

`RefreshAsync()` guidance по умолчанию пересобирает pack без принудительного обновления Git. Задайте `RefreshDocsRepository=true`, чтобы запросить обновление; export/copy без явного контекста делают это сами. Перегрузки с контекстом используют выбранный снимок. `ResolveExistingContextAsync` разрешает пути существующего состояния, но не доказывает актуальность контента на сервере.

Core speech service сообщает `IsAvailable=false` и возвращает неуспешный результат. Desktop-адаптер сообщает `true` по факту наличия реализации, создаёт временную speech-сессию на вызов, задаёт профиль, ожидает распознавание и освобождает сессию. Это не проверка микрофона, ключа или доступности провайдера. Владение чат-компонентом, view model и session handle разобрано в [рецепте UI](/ru/scripting/api/recipes/script-ai-editor-assistant).

Предварительное retrieval зависит от backend: Responses его намеренно пропускает. См. [композицию и политику инструментов](ai-kernel-plugins) и [обновление базы документации](documentation-retrieval).

[Source contracts](https://github.com/iXab3r/EyeAuras/tree/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.AI)
