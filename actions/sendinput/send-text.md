---
title: (legacy) Send Text
description:  allows users to input a predefined text as a series of individual inputs or paste it as a single action using the clipboard
published: true
date: 2024-05-14T09:38:36.235Z
tags: 
editor: markdown
dateCreated: 2023-06-18T15:31:49.359Z
---

# LEGACY - Use [Send Sequence | EyeAuras Wiki](https://wiki.eyeauras.net/en/actions/sendinput/send-sequence)

---

The Send Text action in EyeAuras allows users to input a predefined text as a series of individual inputs or paste it as a single action using the clipboard. This action is versatile and applicable in various scenarios where automated text input is required.

![](/eyeauras_iejiqhr0ng.png)

### Common options

Keep in mind that the Send Text action also inherits [all common options](/en/actions/sendinput/options) for Send Input actions, such as Target Window, Key Press delay, Restore After Action, Key Press Passthrough, Block User Input, Mouse Move Smoothing Algorithm, and Input Simulator.

Please note that some input methods might not work as expected depending on the environment and the application you're targeting. Always test your configuration thoroughly to ensure it behaves as expected.

### **Options**

**Text**: Enter the text that will be sent. EyeAuras can automatically detect when it's necessary to switch the keyboard layout, but to keep it simple, it's best to stick with text in one language.

**Input Method**: This option specifies how the text will be sent.

**Paste via Clipboard (Ctrl+V)**: Copies the text into the clipboard and pastes it by simulating a Ctrl+V keystroke.

**Paste via Clipboard (Shift+Insert)**: Copies the text into the clipboard and pastes it by simulating a Shift+Insert keystroke. This option is ideal for use in terminal environments.

**Send Each Character Individually**: Sends each character as a separate input, complete with the required modifiers. This method is ideal when you need to simulate natural typing or avoid paste-blocking mechanisms.