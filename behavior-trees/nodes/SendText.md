---
title: SendText
description:
published: true
date: 2025-08-17T08:39:46.611Z
tags:
editor: markdown
dateCreated: 2025-08-17T08:39:46.611Z
---

**SendText** automatically "types" text as if you were entering it yourself. It simulates key presses and can be used in macros and trees to send any text—messages, commands, chat lines, etc.

![SendText](https://s3.eyeauras.net/media/2025/08/EyeAuras_ea1jBx1plw.png)

## How it works
- Enter the text in the **Text** field.
- Set the delay between keystrokes (**Key Press Delay**, in milliseconds).
- Choose the input method:
    - **Type characters** – types each character sequentially like a regular keyboard.
    - **Shift+Insert** – paste via the standard Ctrl+Shift+Insert combination.
    - **Control+V** – paste from the clipboard (Ctrl+V).

When it's this node's turn, it "writes" the text using the selected method. It can be text for a game, chat, command line, or anything else.

## Main parameters
- **Text** – the text to type.
- **Key Press Delay** – delay between characters so the input looks human.
- **Method** – how to enter the text (typing or pasting).

## Example
In the example above, the node types "Hello, World!" one character at a time with a 30 millisecond pause between each.

## What is it useful for?
- Automatically sending messages, commands, logins, passwords, chat text, and other cases where manual input is required.
