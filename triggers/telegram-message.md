---
title: Telegram Message
description: listens for user-specified messages sent across Telegram channel, allowing for synchronized control and data sharing
published: true
date: 2024-03-31T21:55:55.886Z
tags: 
editor: markdown
dateCreated: 2022-12-20T17:35:23.602Z
---

This trigger allows you to configure reaction to messages in one of your Telegram channels. Message could be send by any user or using [Send Telegram Message](/en/actions/send-telegram-message)

# Setting up Telegram Bot / Group

To setup Telegram notifications you have to do 3 things:

1.  Create Telegram Bot - it will be used to send you notifications. This is how you'll get **Telegram Bot Token.** You can either use an existing bot or create a new one following instruction below
2.  Create a group or add your Telegram Bot to existing group - this is where messages will be sent. You can add another bot named **Show Json Bot** to get **Telegram Chat Id** of the group.
3.  Configure Send Telegram Message by putting in **Telegram Bot Token** and **Telegram Chat Id**

### How to get Telegram Bot Token

1.  Open Telegram client (desktop/mobile does not really matter)
2.  Find bot **BotFather**
3.  Type **/newbot**
4.  Choose and type some name for your new bot, it does not have to be unique, e.g. “MyAwesomeNewTelegramBot”
5.  Choose and type username for your new bot, it has to be unique and has to end with “bot”, .e.g “MyAwesomeNewTelegramBot” (it will be taken and you'll have to pick something new)
6.  That's it! If you've done everything correctly, **BotFather** should provide you with **Bot Token**

Example:

![](/telegram_3uc3q03fas.png)

### How to get Chat Id

1.  Create new group in Telegram or open existing one
2.  Click on **Add Member** button
3.  Find and add **YOUR\_BOT\_NAME** (username of the bot you've created previously, e.g. **MyAwesomeNewTelegramBot**)
4.  Find and add **Show Json Bot**
5.  (optional) Click on Create - this is needed only if you're creating a new and fresh TG group
6.  **Show Json Bot** will print a JSON which will contain ChatId

![](/telegram_ive2xr6teu.png)

# Trigger settings

As with all other text-matching triggers this trigger supports [Text Match Expressions](https://wiki.eyeauras.net/en/text-match-expressions)

Prior to usage of this trigger you'll have to establish Telegram bot which will maintain the channel subscription. It is quite an easy task, but could be a bit overwhelming first time you'll try to do it, luckily, there is a number of different guides out there in the web. 

The most crucial part of that process is retrieving Token, which will be used by EyeAuras to impersonate Bot and retrieve messages from the channel

Helpful docs about TG bots:

-   Official docs, BotFather section:  [](https://tlgrm.ru/docs/bots)[Документация Telegram: Боты (tlgrm.ru)](https://tlgrm.ru/docs/bots#botfather)
-   Instruction with images on how to configure chat-bot: [Как подключитьTelegram чат-бот | SendPulse](https://sendpulse.com/ru/knowledge-base/chatbot/create-telegram-chatbot)