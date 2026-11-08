---
title: How to Query Chat GPT
description: 
published: true
date: 2025-03-17T22:38:10.124Z
tags: scripting, ai, ocr, ai-translated
editor: markdown
dateCreated: 2025-03-17T22:25:15.654Z
---

# Ask a model about one captured image

The built-in EyeAuras AI route uses `EyeAuras.AI`, `AiEngine`, a configured profile and a session. Editor UI can use `IScriptAiChatSessionFactory`. These require their host registrations, not an arbitrary script's GetService call. See [AI runtime](/en/scripting/api/ml/ai-runtime) and [AI clients](/en/scripting/api/ml/script-ai-clients).

This separate historical provider example keeps `OpenAI 2.1.0` and `gpt-4o`. It does not call the built-in assistant. The [official model page](https://developers.openai.com/api/docs/models/gpt-4o) describes text/image input and currently marks the model Deprecated; account access is a separate prerequisite. The package XML confirms `CreateImagePart`, `GetChatClient` and `CompleteChat`; Emgu.CV `4.9.0.5494` documents `ToJpegData(int)` returning JPEG bytes.

## Capture one frame and send the request

Create an EyeAuras C# Script with working window capture. Open your own window, replace `OCR Demo` with its title and supply a provider key instead of the placeholder. Do not publish that key with the pack. The package must restore into a compatible host.

`ProcessPixels` copies the borrowed image into an owned byte array. The network call happens after the callback returns; do not hand `Captured.InputImage` to a background task. A continuously updating trigger subscription is unnecessary for this one-frame operation.

```csharp
#r "nuget: OpenAI, 2.1.0"

using OpenAI;
using OpenAI.Chat;
using Emgu.CV;
using System;
using System.Collections.Generic;

{
    var targetWindow = GetService<IWindowSelector>().GetWindow("OCR Demo");
    using var cv = GetService<IComputerVisionExperimentalScriptingApi>()
        .ForWindow(targetWindow);

    cancellationToken.ThrowIfCancellationRequested();
    var jpegBytes = cv.ProcessPixels(image => image.ToJpegData(90));
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

On success the Event Log contains the model's response. This is free-form text, not OCR segments with verified coordinates, and it may be inaccurate or omit expected text. No ROI is supplied, so the selected window is captured. The response has no CV similarity threshold or `Detected.Bounds`. For local OCR with coordinates, use [Text Search and click](/en/scripting/examples/basic/click-on-text).

The using scope disposes the created CV accessor; the callback image is borrowed. This listing does not pass a token into synchronous capture or CompleteChat: checking before a call does not interrupt an active request. Keep it out of UI/render callbacks. The SDK also has token-taking completion overloads, but this preserves the historical call shape. No provider request, authentication or image upload was executed for this documentation check.

See [script contexts](/en/scripting/api/core/app-runtime-contexts), [capture ownership](/en/scripting/api/computer-vision/images), and the [CV API](/en/scripting/api/IComputerVisionExperimentalScriptingApi).
