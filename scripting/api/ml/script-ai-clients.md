---
title: AI ML: Script AI Clients
description: AI-first map for using external AI client NuGets from scripts and distinguishing them from built-in EyeAuras AI runtime.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ml, openai
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Script AI Clients Discovery Map

Reference map for script mini-apps that call external AI APIs through NuGet
client libraries, and how that differs from the built-in `EyeAuras.AI` runtime.

## User Intents

- Call an external chat/vision/OCR model from a script.
- Send a captured image to an AI model.
- Use the OpenAI .NET client or another provider client.
- Decide between built-in EyeAuras AI runtime and direct NuGet API calls.
- Keep API keys and model configuration outside hardcoded source when possible.

## Concept Model

- Built-in EyeAuras AI runtime is an app subsystem for chat sessions, profiles,
  retrieval, plugins, and tool approval.
- External AI client NuGets are ordinary script dependencies used directly by a
  mini-app.
- Direct clients are often simplest for one-off OCR/vision/chat calls.
- Built-in runtime is better for integrated chat UI, retrieval, tool plugins,
  profiles, and long-lived AI workflows.
- Captured screen/window images usually come from CV/image APIs before being
  converted to provider-specific image input.

## Common Flow: Capture Image And Ask AI

1. Capture or receive an image from CV/window/image APIs.
2. Convert it to provider-supported bytes or stream format.
3. Create/configure the external AI client.
4. Build a chat/vision request with text plus image content.
5. Send the request.
6. Parse/store/display the returned text.
7. Dispose subscriptions/resources with script lifetime.

## Prefer

- Prefer built-in `EyeAuras.AI` runtime for app-integrated assistants,
  retrieval, tool/plugin workflows, and reusable chat UI.
- Prefer direct provider NuGets for small standalone calls.
- Prefer storing API keys in variables, config providers, user settings, or
  secret storage rather than hardcoding.
- Prefer bounded image sizes and compressed formats for vision calls.
- Prefer separating capture logic from AI-client request logic.

## Avoid

- Avoid confusing external provider SDKs with `EyeAuras.AI` runtime services.
- Avoid hardcoding real API keys in scripts or docs.
- Avoid sending large raw images when compressed bytes are sufficient.
- Avoid blocking UI/render loops while waiting for network calls.
- Avoid assuming provider SDK versions and model names stay current forever.

## Research Anchors

- `EyeAuras.AI`
- `AiEngine`
- `IAiChatSession`
- `AiModelProfile`
- `AiKernelPlugin`
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

- external AI client
- OpenAI NuGet
- chat client
- vision model
- GPT OCR
- image to text
- screenshot OCR
- direct provider SDK
- built-in AI runtime
- AI profile
- AI plugin

## Related Maps

- `ml/ai.md`
- `ml/ai-runtime.md`
- `ml/ai-kernel-plugins.md`
- `computer-vision/images.md`
- `scripting/references-and-resources.md`
