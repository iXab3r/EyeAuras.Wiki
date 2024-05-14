---
title: Text Match Expressions
description: Powerful tool enabling text condition validation through Regex, Text, and Lambda evaluators.
published: true
date: 2024-05-14T11:15:09.978Z
tags: 
editor: markdown
dateCreated: 2023-06-18T12:37:30.883Z
---

Text Match Expressions in EyeAuras are versatile tools for validating and matching text-based conditions specified by users. There are three types of evaluators available: **Regex**, **Text**, and **Lambda**. 

These could be encountered in [Text Search](/en/triggers/images/text-search), [Network Message](/en/triggers/network-message), [Telegram Message](/en/triggers/telegram-message) and some other types of triggers

### **Text Evaluator**

The Text Evaluator works by performing a direct comparison with the specified text. It is case-sensitive, but you can choose to make it case-insensitive if you prefer.

![](/eyeauras_ruxbjypgds.png)

Here are some examples of how you can use the Text Evaluator:

-   **Match "Hello World"** Text to match: `**Hello World**` This will match only the exact string "Hello World".
-   **Match numeric string** Text to match: `**12345**`  This will match the string "12345". Note that it will not match the number 12345 typed without the quotes.
-   **Case insensitive match** Text to match: `**HELLO**`  With case-insensitivity turned on, this will match "hello", "Hello", "HELLO", etc.
-   **Match a sentence** Text to match: `**The quick brown fox jumps over the lazy dog**` This will match the entire sentence exactly as it is.

### **Regex Evaluator**

The Regex Evaluator allows you to utilize [regular expressions](https://regex101.com/) for more complex and flexible text matching conditions.

![](/eyeauras_jb1lvsh9pz.png)

Here are a few examples:

**Match any number** Regex to match: `**\d+**` This will match any string that represents a number, e.g., "123", "45678", etc.

**Match any word** Regex to match: `**\b\w+\b**` This will match any string that represents a word, e.g., "Hello", "World", etc.

**Match any two letters** Regex to match: `**\b[a-zA-Z]{2}\b**` This will match any string that represents exactly two letters, e.g., "ab", "cd", etc.

**Match any three numbers** Regex to match: `**\b\d{3}\b**` This will match any string that represents exactly three numbers, e.g., "123", "456", etc.

**Match any word starting with a specific letter** Regex to match: `**\bH\w*\b**` This will match any string that represents a word starting with the letter "H", e.g., "Hello", "Hi", etc.

**Match any word ending with a specific letter** Regex to match: `**\b\w*e\b**` This will match any string that represents a word ending with the letter "e", e.g., "code", "node", etc.

### **Lambda Evaluator**

The Lambda Evaluator is a powerful tool that enables you to write **C# Lambda** Expressions. This evaluator essentially converts a string to a boolean based on the conditions you set, offering a broad range of possibilities.

For example, you can create a lambda expression to check if a string is empty, if it contains specific characters, or even if it can be parsed into a number within a certain range.

![](/eyeauras_i9f6mfq9lz.png)

Here are a few examples:

-   **Check if the string is empty** Lambda expression: `**text => string.IsNullOrEmpty(text)**` This will return `**True**` for an empty string or `**Null**`, and `**False**` otherwise.
-   **Check if the string contains "Hello"** Lambda expression: `**text => text.Contains("Hello")**` This will return `**True**` if the string contains "Hello", and `**False**` otherwise.
-   **Check if the string length is less than 5** Lambda expression: `**text => text.Length < 5**` This will return `**True**` if the string length is less than 5, and `**False**` otherwise.
-   **Check if the string, when parsed into a number, is within a certain range** Lambda expression: `**text => double.Parse(text) >= 1 && double.Parse(text) <= 100**` This will return `**True**` if the string can be parsed into a number between 1 and 100, and `**False**` otherwise.

### Test Mode

Test Mode is a valuable feature that allows you to enter a string value and verify that your expression functions as expected, reducing the chance of errors. You can use it to fine-tune your expressions to suit your needs.

Remember that all evaluators operate on strings, and they're compatible with any Unicode-compatible language. There are no limitations to the type of expressions you can create, and EyeAuras will warn you if your expression is not valid.