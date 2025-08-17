---
title: CheckKeyState
description: 
published: true
date: 2025-08-17T08:36:34.854Z
tags: 
editor: markdown
dateCreated: 2025-08-17T08:36:34.854Z
---

**CheckKeyState** — это нода, которая проверяет нажата ли **сейчас** определённая клавиша на клавиатуре. Если нужная кнопка зажата в момент проверки, нода вернёт `Success`, если нет — `Failure`.

![CheckKeyState parameters](https://s3.eyeauras.net/media/2025/08/EyeAuras_dfgmUF8kNg.png)

## Как использовать

1. В настройках указываете нужную клавишу (параметр **Hotkey**).
2. Вставляете ноду в нужное место сценария.
3. При каждом запуске дерева или макроса будет происходить проверка:
    - Если кнопка нажата, CheckKeyState возвращает `Success`.
    - Если не нажата — `Failure`.
> Если вы не выбрали кнопку, результат будет всегда `Failure`.

## Пример
```
Sequence 
├── CheckKeyState (Hotkey = F1) 
├── DoSomethingWhileF1Pressed
```

В этом примере действия из DoSomethingWhileShiftPressed выполнятся только тогда, когда пользователь держит Shift.

## Для чего удобно?
- Создавать ветки в дереве, которые работают только по удержанию определённой клавиши, модифицируя поведения