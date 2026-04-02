---
title: Как составлять запросы для ChatGPT
description: Краткое руководство по составлению запросов для ChatGPT.
published: true
date: 2025-03-17T22:38:10.124Z
tags: ai-translated
editor: markdown
dateCreated: 2025-03-17T22:25:15.654Z
---
## Как задать ChatGPT вопрос по захваченному изображению

В этом примере показано, как:

1. Полностью создать триггер `ImageSearch` кодом
2. Использовать его для захвата экрана
3. Задать ChatGPT вопрос по захваченному изображению — в этом примере модель распознаёт и выводит текст

```csharp
#r "nuget: OpenAI, 2.1.0"

using OpenAI;
using OpenAI.Chat;
using OpenAI.Files;
using Emgu.CV;
using System;

Main();

void Main()
{
    Log.Info("Hello, World!");

    OpenAIClient openAIClient = new OpenAIClient("<your-api-key-here>");
    var chatClient = openAIClient.GetChatClient("gpt-4o");
    var trigger = GetService<IEyeEntityFactory>()
        .Create<IImageSearchTrigger>(new ImageSearchTriggerProperties()
        {
            MaxFramesPerSecond = 1 //at most once per second
        }).AddTo(ExecutionAnchors);

    Log.Info($"Created new trigger: {trigger}");

    trigger.WhenImageProcessed
        .Where(x => x.Captured.InputImage != null)
        .Subscribe(image =>
        {
            var inputImage = image.Captured.InputImage; //Image<Bgr, byte>
            Log.Info($"Got the new image: {inputImage.Size}");

            try
            {
                var jpegBytes = inputImage.ToJpegData();
                var visionResult = RecognizeImage(chatClient, jpegBytes);

                Log.Info($" Recognition Result: {visionResult}");
            }
            catch (Exception ex)
            {
                Log.Error($" Error during image recognition: {ex.Message}");
            }
        })
        .AddTo(ExecutionAnchors);

    cancellationToken.WaitHandle.WaitOne();
}

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
```