---
title: Discord Bot
description: How to ask the EyeAuras bot in Discord DMs and channels, what it remembers and its limits
published: true
date: 2026-04-04T00:00:00.000Z
tags: discord, bot, ai, support, ai-translated
editor: markdown
dateCreated: 2026-04-04T00:00:00.000Z
---

# Ask the EyeAuras assistant in Discord

The [community server](/en/contacts) has a public **EyeAuras** bot. Ask it how to set something up or ask for a script example. It looks for the answer in the EyeAuras documentation and replies in Discord. It is a support assistant, not an action for sending messages from an aura. You do not need to install your own bot or create a token for it.

## Ask for a relevant article

1. On the community server, find the **EyeAuras** user with the bot badge. Open a DM with it or a suitable support channel.
2. In a DM, just ask. In a channel or thread, mention the bot: type `@EyeAuras` and pick it in Discord's list.
3. For example, ask which trigger and overlay show your own text while a chosen window is active, and ask for documentation links. If the answer may depend on the version, add your build number.
4. Read the reply and open the articles it suggests. To follow up in a channel, mention the bot again, or it may not see that the question is for it.
5. If you no longer need an answer that is still being written, the person who asked can press its stop button. It cancels the current work but does not remove text already posted. A server administrator with the right access can stop it too.

![The EyeAuras bot in a channel](https://s3.eyeauras.net/media/2026/04/Discord_jjGZGKtG1r.png)

The bot does not test its examples. It has no access to your desktop and does not run scripts on your computer.

| Where you ask | Context used |
| --- | --- |
| DM | No mention needed. The conversation and its memory are tied to your user. |
| Shared channel | A mention is required. Messages from the channel can get into the context. |
| Discord thread | A separate conversation. A mention is still required. |
| Reply to a message | The bot can take the quoted message and the recent conversation into account. In a channel, a reply without a mention may not call it. |
| Mention without a question | The bot may try to work out the question from recent messages. A full question is more reliable. |

## Supply the task and relevant evidence

Describe what should happen, where the condition comes from and what happened instead. For a script error, add a short snippet and the error text. For a settings question, name the trigger, action, window and build. You can ask the bot to find a wiki article first and check API names against it.

Example questions. In Discord, pick the real bot from the mention list:

```text
@EyeAuras Bot how do I get the coordinates of a found image?
@EyeAuras Bot why does my AI profile show Unavailable?
@EyeAuras Bot here is a piece of Script.csx, why doesn't Log work here?
```

The bot can help with settings, scripting and the changelog: image or text search, coordinates, input, packs, mini-apps. It searches the documentation and the conversation history. It does not know your auras.

In the example below the bot suggests how to build an interface with toggles. Check the current files and API against [Blazor windows](/en/scripting/blazor-windows/getting-started) and [C# Overlay](/en/overlays/custom-ui).

![Conversation with the EyeAuras bot in a DM](https://s3.eyeauras.net/media/2026/04/Discord_lefcNxnwcM.png)

<details>
<summary>Memory, access and limits</summary>

Your DM history does not get into answers for other users. The memory of a channel belongs to that channel, and the memory of a thread to that thread. The bot can read the context available to it and keep information to continue the conversation. Do not send passwords, keys or other people's private data.

Service roles and limits apply: global, per user and per channel. If the bot refuses because of access or a limit, read its reply. Sending the same request again will not help.

The answer may be incomplete or not fit your build. Ask for the source and check the code. [Scripting practices](/en/scripting/best-practices) and the [scripting introduction](/en/scripting/getting-started) help with that.

To work with an open local project, use [AI Assistant](/en/features/ai-assistant) or [Codex in EyePad](/en/features/ai-codex-coding-assistant). There the project context is connected separately.

</details>
