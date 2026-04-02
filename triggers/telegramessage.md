---
title: Telegram Message
description: Send a message via Telegram.
published: true
date: 2022-11-02T15:02:56.038Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T15:01:05.360Z
---
# Telegram Message

EyeAuras can now react when it receives specific messages in Telegram.

This can be:

- a keyword or phrase
- a partial text match
- a [regular expression](https://ru.wikipedia.org/wiki/Регулярные_выражения)
- a **C#** function

With a C# function, you can do any processing you need on the incoming text, as long as the function returns a boolean value.

To use this feature, you need to create a Telegram bot and send messages to it yourself, or have someone else send messages to it. EyeAuras will react to those messages.

Creating a bot usually takes no more than 10 minutes, even if this is your first time doing it. The most important part is getting the bot token. That token lets EyeAuras subscribe to the bot's incoming messages and also send messages on the bot's behalf using the **Send To Telegram** action.

Useful bot setup guides:

- Official Telegram BotFather documentation: [Telegram docs: Bots (tlgrm.ru)](https://tlgrm.ru/docs/bots#botfather)
- Step-by-step SendPulse guide with screenshots: [How to connect a Telegram chatbot | SendPulse](https://sendpulse.com/ru/knowledge-base/chatbot/create-telegram-chatbot)

You can also test how your expression will behave when a specific message is received.

- **Text or expression** — enter the text, regular expression, or C# function that will be applied to the received message
- **Input test text** — a test input string that simulates an incoming message
- **Matching text** — for a regular expression, this is the first successfully matched group; for plain text and C#, this is the full input string if the comparison succeeds

![](https://eyeauras.net/uploads/ODK_Fb_Oy_76969f0b38.png)