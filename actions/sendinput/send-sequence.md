---
title: Send Sequence
description: allows users to design complex sequences of inputs and delays that can be replayed when required
published: true
date: 2024-05-14T09:34:19.654Z
tags: 
editor: markdown
dateCreated: 2023-06-18T15:45:55.532Z
---

The Send Sequence action in EyeAuras is a powerful tool that allows users to design complex sequences of inputs and delays that can be replayed when required. It's the most advanced input tool in EyeAuras to date, providing unparalleled flexibility in simulating user interactions with applications.

![](/eyeauras_7qwn3ee1ud.png)

### Common options

Keep in mind that the Send Sequence action also inherits [all common options](/en/actions/sendinput/options) for Send Input actions, such as Target Window, Key Press delay, Restore After Action, Key Press Passthrough, Block User Input, Mouse Move Smoothing Algorithm, and Input Simulator.

Please note that some input methods might not work as expected depending on the environment and the application you're targeting. Always test your configuration thoroughly to ensure it behaves as expected.

### **Features**

**Interruption Hotkey**: Sequences can be interrupted at any moment by pressing a predefined hotkey, which can be configured in Settings. The default hotkey is Escape.

**Variety of Input Actions**: The action offers a diverse list of input-related actions, including keystrokes, mouse button clicks, text entries, delays, and numpad keys. You can use drag-and-drop or double-click to assemble the sequence that will be replayed when the action is triggered.

**Use Default KeyUp/KeyDown Delay**: When you add a key to the sequence, EyeAuras automatically inserts a 50ms delay between keydown and keyup events. These delay steps are marked as "KeyUp/Down" in the sequence. If you find these delay steps cluttering the sequence view, you can hide them by toggling this option.

**Show Notification While Executing**: If enabled, a floating notification will appear at the top of the screen for the duration of the action's execution.

### **Record User Inputs**

The Record User Inputs feature in the Send Sequence action provides an easy way for users to capture and replicate their interactions with an application. It can record keyboard keypresses, mouse clicks, and mouse positions at a configurable interval.

Here's how you can use this feature:

**Steps:**

1.  Start the Send Sequence action.
2.  Click on the Record button to begin recording your inputs.
3.  Interact with your application as needed. The system will record your actions.
4.  Click on the Record button again to stop recording.

**Customize Recording Settings:**

You can customize the recording settings by clicking on the small cog wheel next to the Record button. This opens a context menu with the following options:

**Record keys:** Toggles the recording of keyboard keypresses. When enabled, every key you press on your keyboard will be captured and added to the sequence.

**Record mouse clicks:** Toggles the recording of mouse clicks. When enabled, the system will record every mouse click and add it to the sequence.

**Record mouse positions:** Toggles the recording of mouse positions. When enabled, the system will capture your mouse's position every N milliseconds and add these positions to the sequence. This is especially useful for tasks that require precise mouse movement.

**Start/Stop keyboard hotkey:** Allows you to set a custom hotkey to start and stop the recording. This can be helpful when you need to capture interactions that can't be easily started or stopped with a mouse click.

The Record User Inputs feature in Send Sequence action simplifies the process of creating complex input sequences by allowing you to capture and replay your interactions with an application. However, keep in mind that it's always a good idea to review and test your sequences to ensure they behave as expected.

### **Restrictions**

The maximum duration of the replayed sequence is 120 seconds. If you need to exceed this limit for your specific use case, please reach out for a possible extension.

Like other actions in the Send Input group, Send Sequence inherits common options such as Target Window, Key Press delay, Restore After Action, Key Press Passthrough, Block User Input, Mouse Move Smoothing Algorithm, and Input Simulator.

The Send Sequence action is an extremely potent tool for automating complex user interactions, yet it requires careful configuration and testing to ensure the expected behavior.

### Examples

-   **In-Game Macro Creation:** If you're playing a game that requires complex key sequences or mouse movements, you can record these sequences once and then replay them with a single button press. This can be especially useful in MMOs, where you may need to execute complex skill rotations.
-   **Automating Repetitive Tasks:** If there are repetitive tasks in a game or application that require the same sequence of inputs every time, this feature can help automate these tasks, saving you time and effort.
-   **Rapid Text Entry:** For games or applications that require fast text entry, you can record a sequence of text input and replay it when needed.
-   **Automated Testing:** If you're a game developer or QA tester, you can use this feature to automate testing of game functionality. Record a sequence of actions that cover a specific game function, and replay it whenever you need to test that function.
-   **Fast Trading:** In games where trading items with other players is a core mechanic, you can record the sequence of actions for a standard trade and replay it to speed up your trading interactions.
-   **Executing Difficult Moves:** In fighting games, some moves require precise timing of button presses. Record the move once successfully, and then replay it during a match to execute it perfectly every time.
-   **Speedrunning:** If you're a speedrunner trying to shave milliseconds off your best time, recording and replaying sequences of actions can help you maintain optimal speed.
-   **Automating Crafting:** In games where crafting is a common task, you can record the crafting process for a specific item and replay it whenever you need to craft that item again.