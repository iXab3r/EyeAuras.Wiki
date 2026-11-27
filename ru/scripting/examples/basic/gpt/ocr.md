---
title: Как составлять запросы для ChatGPT
description: Краткое руководство по составлению запросов для ChatGPT.
published: true
date: 2025-03-17T22:38:10.124Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-17T22:25:15.654Z
---

# Получить текст со снимка своего окна через OpenAI

Можно отправить снимок собственного окна модели с поддержкой изображений и получить текстовый ответ. Это отдельный сетевой запрос из C#-скрипта: встроенный [Text Search](/ru/triggers/images/text-search) работает по другому пути и может возвращать сегменты с координатами. Ответ модели в этом примере — обычный текст, без рамок OCR и без гарантии точного распознавания.

Пример рассчитан на **OpenAI SDK 2.1.0**, API Chat Completions и историческую модель **`gpt-4o`**. В [официальном каталоге](https://developers.openai.com/api/docs/models/gpt-4o) она помечена как устаревшая. Для повторения необходим доступ к этой модели в вашем API-аккаунте; при отсутствии доступа пример нельзя запустить простой заменой ключа. Это не рекомендация модели для нового проекта.

## Подготовить один запрос

Нужны **C# Script** в [EyePad](/ru/features/eyepad), доступный захват окна и собственный разрешённый доступ к OpenAI API. Снимок содержит всё, что попало в захватываемую область: подготовьте окно без личных данных. Запрос передаёт JPEG и текст инструкции внешнему сервису и может тарифицироваться.

1. Откройте своё тестовое окно с хорошо читаемой надписью, например `Заказ готов`. Подберите его выражение по [правилам выбора окна](/ru/features/window-matching-expressions) и замените `OCR Demo` в программе.
2. Поместите программу в `Script.csx`. Значение `YOUR_API_KEY` — фиктивный заполнитель; до осознанного запроса нужен ваш настроенный ключ. Не публикуйте его вместе со скриптом.
3. Запустите `Run` один раз. Скрипт получает JPEG из захвата и делает один запрос. В журнале появится текст ответа модели, а при ошибке доступа, сети или модели выполнение завершится ошибкой.
4. Сравните ответ с видимой надписью. Модель может ошибиться; название окна берётся из вашего выбора источника, а не узнаётся из скрытых данных приложения.

```csharp
#r "nuget: OpenAI, 2.1.0"

using OpenAI;
using OpenAI.Chat;
using Emgu.CV;
using System;
using System.Collections.Generic;
using System.Linq;

{
    cancellationToken.ThrowIfCancellationRequested();
    var window = GetService<IWindowSelector>().GetWindow("OCR Demo");
    if (!window.IsWindow)
    {
        Log.Info("Тестовое окно больше недоступно");
        return;
    }

    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(window);
    var jpegBytes = cv.ProcessPixels(image => image.ToJpegData(90));
    cancellationToken.ThrowIfCancellationRequested();
    var client = new OpenAIClient("YOUR_API_KEY").GetChatClient("gpt-4o");
    var messages = new List<ChatMessage>
    {
        new UserChatMessage(
            ChatMessageContentPart.CreateTextPart(
                "Read the visible text in this image. Return only that text."),
            ChatMessageContentPart.CreateImagePart(
                BinaryData.FromBytes(jpegBytes), "image/jpeg"))
    };
    ChatCompletion completion = client.CompleteChat(
        messages, cancellationToken: cancellationToken);
    var text = string.Concat(completion.Content.Select(part => part.Text));
    Log.Info(string.IsNullOrWhiteSpace(text) ? "В ответе нет текста" : text);
}
```

`GetWindow` завершает выполнение с ошибкой, если окно не найдено; в этом случае запрос не отправляется. Дополнительная проверка `IsWindow` относится к окну, исчезнувшему после выбора. Оставьте его стабильным на время захвата.

| Параметр | Смысл |
|---|---|
| `OpenAI, 2.1.0` | Версия C#-клиента, под которую написаны вызовы. Примеры нового SDK могут иметь другой контракт. |
| `gpt-4o` | Имя исторической модели; её доступность определяется сервисом и аккаунтом. |
| `ToJpegData(90)` | Кодирует захваченные пиксели в JPEG с качеством `90`; это не уверенность распознавания. |
| `image/jpeg` | Формат переданных байтов; должен соответствовать кодированию. |
| `cancellationToken` | Передаёт остановку скрипта в сетевой вызов; отмена не возвращает уже переданные данные. |

`ProcessPixels` даёт временный доступ к изображению. JPEG создаётся внутри его обработчика и затем принадлежит программе как массив байтов; само изображение из обработчика не сохраняется и не освобождается скриптом. Объект `cv` освобождается при выходе из явного блока, в том числе при отмене или ошибке.

<details>
<summary>Зависимости и контекст</summary>

`ToJpegData(int)` относится к Emgu.CV; исходный пример использует контракт **Emgu.CV 4.9.0.5494** из окружения EyeAuras. Не подменяйте уже загруженную нативную библиотеку случайной версией пакета. `GetService`, `Log` и `cancellationToken` доступны в верхнеуровневом `Script.csx`; обычному классу зависимости передаются явно.

В [документации OpenAI по изображениям](https://developers.openai.com/api/docs/guides/images-vision) описана передача изображения вместе с инструкцией. Это не обращение к игровым ресурсам: внешний сервис получает только отправленные пиксели и текст. Встроенный `AiEngine` и прямой `OpenAIClient` — разные пути подключения; настройка профиля AI Assistant не подставляет ключ в этот код автоматически.

</details>
