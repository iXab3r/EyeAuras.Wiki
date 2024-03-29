---
title: Force Success
description: 
published: true
date: 2024-03-07T23:34:41.471Z
tags: 
editor: markdown
dateCreated: 2024-03-07T23:34:41.470Z
---

Нода **Force Success** является декоратором в деревьях поведения. Она всегда возвращает состояние `Success`, независимо от результата выполнения дочерней ноды. 

**Пример использования:**
```
Force Success
    └── Дочерняя Нода (Failure)
```

**Описание работы:**
1. Eсли дочерняя нода вернула `Success`, **Force Success** также вернет `Success`.
2. Если дочерняя нода вернула Failure, **Force Success** все равно вернет `Success`.
3. Если дочерняя нода вернула Running, **Force Success** вернет `Running` - это дает возможность дочерней ноде отработать до конца.

**Примечание:**
Force Success может быть использована, например, для обеспечения успешного завершения определенного действия в игровом боте, даже если это действие не выполнено корректно.