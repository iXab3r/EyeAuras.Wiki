---
title: Dependency Injection
description: зависимости
published: true
date: 2025-03-23T11:52:03.455Z
tags: 
editor: markdown
dateCreated: 2025-03-23T11:44:34.759Z
---

# Зачем?
Чтобы использовать функционал программы из скриптов, нужно сначал получить "рычаги" для управления ("интерфейс").
Dependency Injection(DI) это основной механизм, которым предполагается взаимодействие скрипта с инфраструктурой EyeAuras.

## Init-only свойства (рекомендуемый способ)
```csharp
ISendInputScriptingApi SendInput { get; init; } //автоматически будет инициализировано при запуске скрипта

SendInput.MouseMoveTo(200, 100); // передвинет мышь в Х200 Y100
SendInput.MouseRightClick(); // тыкнет правую кнопку мыши
```

## Аттрибут `Dependency`
Если повесить на свойство этот аттрибут, то можно указать EyeAuras, чтобы прямо при старте данное свойство было инициализировано и готово к работе.
Ключевое отличие от варианта с Init-only в том, что свойство может иметь открытый `set`, т.е. может быть модифицировано ПОСЛЕ того, как скрипт запущен. Если у свойства указан только `init`, то из скрипта его модифицировать не получится.

```csharp
[Dependency] ISendInputScriptingApi SendInput { get; set; }

SendInput.MouseMoveTo(200, 100); // передвинет мышь в Х200 Y100
SendInput.MouseRightClick(); // тыкнет правую кнопку мыши
```

## GetService
Самый могучий метод в [песочнице](/ru/scripting/sandbox). Это связь вашего скрипта с внешним миром и возможность получить доступ к разным частям функционала программы.
Используя `GetService` вы можете запросить у программы ниточки, дергая за которые будете получать тот или иной эффект.
Вместо тысячи слов:

```csharp
var sendInput = GetService<ISendInputScriptingApi>();
sendInput.MouseMoveTo(200, 100); // передвинет мышь в Х200 Y100
sendInput.MouseRightClick(); // тыкнет правую кнопку мыши
```

А вот так можно получить интерфейс для проигрывания звуков
```csharp
using PoeShared.Audio.Services; // важно указать! Так вы говорите, где именно искать эту службу. Для разных служб будет разным
var sound = GetService<IPlaySoundScriptingApi>();
sound.PlaySound(AudioNotificationType.Minions); // проиграет звук
```
