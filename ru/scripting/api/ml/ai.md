---
title: AI и ML API
description: Индекс AI-first API для ML, инференса моделей и интеграции ИИ в приложения.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ml, ai-translated
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Карта раздела ML / AI

Навигационная карта для двух близких, но разных направлений:

- computer-vision ML: YOLO, инференс моделей, датасеты и поиск по изображениям на основе моделей;
- AI-интеграция в приложении: chat sessions, model profiles, tool plugins, retrieval, artifact store, MCP hosting, Responses API transport и UI AI-чата.

## Что обычно хотят сделать

- Использовать ML-поиск вместо детерминированного сравнения изображений.
- Загружать модели YOLO или запускать model inference.
- Понять, как работают вспомогательные инструменты для датасетов и обучения моделей.
- Связать результаты модели с CV capture и экранными overlay.
- Создать AI chat session внутри приложения, Razor component или script editor.
- Подключить к сессии инструменты, которые может вызывать AI.
- Добавить в AI assistant локальный поиск по документации.
- Опубликовать тот же набор инструментов через MCP.

## Модель понятий

- ML-поиск полезен, когда внешний вид цели меняется или важны классы объектов.
- CV capture по-прежнему отвечает за получение кадров.
- Model inference возвращает predictions/rectangles/classes/scores.
- Screen overlay может показывать detections, найденные моделью.
- Сервисы общего AI chat/agent — это отдельная область, не связанная напрямую с CV model inference.
- AI chat sessions — это возможности host/runtime. Script, component, plugin или service должны получать зависимости из текущего host context; эти API не являются глобально доступными C#-объектами.
- AI tool plugins — это обычные .NET-объекты, унаследованные от `AiKernelPlugin`. Методы с `[KernelFunction]` после регистрации становятся вызываемыми tools.

## Детали API

- `MLSearchTrigger` - aura trigger для model-backed search.
- `IComputerVisionExperimentalScriptingApi` / `ICvAccessor` - точки входа CV/ML для скриптов там, где они доступны.
- YOLO/model classes - основные точки для загрузки моделей и инференса.
- `AiEngine` - создает и отслеживает сессии chat, MCP и coding-agent.
- `IAiChatSession` / `AiChatSession` - chat transcript, active profile, plugin host, tool policy, retrieval, artifact store и conversation engine.
- `IAiProfileRepository` / `AiModelProfile` - настроенные model profiles, providers, endpoints, ссылки на API-key, function-calling flags, reasoning effort и metadata context window.
- `AiChatViewModel` / `AiChatComponent` - состояние чата и UI для Blazor.
- `AiDocsKnowledgeBasePlugin` / `IBm25KnowledgeBase` - индексация локальной markdown-документации и инструменты `doc_*`.
- `AiKernelPlugin` - базовый класс для tool plugins.
- `AiMcpSession` / `AiMcpServerHost` - публикуют зарегистрированные plugins как MCP server.

## Что предпочесть

- Сначала выбирайте детерминированный CV, если задача со стабильным template/color/OCR.
- Выбирайте ML, если ключевую роль играет класс объекта или изменчивый внешний вид.
- Для prediction boxes используйте `osd/screen-overlay.md`.
- Для интеграции chat/session/profile/UI используйте `ml/ai-runtime.md`.
- Если нужно добавить tools, которые сможет вызывать AI model, используйте `ml/ai-kernel-plugins.md`.
- Для прямых вызовов внешних provider NuGet из скриптов используйте `ml/script-ai-clients.md`.
- Если вопрос скорее про архитектуру, чем про один конкретный API, лучше искать готовый recipe.

## Чего избегать

- Не используйте model inference для простых поисков по фиксированному шаблону.
- Не смешивайте chat/agent API с CV model inference, если это не требуется задачей.
- Не предполагайте, что AI runtime services доступны в обычных helper-классах.
- Не регистрируйте tools без понятных описаний, корректного поведения с cancellation и проверки на дубли имен.

## Опорные сущности для поиска

- `MLSearchTrigger`, `ImageSearchTrigger`, `ICvAccessor`, `Yolo`,
  `AiEngine`, `IAiSession`, `IAiChatSession`, `AiChatSession`,
  `IAiChatSessionHandle`, `AiChatViewModel`, `AiChatComponent`,
  `IAiProfileRepository`, `AiModelProfile`, `AiKernelPlugin`,
  `AiDocsKnowledgeBasePlugin`, `IBm25KnowledgeBase`, `AiMcpSession`,
  `AiMcpServerHost`.

## Синонимы для поиска

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

## Связанные карты

- `ml/ai-runtime.md`
- `ml/ai-kernel-plugins.md`
- `ml/script-ai-clients.md`
- `computer-vision/images.md`
- `osd/screen-overlay.md`
- `auras/triggers.md`
- `recipes/script-ai-editor-assistant.md`