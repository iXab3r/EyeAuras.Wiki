---
title: Network Message
description:  listens for user-specified messages sent across EyeAuras instances, allowing for synchronized control and data sharing
published: true
date: 2024-05-14T10:19:28.993Z
tags: 
editor: markdown
dateCreated: 2023-06-18T13:14:07.916Z
---

### **Overview**

The Network Message trigger allows an instance of EyeAuras to listen for messages sent from another instance. The instances communicate through uniquely identified channels. Users can utilize [_Text Match Expressions_](https://wiki.eyeauras.net/e/en/text-match-expressions) to create conditions that activate or deactivate the trigger based on the content of the received message.

### **Usage**

To set up a Network Message trigger:

1.  Select or generate a unique ID for the channel you want to listen to. You can manually enter the ID or click the button to generate it automatically.
2.  Choose the [_Text Match Expression_](https://wiki.eyeauras.net/e/en/text-match-expressions) to specify the conditions for the message content.

By default, the trigger changes its state (Active or Inactive) whenever a message fulfilling the Text Match Expression condition is received. Alternatively, you can opt to set a different Text Match Expression for deactivation by checking the "Deactivate on message" box.

### Network messages broadcasting functionality (early-early alpha)

[Send Message](https://wiki.eyeauras.net/en/actions/send-network-message) / [Network Message](https://wiki.eyeauras.net/en/triggers/network-message) action/trigger pair is a powerful tool that can help you to build your own controllable network of inter-connected EyeAuras. This has been available for a few years at that point and is used mostly for multi-boxing (on multiple PCs) purposes.

What was always a problem is latency - all messages had to come through one of EyeAuras servers, which introduced latency. New broadcasting mode allows you to use your **local network** to exchange messages between PCs. This basically eliminates any latency.

The feature is still in early alpha and very rough on configuration side of things - you have to specify IP range manually. In final version this will probably be done automatically by software.

To use this new feature, set **ChannelId** to:

-   On **Server** EyeAuras (one that listens for messages) - set **broadcast://255.255.255.255/anychannelname**
-   On **Client** EyeAuras (one which sends messages) - set **broadcast://192.168.1.255/anychannelname**

**Important! 192.168.1.255 is an example, replace 192.168.1 with your actual subnet. You can leave the final “255” intact as this instructs the program to broadcast the message to whole subnet rather than to a specific IP**

p.s. by default, the program uses port **53082** for communications, you can pick any other port if you want right after **IP** in **ChannelId** (e.g. **broadcast://172.16.15.255:55055/mychannel**)

### **Considerations**

-   The program requires internet access as the communication between instances is facilitated through EyeAuras' servers.
-   The choice between the "Server Hub" (RU or EU) doesn't affect the reception of messages but could influence the latency.
-   The maximum size for a single message is 100Kb.

### **Examples**

**Multi-Character MMO Control**

Suppose you're controlling multiple characters in an MMO running on separate PCs. By setting a HotkeyIsActive trigger and "Send network message" action, you can control all your characters simultaneously. Sending the message "start" would make your characters follow you, assist, gather loot, etc. Sending "stop" halts their actions.

**Information Gathering**

In a similar setting, you could configure your bots to listen to a specific message, e.g., "report". Upon receiving this message, they could send back information such as their online time, total amount of EXP/gold farmed since the last report, etc. This allows for quick and efficient information gathering without the need to individually log into each PC.

**Remote Control for Presentation**

In a professional setting, you could use EyeAuras to remotely control a presentation. You can configure your EyeAuras instance to listen for messages such as "next", "previous", or "slide\_number". These can be linked to actions that simulate pressing the right/left arrow keys or inputting a specific slide number, effectively allowing you to control the presentation remotely.

**Home Automation System**

If you have a home automation system set up with the help of EyeAuras, you could use the Network Message trigger to synchronize actions across different systems. For instance, a message like "lights\_on" could activate triggers that switch on lights in different rooms.

The Network Message trigger, paired with the "Send network message" action, provides a powerful tool for communication and synchronization between different EyeAuras instances. This feature is highly flexible, allowing users to establish complex network protocols and remote control setups tailored to their needs.