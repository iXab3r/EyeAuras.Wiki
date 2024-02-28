---
title: Articles Needed
description: Overview of the required articles for scripting functionalities and usage in the program.
published: true
date: 2024-02-20T22:29:52.393Z
tags: scripting, C#, .NET, Roslyn, WebUI, Dependency Injection, NuGet
editor: markdown
dateCreated: 2024-02-18T22:39:16.329Z
---

# General Topics
All scripts are placed in the Guides/example_name/ folder...
Ideally, most of each script should also be attached directly in the guide for indexing and searching.

## ~~[Script Overview v3](/ru/scripting/getting-started)~~
How they are structured, what is supported, etc. Technical details.  
Need to mention v2 *briefly

---

## ~~[Hello, World!](/ru/scripting/examples/basic/hello-world)~~
Can't do without it, simply print one line in the **Event Log**

---

## Super Short Overview of C# Syntax and How It Interacts with the Program (sandbox)
https://wiki.eyeauras.net/ru/scripting/sandbox

Loops, conditions, ultra-compressed chat-gpt guide on the language

---

## ~~Saving State Between Script Runs - Global Variables~~
https://wiki.eyeauras.net/ru/scripting/examples/basic/variables

Most scripts need to store intermediate data somewhere.
Need to describe what:
- local variables (`var ... = ...`)
- sandbox variables (`int Property {get;set;} = ...`)
- global variables (`Variables["name"] = ...`)
What is the difference between them, why they are needed, when to use, etc.
Also, a human-readable overview here https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IVariablesScriptingApi.html

---

## ~~Working with Auras - How to Find, How to Work with Them~~
https://wiki.eyeauras.net/ru/scripting/examples/basic/find-aura
https://wiki.eyeauras.net/ru/scripting/api/IAuraAccessor
https://wiki.eyeauras.net/ru/scripting/api/IAuraTreeScriptingApi

To access triggers and actions, you first need to find the auras they are in.
Overview of the AuraTree service, its methods, etc. Also need to describe how to read certain trigger properties (state, etc.)

---

## Accessing Internal Services and Functionality
Apart from the most basic things, to access functionality, you need to use a specific program interface.
So here will be an overview of the GetService<> method, which allows access to the internals by name.
Also, a brief list of useful services and ScriptingApi, as well as the main differences between them (stability, etc.)

---

## Overview of Send Input Scripting API
In general, explain the documentation https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html
Provide examples of a couple of simple programs (move the mouse to the center of the screen, draw something in Paint, type text)

---

## Overview of OnScreen Canvas Scripting API
Again, explain the documentation, draw something on the screen. https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IOnScreenCanvasScriptingApi.html
- a script that simply draws something on the screen
- a script that tracks the mouse and draws an overlay around it
- a script that displays custom HTML

---

## Script that clicks on an image by hotkey

## Multithreading in C# in the context of the eye
Async/await, when to use, what helpers are available, and how the program itself works with all this using the same scripts as examples