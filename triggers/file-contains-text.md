---
title: File Contains Text
description: monitors specified files, applying Text Match Expressions to detect changes and activate accordingly
published: true
date: 2024-05-14T10:30:27.708Z
tags: 
editor: markdown
dateCreated: 2023-06-18T12:56:51.981Z
---

**File Contains Text** is designed to monitor changes in a specific file and react based on predefined conditions. It can be particularly useful when tracking updates in configuration files, logs, or any document where changes can determine significant events or actions.

### **Description**

The "File Contains Text" trigger observes a designated file and evaluates the contents using a [_Text Match Expression_](https://wiki.eyeauras.net/e/en/text-match-expressions). If the file contents meet the conditions defined in your Text Match Expression, the trigger activates. If the conditions are not met, the trigger deactivates.

In situations where the monitored file is inaccessible or non-existent, the trigger status transitions to an 'Unknown' state until the file becomes available or is found again.

### **Options**

**File Path:** Specify the file to monitor. This can be done by manually inputting the file path or selecting the file using the OpenFileDialog button.

[**Text Match Expression**](https://wiki.eyeauras.net/e/en/text-match-expressions)**:** Define the conditions that need to be met for the trigger to activate. This expression can be simple or complex, based on the requirement.

### **Use Cases**

**Configuration file changes:** If you have an application with a configuration file that alters regularly, the trigger can notify you when specific changes are made.

**Log file monitoring:** Set up a Text Match Expression to alert you when a certain error message appears in a log file, or track occurrences of specific events.

**Document updates:** Monitor changes in a document, triggering actions when specific text is added or removed.

### **Note**

The "File Contains Text" trigger monitors one file at a time. It is essential to ensure the monitored file is not moved, renamed, or deleted to maintain the trigger's active state. If such changes occur, the trigger status switches to 'Unknown' until the situation is resolved.