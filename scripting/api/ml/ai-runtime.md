---
title: AI Runtime APIs
description: AI-first map of chat sessions, model profiles, retrieval, MCP, and Blazor chat UI.
published: true
date: 2026-04-25T00:00:00.000Z
tags: scripting, api, ai, ml, semantic-kernel, mcp, ai-translated
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
- Host a reusable Codex thread/workspace/chat surface without making Codex
  lifecycle depend on Blazor.
- Add speech-to-text to chat input.
- Host tools through MCP for external clients.
- Build a coding-agent or Responses API based integration.
- Build, export, or copy the EyeAuras guidance pack for external coding
  agents.

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
- `AiCodexManager` owns Codex runtime operations such as model listing, thread
  listing, thread reading/creation, archive, and live session resolution.
- `AiCodexSession` is the Codex-backed `AiCodingAgentSession` implementation
  that still fits the normal `AiChatSession`/plugin/event-sink model.
- `ICodexChatController` / `CodexChatController` are UI-agnostic Codex shell
  controllers. They own start/stop, thread browser state, active thread
  lifecycle, model/reasoning selection, archive confirmation, and workspace
  attachments.
- `CodexChatOptions` is the host adapter point for profile validation,
  `CodexSessionOptions`, session context, plugin registration, pre-send
  refresh, file/folder picking, and feature defaults. The session-options
  delegate is called again before active turns so hosts can refresh
  request-boundary readable/writable roots.
- `CodexThreadListItem` maps raw `AiCodexThreadSummary` values into
  presentation-independent thread picker rows.
- `CodexWorkspaceAttachment` maps selected files/directories into Codex
  workspace access rules. Directory attachments use the selected directory as
  writable root; file attachments keep the exact selected file path while using
  the parent directory as writable root.
- `IEyeAurasAiGuidanceService` builds and exports the portable EyeAuras
  `guidance-pack` for external coding agents. Its public contract lives in
  `EyeAuras.UI.Metadata`; the desktop implementation lives in `EyeAuras.UI`.
- `EyeAurasAiGuidanceContext` describes the resolved docs repository snapshot
  and generated pack paths. Explicit-context methods reuse that snapshot, while
  no-context export/copy methods refresh the docs repository and rebuild the
  pack first.

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
- `IAiCodingAgentManager` / `AiCodexManager` - Codex lifecycle and persisted
  thread operations.
- `ICodexChatController` - reusable, UI-agnostic Codex surface controller.
  `PrepareActiveSessionForRequestAsync` runs the host pre-send callback and
  refreshes active `CodexSessionOptions` before the next turn.
- `CodexChatOptions` - host configuration delegate record for Codex controller
  startup, session creation, plugins, request preparation, and workspace picking.
- `CodexThreadListItem.FromSummary` - reusable mapper from raw Codex summaries
  to thread-browser display state.
- `CodexWorkspaceAttachment.CreateValidated` - validates and normalizes selected
  workspace files/folders.
- `IEyeAurasAiGuidanceService.RefreshAsync` - creates or refreshes the managed
  guidance pack from the configured docs repository, optional MCP status, and
  generation timestamp.
- `IEyeAurasAiGuidanceService.ExportPackFolderAsync`,
  `ExportPackArchiveAsync`, `CopyPackToCsharpProjectAsync`, and
  `CopyPackToSolutionProjectAsync` - export or copy the pack. Overloads without
  `EyeAurasAiGuidanceContext` assume the caller wants the latest docs and
  rebuild the pack before exporting or copying.

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

## Create and close an app-owned session

An ordinary app/plugin helper receives its registered `AiEngine` explicitly. `AddAiCoreServices()` registers the engine, profiles, key resolver, transport events and no-op speech service in `IServiceCollection`. The host must also supply `IConfigProvider<AiProfileRepositoryConfig>` through its configuration infrastructure; AI registration alone does not make an empty container sufficient. `AddAiDesktopServices()` adds desktop services; the compatibility `EyeAuras.AISdk.AI.AddAiServices()` combines them.

