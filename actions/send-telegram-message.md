---
title: Send Telegram Message
description: allows you to connect to Telegram and send messages via the Telegram framework
published: true
date: 2024-03-31T21:53:52.979Z
tags: 
editor: markdown
dateCreated: 2023-06-18T15:01:39.519Z
---

The "Send Telegram Message" Action in EyeAuras allows you to connect to Telegram and send messages via the Telegram framework. Please note that it's not currently possible to send messages impersonating a real user.

# Setting up Telegram Bot / Group

To setup Telegram notifications you have to do 3 things:

1.  Create Telegram Bot - it will be used to send you notifications. This is how you'll get `Telegram Bot Token`. You can either use an existing bot or create a new one following instruction below
2.  Create a group or add your Telegram Bot to existing group - this is where messages will be sent. You can add another bot named `Show Json Bot` to get `Telegram Chat Id` of the group.
3.  Configure Send Telegram Message by putting in `Telegram Bot Token` and `Telegram Chat Id`

### How to get Telegram Bot Token

1.  Open Telegram client (desktop/mobile does not really matter)
2.  Find bot `BotFather`
3.  Type `/newbot`
4.  Choose and type some name for your new bot, it does not have to be unique, e.g. `MyAwesomeNewTelegramBot`
5.  Choose and type username for your new bot, it has to be unique and has to end with “bot”, .e.g `MyAwesomeNewTelegramBot` (it will be taken and you'll have to pick something new)
6.  That's it! If you've done everything correctly, `BotFather` should provide you with `Bot Token`

Example:

![](/telegram_3uc3q03fas.png)

### How to get Chat Id

1.  Create new group in Telegram or open existing one
2.  Click on **Add Member** button
3.  Find and add `YOUR_BOT_NAME` (username of the bot you've created previously, e.g. `MyAwesomeNewTelegramBot`)
4.  Find and add `Show Json Bot` (important! Name must be exactly that, there are many different bots with similar names)
5.  (optional) Click on Create - this is needed only if you're creating a new and fresh TG group
6.  **Show Json Bot** will print a JSON which will contain ChatId

![](/telegram_ive2xr6teu.png)

# Action options

**Telegram Bot Token:** This is the ID of the Telegram bot that you've created. For more details on how to configure this, please check the following link: [_Telegram Message Trigger_](https://wiki.eyeauras.net/en/triggers/telegram-message).

**Telegram Chat ID:** This is the ID of the chat where you want to send your message.

**SOCKS5 Proxy:** If needed, you can connect to a proxy to send your message. The proxy should be provided in the following format: username:password@host:port.

**Message Format:** You can choose between Text, HTML, Markdown, or MarkdownV2 for your message format. Here is a brief explanation of each one:

-   **Text**: The simplest format, plain text with no special formatting.
-   **HTML**: Use HTML tags for formatting your message, such as bold, italics, hyperlinks, etc.
-   **Markdown / MarkdownV2**: Use markdown syntax for formatting. Markdown is a lightweight markup language for creating formatted text. For more details about the specifics of Telegram's markdown syntax, refer to the [_Telegram API_](https://core.telegram.org/bots/api#markdown-style).

**Text:** This is the actual content of the message you want to send.

There is currently no limitation on message size, but keep in mind that excessively long messages might be harder to read or could be truncated by Telegram on the receiving end.

### Gaming applications

**Game Status Notifications:** Using the Send Telegram Message action, gamers can configure EyeAuras to send notifications about their game status to a Telegram group. For example, when a level is completed or when a game is saved, a message could be sent to notify friends or fellow gamers.

**Team Communication:** For team-based games, players can set up EyeAuras to send messages to their team's Telegram chat whenever certain in-game events occur, such as acquiring an important item or reaching a critical location. This would facilitate real-time updates and better team coordination.

**Streaming Alerts:** Streamers can use the action to send messages to their Telegram channel each time they start or end their live stream. This can keep their followers updated about their streaming schedule.

**Game Statistics Sharing:** Gamers can set up EyeAuras to automatically send their gaming statistics, like high scores or completed achievements, to a Telegram group, helping them to share their progress and compete with friends.