---
title: Default Properties
description: is a way to configure target window or any other common property on a folder level
published: true
date: 2024-05-14T11:16:25.203Z
tags: 
editor: markdown
dateCreated: 2023-02-15T19:56:35.160Z
---

### Configuring defaults via UI

Default properties are an answer to a problem that existed for quite a long time in EyeAuras - “How do I change bunch of properties of ALL auras in a quick and convenient way?”.   
Previously there were multiple solutions - cloning, Bindings, scripts. None of them were user-friendly enough, especially for new users. 

Default properties were developed to change that and make simple operations (like changing Target Window of all auras), well… simple. 

First of all, they are directly linked to Folders, thus you'll need for you auras to be in a folder to use this functionality. It makes sense as Eye Auras is pushing you to keep auras in some organized way anyways. 

After you've created a folder there will be a separate section called “Triggers/Actions/Overlays Defaults”:

![](/trtr5ma[1].png)

This section will contains all properties which could be set as Default, it is possible to put ANY property of any type of trigger/action/overlay there, but I've decided to start with 3 that were requested most often. 

Each property has a checkbox, which basically “enables” folder to propagate selected value to all Auras inside it. Having all checkboxes unchecked is exactly the same state as it was before this change. 

If you've configured some property to have a default value, all new triggers/actions/overlays will have corresponding property set to value that was specified at folder level. Moreover, if you'll change Default value to something else, child auras will automatically update their values as well. 

For already existing auras though nothing will change. There are three ways of resetting some trigger's property to configured default value:

1.  Right click on small black box to the right of property and click "Reset to Default" (available only if there is no active binding)
2.  Left click on the same box and click “Default” in bindings editor
3.  On Folder page, hover on desired property and click "Apply to All", this will reset properties of ALL child auras to default, basically same as clicking "Reset to Default" on each one individually

![](/sb8y4cj[1].png)

![](/51tmde2[1].png)

### Accessing via Scripts

TBA