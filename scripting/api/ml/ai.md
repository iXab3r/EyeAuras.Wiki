---
title: AI ML and AI APIs
description: AI-first index for ML, model inference, and app AI integration APIs.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ml
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# ML / AI Discovery Map

Index map for two related but separate areas:

- computer-vision ML: YOLO, model inference, datasets, and model-backed image
  search;
- app AI integration: chat sessions, model profiles, tool plugins, retrieval,
  artifact store, MCP hosting, Responses API transport, and AI chat UI.

## User Intents

- Use ML search instead of deterministic image matching.
- Load or run YOLO/model inference.
- Understand dataset/model training helpers.
- Connect model results to CV capture and screen overlays.
- Create an AI chat session inside an app, Razor component, or script editor.
- Attach AI-callable tools to a session.
- Add local documentation search to an AI assistant.
- Host the same tool surface through MCP.

## Concept Model

- ML search is useful when target appearance varies or classes matter.
- CV capture still provides frames.
- Model inference returns predictions/rectangles/classes/scores.
- Screen overlay can display model detections.
- General AI chat/agent services are separate from CV model inference.
- AI chat sessions are host/runtime features. A script, component, plugin, or
  service must obtain dependencies from its current host context; these APIs are
  not ambient C# globals.
- AI tool plugins are normal .NET objects derived from `AiKernelPlugin`.
  `[KernelFunction]` methods become callable tools after registration.

## API Details

- `MLSearchTrigger` - aura trigger for model-backed search.
- `IComputerVisionExperimentalScriptingApi` / `ICvAccessor` - script CV/ML
  entry points where available.
- YOLO/model classes - model loading and inference anchors.
- `AiEngine` - creates and tracks chat, MCP, and coding-agent sessions.
- `IAiChatSession` / `AiChatSession` - chat transcript, active profile,
  plugin host, tool policy, retrieval, artifact store, and conversation engine.
- `IAiProfileRepository` / `AiModelProfile` - configured model profiles,
  providers, endpoints, API-key references, function-calling flags, reasoning
  effort, and context-window metadata.
- `AiChatViewModel` / `AiChatComponent` - Blazor-facing chat state and UI.
- `AiDocsKnowledgeBasePlugin` / `IBm25KnowledgeBase` - local markdown docs
  indexing and `doc_*` tools.
- `AiKernelPlugin` - base class for tool plugins.
- `AiMcpSession` / `AiMcpServerHost` - expose registered plugins as an MCP
  server.

## Prefer

- Prefer deterministic CV first when a template/color/OCR task is stable.
- Prefer ML when object class or appearance variability is central.
- Prefer `osd/screen-overlay.md` for prediction boxes.
- Prefer `ml/ai-runtime.md` for chat/session/profile/UI integration.
- Prefer `ml/ai-kernel-plugins.md` when adding tools callable by an AI model.
- Prefer `ml/script-ai-clients.md` for direct external provider NuGet calls
  from scripts.
- Prefer a recipe when the task is an architecture question rather than a
  single API lookup.

## Avoid

- Avoid model inference for simple fixed-template searches.
- Avoid mixing chat/agent APIs with CV model inference unless the task needs it.
- Avoid assuming AI runtime services are available in plain helper classes.
- Avoid registering tools without clear descriptions, cancellation behavior, and
  duplicate-name checks.

## Research Anchors

- `MLSearchTrigger`, `ImageSearchTrigger`, `ICvAccessor`, `Yolo`,
  `AiEngine`, `IAiSession`, `IAiChatSession`, `AiChatSession`,
  `IAiChatSessionHandle`, `AiChatViewModel`, `AiChatComponent`,
  `IAiProfileRepository`, `AiModelProfile`, `AiKernelPlugin`,
  `AiDocsKnowledgeBasePlugin`, `IBm25KnowledgeBase`, `AiMcpSession`,
  `AiMcpServerHost`.

## Search Synonyms

- ML
- AI
- YOLO
- model inference
- object detection
- prediction
- dataset
- training
- AI search
- AI chat
- AI assistant
- tool calling
- function calling
- kernel plugin
- Semantic Kernel
- Responses API
- MCP server
- RAG
- BM25
- artifact store

## Related Maps

- `ml/ai-runtime.md`
- `ml/ai-kernel-plugins.md`
- `ml/script-ai-clients.md`
- `computer-vision/images.md`
- `osd/screen-overlay.md`
- `auras/triggers.md`
- `recipes/script-ai-editor-assistant.md`
