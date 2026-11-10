---
title: Discord Bot
description: How to use the EyeAuras Bot in Discord DMs, channel mentions, privacy, and limitations
published: true
date: 2026-04-04T00:00:00.000Z
tags: discord, bot, ai, support, ai-translated
editor: markdown
dateCreated: 2026-04-04T00:00:00.000Z
---

# Ask the EyeAuras assistant in Discord

Ask the public **EyeAuras** bot in the [community server](/en/contacts) when you need an explanation or a script example. It searches EyeAuras documentation and replies in Discord. This is a support assistant, not an aura action for sending arbitrary Discord messages or a recipe for installing your own bot. You do not need to create a bot token.

You need Discord access, permission to message the bot or a channel it can read, and an available bot service. Replies depend on service availability, permissions and limits; installing EyeAuras on your computer does not start the public bot.

## Ask for a relevant article

1. Find **EyeAuras** with Discord's bot indicator in the community server. Open a DM or an appropriate support channel.
2. In a DM, ask directly. In a channel or thread, explicitly mention the bot by typing `@EyeAuras` and selecting the actual account in Discord's list.
3. For example, ask which trigger and overlay will show your own text while a selected window is active, and request documentation links. Include your build number when the answer may depend on the version.
4. Read the reply and its sources. For follow-up replies in a channel, keep the explicit mention so the question is addressed to the bot.
5. If you no longer need an in-progress response, its requester can use the stop button. This requests cancellation; it does not remove text already posted. A server administrator with the appropriate access can also stop it.

![Identifying the EyeAuras bot in a channel](https://s3.eyeauras.net/media/2026/04/Discord_jjGZGKtG1r.png)

Expect a text answer with links or an example relevant to the question. Asking for code does not give the bot access to your desktop or make it execute that code on your computer.

| Where you ask | Context used |
| --- | --- |
| DM | No mention required. Conversation memory is scoped to your user. |
| Shared channel | Explicit mention required. Available channel messages can supply context. |
| Discord thread | Separate conversation scope; a mention is still required. |
| Reply to a message | The quoted message and recent conversation can help; a channel reply without a mention may not invoke the bot. |
| Mention without a question | It may use recent context, but a complete question is clearer. |

## Supply the task and relevant evidence

Describe what should happen, where the condition or data comes from, and what happened instead. For a script error, provide a short snippet and the error text. For a configuration question, name the trigger, action, window and build. You can ask the bot to find a wiki article before proposing API names.

These earlier prompt examples illustrate the subject matter; select the actual bot mention rather than relying on a literal display name:

```text
@EyeAuras Bot how do I get the coordinates of a found image?
@EyeAuras Bot why does my AI profile show Unavailable?
@EyeAuras Bot here is a piece of Script.csx, why doesn't Log work here?
```

The assistant can help locate settings, scripting and changelog information, including image or text search, coordinates, input, packs and mini-apps. Documentation lookup and conversation memory do not mean it has been trained on all your auras or can validate a build on your computer.

The earlier DM illustration shows a suggested toggle interface. Treat such an answer as a starting point and compare its files and contracts with [Blazor windows](/en/scripting/blazor-windows/getting-started) and [C# Overlay](/en/overlays/custom-ui).

![Earlier conversation with the EyeAuras bot in a DM](https://s3.eyeauras.net/media/2026/04/Discord_lefcNxnwcM.png)

<details>
<summary>Memory, access and limits</summary>

DM history is not mixed into other users' conversations as shared history. Channel and thread memories belong to their respective scopes. The bot can process available context on the server and retain information for follow-up; a DM does not mean no server processing. Do not send passwords, keys or someone else's private data.

Discord posting permission does not grant unlimited AI use. Service roles and global, per-user and per-channel limits also apply. Follow the service's response when access is denied or a limit is reached; repeatedly sending the same request does not change permissions.

This assistant is an evolving public service. An answer may be incomplete or use an example unsuitable for your build. Ask for the source and review dependencies and code. For work on an open local project, use [AI Assistant](/en/features/ai-assistant) or [Codex in EyePad](/en/features/ai-codex-coding-assistant), where project context is connected separately. [Scripting practices](/en/scripting/best-practices) and the [scripting introduction](/en/scripting/getting-started) help check the proposed example.

</details>