This operation creates a session and invokes a local built-in tool without sending a provider request:

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
                new KernelArguments { ["request"] = "Hello" },
                cancellationToken: cancellationToken);
        }
        finally
        {
            engine.RemoveSession(session.SessionId);
        }
    }
}
```

The value contains `AiHelloWorldResponse`: echoed text, a message and local/UTC host time. `RemoveSession` removes the registry entry and disposes the session. Do not call `ClearSessions()` for one tab because it affects other sessions owned by that engine.

`CreateSession` selects the first configured profile or leaves `ActiveProfile` null. Before a real conversation, load profiles with `IAiProfileRepository.Load()`, select a profile, configure key resolution, tools and the UI/event sink. This local example does not validate those integrations. Direct plugin invocation does not enforce session approval policy; see [tool policy boundaries](ai-kernel-plugins).

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
- `CodexChatComponent` is a Codex-specific Blazor shell that composes loading
  state, `CodexThreadBrowser`, optional `CodexWorkspacePanel`, and the existing
  generic `AiChatComponent`.
- `CodexThreadBrowser` renders active/archived thread filtering, compact/all
  toggling, busy/status badges, and two-step archive confirmation from
  `ICodexChatController`.
- `CodexWorkspacePanel` renders selected file/folder attachments and delegates
  add/remove actions back to `ICodexChatController`.
- Keep Codex-specific lifecycle in `ICodexChatController`; keep
  `AiChatComponent` provider-agnostic.

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

### Reusable Codex Chat Surface

1. Create a `CodexChatController` with `AiEngine`, `IAiCodingAgentManager`, and
   host-specific `CodexChatOptions`.
2. Implement options delegates for profile/auth validation,
   `CodexSessionOptions`, optional `IAiSessionContext`, plugin registration,
   pre-send refresh, and optional file/folder picking.
3. Start the controller and render thread/workspace state through any view
   technology. Blazor hosts can use `CodexChatComponent`.
4. If using Blazor chat, adapt `ICodexChatController.ActiveSession` into
   `AiChatViewModel`, seed `CodexActiveThread.TranscriptItems`, and pass the
   view model to `CodexChatComponent`.
5. Call `ICodexChatController.PrepareActiveSessionForRequestAsync` from
   `AiChatComponent.BeforeSend`; the host `CreateSessionOptions` delegate should
   include any current file or workspace root that Codex needs in the next
   sandbox policy.
6. Dispose view-specific chat adapters when `SessionRemoving` fires, then
   dispose the controller.

Codex transcript rendering follows the app-server `ThreadItem` model. Live
`agentMessage` items render as `AiChatItem` assistant rows keyed by provider
item id and phase; the generic request response bubble is only used by
non-Codex chat backends that do not emit assistant transcript items directly.
Use `AiChatItem.ProviderItemId`, `ProviderPhase`, and `CompletedTimestamp` for
diagnostics or replay alignment, not for business logic.

### External Agent Guidance Pack

1. Resolve `IEyeAurasAiGuidanceService` from the app/plugin dependency
   container.
2. For UI status checks, call `ResolveExistingContextAsync` and inspect the
   returned `EyeAurasAiGuidanceContext` paths.
3. To rebuild the managed pack explicitly, call `RefreshAsync`; pass
   `EyeAurasAiGuidanceRefreshOptions.Mcp` when live MCP status should be
   embedded.
4. To hand the pack to an external agent without managing context yourself,
   call the no-context export/copy overload. Those methods refresh the docs
   repository and rebuild the pack first.
5. Use the explicit-context overloads when a caller already refreshed the pack
   and wants to avoid a second docs update.

## Assembly / Package Hints

- Core namespace: `EyeAuras.AI`.
- Plugin namespace: `EyeAuras.AI.SemanticKernel`.
- Retrieval namespace: `EyeAuras.AI.BM25`.
- UI namespace: `EyeAuras.AI.UI`.
- Codex runtime/controller namespace: `EyeAuras.AI.CodingAgents.Codex`.
- Codex Blazor shell namespace: `EyeAuras.AI.UI.Codex`.
- Desktop scripting namespace: `EyeAuras.AI.Desktop.Scripting`.
- MCP namespace: `EyeAuras.AI.Mcp`.
- Responses namespace: `EyeAuras.AI.ResponsesAPI`.
- Guidance-pack contract namespace: `EyeAuras.UI.AI.Services` in
  `EyeAuras.UI.Metadata`.
- AI runtime depends on Semantic Kernel and Model Context Protocol packages in
  app/module code. Do not assume these assemblies are referenced by every
  script project.

## Prefer

- Prefer factory/configurator composition for feature-specific sessions.
- Prefer `IAiChatSessionHandle` to make ownership explicit.
- Prefer `AiDocsKnowledgeBasePlugin` for local markdown docs instead of
  hand-built prompt stuffing.
- Prefer `AiChatViewModel` + `AiChatComponent` for reusable Blazor chat UI.
- Prefer `ICodexChatController` + `CodexChatOptions` for reusable Codex
  lifecycle/thread/workspace surfaces.
- Prefer `CodexThreadListItem` and `CodexWorkspaceAttachment` over duplicating
  app-specific thread/workspace DTOs.
- Prefer `IEyeAurasAiGuidanceService` for guidance-pack export/copy workflows
  instead of manually copying docs or editing a user's project [AGENTS.md](/en/scripting/api/AGENTS).
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
- Avoid adding Codex-specific lifecycle or thread browser behavior to
  `AiChatComponent`.
- Avoid making Codex controller logic depend on Blazor types such as
  `RenderFragment`, Razor components, or UI view models.
- Avoid using explicit-context guidance-pack overloads when the caller has not
  already refreshed or validated the pack.

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
- Codex chat
- Codex thread browser
- Codex workspace attachment
- agent guidance
- guidance pack
- external coding agent

## Related Maps

- [ml/ai.md](/en/scripting/api/ml/ai)
- [ml/ai-kernel-plugins.md](/en/scripting/api/ml/ai-kernel-plugins)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [windows-subsystems/blazor-windows.md](/en/scripting/api/windows-subsystems/blazor-windows)
- [recipes/script-ai-editor-assistant.md](/en/scripting/api/recipes/script-ai-editor-assistant)

See [documentation search and snapshot identity](/en/scripting/api/ml/documentation-retrieval) for reading contracts, metadata, citations and refresh behavior.

## Lifecycle boundaries

At `c8b2304`, `CodexChatController.StartAsync` catches startup failures and sets `StartSessionError`; task completion alone does not establish readiness. Check `IsStarted` and the error state. `StopAsync` clears owned workspaces and stops the manager. Controller disposal clears workspaces but does not replace explicit manager shutdown. `SessionRemoving` fires before engine removal so the host can dispose UI adapters. Before a turn, `PrepareActiveSessionForRequestAsync` prepares attachments, invokes the host callback and refreshes options. A selected file's writable root is its parent directory, not just that file.

MCP captures its tool catalog and instructions at startup. To change that set, stop the host, change registrations and start it again. `StopAsync` stops and disposes its web app; `Dispose` invokes this route synchronously. The host does not own the engine's session registry. MCP instructions are not tool permission enforcement.

Guidance `RefreshAsync()` rebuilds the pack without forcing a Git refresh by default. Set `RefreshDocsRepository=true` to request an update; no-context export/copy overloads do this themselves. Explicit-context overloads reuse the selected snapshot. `ResolveExistingContextAsync` resolves existing state paths and does not establish server freshness.

The core speech service reports `IsAvailable=false` and returns an unsuccessful result. The desktop adapter reports true because an implementation exists, creates a speech session per call, sets its profile, awaits recognition and disposes the session. That does not validate a microphone, key or provider availability. See the [UI recipe](/en/scripting/api/recipes/script-ai-editor-assistant) for separate component, view-model and session-handle ownership.

Pre-retrieval depends on the backend: Responses intentionally skips it. See [retrieval composition and tool policy](ai-kernel-plugins) and [documentation freshness](documentation-retrieval).

[Source contracts](https://github.com/iXab3r/EyeAuras/tree/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.AI)
