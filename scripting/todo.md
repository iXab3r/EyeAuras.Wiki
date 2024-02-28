---
title: Types of Articles Needed
description: A list of article topics required for scripting guides, including syntax overview, state persistence, working with auras, accessing internal services, and API reviews.
published: true
date: 2024-02-20T22:29:52.393Z
tags: scripting, C#, .NET, EyeAuras, API, guides
editor: markdown
dateCreated: 2024-02-18T22:39:16.329Z
---

# General Topics
All scripts are placed in the Guides/example_name/ folder...
Ideally, most of each script should also be attached directly in the guide for indexing and searching.

## ~~[Scripting Overview v3](/ru/scripting/getting-started)~~
How they are structured, what is supported, etc. Technical details.  
Need to mention v2 *briefly

---

## ~~[Hello, World!](/ru/scripting/examples/basic/hello-world)~~
Can't do without it, simply print one line in the **Event Log**

---

## Super Brief Syntax Overview of C# and How It Fits with the Program (sandbox)
https://wiki.eyeauras.net/ru/scripting/sandbox

Loops, conditions, an ultra-compressed cheat sheet guide on the language

---

## ~~Persisting State Between Script Runs - Global Variables~~
https://wiki.eyeauras.net/ru/scripting/examples/basic/variables

Most scripts need to store intermediate data somewhere
Need to describe what:
- local variables (`var ... = ...`)
- sandbox variables (`int Property {get;set;} = ...`)
- global variables (`Variables["name"] = ...`)
What the differences are, why they are needed, when to use them, etc.
Also, a human-readable overview here https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IVariablesScriptingApi.html

---

## ~~Working with Auras - How to Find, How to Work with Them~~
https://wiki.eyeauras.net/ru/scripting/examples/basic/find-aura
https://wiki.eyeauras.net/ru/scripting/api/IAuraAccessor
https://wiki.eyeauras.net/ru/scripting/api/IAuraTreeScriptingApi

To access triggers and actions, you first need to find the auras they are in.
Overview of the AuraTree service, its methods, etc. Also, describe how to read certain trigger properties (state, etc.)

---

## Accessing Internal Services and Functionality
Apart from the most basic things, to access functionality, you need to use a specific program interface.
So here will be an overview of the GetService<> method, which allows access to the program's internals by name.
Also, a brief list of useful services and ScriptingApi, as well as the main differences between them (stability, etc.)

---

## Overview of Send Input Scripting API
In general, dissect the documentation https://docs.eyeauras.net/api/EyeAuras.Roxy.Api.ISendInputUnstableScriptingApi.html
Provide examples of a couple of simple programs (move the mouse to the center of the screen, draw something in Paint, type text)

---

## Overview of OnScreen Canvas Scripting API
Again, dissect the documentation, draw something on the screen. https://docs.eyeauras.net/api/EyeAuras.Scripting.Api.IOnScreenCanvasScriptingApi.html
- a script that simply draws something on the screen
- a script that tracks the mouse and draws an overlay around it
- a script that displays custom HTML

---

## Script that clicks on an image using a hotkey

## Multithreading in C# in the context of EyeAuras
Async/await, when to use, what helpers are available, and how the program itself handles all this with examples of the same scripts