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

Скрипт отправляет снимок вашего окна модели OpenAI, которая понимает изображения, и получает текстовый ответ. Это отдельный сетевой запрос из C#-скрипта. Встроенный [Text Search](/ru/triggers/images/text-search) работает иначе и может возвращать сегменты с координатами. Здесь ответ модели — обычный текст, без рамок OCR.

Пример написан под **OpenAI SDK 2.1.0**, API Chat Completions и старую модель **`gpt-4o`**. В [официальном каталоге](https://developers.openai.com/api/docs/models/gpt-4o) она помечена как устаревшая. Чтобы повторить пример, у вашего API-аккаунта должен быть доступ к этой модели.

## Подготовить один запрос

Нужны **C# Script** в [EyePad](/ru/features/eyepad), работающий захват окна и ваш собственный разрешённый доступ к OpenAI API. В снимок попадает всё, что есть в захватываемой области, поэтому уберите из окна личные данные. Запрос отправляет JPEG и текст инструкции внешнему сервису и может стоить денег.

1. Откройте своё тестовое окно с хорошо читаемой надписью, например `Заказ готов`. Подберите выражение для него по [правилам выбора окна](/ru/features/window-matching-expressions) и замените им `OCR Demo` в программе.
2. Вставьте программу в `Script.csx`. `YOUR_API_KEY` — заглушка: подставьте свой ключ, когда будете готовы отправить запрос. Не публикуйте ключ вместе со скриптом.
3. Нажмите `Run` один раз. Скрипт получит JPEG из захвата и сделает один запрос. В журнале появится ответ модели. При ошибке доступа, сети или модели выполнение завершится ошибкой.
4. Сравните ответ с надписью на экране.

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

Если окно не найдено, `GetWindow` завершает скрипт с ошибкой и запрос не отправляется. Дополнительная проверка `IsWindow` нужна на случай, если окно исчезло уже после выбора. Пусть окно не меняется, пока идёт захват.

| Параметр | Смысл |
|---|---|
| `OpenAI, 2.1.0` | Версия C#-клиента, под которую написаны вызовы. В примерах для нового SDK контракт может быть другим. |
| `gpt-4o` | Имя старой модели. |
| `ToJpegData(90)` | Кодирует захваченные пиксели в JPEG с качеством `90`. |
| `image/jpeg` | Формат отправленных байтов. Должен совпадать с кодированием. |
| `cancellationToken` | Передаёт остановку скрипта в сетевой вызов. Уже отправленные данные отмена не вернёт. |

`ProcessPixels` даёт изображение только на время обработчика. JPEG создаётся внутри него и дальше принадлежит программе как массив байтов. Само изображение скрипт не сохраняет и не освобождает. Объект `cv` освобождается при выходе из явного блока, в том числе при отмене или ошибке.

<details>
<summary>Зависимости и контекст</summary>

`ToJpegData(int)` — метод Emgu.CV. Исходный пример использует контракт **Emgu.CV 4.9.0.5494** из окружения EyeAuras. Не подменяйте уже загруженную нативную библиотеку случайной версией пакета. `GetService`, `Log` и `cancellationToken` доступны в верхнеуровневом `Script.csx`. В обычный класс зависимости передаются явно.

Как передать изображение вместе с инструкцией, описано в [документации OpenAI по изображениям](https://developers.openai.com/api/docs/guides/images-vision). Встроенный `AiEngine` и прямой `OpenAIClient` — разные способы подключения. Ключ из профиля AI Assistant в этот код сам не подставится.

</details>
