---
title: Узлы
description: Что это такое, как они работают и что нужно подготовить
published: true
date: 2025-08-17T09:32:39.778Z
tags: programming, behavior trees, nodes, logic, ai-translated
editor: markdown
dateCreated: 2024-03-07T15:12:13.483Z
---
Дерево поведения полностью состоит из нод (узлов). Каждая нода выполняет какое-то действие: нажимает кнопки, проверяет условия и так далее.

## Статусы выполнения

Все ноды по результату выполнения возвращают один из статусов:

- **Success** — действие успешно выполнено: кнопка нажата, изображение найдено и т. п.
- **Failure** — произошло обратное: выполнить действие не удалось или условие не выполнено.
- **Running** — нода уже начала работу, но ещё не завершила её. Это происходит, когда действие занимает больше одного тика. Обычно в таком случае всё дерево ждёт, пока нода не закончит работу и не вернёт **Success** или **Failure**. Классический пример — нода [Wait](/ru/behavior-trees/nodes/wait), которая просто задерживает выполнение дерева на указанное время.

## Типы нод

- [Root](/ru/behavior-trees/nodes/root) — корень всего дерева, содержит общие настройки.
- [Sequence](/ru/behavior-trees/nodes/sequence) — перебирает дочерние ноды, пока не встретит ту, которая вернёт `Failure`.
- [Selector](/ru/behavior-trees/nodes/selector) — перебирает дочерние ноды, пока не встретит ту, которая вернёт `Success`.
- [Aura Is Active](/ru/behavior-trees/nodes/aura-is-active) — позволяет указать одну или несколько аур, которые будут использоваться как условия для ноды.
- [Execute Aura](/ru/behavior-trees/nodes/execute-aura) — задаёт ауру, действия которой будут выполнены при запуске ноды.
- [Key Press](/ru/behavior-trees/nodes/KeyPress) — нажимает клавишу или сочетание клавиш.
- [Wait](/ru/behavior-trees/nodes/wait) — приостанавливает выполнение дерева на указанное время.
- [Cooldown](/ru/behavior-trees/nodes/cooldown) — не позволяет конкретной ноде выполняться слишком часто.
- [Inverter](/ru/behavior-trees/nodes/inverter) — инвертирует статус дочерней ноды (`Success` => `Failure` и наоборот).
- [Force Failure](/ru/behavior-trees/nodes/force-failure) — выполняет дочернюю ноду, но всегда возвращает `Failure`.
- [Force Success](/ru/behavior-trees/nodes/force-success) — выполняет дочернюю ноду, но всегда возвращает `Success`.
- [Until Success](/ru/behavior-trees/nodes/until-success) — выполняет дочернюю ноду до тех пор, пока она не вернёт `Success`.
- [Fixed Status](/ru/behavior-trees/nodes/fixed-status) — вспомогательная нода, позволяющая задать фиксированный статус, который она будет возвращать; полезно для отладки и настройки.
- [Comment](/ru/behavior-trees/nodes/comment) — позволяет оставлять комментарии к логике прямо в дереве.