---
title: AI ML: Script AI Clients
description: AI-first map for choosing the built-in EyeAuras AI SDK/runtime first and using direct provider SDKs only when intentionally bypassing it.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ml, openai
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Script AI Clients Discovery Map

Reference map for script mini-apps that need AI chat, vision, tool-calling, or
agent workflows. Start with the built-in `EyeAuras.AISdk` / `EyeAuras.AI`
runtime, then use direct provider NuGet clients only for explicit escape-hatch
cases.

## User Intents

- Use the built-in EyeAuras AI SDK/runtime from a script or mini-app.
- Call a chat/vision/OCR model through configured EyeAuras AI profiles.
- Send a captured image to an AI model.
- Register AI-callable tools through the existing Semantic Kernel-based
  infrastructure.
- Decide when a script should intentionally bypass the built-in AI SDK with a
  direct provider NuGet.
- Keep API keys and model configuration outside hardcoded source when possible.

## Concept Model

- `EyeAuras.AISdk` packages the built-in EyeAuras AI surface for script/project
  use. It brings in the `EyeAuras.AI` runtime and desktop AI helpers.
- Built-in EyeAuras AI runtime is the app subsystem for chat sessions, profiles,
  retrieval, Semantic Kernel plugins, tool approval, MCP/Codex surfaces, and
  reusable chat UI.
- Use the built-in runtime as the default path for app-integrated AI. It already
  owns profile selection, key resolution, tool policy, session state, retrieval,
  and UI/event plumbing.
- External AI client NuGets are ordinary script dependencies used directly by a
  mini-app when the script deliberately bypasses the built-in runtime.
- External AI client assemblies are not default host/script references. Add
  them explicitly with `#r "nuget:..."` or project references when a script
  wants to call a provider SDK directly.
- Direct clients are an escape hatch for provider-specific features, experiments,
  or standalone calls that should not participate in EyeAuras AI profiles,
  plugins, retrieval, or chat UI.
- Captured screen/window images usually come from CV/image APIs before being
  attached to an AI session or converted to provider-specific image input.

## Common Flow: Built-in AI SDK

1. Reference or depend on `EyeAuras.AISdk` for script/project AI integrations.
2. Resolve AI services through the script/project host surface, usually
   `AiEngine`, `IAiProfileRepository`, session configurators, or UI factories.
3. Create an `IAiSession` / `IAiChatSession` through `AiEngine`.
4. Use configured `AiModelProfile` entries instead of hardcoded provider
   clients and keys.
5. Attach `AiKernelPlugin` tools, retrieval plugins, or context snapshots when
   the workflow needs them.
6. Send turns through the session and render events with `AiChatViewModel` /
   `AiChatComponent` when UI is needed.
7. Dispose session handles and subscriptions with script lifetime.

## Common Flow: Direct Provider Escape Hatch

1. Confirm the built-in AI SDK/runtime does not cover the required provider
   feature or experiment.
2. Add the provider client explicitly with `#r "nuget:..."` or a project
   reference.
3. Keep provider API keys in variables, config providers, user settings, or
   secret storage.
4. Capture or receive inputs from EyeAuras APIs, then convert them to the
   provider-specific request format.
5. Dispose provider clients, subscriptions, and buffers with script lifetime.

## Prefer

- Prefer built-in `EyeAuras.AISdk` / `EyeAuras.AI` runtime for AI chat, model
  profiles, key resolution, Semantic Kernel tools, retrieval, MCP/Codex,
  app-integrated assistants, and reusable chat UI.
- Prefer `AiEngine`, `IAiProfileRepository`, `AiKernelPlugin`,
  `AiChatViewModel`, and `AiChatComponent` over direct provider clients when
  building on EyeAuras AI infrastructure.
- Use direct provider NuGets only when the script intentionally owns provider
  versioning, authentication, request shape, and response parsing.
- Prefer storing API keys in variables, config providers, user settings, or
  secret storage rather than hardcoding.
- Prefer bounded image sizes and compressed formats for vision calls.
- Prefer separating capture logic from AI-client request logic.

## Avoid

- Avoid defaulting to direct provider SDKs when the built-in AI SDK can satisfy
  the workflow.
- Avoid bypassing EyeAuras profiles, key resolution, tool approval, and session
  state for app-integrated AI.
- Avoid confusing external provider SDKs with `EyeAuras.AISdk` /
  `EyeAuras.AI` runtime services.
- Avoid hardcoding real API keys in scripts or docs.
- Avoid sending large raw images when compressed bytes are sufficient.
- Avoid blocking UI/render loops while waiting for network calls.
- Avoid assuming provider SDK versions and model names stay current forever.

## Research Anchors

- `EyeAuras.AISdk`
- `EyeAuras.AI`
- `AiEngine`
- `IAiProfileRepository`
- `IAiChatSession`
- `AiModelProfile`
- `AiKernelPlugin`
- `AiChatViewModel`
- `AiChatComponent`
- `Microsoft.SemanticKernel`
- `KernelFunctionAttribute`
- `OpenAIClient`
- `OpenAI.Chat`
- `ChatClient`
- `ChatMessage`
- `ChatMessageContentPart`
- `BinaryData`
- `ToJpegData`
- `IImageSearchTrigger`
- `WindowImageProcessedEventArgs`

## Search Synonyms

- EyeAuras AISdk
- built-in AI SDK
- built-in AI runtime
- external AI client
- direct OpenAI NuGet
- chat client
- vision model
- GPT OCR
- image to text
- screenshot OCR
- direct provider SDK escape hatch
- AI profile
- AI plugin

## Related Maps

- `ml/ai.md`
- `ml/ai-runtime.md`
- `ml/ai-kernel-plugins.md`
- `computer-vision/images.md`
- `scripting/references-and-resources.md`
