---
title: Sandbox
description: Testing and experimentation area
published: true
date: 2025-03-23T11:44:49.173Z
tags: sandbox, scripting, code execution, logging, dependency injection, ai-translated
editor: markdown
dateCreated: 2024-02-20T19:26:43.431Z
---
# What is this, exactly?

The sandbox is the environment where your scripts run. In code terms, it is the base class inherited by all user scripts, and it provides a certain amount of control over them.

# Why do you need it?

### It keeps **state** between runs

When you create a property or service, draw something on the screen, or recognize text, the sandbox stores and reuses data from previous runs so the same thing does not have to be created again and again. This improves performance and makes scripts easier to write.

### It cleans up after the script

When a script finishes, it is generally a good idea to clean up after it: free memory, remove drawings from the screen, and so on. But nobody likes cleanup work, so it is better to let the robots handle it for us.

That said, not everything created by scripts can be cleaned up automatically. This will be covered in a separate article about resource management.

![e0219e2e257a9878d5b6b2323dcb9c37.jpg](/assets/e0219e2e257a9878d5b6b2323dcb9c37.jpg =x200)

### It provides a set of basic functionality

To make life easier, every script comes with a small set of built-in services by default: logging, access to program files, and so on. To avoid unnecessary bloat, this built-in functionality is intentionally very limited.

The expectation is that you will use `GetService<>` to add whatever capabilities your script needs. More on that below.

# What does it look like in code?

Let’s go over the methods and properties available in every script.

## Logging

```csharp
IFluentLog Log { get; }
```

At some point, almost every script needs to report something back: current variable values, debug messages, and so on.

`Log` is responsible for that. You can use it to write messages both to the program log files and to the `Event Log` window.

Each log entry has one of these **levels**: **Debug**, **Info**, **Warn**, **Error**.

The higher the level, the more important the message is. **Error** is the most important. In `Event Log`, you can choose which minimum level should be displayed. By default, it shows **Info** and above.

```csharp 
Log.Info("Hello!"); 
Log.Debug("Hello from debug level!");
```

![](https://i.imgur.com/vWkUbVS.png =x300)

## For those who like to sleep

```csharp
void Sleep(TimeSpan delay);
void Sleep(int delayMs)
```

This method pauses script execution for the specified amount of time. Internally, it uses [Task.Delay](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.delay?view=net-8.0).

```csharp 
Sleep(2000); //приостанавливаем скрипт на 2 секунды
Sleep(TimeSpan.FromMilliseconds(100)); //приостанавливаем на 100 миллисекунд
```

> If the program asks the script to stop for some reason (for example, if the aura running the script is unloaded), `Sleep` will end early and the script will be stopped.
{.is-info}

![](https://i.imgur.com/TYwJwzi.png =x300)

## [Dependency Injection](/scripting/dependency-injection)

```csharp
T GetService<T>()
```

This is the most powerful method in the sandbox. It is your script’s connection to the outside world and the way to access different parts of the program’s functionality.

With `GetService`, you can request the “handles” that let you trigger one behavior or another.

Instead of a thousand words:

```csharp
var sendInput = GetService<ISendInputUnstableScriptingApi>();
sendInput.MouseMoveTo(200, 100); // передвинет мышь в Х200 Y100
sendInput.MouseRightClick(); // тыкнет правую кнопку мыши
```

```csharp
using PoeShared.Audio.Services; // важно указать! Так вы говорите, где именно искать эту службу. Для разных служб будет разным
var sound = GetService<IPlaySoundScriptingApi>();
sound.PlaySound(AudioNotificationType.Minions); // проиграет звук
```

---