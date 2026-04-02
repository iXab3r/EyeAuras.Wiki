---
title: (legacy) Send Input
description:  lets users emulate a single input event
published: true
date: 2024-05-14T09:38:56.650Z
tags: 
editor: markdown
dateCreated: 2023-06-18T16:03:09.798Z
---

# LEGACY - Use [Send Sequence | EyeAuras Wiki](https://wiki.eyeauras.net/en/actions/sendinput/send-sequence)

---

The Send Input action in EyeAuras is a powerful tool that lets users emulate a single input event. This automation can replicate a keyboard combination, a mouse movement, or a mouse click.

There are multiple types of action which are supported by Send Input.

![](/eyeauras_vkyrrjgchm.png)

### Common options

Keep in mind that the Send Sequence action also inherits [all common options](/en/actions/sendinput/options) for Send Input actions, such as Target Window, Key Press delay, Restore After Action, Key Press Passthrough, Block User Input, Mouse Move Smoothing Algorithm, and Input Simulator.

Please note that some input methods might not work as expected depending on the environment and the application you're targeting. Always test your configuration thoroughly to ensure it behaves as expected.

### **Key Press** 

The Key Press action simulates a keyboard combination. It could be a simple key press, like 'A', a combination like 'Ctrl+A', or even a mouse click with or without a modifier. To select a Mouse button, double-click with it on an input field.

There are three event types to select from:

-   **KeyPress:** This simulates a complete keystroke. The key is pressed and then released. For example, if you have a scenario where you need to input the letter 'A', you can use this option.
-   **KeyDown:** This simulates the pressing down of a key, as if the key is being held down. This can be useful in games where holding down a key has a different effect compared to a simple key press. For instance, holding down the 'Shift' key in a racing game to enable nitro boost.
-   **KeyUp:** This simulates the release of a key, like a key being let go after being held down. This can be helpful in games or applications where releasing a key triggers a specific action.

### **Key Press with Location**

In addition to the Key Press action, you can specify the mouse to move to a particular location before the key press is executed. This can be handy when you need to interact with a specific part of the screen, such as opening a menu or selecting an option.

### **Mouse Click**

The Mouse Click action automates a mouse button click or a mouse wheel action. You can specify any modifier keys (Shift, Alt, Control, etc.) that should be held down during the click. It also allows you to define whether the mouse button should be pressed (held down and then released), held down, or released.

#### **Mouse Click with Location**

This action functions like the Mouse Click option but also moves the mouse to a specified location before the click. This is useful for automating interactions with specific on-screen elements, like closing a pop-up window or clicking on a specific button in an application.

-   **Relative Mouse Movement** The relative mouse movement is a useful option when the mouse's target location is dependent on its current position. When the movement is marked as "relative", the coordinates block acts as an offset to the current mouse location. For instance, if you need to click on a UI element that is always a fixed distance from the cursor's current location, you could use relative mouse movement.

### **Link Aura**

Link Aura functionality allows a user to link any Aura. Depending on the types of triggers present in the linked auras, EyeAuras extracts the TargetWindow and coordinates block from it. For example, if you're linking an aura that has an Image Search trigger and the linked aura is active, the program obtains the coordinates of the found image and uses it to coordinate a click. This can be especially helpful in complex automation sequences where you need to interact with dynamically appearing UI elements. 

**Note:** While the Send Input action is versatile and powerful, it does come with certain limitations due to its age. For more intricate tasks that require complex sequences of inputs, the 'Send Sequence' action is highly recommended. It offers enhanced functionality and greater flexibility, enabling you to create more advanced and tailored automation sequences.