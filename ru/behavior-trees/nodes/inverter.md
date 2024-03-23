---
title: Inverter
description: 
published: true
date: 2024-03-23T22:57:07.662Z
tags: 
editor: markdown
dateCreated: 2024-03-07T23:20:14.981Z
---

Нода **Inverter**, или инвертор, является одной из базовых нод в деревьях поведения. Ее основная функция заключается в инвертировании результата выполнения своего дочернего узла. Если дочерний узел вернул Success, то Inverter вернет Failure, и наоборот. 

**Пример применения:**
![eyeauras_exsrmbzxzu.gif](/assets/eyeauras_exsrmbzxzu.gif)
Здесь нода **[Fixed Status](/ru/behavior-trees/nodes/fixed-status)** возвращает `Failure`, однако инвертер вернет `Success`.

**Работа:**
1. **Inverter** выполняет своего дочернего узла.
2. Если дочерний узел вернул `Success`, Inverter вернет `Failure`.
3. Если дочерний узел вернул `Failure`, Inverter вернет `Success`.
4. Если дочерний узел вернул `Running`, Inverter также вернет `Running`.