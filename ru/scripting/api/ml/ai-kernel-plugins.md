---
title: Плагины AI Kernel
description: Навигация по созданию инструментов AiKernelPlugin, retrieval-плагинов и AI-расширений с учетом подтверждений.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, semantic-kernel, tools, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта по `AiKernelPlugin` и discovery плагинов AI Kernel

`AiKernelPlugin` — это основная точка расширения, через которую возможности хоста становятся доступными для AI-сессий в виде вызываемых инструментов.

## Для чего это используют

- Создать свой AI tool plugin.
- Дать модели безопасный доступ к просмотру или изменению состояния хоста.
- Добавить инструкции для сессии под конкретный набор инструментов.
- Подключить локальный retrieval к сессии.
- Требовать подтверждение перед рискованными вызовами инструментов.
- Переиспользовать один и тот же plugin и в чате, и в MCP.

## Как это устроено

- Плагин — это обычный .NET-объект, унаследованный от `AiKernelPlugin`.
- Публичные instance-методы с атрибутом `[KernelFunction("tool_name")]` после регистрации плагина становятся инструментами.
- `[Description]` у методов и параметров превращается в метаданные инструмента и подсказки для схемы.
- `IAiSession.AddOrUpdatePlugin("plugin_name", plugin)` подключает плагин к сессии чата, MCP или coding-agent.
- `IAiPluginHost` хранит регистрации и собирает плоский каталог инструментов.
- У инструмента есть два уровня идентичности:
  - имя регистрации плагина, например `docs`;
  - явное имя функции, например `doc_search`.
- Внешние имена инструментов могут содержать только буквы, цифры, `_` и `-`.
- Имена функций инструментов должны быть уникальны среди всех зарегистрированных плагинов внутри одного plugin host.
- Параметры привязываются по имени из `KernelArguments`; поддерживаются строки, числа, enum, GUID, URI, JSON elements, nullable-типы и простая сериализация объектов.
- Параметры `CancellationToken` подставляются рантаймом автоматически и не показываются модели как аргументы.

## Контексты хоста и рантайма

- Сервисы приложения и Razor view model обычно создают экземпляры плагинов через constructor injection или локальную композицию.
- AI в редакторе скриптов использует configurator-ы вроде `IScriptAiChatSessionConfigurator`, чтобы подключать к сессии плагины с доступом к workspace.
- Обычные helper-классы должны явно получать plugin, session или сервисы host-а. Не рассчитывайте на top-level удобства, доступные в скриптах.
- В MCP-hosting используются те же методы `AiKernelPlugin`, но инструкции берутся из `GetMcpServerInstructions`.

## Минимальная форма плагина

```csharp
using System.ComponentModel;
using EyeAuras.AI.SemanticKernel;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

public sealed class WorkspaceSummaryPlugin : AiKernelPlugin
{
    private readonly IWorkspaceIndex workspaceIndex;

    public WorkspaceSummaryPlugin(IWorkspaceIndex workspaceIndex)
    {
        this.workspaceIndex = workspaceIndex;
    }

    public override void InitializeChatHistory(in ChatHistory chatHistory)
    {
        chatHistory.AddSystemMessage(
            "Use workspace_summary_get before making claims about workspace state.");
    }

    [KernelFunction("workspace_summary_get")]
    [Description("Return a concise summary of the current workspace state.")]
    public WorkspaceSummary GetSummary(
        [Description("Maximum number of items to include.")] int maxItems = 20,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return workspaceIndex.GetSummary(maxItems);
    }
}
```

Регистрация:

```csharp
session.AddOrUpdatePlugin("workspace", new WorkspaceSummaryPlugin(index));
```

## Детали API

- `AiKernelPlugin.InitializeKernel` — настройка session-scoped Semantic Kernel после регистрации плагина.
- `AiKernelPlugin.InitializeChatHistory` — добавляет стартовые system message в `ChatHistory`.
- `AiKernelPlugin.GetChatHistoryBootstrapSystemMessages` — извлекает уникальные system message из `InitializeChatHistory`.
- `AiKernelPlugin.GetMcpServerInstructions` — экспортирует инструкции при работе через MCP; по умолчанию использует те же system message.
- `AiKernelPlugin.GetRetrievalServices` — возвращает экземпляры `IAiRetrievalService`, которые могут добавлять контекст в запросы модели.
- `AiKernelPlugin.AiFunctionApprovalCallback` — plugin-level hook для подтверждения рискованных вызовов инструментов.
- `AiKernelPluginRegistration` — имя плагина плюс его экземпляр.
- `IAiPluginHost.AddOrUpdatePlugin` — валидирует и сохраняет плагин.
- `IAiPluginHost.ListTools` — отражает методы с `[KernelFunction]` в значения `AiToolDescriptor`.
- `IAiPluginHost.InvokeToolAsync` — вызывает зарегистрированный инструмент по имени plugin/tool.
- `AiToolDescriptor` и `AiToolParameterDescriptor` — нормализованные записи каталога инструментов.
- `AiFunctionInvocationPolicy` — session-level allowlist, denylist, режим подтверждения по умолчанию и approval callback.
- `AiToolCallFilter` — runtime enforcement и telemetry для вызовов инструментов Semantic Kernel.

## Retrieval-плагины

Используйте retrieval, когда модели нужен локальный контекст до того, как она решит, вызывать ли инструменты.

