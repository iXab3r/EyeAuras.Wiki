---
title: Window Match Expressions
description: A user interface in EyeAuras, enabling selection of specific windows using a custom expression.
published: true
date: 2024-05-14T11:14:59.400Z
tags: 
editor: markdown
dateCreated: 2023-06-18T11:57:49.061Z
---

The Window Matching Expression Control is a concept and a user interface component in EyeAuras. It allows you to define an expression to select specific window(s) based on various criteria. These expressions are supported across all actions/triggers in EyeAuras and allow you to control where to send inputs, what window should be active, what window to screenshot/record, etc.

![](/eyeauras_zjebk8jadf.png)

### Components

This control includes three components:

**Window Selection Dropdown**: Clicking a small icon triggers a dropdown list of all active windows. Selecting a window from this list generates a matching expression by window handle or title.

**Expression Input Box**: A text input field for entering a matching expression. The system parses this expression to determine the window(s) to select.

**Picked Window Display**: This area displays the selected window(s) based on the defined expression. A tooltip with detailed window information appears when hovering over the display, aiding refinement of the expression.

### **Creating a Matching Expression**

Expressions can be manually entered into the input box. The system interprets these expressions as matching criteria. Here are examples:

-   **Plain text**: Entering "test" matches all windows with "test" in the title, using a case-insensitive partial-match search.
-   **Strict text match**: Quoting text with single (' ') or double (" ") quotes enforces an exact, case-sensitive match. For example, 'test' matches windows titled "test" only.
-   **Regular expression match**: Text formatted as /expression/ is treated as a regular expression to match window titles based on patterns.
-   **By handle**: You can specify the window's handle directly. Hexadecimal (e.g., 0xA) or "&H" prefixed (e.g., &HA) inputs match a window by its handle. Note that handles can change each time the window or application restarts.
-   **By Index**: Adding "#number" to an expression selects a window by its index. For example, "test #2" selects the second window with "test" in its title. "#2" selects the second window in the dropdown list.

The system then shows the selected window(s) in the Picked Window Display.

The Window Matching Expression Control simplifies the process of customizing your experience with EyeAuras.

### Examples

Expression: `**"Explorer"**` Result: Matches the window titled exactly "Explorer".

Expression: `**"/fire/"**` Result: Matches all windows with "fire" in their title, ignoring case sensitivity.

Expression: `**"Explorer" #2**` Result: Matches the second window titled exactly "Explorer".

Expression: `**"Mail" #1**` Result: Matches the first window titled "Mail".

Expression: `**0x5A**` Result: Matches the window with handle hexadecimal value 5A.

Expression: `**"paint"**` Result: Matches all windows with "paint" in their title.

Expression: `**"/^Notepad/"**` Result: Matches all windows where the title begins with "Notepad".

Expression: `**&H2B**` Result: Matches the window with handle hexadecimal value 2B.

Expression: `**"/chrome$/"**` Result: Matches all windows where the title ends with "chrome".

Expression: `**"Calculator" #3**` Result: Matches the third window titled exactly "Calculator".

Expression: `**"Excel" #1**` Result: Matches the first window titled "Excel".

Expression: `**"/Microsoft/"**` Result: Matches all windows with "Microsoft" in their title, ignoring case sensitivity.

Expression: `**0xA1F**` Result: Matches the window with handle hexadecimal value A1F.

Expression: `**"/^Google Chrome/"**` Result: Matches all windows where the title begins with "Google Chrome".

Expression: `**#5**` Result: Matches the fifth window in the dropdown list.

Expression: `**"Firefox #2"**` Result: Matches the second window titled exactly "Firefox".

Expression: `**&H7C**` Result: Matches the window with handle hexadecimal value 7C.

Expression: `**#1**` Result: Matches the first window in the dropdown list.

Expression: `**"/.*/"**` Result: Matches all windows as it's a regular expression for any character.