---
title: Read window text with OpenAI
description: 
published: true
date: 2025-03-17T22:38:10.124Z
tags: scripting, ai, ocr, ai-translated
editor: markdown
dateCreated: 2025-03-17T22:25:15.654Z
---

# Read text from your own window with OpenAI

The script sends a picture of your window to an OpenAI model that understands images and gets a text answer back. This is a separate network request from a C# script. The built-in [Text Search](/en/triggers/images/text-search) works differently and can return segments with coordinates. Here the model's answer is plain text, without OCR boxes.

The example is written for **OpenAI SDK 2.1.0**, **Chat Completions** and the old **`gpt-4o`** model. The [official model catalog](https://developers.openai.com/api/docs/models/gpt-4o) marks it Deprecated. To repeat the example, your API account needs access to that model.

## Prepare one request

You need a **C# Script** in [EyePad](/en/features/eyepad), working window capture and your own authorized OpenAI API access. Everything in the captured area ends up in the picture, so remove personal information from the window. The request sends a JPEG and the instruction text to an external service and can cost money.

1. Open your own test window with a clear phrase such as `Order ready`. Replace `OCR Demo` in the program with its [window-matching expression](/en/features/window-matching-expressions).
2. Paste the program into `Script.csx`. `YOUR_API_KEY` is a placeholder: put in your own key when you are ready to send the request. Do not publish the key with the script.
3. Click `Run` once. The script gets a JPEG from the capture and makes one request. The log shows the model's answer. An access, network or model error ends the run with an error.
4. Compare the answer with the phrase on the screen.

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
        Log.Info("The test window is no longer available");
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
    Log.Info(string.IsNullOrWhiteSpace(text) ? "The response contains no text" : text);
}
```

If no window matches, `GetWindow` ends the script with an error and no request is sent. The extra `IsWindow` check covers a window that disappeared after it was selected. Keep the window unchanged while it is captured.

| Parameter | Meaning |
| --- | --- |
| `OpenAI, 2.1.0` | The C# client version these calls are written for. Examples for a newer SDK may use a different API. |
| `gpt-4o` | The name of the old model. |
| `ToJpegData(90)` | Encodes the captured pixels as JPEG with quality `90`. |
| `image/jpeg` | The format of the bytes sent. It must match the encoding. |
| `cancellationToken` | Passes the script's stop into the network call. Cancelling does not take back data already sent. |

`ProcessPixels` lends the image only for the duration of the callback. The JPEG is created inside it and then belongs to the program as a byte array. The script does not keep or dispose the image itself. The `cv` object is disposed when the explicit block exits, including on cancellation or error.

<details>
<summary>Dependencies and the built-in AI route</summary>

`ToJpegData(int)` is an Emgu.CV method. The example uses the **Emgu.CV 4.9.0.5494** contract from the EyeAuras environment. Do not swap an already loaded native library for a random package version. `GetService`, `Log` and `cancellationToken` are available in top-level `Script.csx`. An ordinary class gets its dependencies passed in explicitly.

The [OpenAI image guide](https://developers.openai.com/api/docs/guides/images-vision) explains how to send an image together with an instruction. The cancellation overload used here is in the [2.1.0 ChatClient source](https://github.com/openai/openai-dotnet/blob/OpenAI_2.1.0/src/Custom/Chat/ChatClient.cs).

The built-in `AiEngine` and a direct `OpenAIClient` are two different ways to connect. The key from an AI Assistant profile is not put into this code automatically. See [AI runtime](/en/scripting/api/ml/ai-runtime) and [script AI clients](/en/scripting/api/ml/script-ai-clients).

</details>
