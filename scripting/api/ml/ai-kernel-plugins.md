---
title: AI Kernel Plugins
description: AI-first map for creating AiKernelPlugin tools, retrieval plugins, and approval-aware AI extensions.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, semantic-kernel, tools
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# AI Kernel Plugins Discovery Map

`AiKernelPlugin` is the main extension point for making host capabilities
available to AI sessions as callable tools.

## User Intents

- Create a custom AI tool plugin.
- Let a model inspect or modify host state through safe methods.
- Add session instructions for a specific tool surface.
- Add local retrieval to a session.
- Require approval before risky tool calls.
- Reuse the same plugin in chat and MCP.

## Concept Model

- A plugin is a normal .NET object derived from `AiKernelPlugin`.
- Public instance methods marked with `[KernelFunction("tool_name")]` become
  tools after the plugin is registered.
- `[Description]` on methods and parameters becomes tool metadata and schema
  guidance.
- `IAiSession.AddOrUpdatePlugin("plugin_name", plugin)` attaches the plugin to a
  chat, MCP, or coding-agent session.
- `IAiPluginHost` stores registrations and builds a flattened tool catalog.
- Tool identity has two levels:
  - plugin registration name, for example `docs`;
  - explicit function name, for example `doc_search`.
- External tool names must contain only letters, digits, `_`, and `-`.
- Tool function names must be unique across registered plugins in the same
  plugin host.
- Parameters are bound by name from `KernelArguments`; supported conversions
  include strings, numbers, enums, GUIDs, URIs, JSON elements, nullable types,
  and simple object serialization.
- `CancellationToken` parameters are injected by the runtime and are not exposed
  as model arguments.

## Host / Runtime Contexts

- App services and Razor view models usually create plugin instances through
  constructor injection or local composition.
- Script editor AI uses configurators such as `IScriptAiChatSessionConfigurator`
  to attach workspace-aware plugins to a session.
- Plain helper classes must receive the plugin, session, or host services
  explicitly. Do not assume top-level script conveniences are available.
- MCP hosting uses the same `AiKernelPlugin` methods, but instructions come from
  `GetMcpServerInstructions`.

## Minimal Plugin Shape

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

Register it:

```csharp
session.AddOrUpdatePlugin("workspace", new WorkspaceSummaryPlugin(index));
```

## API Details

- `AiKernelPlugin.InitializeKernel` - customize the session-scoped Semantic
  Kernel after plugin registration.
- `AiKernelPlugin.InitializeChatHistory` - add bootstrap system messages to
  `ChatHistory`.
- `AiKernelPlugin.GetChatHistoryBootstrapSystemMessages` - extracts distinct
  system messages from `InitializeChatHistory`.
- `AiKernelPlugin.GetMcpServerInstructions` - exports instructions when hosted
  through MCP; default is the same system messages.
- `AiKernelPlugin.GetRetrievalServices` - returns `IAiRetrievalService`
  instances that can inject context into model requests.
- `AiKernelPlugin.AiFunctionApprovalCallback` - plugin-level approval hook for
  risky tool calls.
- `AiKernelPluginRegistration` - plugin name plus instance.
- `IAiPluginHost.AddOrUpdatePlugin` - validates and stores a plugin.
- `IAiPluginHost.ListTools` - reflects `[KernelFunction]` methods into
  `AiToolDescriptor` values.
- `IAiPluginHost.InvokeToolAsync` - invokes a registered tool by plugin/tool
  name.
- `AiToolDescriptor` and `AiToolParameterDescriptor` - normalized tool catalog
  records.
- `AiFunctionInvocationPolicy` - session-level allowlist, denylist, default
  approval mode, and approval callback.
- `AiToolCallFilter` - runtime enforcement and telemetry for Semantic Kernel
  tool calls.

## Retrieval Plugins

Use retrieval when the model needs local context before deciding whether to call
tools.

- Implement or reuse `IAiRetrievalService`.
- Return it from `AiKernelPlugin.GetRetrievalServices`.
- The session combines retrieval services into `CompositeAiRetrievalService`.
- Retrieval payloads are injected into the request context by
  `AiConversationEngine`.
- `AiDocsKnowledgeBasePlugin` is the built-in example for markdown docs:
  `IBm25KnowledgeBase`, `Bm25Document`, `Bm25SearchQuery`, and `Bm25SearchHit`.

## Tool Approval

- Use `AiFunctionInvocationPolicy` when a session contains tools that can mutate
  state, touch files, send input, call external services, or execute expensive
  operations.
- Match rules accept unqualified tool names or `plugin.tool` names.
- Whitelisted tools run without approval.
- Blacklisted tools require approval even when default mode allows calls.
- With `AiFunctionInvocationDefaultMode.RequireApproval`, all non-whitelisted
  tools require an approval callback.
- `AiFunctionApprovalResult.Allow` executes the tool.
- `AiFunctionApprovalResult.Deny` blocks it and can return a synthetic result.
- `AiFunctionApprovalResult.Handled` skips invocation and returns a callback
  result.

## Common Flows

### Add A Simple Tool

1. Create a class derived from `AiKernelPlugin`.
2. Add public methods with `[KernelFunction("stable_tool_name")]`.
3. Add `[Description]` to the method and each user-facing parameter.
4. Add `CancellationToken` to long-running tools.
5. Register with `session.AddOrUpdatePlugin`.
6. Verify with `session.PluginHost.ListTools`.

### Add A Tool With Instructions

1. Override `InitializeChatHistory`.
2. Add concise system guidance that tells the model when and how to use tools.
3. Keep instructions host-neutral where possible.
4. Register the plugin before the first user turn.
5. If the same plugin is hosted through MCP, override
   `GetMcpServerInstructions` only when MCP needs different guidance.

### Add Docs Search

1. Create `AiDocsKnowledgeBasePlugin`.
2. Add markdown documents with `AddOrUpdateDocument` or directory helpers.
3. Mark standing guidance as pinned with `Bm25Document.IsPinned`.
4. Call `ReindexAsync` before exposing the chat UI.
5. Register the plugin with a stable name such as `docs`.

## Prefer

- Prefer stable snake_case tool names.
- Prefer small purpose-built plugins over one giant mixed plugin.
- Prefer structured return records over plain text for machine-readable results.
- Prefer explicit dependencies in plugin constructors.
- Prefer `CancellationToken` on tools that read files, scan data, call services,
  or wait on external state.
- Prefer approval policies for mutating or high-impact tools.
- Prefer pinned docs for standing behavior rules.

## Avoid

- Avoid duplicate tool names across registered plugins.
- Avoid relying on C# method names as public tool names; use explicit
  `[KernelFunction("...")]`.
- Avoid returning huge strings when a paged/list/read workflow would be safer.
- Avoid writing prompts that tell the model to use unavailable services.
- Avoid tool methods that silently mutate state without clear naming and
  descriptions.
- Avoid blocking forever inside tools; respect cancellation.

## Research Anchors

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

## Search Synonyms

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

## Related Maps

- `ml/ai-runtime.md`
- `ml/ai.md`
- `scripting/runtime.md`
- `reverse-engineering/reprocess.md`
- `recipes/script-ai-editor-assistant.md`
