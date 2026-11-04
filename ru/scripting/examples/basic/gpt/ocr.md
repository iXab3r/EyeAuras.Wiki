---
title: Как составлять запросы для ChatGPT
description: Краткое руководство по составлению запросов для ChatGPT.
published: true
date: 2025-03-17T22:38:10.124Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-17T22:25:15.654Z
---
# Спросить модель о захваченном изображении

Встроенный путь EyeAuras AI проходит через `EyeAuras.AI`, `AiEngine`, настроенный профиль и сессию; для интерфейса редактора есть `IScriptAiChatSessionFactory`. Эти сервисы требуют регистраций своего хоста и не являются автоматически доступным `GetService` любого скрипта. Настройка и владение сессией описаны в [AI runtime](/ru/scripting/api/ml/ai-runtime) и [карте AI-клиентов](/ru/scripting/api/ml/script-ai-clients).

Ниже сохранён отдельный исторический вариант прямого обращения к провайдеру — `OpenAI` версии `2.1.0`, модель `gpt-4o`. Это не вызов встроенного помощника EyeAuras и не обновление примера под новый SDK. По [описанию OpenAI](https://developers.openai.com/api/docs/models/gpt-4o) модель принимает текст и изображения; это не подтверждает компиляцию примера с пакетом 2.1.0 или доступ к модели у конкретного аккаунта.

## Подготовить один кадр и отправить запрос

Создайте `C# Script` в EyeAuras с рабочим захватом окна. Откройте собственное окно с известным заголовком, замените `OCR Demo` в коде и подготовьте ключ провайдера вместо `<your-api-key-here>`. Ключ — явный внешний вход этого исторического примера; не публикуйте его вместе с паком. Пакет должен загрузиться в совместимый runtime. Без этих входов код не является готовым автономным OCR.

Здесь отправляется один JPEG выбранного окна. Сначала `ProcessPixels` копирует изображение в принадлежащий скрипту `byte[]`, и только после выхода из callback выполняется сетевой запрос. Не передавайте заимствованный `Captured.InputImage` в фоновую задачу. Вариант с постоянно обновляющимся триггером и сетевым вызовом внутри подписки для этого не нужен.

```csharp
#r "nuget: OpenAI, 2.1.0"

using OpenAI;
using OpenAI.Chat;
using Emgu.CV;
using System;

{
    var targetWindow = GetService<IWindowSelector>().GetWindow("OCR Demo");
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(targetWindow);

    cancellationToken.ThrowIfCancellationRequested();
    var jpegBytes = cv.ProcessPixels(image => image.ToJpegData());
    cancellationToken.ThrowIfCancellationRequested();

    var openAIClient = new OpenAIClient("<your-api-key-here>");
    var chatClient = openAIClient.GetChatClient("gpt-4o");
    var recognizedText = RecognizeImage(chatClient, jpegBytes);
    Log.Info($"Recognition Result: {recognizedText}");

    string RecognizeImage(
        OpenAI.Chat.ChatClient client,
        byte[] jpegBytes)
    {
        var imageBytes = BinaryData.FromBytes(jpegBytes);
        List<ChatMessage> messages =
        [
            new UserChatMessage(
                    ChatMessageContentPart.CreateTextPart("Perform OCR on the image and print found text and window in which it was found"),
                    ChatMessageContentPart.CreateImagePart(imageBytes, "image/jpeg")),
            ];

        ChatCompletion completion = client.CompleteChat(messages);
        return completion.Content[0].Text;
    }
}
```

Ожидаемый результат — текст ответа в журнале, если запрос завершился успешно. Это свободный ответ модели, а не набор OCR-сегментов с проверяемыми координатами. Он может содержать ошибки или не содержать ожидаемого текста. Здесь ROI не задан: берётся захват выбранного окна; порога сходства и envelope `Detected.Bounds` у ответа модели нет. Для локального OCR с координатами используйте [Text Search и клик по сегменту](/ru/scripting/examples/basic/click-on-text).

`using` освобождает созданный CV accessor; изображение внутри callback заимствовано и не освобождается скриптом. Синхронные захват и `CompleteChat` в этом варианте не получают токен отмены: проверки перед вызовами не означают, что остановка прервёт уже идущий запрос. Не выполняйте этот код в UI/ImGui render callback. Авторизация, отправка изображения, OCR и совместимость внешнего SDK здесь не проверялись.


## Дальше

[Контекст скрипта](/ru/scripting/api/core/app-runtime-contexts) · [Захват и результаты CV](/ru/scripting/api/computer-vision/images) · [CV API](/ru/scripting/api/IComputerVisionExperimentalScriptingApi)

Контракты сверены со срезом EyeAuras `20fd3d4` и PoeEye `0e02c98`. Полные сигнатуры смотрите в SDK/XML своей версии; наличие символа не подтверждает доступность внешнего пакета или нативного компонента. Пример здесь не проверялся компиляцией или запуском.
