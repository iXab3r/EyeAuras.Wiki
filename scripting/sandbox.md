---
title: Sandbox
description: Overview of the sandbox functionality for running scripts.
published: true
date: 2024-02-20T19:26:43.431Z
tags: sandbox, logging, sleep, dependency injection
editor: markdown
dateCreated: 2024-02-20T19:26:43.431Z
---

# What Is It Exactly?
The sandbox is where your scripts are executed. From a code perspective, it is a class that all user scripts inherit from and have some level of control over.

# Why Is It Needed?
### Stores **state** between runs
When you create a property or service, draw an image on the screen, or recognize text, the sandbox saves and reuses data from previous runs to avoid redundant creations. This improves performance and simplifies script writing.

### Cleans up script garbage
When a script finishes its work, it's good practice to clean up - free up memory, erase screen messages, etc. However, nobody likes cleaning up, so let the robots do it for us. However, not everything created by scripts can be cleaned up automatically. This will be covered in a separate article on resource management.
![e0219e2e257a9878d5b6b2323dcb9c37.jpg](/assets/e0219e2e257a9878d5b6b2323dcb9c37.jpg =x200)

### Provides a set of basic functionality
To make life easier, every script by default includes a set of basic services - the ability to write logs, work with program files, etc. However, to avoid accumulating unnecessary weight, this functionality is very limited. It is assumed that the user uses the GetService<> method to add any necessary capabilities to the script. More on this below.

# What's in the Code
Let's look at the methods and properties that any script has.

## Logging
```csharp
IFluentLog Log { get; }
```
Almost every script needs to provide some feedback at some point in its life cycle - current variable values, debug messages, etc.
`Log` is responsible for this. It allows you to write messages to program log files and the `Event Log` window.
Each log line has one of the **levels**: **Debug**, **Info**, **Warn**, **Error**. The higher the level, the more important the message, with **Error** being the most critical. By default, messages from **Info** level and above are displayed in the `Event Log`.

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
This method pauses script execution for the specified time. Internally, it uses [Task.Delay](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.delay?view=net-8.0).

```csharp 
Sleep(2000); // pause the script for 2 seconds
Sleep(TimeSpan.FromMilliseconds(100)); // pause for 100 milliseconds
```

> If for any reason the program requests the script to stop (e.g., the script aura is unloaded), `Sleep` will be interrupted in advance, and the script will be stopped.
{.is-info}

![](https://i.imgur.com/TYwJwzi.png =x300)

## Dependency Injection
```csharp
T GetService<T>()
```
The most powerful method in the sandbox. It connects your script to the outside world and allows access to various parts of the program's functionality.
By using `GetService`, you can request threads from the program, pulling which will give you a specific effect.
In place of a thousand words:

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

---