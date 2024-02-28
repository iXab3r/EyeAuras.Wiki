---
title: Sandbox
description: An overview of the sandbox feature, its purpose, and functionality in scripting.
published: true
date: 2024-02-20T19:26:43.431Z
tags: sandbox, scripting, code execution, logging, dependency injection
editor: markdown
dateCreated: 2024-02-20T19:26:43.431Z
---

# What Is It Exactly?
A sandbox is a tool where your scripts are executed. From a code perspective, it's a class that serves as the base for all user scripts, providing a level of control over them.

# Why Is It Needed?
### Preserves **State** Between Executions
When you create a property or service, draw an image on the screen, or recognize text, the sandbox saves and reuses data from previous executions to avoid redundant operations. This enhances performance and simplifies script writing.

### Cleans Up After the Script
When a script finishes its task, it's good practice to clean up - free up memory, clear screen messages, etc. Since nobody likes cleaning up, let robots handle it for us. However, not everything created by scripts can be cleaned automatically. This will be covered in a separate article on resource management.
![e0219e2e257a9878d5b6b2323dcb9c37.jpg](/assets/e0219e2e257a9878d5b6b2323dcb9c37.jpg =x200)
 
### Provides a Set of Basic Functionality
To simplify scripting, every script comes with a default set of basic services - logging capabilities, file operations, etc. However, to avoid unnecessary complexity, this functionality is very limited. It's expected that users use the GetService<> method to add any required capabilities to the script. More on this below.
 
# What's in the Code?
Let's explore the methods and properties present in any script.

## Logging
```csharp
IFluentLog Log { get; }
```
Most scripts need to provide feedback at some point - current variable values, debug messages, etc. 
`Log` handles this by allowing messages to be written to program log files or the `Event Log` window.
Each log entry has one of the following **levels**: **Debug**, **Info**, **Warn**, **Error**. The higher the level, the more critical the message, with **Error** being the most crucial. You can adjust which level of messages to display in the `Event Log`, defaulting to **Info** and above.

```csharp 
Log.Info("Hello!"); 
Log.Debug("Hello from debug level!");
```

![](https://i.imgur.com/vWkUbVS.png =x300)

## Sleep Enthusiasts
```csharp
void Sleep(TimeSpan delay);
void Sleep(int delayMs)
```
This method pauses script execution for a specified time. Internally, it uses [Task.Delay](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.delay?view=net-8.0).

```csharp 
Sleep(2000); // pause the script for 2 seconds
Sleep(TimeSpan.FromMilliseconds(100)); // pause for 100 milliseconds
```

> If for any reason the program requests the script to stop (e.g., unloading the script's aura), `Sleep` will terminate early, halting the script.
{.is-info}

![](https://i.imgur.com/TYwJwzi.png =x300)

## Dependency Injection
```csharp
T GetService<T>()
```
The most powerful method in the sandbox. It connects your script to the outside world, allowing access to various parts of the program's functionality.
By using `GetService`, you can request threads from the program that, when pulled, produce different effects.
In short:

```csharp
var sendInput = GetService<ISendInputUnstableScriptingApi>();
sendInput.MouseMoveTo(200, 100); // moves the mouse to X200 Y100
sendInput.MouseRightClick(); // right-clicks the mouse
```

```csharp
using PoeShared.Audio.Services; // important to specify! This tells where to find this service. It will vary for different services
var sound = GetService<IPlaySoundScriptingApi>();
sound.PlaySound(AudioNotificationType.Minions); // plays a sound
```