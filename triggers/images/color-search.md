---
title: Color Search
description: captures, analyzes the average color of a screen area, and triggers actions based on its similarity to a pre-selected color. Ideal for game resource monitoring.
published: true
date: 2024-05-14T11:17:37.160Z
tags: 
editor: markdown
dateCreated: 2023-06-17T12:25:45.794Z
---

The Color Search Trigger is an EyeAuras feature that allows users to capture a screen, window, or specific region, calculate the average color of the captured section, and then compare it to a predetermined color. The trigger activates when the measured similarity (match percentage) between the captured color and the chosen color is greater than or equal to a specified threshold. Users can opt for one of two methods to calculate color similarity - CIEDE2000 and Euclidean Distance.

### **Human Perception - CIEDE2000**

CIEDE2000 is a refined method for color comparison that mirrors human color perception. This technique, developed by the International Commission on Illumination (CIE), factors in the complex attributes of human vision and offers a highly accurate comparison of colors as perceived by the human eye.

Benefits:

-   Close approximation of human color perception.
-   Accurate results for a broad spectrum of colors.

Drawbacks:

-   More computationally demanding than simpler mathematical comparisons.

Ideal for: Applications requiring accurate color comparisons and a close approximation of human color perception, such as design software, photo editing, and color grading in videos.

### **Mathematical - Euclidean Distance**

Euclidean Distance employs a straightforward mathematical calculation to compare colors by measuring the straight-line distance in the RGB color space.

Benefits:

-   Quick and easy to compute.
-   Suitable for swift and less precise color comparisons.

Drawbacks:

-   Less accurate representation of human color perception.
-   Doesn't consider the non-linearity of human color perception.

Ideal for: Applications where speed outweighs a perfect color match, like real-time applications, simple color matching games, and quick prototyping.

### **Practical Applications**

The Color Search Trigger can be highly beneficial when you need to determine percentage values of game resources like HP/MP. By using the Image Effect on the captured image, you can convert a filled MP bar's color to white and an empty MP bar's color to black. Calculating the Euclidean Distance similarity between a fully-filled MP bar and a partially-filled one, you can accurately assess the remaining MP%. This enables efficient character management by triggering specific actions when HP/MP or other resources reach a particular percentage.

### **Match Threshold**

The match threshold is a user-set parameter that dictates when the trigger is activated. It represents the similarity level (in percentage) between the average color of the captured area and the chosen color. The trigger activates when the calculated similarity meets or surpasses this threshold.

Experimenting with different settings can help you strike the perfect balance between speed and accuracy for your application. The correct configuration can significantly boost the performance and utility of the Color Search Trigger.

### Gaming applications

-   **Enemy Detection**: In competitive FPS games, the Color Search Trigger can be used to detect enemy health bars or specific enemy uniforms and trigger actions like alerting the player or activating defensive abilities.
-   **Resource Management**: In strategy games where resource nodes are color-coded, this trigger can detect when new resources become available or when resources are depleted.
-   **Racing Games**: The trigger can detect changes in traffic light colors and automate the acceleration process, making a perfect start.
-   **Hidden Item Finder**: For games that feature hidden items or collectibles often marked with distinct colors, the Color Search Trigger can help locate them.
-   **Puzzle Solving**: In games with color-based puzzles, the trigger can detect the presence of specific colors and automate solutions.
-   **Environment Interaction**: In open-world games, the trigger can be used to interact with color-coded objects in the environment, automating repetitive actions.
-   **Platform Games**: The trigger can detect harmful elements (like red spikes in a platformer) and trigger avoidance actions.
-   **Health/Mana Bar Monitoring**: The trigger can monitor the color changes in health or mana bars in RPG games, triggering alerts or actions when they reach critical levels.
-   **Minimap Awareness**: In games with minimaps, the trigger can be set to detect certain color-coded events, such as enemy encounters or objectives, enhancing player's map awareness.
-   **Fishing Automation**: In games with fishing mechanics where a catch is indicated by a specific color change, the Color Search Trigger can automate the process.