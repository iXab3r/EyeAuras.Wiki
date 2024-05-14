---
title: Mouse Input Smoothing
description: 
published: true
date: 2024-05-14T18:37:54.663Z
tags: 
editor: markdown
dateCreated: 2022-12-25T20:38:37.667Z
---

## Why do I need it?

In real-world mouse movement is not instant and is usually determined by how often your device reports its position to OS. For gaming devices, it could be in range of hundreds and even thousands of input events per second. 

This makes our mouse movement to appear smooth even when you do 360-no-scope-flickshot. And applications know for a fact, that there is almost never such thing as instant “teleports" of cursor (still possible if OS or app is lagging). 

Considering the fact that EyeAuras is able to simulate mouse input it has to “mask” simulated input and make it appear to OS like “real” input. This where smoothing comes into play - it makes instant movement from point A to point B look more human by injecting dozens of extra inputs instead of straight A → B

##   
How to use User Input Smoothing?

This is configured in **Advanced** section of **SendInput/Sequence/Text** actions. 

By default, smoothing is disabled. This was the only option for versions of up to **1.2.4153 (Dec 2022).**

There are multiple algorithms(described below), pick one that fits you best by trial-and-error approach. In most cases **Randomized Fast** should work just fine. 

## Smoothing algorithms

### Disabled

No smoothing is applied, mouse movement is instantaneous.

### Linear

Makes linear approximation of mouse movement. Does not look very human to a naked eye, but enough to fool protection and input-detection systems in most games. 

![](/g100_wnd1_w5-10_s10_a1.gif)

### Randomized

Applies random seed to all inputs making it look much more humane. 

![](/g6_wnd2_w1-5_s10_a10.gif)