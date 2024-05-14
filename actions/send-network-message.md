---
title: Send Network Message
description: lets users transmit custom messages across specified network channels, coordinating tasks among applications or integrating third-party services.
published: true
date: 2024-05-14T09:51:08.430Z
tags: 
editor: markdown
dateCreated: 2023-06-18T14:40:18.159Z
---

The "Send Network Message" action is a powerful feature in EyeAuras that allows users to send custom messages over specified network channels. This can be useful in various contexts, such as coordinating tasks between different instances of an application, triggering events across different applications, or for integrating with third-party services and applications.

### **Options:**

**Channel:** This specifies the network channel that the message will be sent to. It can be any string value. The network channel works like a radio channel, where a message sent on one channel can be received by any trigger listening to that same channel. Click on a button to generate new random ID or input the channel manually if you already know it.

**Message:** This is the actual message that will be sent on the channel. It can be any string value.

### **Usage:**

**Define the channel and message:** In the EyeAuras interface, you can specify the network channel and the message to be sent when the action is executed.

**Send the message:** When the action is triggered, the message is sent over the specified network channel.

**Listen for the message:** Any instance of EyeAuras listening to that same channel can receive the message and trigger its own set of actions. This is done through the "[Network Message Trigger](/en/actions/send-network-message)", which is set to listen for messages on a specified channel.

The "Send Network Message" action is versatile and can be used in a variety of gaming and non-gaming contexts. For example, you could use it to synchronize actions between multiple instances of a game.

Remember, in order to receive and process a network message, you must set up a "[Network Message Trigger](/en/actions/send-network-message)" to listen to the specified channel and define the actions that should be taken upon receiving the message. You can refer to the documentation for the "[Network Message Trigger](/en/triggers/network-message)" for more details.

### Network messages broadcasting functionality (early-early alpha)

[Send Message](https://wiki.eyeauras.net/en/actions/send-network-message) / [Network Message](https://wiki.eyeauras.net/en/triggers/network-message) action/trigger pair is a powerful tool that can help you to build your own controllable network of inter-connected EyeAuras. This has been available for a few years at that point and is used mostly for multi-boxing (on multiple PCs) purposes.

What was always a problem is latency - all messages had to come through one of EyeAuras servers, which introduced latency. New broadcasting mode allows you to use your **local network** to exchange messages between PCs. This basically eliminates any latency.

The feature is still in early alpha and very rough on configuration side of things - you have to specify IP range manually. In final version this will probably be done automatically by software.

To use this new feature, set **ChannelId** to:

-   On **Server** EyeAuras (one that listens for messages) - set **broadcast://255.255.255.255/anychannelname**
-   On **Client** EyeAuras (one which sends messages) - set **broadcast://192.168.1.255/anychannelname**

**Important! 192.168.1.255 is an example, replace 192.168.1 with your actual subnet. You can leave the final “255” intact as this instructs the program to broadcast the message to whole subnet rather than to a specific IP**

p.s. by default, the program uses port **53082** for communications, you can pick any other port if you want right after **IP** in **ChannelId** (e.g. **broadcast://172.16.15.255:55055/mychannel**)

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