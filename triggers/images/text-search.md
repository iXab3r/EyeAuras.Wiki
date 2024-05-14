---
title: Text Search
description: extracts text from images using Tesseract OCR with customizable language settings
published: true
date: 2024-05-14T11:17:12.841Z
tags: 
editor: markdown
dateCreated: 2023-06-18T14:14:56.137Z
---

Text Search Trigger uses the [_Tesseract OCR engine_](https://github.com/tesseract-ocr/tesseract) to extract text from the captured image. This allows EyeAuras to react to specific pieces of text within a game or application, offering a wide range of potential uses from automated actions in response to specific game events to more complex scripting possibilities.

### **Overview of Tesseract**

Tesseract is an optical character recognition engine originally developed by HP and now maintained by Google. It is highly accurate and can recognize multiple languages, making it a powerful tool for extracting text from images.

### **Capture Options**

These are the same as in other image searches. For more details, visit [_this page_](https://wiki.eyeauras.net/en/triggers/images/imagecapturetriggers).

### **Text Match Expression**

You can specify a custom expression to match the extracted text against using the full potential of [_Text Match Expressions_](https://wiki.eyeauras.net/en/matching/overview).

### OCR engines

EyeAuras is using following engines to transform images into text

-   [Tesseract](https://github.com/tesseract-ocr/tesseract) -  one of the best open-source solutions, but, at some point, it started to be worse than Windows API solution. You can install additional languages by downloading and placing language files into specific folder, see section below for details
-   [Windows OCR](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/features-on-demand-language-fod?view=windows-11) - uses built-in capabilities of Windows to perform OCR. You have to install language pack fo a language which you want to process. E.g. if you want to translate russian symbols - you have to have Russian language pack installed into Windows, see section below for details

### **Symbols**

This option allows you to specify the language used for recognition. By default, there are four models embedded into EyeAuras:

-   Windows (language): recognizes symbols of selected language plus arabic numbers
-   Tesseract (eng+rus): recognizes both Russian and English symbols, plus numbers
-   Tesseract  (eng) / Tesseract  (rus): recognizes only English or only Russian symbols
-   Tesseract  (numbers): recognizes only numbers

### **Windows OCR: Enabling OCR support for a Specific Language on Windows 10+**

**Open Settings**:

-   Click on the Windows start button (bottom-left corner of the screen).
-   Click on the gear-shaped icon labeled “Settings”.

**Navigate to Language Settings**:

-   In the Settings window, click on “Time & Language”.
-   Now, select “Language” from the left sidebar.

![](/ni1l1qv[1].png)

**Add a New Language (if not already added)**:

-   Under the 'Preferred languages' section, click on the “Add a preferred language” button.
-   A window will pop up with a list of languages. You can scroll to find your desired language or type the language's name into the search bar at the top.
-   Once you locate your language, click on it and then click the “Next” button.
-   Ensure the “Install language pack” option is checked, and click “Install”.

![](/cmjv657[1].png)

**Install the OCR Language Pack**:

-   Once your desired language is listed under 'Preferred languages', click on it.
-   Now click on “Options”.
-   Under the “Download” section, you should see various features available for the language. Look for “Handwriting” or "Optical Character Recognition (OCR)" and click the “Download” button beside it.

![](/zetu69i[1].png)

**Wait for Installation**:

-   Windows will now download and install the necessary files for OCR functionality for your chosen language. This process might take some time, depending on your internet speed.

**Verify Installation**:

-   Once installed, the status should change to “Installed”. You can now close the Settings window.

**Restart Your Application**:

-   If you have EyeAuras open, please close and restart it to ensure it recognizes the newly added OCR capabilities.

### **Tesseract: Adding Custom Languages** 

EyeAuras uses the following code to load Tesseract models, which includes default languages and allows you to add custom ones. The application looks for Tesseract language data files (with the extension `**.traineddata**`) in the following directory: `**%appdata%\release\tessdata**`. You can download more Tesseract models from [_this repository_](https://github.com/tesseract-ocr/tessdata_best). Please note that the application needs to be restarted to load new models.

### Improving text search results

To achieve the best results when performing OCR, it is recommended that the text on the image is **black on white.** This can be done using several methods:

**Invert Image Options**: Inverts the colors on the image, turning white text on a black background to black text on a white background.

**Binary Threshold**: Converts the colored image into a black and white image. The threshold value set determines what is considered black or white. This greatly improve results for Tesseract, for Windows - not so much. 

**Scale factor**: Resizes image using specified factor. In some cases increasing Scale Factor is the only way to get results from OCR, especially if the image you're trying to process is small or the text is written using non-standard fonts.

**Image Effects**: Allows you to modify the image to optimize it for OCR. This could involve adjusting the brightness, contrast, and saturation to make the text more distinct.

Remember, the better the quality of the original image and the higher the contrast between the text and its background, the more accurate the OCR process will be.

### Gaming applications

-   **Health/Mana Tracker**: In games where health or mana levels are displayed as text, the trigger could automate actions based on these levels (like consuming a health potion when health drops below a certain level).
-   **Inventory Management**: In games where inventory is text-based (like old-school RPGs), the Text Search Trigger can be used to detect when certain items are obtained or used, and trigger appropriate actions.
-   **Dialogue Choices**: In games with multiple dialogue options, the Text Search Trigger could be used to automatically choose specific dialogue options based on the on-screen text.
-   **Real-Time Strategy Alerts**: Text Search Trigger could detect warning messages or resource updates in RTS games and alert the player or trigger specific actions accordingly.
-   **MMO Communication**: The trigger can read in-game chat messages, allowing players to trigger automatic responses to certain phrases or keywords.
-   **Accessibility Helper**: For gamers with disabilities, the Text Search Trigger could be used to read and interpret on-screen text and facilitate actions that would otherwise require more complex input.
-   **Quest Tracking**: In RPGs, the trigger could read quest updates from the screen and automatically track progress or switch active quests.
-   **Achievement Tracker**: The trigger could detect on-screen achievement notifications and log them or trigger celebratory effects.