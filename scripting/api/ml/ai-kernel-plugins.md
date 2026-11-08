---
title: AI Kernel Plugins
description: AI-first map for creating AiKernelPlugin tools, retrieval plugins, and approval-aware AI extensions.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, semantic-kernel, tools, ai-translated
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

## Register and invoke a local tool

This ordinary C# app/plugin example requires `EyeAuras.AI` and Semantic Kernel assemblies. It registers a tool, passes a string and returns its UTF-16 length. No model profile, key or network request is needed for this local invocation. A model-driven call additionally needs a configured session and provider; see [AI runtime](ai-runtime).

```csharp
using System.ComponentModel;
using System.Threading;
using System.Threading.Tasks;
using EyeAuras.AI.PluginHost;
using EyeAuras.AI.SemanticKernel;
using Microsoft.SemanticKernel;

public sealed class TextLengthPlugin : AiKernelPlugin
{
    [KernelFunction("text_length")]
    [Description("Return the number of UTF-16 code units in the text.")]
    public int GetLength(
        [Description("Text to measure.")] string text,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return text.Length;
    }
}

public static class TextLengthExample
{
    public static async Task<AiToolInvocationResult> RunAsync(
        CancellationToken cancellationToken)
    {
        var host = new AiPluginHost();
        host.AddOrUpdatePlugin("text", new TextLengthPlugin());
        try
        {
            return await host.InvokeToolAsync(
                "text", "text_length",
                new KernelArguments { ["text"] = "Hello!" },
                cancellationToken: cancellationToken);
        }
        finally
        {
            host.RemovePlugin("text");
        }
    }
}
```

`RunAsync` returns `AiToolInvocationResult` with `Succeeded = true` and `Value = 6`. `ListTools()` exposes `text.text_length`; the runtime supplies the token outside the model argument schema. The registration is removed in `finally`. `AiKernelPlugin` is not itself `IDisposable`; your code owns its services, subscriptions and resources.

For an actual chat, register the same instance with `session.AddOrUpdatePlugin("text", plugin)`. Your host creates and owns that session; it is not a script global.

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
- `AiScriptingModeToolsPluginBase` - shared base for source-mode-specific
  scripting plugin adapters such as in-memory and disk-backed EyePad surfaces.
- `AiScriptingInMemoryToolsPlugin` - prefixed in-memory scripting surface with
  `script_inmemory_*` inspection, edit, diagnostics, symbol, and NuGet/package
  analysis tools.
- `AiScriptingOnDiskToolsPlugin` - prefixed disk-backed scripting surface with
  `script_ondisk_*` diagnostics, semantic lookup, symbol documentation, and
  package/reference analysis tools; file text discovery and source edits remain
  the responsibility of filesystem/workspace tools.

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

## Where the policy applies

`AiToolCallFilter` enforces the policy in the Semantic Kernel route. Direct `IAiPluginHost.InvokeToolAsync`, used in the example above, does not check session policy; its caller owns the decision to permit the operation. Do not transfer this guarantee to MCP, coding-agent or custom invocation routes. It is not OS isolation.

## Tool Approval

- Use `AiFunctionInvocationPolicy` when a session contains tools that can mutate
  state, touch files, send input, call external services, or execute expensive
  operations.
- Match rules accept unqualified tool names or `plugin.tool` names.
- Whitelisted tools run without approval.
- Blacklisted tools require approval unless they also match the whitelist; whitelist matching happens first.
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
- `AiScriptingModeToolsPluginBase`
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

- [ml/ai-runtime.md](/en/scripting/api/ml/ai-runtime)
- [ml/ai.md](/en/scripting/api/ml/ai)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [reverse-engineering/reprocess.md](/en/scripting/api/reverse-engineering/reprocess)
- [recipes/script-ai-editor-assistant.md](/en/scripting/api/recipes/script-ai-editor-assistant)

See [documentation search and snapshot identity](/en/scripting/api/ml/documentation-retrieval) for reading contracts, metadata, citations and refresh behavior.

## Retrieval composition and MCP instructions

At `c8b2304`, the factory selects a null service, one service, or `CompositeAiRetrievalService`. The composite invokes services sequentially, joins distinct messages, and keeps the first hit for each case-insensitive `ChunkId`. It does not reapply a global size limit; `InjectedCharCount` is summed. A service error aborts composition. Chat Completions and Codex report skipped retrieval and continue the request, except on cancellation. The Responses backend intentionally performs no pre-retrieval injection. Plugin registration therefore does not guarantee identical context across backends.

MCP builds instructions at startup from base text and plugin sections sorted by name. The default plugin method extracts nonempty distinct system messages from a temporary history, not the live chat history. These instructions supply client context, not permission enforcement.

The filter uses the callback stored in `AiFunctionInvocationPolicy`. Merely overriding `AiKernelPlugin.AiFunctionApprovalCallback` does not wire it into that policy; the host must do so. Required approval without a callback or decision blocks the call. A tool timeout requests cancellation of the current request but does not forcibly interrupt code that ignores cancellation.

[Source contracts](https://github.com/iXab3r/EyeAuras/tree/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.AI)