- Реализуйте или переиспользуйте `IAiRetrievalService`.
- Верните его из `AiKernelPlugin.GetRetrievalServices`.
- Сессия объединяет retrieval-сервисы в `CompositeAiRetrievalService`.
- Retrieval payload-ы добавляются в контекст запроса через `AiConversationEngine`.
- `AiDocsKnowledgeBasePlugin` — встроенный пример для markdown-документов: `IBm25KnowledgeBase`, `Bm25Document`, `Bm25SearchQuery` и `Bm25SearchHit`.

## Подтверждение вызова инструментов

- Используйте `AiFunctionInvocationPolicy`, если в сессии есть инструменты, которые могут менять состояние, работать с файлами, отправлять input, вызывать внешние сервисы или запускать дорогие операции.
- Правила сопоставления принимают либо короткие имена инструментов, либо имена в формате `plugin.tool`.
- Инструменты из whitelist запускаются без подтверждения.
- Инструменты из blacklist требуют подтверждения, даже если режим по умолчанию разрешает вызовы.
- При `AiFunctionInvocationDefaultMode.RequireApproval` все инструменты вне whitelist требуют approval callback.
- `AiFunctionApprovalResult.Allow` выполняет инструмент.
- `AiFunctionApprovalResult.Deny` блокирует его и может вернуть synthetic result.
- `AiFunctionApprovalResult.Handled` пропускает реальный вызов и возвращает результат callback-а.

## Типовые сценарии

### Добавить простой инструмент

1. Создайте класс, унаследованный от `AiKernelPlugin`.
2. Добавьте публичные методы с `[KernelFunction("stable_tool_name")]`.
3. Добавьте `[Description]` к методу и каждому пользовательскому параметру.
4. Добавьте `CancellationToken` в инструменты, которые могут работать долго.
5. Зарегистрируйте плагин через `session.AddOrUpdatePlugin`.
6. Проверьте результат через `session.PluginHost.ListTools`.

### Добавить инструмент с инструкциями

1. Переопределите `InitializeChatHistory`.
2. Добавьте короткие system-инструкции, которые объясняют модели, когда и как использовать инструменты.
3. По возможности делайте инструкции независимыми от конкретного host-а.
4. Зарегистрируйте плагин до первого сообщения пользователя.
5. Если тот же плагин используется через MCP, переопределяйте `GetMcpServerInstructions` только если для MCP нужны отдельные инструкции.

### Добавить поиск по документации

1. Создайте `AiDocsKnowledgeBasePlugin`.
2. Добавьте markdown-документы через `AddOrUpdateDocument` или directory helper-ы.
3. Пометьте постоянные инструкции как pinned через `Bm25Document.IsPinned`.
4. Вызовите `ReindexAsync` до того, как откроете chat UI пользователю.
5. Зарегистрируйте плагин под стабильным именем, например `docs`.

## Рекомендуется

- Использовать стабильные имена инструментов в формате snake_case.
- Делать небольшие плагины под конкретную задачу вместо одного большого смешанного плагина.
- Возвращать структурированные records вместо обычного текста, если результат должен быть машиночитаемым.
- Явно передавать зависимости в конструктор плагина.
- Добавлять `CancellationToken` в инструменты, которые читают файлы, сканируют данные, вызывают сервисы или ждут внешнее состояние.
- Использовать approval policy для изменяющих или потенциально опасных инструментов.
- Использовать pinned docs для постоянных правил поведения.

## Не рекомендуется

- Дублировать имена инструментов в зарегистрированных плагинах.
- Полагаться на имена методов C# как на публичные имена инструментов; используйте явный `[KernelFunction("...")]`.
- Возвращать огромные строки там, где безопаснее paged/list/read workflow.
- Писать промпты, которые говорят модели использовать недоступные сервисы.
- Делать инструменты, которые молча меняют состояние без понятного имени и описания.
- Блокироваться навсегда внутри инструмента; учитывайте cancellation.

## Опорные сущности для изучения

- `AiKernelPlugin`
- `KernelFunctionAttribute`
- `DescriptionAttribute`
- `AiKernelPluginRegistration`
- `IAiPluginHost`
- `AiPluginHost`
- `AiToolDescriptor`
- `AiToolInvocationResult`
- `AiFunctionInvocationPolicy`
- `AiFunctionApprovalRequest`
- `AiFunctionApprovalResult`
- `AiToolCallFilter`
- `IAiRetrievalService`
- `AiDocsKnowledgeBasePlugin`
- `AiArtifactStorePlugin`
- `AiScriptingToolsPlugin`
- `AiScriptingInMemoryToolsPlugin`
- `AiScriptingOnDiskToolsPlugin`
- `ReToolsPlugin`
- `EyeAurasBlazorWindowPlugin`

## Синонимы для поиска

- AI tool
- tool calling
- function calling
- kernel function
- kernel plugin
- Semantic Kernel plugin
- plugin host
- tool schema
- tool catalog
- approval callback
- allowlist
- denylist
- retrieval plugin
- RAG plugin
- docs plugin
- MCP tools

## Связанные карты

- `ml/ai-runtime.md`
- `ml/ai.md`
- `scripting/runtime.md`
- `reverse-engineering/reprocess.md`
- `recipes/script-ai-editor-assistant.md`