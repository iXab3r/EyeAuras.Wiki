---
title: AI Runtime APIs
description: AI-first map of chat sessions, model profiles, retrieval, MCP, and Blazor chat UI.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ml, semantic-kernel, mcp
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AI Runtime Discovery Map

AI runtime APIs create model-backed chat sessions, attach tools, add local
retrieval, expose sessions through UI, and optionally publish the same tool
surface through MCP.

## User Intents

- Create an AI chat session for an app feature or script editor.
- Select or inspect the active model profile.
- Add docs search to a chat session.
- Register AI-callable tools.
- Render a reusable Blazor chat component.
- Add speech-to-text to chat input.
- Host tools through MCP for external clients.
- Build a coding-agent or Responses API based integration.

## Concept Model

- `AiEngine` is the session factory and registry.
- `IAiProfileRepository` stores templates and configured `AiModelProfile`
  entries.
- `AiChatSession` owns chat history, active profile, plugins, retrieval,
  artifact store, function-invocation policy, and `AiConversationEngine`.
- `AiConversationEngine` sends turns, streams updates, applies retrieval,
  tracks token usage, emits telemetry, and routes tool-call events to a sink.
- `AiKernelPlugin` objects expose tools and session instructions. Register them
  through `IAiSession.AddOrUpdatePlugin`.
- `IAiPluginHost` owns the plugin catalog, lists tools, and can invoke tools by
  plugin/tool name.
- `AiDocsKnowledgeBasePlugin` adds BM25-backed markdown documentation search and
  retrieval.
- `AiChatViewModel` implements `IAiEventSink` and turns session events into
  timeline items.
- `AiChatComponent` renders the chat transcript, tool calls, telemetry,
  artifacts, and input surface.
- `AiMcpSession` and `AiMcpServerHost` expose registered plugin tools as an MCP
  server.

## Host / Runtime Contexts

- App/plugin code usually receives `AiEngine`, `IAiProfileRepository`,
  `IAiSpeechToTextService`, factories, and configurators through dependency
  injection.
- Razor components receive AI services through normal Blazor injection and own
  session/view-model lifetime.
- Top-level scripts or script projects should not assume AI services exist as
  global symbols. Use the host surface available in that script project.
- Ordinary helper classes must receive `IAiSession`, `AiEngine`, plugins, or
  other AI dependencies explicitly.
- AI runtime is not the same subsystem as CV/YOLO inference; only combine them
  when a feature needs both model-backed visual detection and chat/tool
  orchestration.

## API Details

- `AiCoreServiceCollectionExtensions.AddAiCoreServices` - registers core AI
  services: profile repository, transport events, API-key resolver, no-op
  speech service, Codex runtime host, and `AiEngine`.
- `AiDesktopServiceCollectionExtensions.AddAiDesktopServices` - adds desktop
  scripting AI, script editor window display, desktop speech-to-text, and
  script chat session configurators.
- `AiEngine.CreateSession` - creates a generic `AiChatSession`, applies the
  first configured profile when available, and registers the session with the
  engine.
- `AiEngine.CreateMcpSession` - creates `AiMcpSession` for tool hosting without
  chat transcript UI.
- `AiEngine.AddCodexSession` - creates a Codex-backed coding-agent session.
- `AiEngine.RemoveSession`, `RemoveMcpSession`, `ClearSessions` - dispose owned
  sessions and remove them from the engine registry.
- `IAiChatSessionHandle` - disposable ownership wrapper used by UI tabs or
  scoped workflows.
- `AiSessionOptions.EnableArtifactStore` - controls whether sessions register
  the built-in `artifact_store` plugin.
- `AiFunctionInvocationPolicy` - allowlist, denylist, default approval mode, and
  approval callback for tool calls.
- `AiToolCallFilter` - Semantic Kernel invocation filter that enforces approval,
  publishes tool telemetry, and applies tool-call duration budgets.
- `IAiTransportEvents` - observes request/response transport data.
- `IAiSpeechToTextService` - UI-facing speech-to-text abstraction; core runtime
  registers a no-op implementation, desktop runtime registers the real service.

## Profiles

- `IAiProfileRepository.Load` / `Save` persist model profile state.
- `GetAllTemplates`, `GetBuiltInTemplates`, `GetCustomTemplates` describe
  available profile templates.
- `GetConfiguredProfiles`, `FindConfiguredProfile`,
  `AddOrUpdateConfiguredProfile`, `RemoveConfiguredProfile` manage concrete
  profiles usable by sessions.
- `AiModelProfile` fields include `DisplayName`, `Provider`, `ModelId`,
  `Endpoint`, `ApiKeyRef`, `SupportsFunctionCalling`, `OrganizationId`,
  `ApiType`, `ReasoningEffort`, and `MaxContextTokens`.
- Supported provider anchors include `AiProvider.OpenAi`,
  `AiProvider.AzureOpenAi`, `AiProvider.Ollama`, and OpenAI-compatible endpoint
  flows.
