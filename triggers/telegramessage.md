---
title: Telegram Message
description: Carry an earlier incoming-message condition into the current Telegram trigger
published: true
date: 2022-11-02T15:02:56.038Z
tags: ai-translated
editor: markdown
dateCreated: 2022-11-02T15:01:05.360Z
---

# Continue from the older Telegram Message guide

This earlier page describes the same **Telegram Message** trigger. It receives new text that people send to your bot. **Send To Telegram** sends on the bot's behalf and is configured separately. Use [the current Telegram guide](/en/triggers/telegram-message) for bot setup, Chat ID and a complete receiving scenario.

## Check an existing text condition first

To see whether a condition from an old aura accepts `review`, start without sending a Telegram message.

1. Open **Activate** in your Telegram Message trigger. For a simple example, choose **Regex** and enter `\Areview\z`.
2. Enable **Test mode** and enter `review` as the test input. It should match. Replace the input with `done`: it should not match. This checks the expression, not the Telegram connection.
3. Turn **Test mode** off to restore real incoming text. For a live check, follow the current guide's **Telegram Bot Token** and **Chat Id (optional)** setup, then send a new message from your own user account. Keep the token out of shared auras.
4. Check **Message history**. With **Deactivate on message** off, a match gives a short activation with automatic deactivation; turn it on and configure a separate off command for a retained state. Add **On Enter** actions or an overlay separately.

| Earlier label | Current setting or result |
| --- | --- |
| Text or expression | The condition's expression. **Text**, **Regex**, **C#** and **Ignore Case** are supported; [matching rules](/en/features/text-match-expressions) define each context. Text compares the whole input; Regex can express a partial match |
| Input test text | Test input while **Test mode** is on, not proof of an incoming Telegram message |
| Matching text | Regex returns capture group 1 when the expression contains groups, otherwise the whole match. Text and C# return the input on success |
| C# function | A Boolean expression in the text evaluator's string-input context, not a full Script.csx program or implicit access to Log/AuraTree/Variables |
| Token | Now **Telegram Bot Token**, the secret controlling your own bot |
| Chat | **Chat Id (optional)**. Empty means all chats available to that bot, not only yours |

Current expression testing is beside Activate; connection and chat fields are in the Telegram source settings.

The receiver uses new ordinary-message text. Old updates at connection, edits and channel posts do not substitute for that path. Group visibility depends on the bot's permissions and privacy settings; establish a history entry before diagnosing a reaction. Do not use the outgoing Send To Telegram notification as an incoming test.

Earlier bot-setup resources: [tlgrm.ru — BotFather](https://tlgrm.ru/docs/bots#botfather) and [SendPulse](https://sendpulse.com/ru/knowledge-base/chatbot/create-telegram-chatbot). Check current bot requirements in [Telegram's official guide](https://core.telegram.org/bots/features#botfather).
