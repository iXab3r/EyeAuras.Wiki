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

Справочная карта для script mini-apps, которым нужен AI chat, vision,
tool-calling или agent workflows. Начинайте со встроенного runtime
`EyeAuras.AI`, добавляйте `EyeAuras.AI.Desktop` для desktop-интеграций, а
прямые NuGet-клиенты провайдеров используйте только как явный escape hatch.

## Что обычно нужно

- Вызвать внешний chat/vision/OCR model из скрипта.
- Отправить захваченное изображение в AI model.
- Использовать OpenAI .NET client или клиент другого провайдера.
- Понять, что выбрать — встроенный рантайм EyeAuras AI или прямые вызовы через NuGet API.
- По возможности хранить API keys и конфигурацию моделей вне захардкоженного исходника.

## Как это устроено

- `EyeAuras.AI` — пакет с non-desktop runtime-поверхностью EyeAuras AI.
- `EyeAuras.AI.Desktop` — desktop AI helpers поверх `EyeAuras.AI`.
- `EyeAuras.AISdk` — compatibility/legacy surface для проектов, которые всё
  ещё ожидают старую объединённую форму AI SDK.
- Встроенный рантайм EyeAuras AI — это подсистема приложения для chat sessions, profiles, retrieval, plugins и tool approval.
- Внешние AI-клиенты из NuGet — это обычные зависимости скрипта, которые mini-app использует напрямую.
- Прямой клиент требует собственной настройки авторизации, запросов и времени жизни.
- Встроенный рантайм лучше подходит для интегрированного chat UI, retrieval, tool plugins, profiles и долгоживущих AI-сценариев.
- Захваченные изображения экрана или окна обычно приходят из CV/image API, а затем конвертируются в формат изображения, который поддерживает конкретный провайдер.

## Проверить встроенный инструмент без запроса модели

Если вашему скриптовому проекту уже доступны `EyeAuras.AI` и Semantic Kernel,
следующий верхнеуровневый код создаст локальный plugin host и вызовет встроенный
инструмент. Ссылки на сборки и их версии нужно подготовить в проекте заранее;
наличие имени в карте не означает установленного пакета. `Log` и
`cancellationToken` здесь предоставляет именно хост C# Script.

```csharp
using EyeAuras.AI;
using EyeAuras.AI.PluginHost;
using Microsoft.SemanticKernel;

var host = new AiPluginHost();
host.AddOrUpdatePlugin("hello", new AiHelloWorldPlugin());
try
{
    var result = await host.InvokeToolAsync(
        "hello", "echo_with_time",
        new KernelArguments { ["request"] = "Привет" },
        cancellationToken: cancellationToken);
    Log.Info(result.Succeeded ? $"Ответ: {result.Value}" : result.Error);
}
finally
{
    host.RemovePlugin("hello");
}
```

В лог попадёт строка и время локального хоста. Ключ провайдера не нужен;
этот вызов не является диалогом с моделью и не применяет session approval policy.
Для настоящего помощника используйте [операцию создания сессии](ai-runtime):
там указаны `AddAiCoreServices`, конфигурационная зависимость, передача `AiEngine`
и освобождение через engine. Для UI редактора есть
`IScriptAiChatSessionFactory` и configurators, получаемые из контекста редактора;
не считайте их глобальными переменными любого скрипта.

В срезе EyeAuras `20fd3d4` `EyeAuras.AI` — проект общего runtime,
`EyeAuras.AI.Desktop` — desktop-интеграция, `EyeAuras.AISdk` объединяет их для
совместимости. Доступность и совместимость конкретных опубликованных NuGet
нужно проверять отдельно. Прямой клиент провайдера оставляйте для случаев,
когда встроенная сессия не подходит; версии моделей и пакетов из старых
примеров не являются рекомендацией на текущую дату.

## Типовой сценарий: захватить изображение и спросить AI

1. Захватить изображение или получить его из CV/window/image API.
2. Конвертировать его в bytes или stream-формат, который поддерживает провайдер.
3. Создать и настроить внешний AI client.
4. Собрать chat/vision request с текстом и содержимым изображения.
5. Отправить запрос.
6. Разобрать, сохранить или показать полученный текст.
7. Освободить subscriptions/resources в соответствии со временем жизни скрипта.

## Что предпочесть

- Используйте встроенный runtime `EyeAuras.AI` / `EyeAuras.AI.Desktop`, если
  нужен AI-помощник, встроенный в приложение, model profiles, retrieval,
  scenarios с tools/plugins, MCP/Codex или переиспользуемый chat UI.
- Используйте прямые provider NuGet-пакеты для небольших автономных вызовов.
- Храните API keys в variables, config providers, user settings или secret storage, а не хардкодьте их в исходнике.
- Для vision-вызовов предпочитайте ограниченные размеры изображений и сжатые форматы.
- Лучше разделять логику захвата изображения и логику AI-запроса через клиент.

## Чего избегать

- Не путайте внешние provider SDK с runtime-сервисами `EyeAuras.AI`,
  `EyeAuras.AI.Desktop` или compatibility-пакетом `EyeAuras.AISdk`.
- Не хардкодьте реальные API keys в скриптах и документации.
- Не отправляйте большие raw images, если достаточно сжатых bytes.
- Не блокируйте UI/render loops, пока ждёте сетевой ответ.
- Не рассчитывайте на то, что версии provider SDK и имена моделей всегда останутся актуальными.

## Ключевые сущности для поиска

- `EyeAuras.AI`
- `EyeAuras.AI.Desktop`
- `EyeAuras.AISdk`
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