- `AiApiType.ChatCompletions` uses Semantic Kernel chat completions wiring.
- `AiApiType.Responses` is handled by the Responses adapter path.

## Retrieval And Docs

- `AiDocsKnowledgeBasePlugin` exposes `doc_search`,
  `doc_get_chunk_preview`, `doc_get_chunk_full`, `doc_list_documents`,
  `doc_list_pinned_documents`, `doc_get_index_status`, and `doc_reindex`.
- `IBm25KnowledgeBase.AddOrUpdateDocument` registers a single markdown document.
- `IBm25KnowledgeBase.AddOrUpdateDirectory` is an extension flow for adding a
  directory of markdown documents when available.
- `Bm25Document` wraps an `IFileInfo`, timestamp, optional hash, description,
  kind, tags, source name, and pinned flag.
- Pinned docs are treated as standing guidance by `AiDocsKnowledgeBasePlugin`.
- `IAiRetrievalService` can inject local context into model requests before the
  turn is sent.
- `AiKernelPlugin.GetRetrievalServices` lets a plugin contribute retrieval to a
  session.

## UI

- `AiChatViewModel` binds an `IAiChatSession` to chat UI state and implements
  `IAiEventSink`.
- `AiChatViewModel.SendAsync`, `CancelAsync`, `ClearAsync`,
  `RetryRequestAsync` are the main command handlers.
- `AiChatViewModel.Session.SetEventSink(this)` connects runtime events to UI.
- `AiChatComponent` renders timeline items, request phases, tool calls,
  telemetry, reasoning, artifacts, and the input component.
- `AiChatComponent.BeforeSend` can run app-specific logic before sending.
- `AiChatComponent.InputFooterContent` can add host-specific controls.
- `AiChatInputComponent` handles text input and speech-related UI.

## Common Flows

### Generic Chat Session

1. Load profiles through `IAiProfileRepository.Load`.
2. Create a session with `AiEngine.CreateSession`.
3. Optionally set or replace `ActiveProfile` using `IAiChatSession.SetProfile`.
4. Register plugins with `session.AddOrUpdatePlugin`.
5. Create `AiChatViewModel(session, speechToTextService)`.
6. Render `AiChatComponent` with the view model as data context.
7. Dispose the view model and session handle together.

### Script Editor Assistant

1. Receive the active `IAuraScriptRunner` from the editor/tab context.
2. Create a session via `IScriptAiChatSessionFactory.CreateSession`.
3. Let `IScriptAiChatSessionConfigurator` instances attach workspace tools.
4. Build a docs plugin, add documentation files, and call `ReindexAsync`.
5. Register docs with `session.AddOrUpdatePlugin`.
6. Create `AiChatViewModel`.
7. Store `AiChatViewModel` and `IAiChatSessionHandle` in one disposable
   lifetime.

### MCP Tool Host

1. Create `AiMcpSession` through `AiEngine.CreateMcpSession`.
2. Register the same `AiKernelPlugin` instances that would be used by a chat
   session.
3. Create `AiMcpServerHost` with listener options.
4. Start the host and give external MCP clients the endpoint URL.
5. Stop and dispose the host/session when the feature is disabled.

## Assembly / Package Hints

- Core namespace: `EyeAuras.AI`.
- Plugin namespace: `EyeAuras.AI.SemanticKernel`.
- Retrieval namespace: `EyeAuras.AI.BM25`.
- UI namespace: `EyeAuras.AI.UI`.
- Desktop scripting namespace: `EyeAuras.AI.Desktop.Scripting`.
- MCP namespace: `EyeAuras.AI.Mcp`.
- Responses namespace: `EyeAuras.AI.ResponsesAPI`.
- AI runtime depends on Semantic Kernel and Model Context Protocol packages in
  app/module code. Do not assume these assemblies are referenced by every
  script project.

## Prefer

- Prefer factory/configurator composition for feature-specific sessions.
- Prefer `IAiChatSessionHandle` to make ownership explicit.
- Prefer `AiDocsKnowledgeBasePlugin` for local markdown docs instead of
  hand-built prompt stuffing.
- Prefer `AiChatViewModel` + `AiChatComponent` for reusable Blazor chat UI.
- Prefer `AiFunctionInvocationPolicy` for risky tools.
- Prefer `IAiEventSink` events for UI/telemetry instead of parsing logs.

## Avoid

- Avoid creating sessions without loading profiles when the host expects
  persisted profile configuration.
- Avoid registering plugin tools with duplicate explicit names.
- Avoid assuming `SupportsFunctionCalling` is true for every profile.
- Avoid long-running tool methods without `CancellationToken` support.
- Avoid putting machine-local documentation paths in shared docs or prompts.
- Avoid mixing AI chat session lifetime into unrelated UI component lifetime.

## Research Anchors

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

## Search Synonyms

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

## Related Maps

- `ml/ai.md`
- `ml/ai-kernel-plugins.md`
- `scripting/runtime.md`
- `windows-subsystems/blazor-windows.md`
- `recipes/script-ai-editor-assistant.md`
