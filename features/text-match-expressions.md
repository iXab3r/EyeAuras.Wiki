---
title: Text Matching Expressions
description: A powerful tool for evaluating text conditions with Regex, Text, and Lambda evaluators.
published: true
date: 2025-03-12T23:03:19.007Z
tags: text, выражения, текст, оценщики, regex, lambda, ai-translated
editor: markdown
dateCreated: 2023-06-18T12:37:30.883Z
---
# Text Matching Expressions

Text matching expressions in EyeAuras are flexible tools for checking text-based conditions defined by the user. Three evaluator types are available: **Regex**, **Text**, and **Lambda**.

You may encounter them in [Text Search](/triggers/images/text-search), [Network Message](/triggers/network-message), [Telegram Message](/triggers/telegram-message), and some other trigger types.

## Text evaluator

The Text evaluator compares input directly against the specified text. It is case-sensitive by default, but you can enable case-insensitive matching if needed.

![](/eyeauras_ruxbjypgds.png)

Examples:

- **Match `Hello, world`**  
  Match text: `Hello, world`  
  This matches only the exact string `Hello, world`.

- **Match a numeric string**  
  Match text: `12345`  
  This matches the string `12345`. Note that it will not match the number `12345` entered without quotes.

- **Case-insensitive match**  
  Match text: `HELLO`  
  With case-insensitive mode enabled, this matches `hello`, `Hello`, `HELLO`, and so on.

- **Match a sentence**  
  Match text: `The quick brown fox jumps over the lazy dog`  
  This matches the full sentence exactly as written.

## Regex evaluator

The Regex evaluator lets you use [regular expressions](https://regex101.com/) for more advanced and flexible text matching.

![](/eyeauras_jb1lvsh9pz.png)

Examples:

- **Match any number**  
  Regex: `\d+`  
  This matches any string representing a number, such as `123`, `45678`, and so on.

- **Match any word**  
  Regex: `\b\w+\b`  
  This matches any string representing a word, such as `Hello`, `World`, and so on.

- **Match any two letters**  
  Regex: `\b[a-zA-Z]{2}\b`  
  This matches any string containing exactly two letters, such as `ab`, `cd`, and so on.

- **Match any three digits**  
  Regex: `\b\d{3}\b`  
  This matches any string containing exactly three digits, such as `123`, `456`, and so on.

- **Match any word that starts with a specific letter**  
  Regex: `\bH\w*\b`  
  This matches any word that starts with `H`, such as `Hello`, `Hi`, and so on.

- **Match any word that ends with a specific letter**  
  Regex: `\b\w*e\b`  
  This matches any word that ends with `e`, such as `code`, `node`, and so on.

## Lambda evaluator

The Lambda evaluator is a powerful tool that lets you write **C# lambda expressions**. It effectively converts a string into a boolean value based on the conditions you define, which gives you a very wide range of possibilities.

For example, you can create a lambda expression to check whether a string is empty, whether it contains specific characters, or whether it can be converted into a number within a certain range.

![](/eyeauras_i9f6mfq9lz.png)

Examples:

- **Check whether a string is empty**  
  Lambda expression: `text => string.IsNullOrEmpty(text)`  
  This returns `True` for an empty string or `null`, and `False` otherwise.

- **Check whether a string contains `Hello`**  
  Lambda expression: `text => text.Contains("Hello")`  
  This returns `True` if the string contains `Hello`, and `False` otherwise.

- **Check whether the string length is less than 5**  
  Lambda expression: `text => text.Length < 5`  
  This returns `True` if the string length is less than 5, and `False` otherwise.

- **Check whether the string can be converted to a number within a specific range**  
  Lambda expression: `text => double.Parse(text) >= 1 && double.Parse(text) <= 100`  
  This returns `True` if the string can be converted to a number from 1 to 100, and `False` otherwise.

## Testing mode

Testing mode is a useful feature that lets you enter a string value and verify that your expression works as expected, reducing the chance of errors. You can use it to fine-tune expressions for your needs.

Keep in mind that all evaluators work with strings and are compatible with any Unicode-supported language. There are no restrictions on the types of expressions you can create, and EyeAuras will warn you if an expression is invalid.