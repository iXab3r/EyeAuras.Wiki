---
title: How to Query Chat GPT
description: 
published: true
date: 2025-03-17T22:25:58.483Z
tags: 
editor: markdown
dateCreated: 2025-03-17T22:25:15.654Z
---

## Asking ChatGPT a question about captured image
This is an example of how to
1) Construct ImageSearch trigger entrirely in code
2) Use it to capture the screen
3) Ask ChatGPT question about the captured image - in this example I've asked it to recognized and print text 


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
                var visionResult = RecognizeImage(chatClient, fileClient, jpegBytes);

                Log.Info($"🔍 Recognition Result: {visionResult}");
            }
            catch (Exception ex)
            {
                Log.Error($"❌ Error during image recognition: {ex.Message}");
            }
        })
        .AddTo(ExecutionAnchors);

    cancellationToken.WaitHandle.WaitOne();
}

string RecognizeImage(
    OpenAI.Chat.ChatClient client,
    OpenAI.Files.OpenAIFileClient fileClient,
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