---
title: Fixed Status
description: 
published: true
date: 2024-03-07T23:24:16.618Z
tags: 
editor: markdown
dateCreated: 2024-03-07T23:24:16.618Z
---

Нода **Fixed Status** позволяет явно задать желаемое состояние, которое будет возвращаться при выполнении данной ноды. Это полезно для отладки, тестирования и контроля прохождения определенных участков в деревьях поведения.

**Примеры применения:**
1. **Пример 1:**
   ```
   Fixed Status: Success
   ```
   В данном примере нода **Fixed Status** всегда будет возвращать состояние `Success`.

2. **Пример 3:**
   ```
   Fixed Status: Running
   ```
   В данном примере нода **Fixed Status** всегда будет возвращать состояние `Running`. 
> Важно! Большинство композитных нод, таких как [Selector](/ru/behavior-trees/nodes/selector) и [Sequence](/ru/behavior-trees/nodes/sequence), при встрече `Running` будут блокировать выполнение дерева, пока нода на вернет `Success` или `Failure`. Так что используйте этот статус аккуратно.
{.is-warning}

