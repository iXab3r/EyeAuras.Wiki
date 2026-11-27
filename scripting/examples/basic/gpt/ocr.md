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

Send an image of your own window to an image-capable model and read its text response. The request contains the captured JPEG and your instruction. For local OCR with text segments and coordinates, use [Text Search](/en/triggers/images/text-search); this example returns free-form text without OCR bounding boxes or an accuracy guarantee.

This is a version-bound example for **OpenAI SDK 2.1.0**, **Chat Completions** and the historical **`gpt-4o`** model. The [official model catalog](https://developers.openai.com/api/docs/models/gpt-4o) marks it Deprecated. You need API access to that model; replacing the key cannot make an unavailable model work. It is not a model recommendation for a new project.

## Prepare one request

You need a **C# Script** in [EyePad](/en/features/eyepad), working window capture and your own authorized OpenAI API access with billing available. Signing into ChatGPT or an EyeAuras account does not supply the API key used by this code. Image inputs are billable API data; prepare a window without personal information.

1. Open your own test window with a clear phrase such as `Order ready`. Replace `OCR Demo` with its [window-matching expression](/en/features/window-matching-expressions).
2. Paste the program into `Script.csx`. `YOUR_API_KEY` is a fictional placeholder; an intentional request requires your configured key. Do not publish it in a shared script.
3. Click `Run` once. The program encodes a captured image as JPEG and makes one network request. The log shows returned text; access, network or model errors end the run with an error.
4. Compare the response with the visible phrase. The model can make mistakes. The selected source determines which window is captured; the model does not learn a hidden window title from the application's internal data.

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

`GetWindow` throws if no window matches, before sending a request. `IsWindow` checks whether the selected handle is still valid; keep the window stable while capturing it.

| Parameter | Meaning |
| --- | --- |
| `OpenAI, 2.1.0` | The C# client version used by these calls. New SDK examples may use different APIs. |
| `gpt-4o` | Historical model identifier, subject to service and account availability. |
| `ToJpegData(90)` | JPEG encoding quality `90`, not recognition confidence. |
| `image/jpeg` | Media type corresponding to the encoded bytes. |
| `cancellationToken` | Cancels the SDK request cooperatively; cancellation cannot retract data already transmitted. |

`ProcessPixels` lends the callback an image. Encode the JPEG inside that callback; the resulting byte array belongs to the program. Do not retain or dispose the borrowed image. The owned `cv` accessor is disposed when the explicit block exits, including on cancellation or error. The synchronous capture call does not take this token, so checks around it do not make capture instantly cancellable.

The response may contain several content parts. The program joins their text and reports an empty text result explicitly instead of indexing the first part unconditionally. A refusal or non-text answer is not successful OCR.

<details>
<summary>Dependencies and the built-in AI route</summary>

`ToJpegData(int)` uses the **Emgu.CV 4.9.0.5494** contract supplied by the EyeAuras environment. Do not replace an already loaded native library with an arbitrary package version. `GetService`, `Log` and `cancellationToken` belong to top-level `Script.csx`; ordinary classes require explicit dependencies.

The [OpenAI image guide](https://developers.openai.com/api/docs/guides/images-vision) explains image and text inputs. The [2.1.0 ChatClient source](https://github.com/openai/openai-dotnet/blob/OpenAI_2.1.0/src/Custom/Chat/ChatClient.cs) defines the cancellation overload used here. Current Responses examples are not a drop-in replacement for this pinned Chat Completions client.

The built-in `EyeAuras.AI` runtime uses configured profiles and sessions through `AiEngine` and registered host services, including `IScriptAiChatSessionFactory` where supplied. It is a separate route from a script-owned `OpenAIClient`; an AI Assistant profile does not fill this literal key automatically. See [AI runtime](/en/scripting/api/ml/ai-runtime) and [script AI clients](/en/scripting/api/ml/script-ai-clients) for that context.

</details>
