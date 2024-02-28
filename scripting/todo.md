---
title: What Articles Are Needed?
description: Overview of various scripting articles required for a guide, including script descriptions, syntax, working with auras, accessing internal services, and APIs for input and on-screen canvas scripting.
published: true
date: 2024-02-20T22:29:52.393Z
tags: scripting, programming, guides, syntax, auras, APIs, services, multithreading
editor: markdown
dateCreated: 2024-02-18T22:39:16.329Z
---

# General Topics
All scripts are placed in the Guides/example_name/ folder...
Ideally, a significant part of each script should also be attached directly to the guide for indexing and searching purposes.

## ~~[Script Descriptions v3](/ru/scripting/getting-started)~~
How they are structured, what is supported, etc. Technical details.
Need to mention v2 * briefly.

---

## ~~[Hello, World!](/ru/scripting/examples/basic/hello-world)~~
It wouldn't be complete without it, just print one line in the **Event Log**.

---

## Brief Overview of C# Syntax and How It Relates to the Program (Sandbox)
https://wiki.eyeauras.net/ru/scripting/sandbox

Loops, conditions, a super-compressed chatbot guide on the language.

---

## ~~Saving State Between Script Runs - Global Variables~~
https://wiki.eyeauras.net/ru/scripting/examples/basic/variables

Most scripts need to store intermediate data somewhere.
Need to describe what:
- local variables (`var ... = ...`)
- sandbox variables (`int Property {get;set;} = ...`)
- global variables (`Variables["name"] = ...`)
What the differences are, why they are needed, when to use them, etc.
Also, a human-readable overview here: https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IVariablesScriptingApi.html

---

## ~~Working with Auras - How to Find and Interact with Them~~
https://wiki.eyeauras.net/ru/scripting/examples/basic/find-aura
https://wiki.eyeauras.net/ru/scripting/api/IAuraAccessor
https://wiki.eyeauras.net/ru/scripting/api/IAuraTreeScriptingApi

To access triggers and actions, you first need to find the auras they are in.
Overview of the AuraTree service, its methods, etc. Also, describe how to read some trigger properties (state, etc.) here.

---

## Accessing Internal Services and Functionality
Besides the most basic things, to access functionality, you need to use a specific program interface.
So here will be an overview of the GetService<> method, which allows access to internals by name.
Also, a brief list of useful services and ScriptingApi, as well as the main difference between them (stability, etc.).

---

## Overview of Send Input Scripting API
In general, explain the documentation: https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html
Provide examples of a couple of simple programs (move the mouse to the center of the screen, draw something in Paint, type text).

---

## Overview of OnScreen Canvas Scripting API
Again, explain the documentation, draw something on the screen. https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IOnScreenCanvasScriptingApi.html
- a script that simply draws something on the screen
- a script that tracks the mouse and draws an overlay around it
- a script that displays custom HTML

---

## Script that Clicks on an Image Using a Hotkey

## Multithreading in C# in the Context of Eye
Async/await, when to use, what helpers are available, and how the program itself works with all of this using the same scripts as examples.