---
title: Ноды
description: что такое, как работают и с чем готовить
published: true
date: 2024-03-08T10:20:41.733Z
tags: 
editor: markdown
dateCreated: 2024-03-07T15:12:13.483Z
---

Дерево поведения целиком состоит из узлов ("нод"), каждая из который что-то умеет - жать кнопки, проверять условия и т.п. 

## Success/Failure
Абсолютно все ноды по результатам выполнения возвращают статус - это может быть:
- **Success** - кнопка нажалась, картинка нашлась и т.п. 
- **Failure** - тут ровно наоборот - что-то не вышло сделать (выбрать действие или условие не выполнено)
- **Running** - нода начала работу, но еще не закончила. Так бывает, когда действие, которое делает нода занимает какое-то длительное время, т.е. больше одного тика. Обычно это значит, что все дерево будет дожидаться, пока нода не закончит свою работу вернув **Success** или **Failure**. Классический пример - нода [Wait](/ru/behavior-trees/nodes/wait), которая просто тормозит все дерево, пока не пройдет указанное время
 

## Какие бывают
- [Root](/ru/behavior-trees/nodes/root) - корень всего дерева, содержит общие настройки
- [Sequence](/ru/behavior-trees/nodes/sequence) - обходит дочерние ноды до тех пор, пока не найдут ту, которая вернет `Failure`
- [Selector](/ru/behavior-trees/nodes/selector) - обходит дочерние ноды до тех пор, пока не найдет ту, которая вернет `Success`
- [Aura Is Active](/ru/behavior-trees/nodes/aura-is-active) - позволяет аказывать одну или несколько аур, которые будут служить условиями для ноды
- [Execute Aura](/ru/behavior-trees/nodes/execute-aura) - позволяет указывать ауру, действия которой будут выполнены при запуске ноды
- [Key Press](/ru/behavior-trees/nodes/key-press) - нажимает на клавишу или комбинацию клавиш
- [Wait](/ru/behavior-trees/nodes/wait) - приостанавливает выполнение дерева на указанное время
- [Cooldown](/ru/behavior-trees/nodes/cooldown) - предотвращает слишком частое выполнение той или иной ноды
- [Inverter](/ru/behavior-trees/nodes/inverter) - инвертирует состояние дочерней ноды (`Success` => `Failure` и наоборот)
- [Force Failure](/ru/behavior-trees/nodes/force-failure) - выполняет дочернюю ноду, но всегда возвращает `Failure`
- [Force Success](/ru/behavior-trees/nodes/force-success) - выполняет дочернюю ноду, но всегда возвращает `Success`
- [Until Success](/ru/behavior-trees/nodes/until-success) - выполняет дочернюю ноду до тех пор, пока она не вернет `Success`
- [Fixed Status](/ru/behavior-trees/nodes/fixed-status) - вспомогательная нода, позволяет жестко задать статус, который вернет нода, помогает при отладке/настройке
- [Сomment](/ru/behavior-trees/nodes/comment) - позволяет писать комментарии к логике прямо в дереве

