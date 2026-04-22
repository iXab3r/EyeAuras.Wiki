---
title: AI и ML — AI-клиенты в скриптах
description: Карта по использованию внешних AI-клиентов NuGet из скриптов и их отличиям от встроенного AI-рантайма EyeAuras.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, ml, openai, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта по AI-клиентам для скриптов

Справочная карта для script mini-apps, которые вызывают внешние AI API через NuGet-клиенты, и краткое объяснение, чем этот подход отличается от встроенного рантайма `EyeAuras.AI`.

## Что обычно нужно

- Вызвать внешний chat/vision/OCR model из скрипта.
- Отправить захваченное изображение в AI model.
- Использовать OpenAI .NET client или клиент другого провайдера.
- Понять, что выбрать — встроенный рантайм EyeAuras AI или прямые вызовы через NuGet API.
- По возможности хранить API keys и конфигурацию моделей вне захардкоженного исходника.

## Как это устроено

- Встроенный рантайм EyeAuras AI — это подсистема приложения для chat sessions, profiles, retrieval, plugins и tool approval.
- Внешние AI-клиенты из NuGet — это обычные зависимости скрипта, которые mini-app использует напрямую.
- Прямые клиенты чаще всего проще для разовых OCR/vision/chat-вызовов.
- Встроенный рантайм лучше подходит для интегрированного chat UI, retrieval, tool plugins, profiles и долгоживущих AI-сценариев.
- Захваченные изображения экрана или окна обычно приходят из CV/image API, а затем конвертируются в формат изображения, который поддерживает конкретный провайдер.

## Типовой сценарий: захватить изображение и спросить AI

1. Захватить изображение или получить его из CV/window/image API.
2. Конвертировать его в bytes или stream-формат, который поддерживает провайдер.
3. Создать и настроить внешний AI client.
4. Собрать chat/vision request с текстом и содержимым изображения.
5. Отправить запрос.
6. Разобрать, сохранить или показать полученный текст.
7. Освободить subscriptions/resources в соответствии со временем жизни скрипта.

## Что предпочесть

- Используйте встроенный рантайм `EyeAuras.AI`, если нужен AI-помощник, встроенный в приложение, retrieval, сценарии с tools/plugins или переиспользуемый chat UI.
- Используйте прямые provider NuGet-пакеты для небольших автономных вызовов.
- Храните API keys в variables, config providers, user settings или secret storage, а не хардкодьте их в исходнике.
- Для vision-вызовов предпочитайте ограниченные размеры изображений и сжатые форматы.
- Лучше разделять логику захвата изображения и логику AI-запроса через клиент.

## Чего избегать

- Не путайте внешние provider SDK и сервисы рантайма `EyeAuras.AI`.
- Не хардкодьте реальные API keys в скриптах и документации.
- Не отправляйте большие raw images, если достаточно сжатых bytes.
- Не блокируйте UI/render loops, пока ждёте сетевой ответ.
- Не рассчитывайте на то, что версии provider SDK и имена моделей всегда останутся актуальными.

## Ключевые сущности для поиска

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

## Синонимы для поиска

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

## Смежные карты

- `ml/ai.md`
- `ml/ai-runtime.md`
- `ml/ai-kernel-plugins.md`
- `computer-vision/images.md`
- `scripting/references-and-resources.md`