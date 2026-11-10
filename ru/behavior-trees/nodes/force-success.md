---
title: Force Success
description: 
published: true
date: 2024-03-07T23:34:41.471Z
tags: 
editor: markdown
dateCreated: 2024-03-07T23:34:41.470Z
---

# Force Success — продолжить после неудачного шага

Если необязательная проверка вернула `Failure`, но последовательность должна идти дальше, поместите её под `Force Success`. Он меняет завершённый результат ребёнка на `Success`, сохраняя `Running`, пока работа продолжается. Саму неудачную операцию узел не исправляет.

## Пропустить неудачу в своей последовательности

Создайте отдельное дерево по [первому примеру](/ru/behavior-trees/gettings-started). У входа оставьте `Activation → Is Loaded` и `Execution → When Activated → Do nothing`, чтобы выполнять только ручные тики.

1. Через `Add new Node` добавьте `Sequence`, `Force Success` и два `Fixed Status`. Соедините узлы по схеме; дети Sequence расположены слева направо.
2. У ребёнка Force Success выберите `General → Status → Failure`, у последнего узла — `Success`. Выделите Force Success и проверьте, что в `General → Child` указан нужный ребёнок.

```text
My Tree
└─ Sequence
   ├─ Force Success
   │  └─ Fixed Status: Failure
   └─ Fixed Status: Success
```

3. Нажмите верхнюю `Tick BT Once`. Первый Fixed Status вернёт `Failure`, Force Success — `Success`; Sequence дойдёт до последнего ребёнка и завершится с `Success`.
4. Поменяйте статус первого Fixed Status на `Running` и снова выполните тик. Теперь Force Success и Sequence вернут `Running`, а последний ребёнок не выполнится в этом тике. Верните первому `Failure` и нажмите ту же кнопку: последовательность продолжится и завершится.

| Настройка или результат | Что означает |
| --- | --- |
| Child | Один подключённый ребёнок. Для нескольких шагов подключите к Force Success собственный Sequence |
| Ребёнок вернул Success | Force Success возвращает Success |
| Ребёнок вернул Failure | Force Success тоже возвращает Success; родитель может продолжить выполнение |
| Ребёнок вернул Running | Force Success возвращает Running, сохраняя незавершённую работу |

Если неудачный шаг нужно повторять, а не принимать его Failure, используйте [Until Success](/ru/behavior-trees/nodes/until-success): новая попытка выполняется при следующем тике. Для перехода к другому варианту после Failure предназначен [Selector](/ru/behavior-trees/nodes/selector).

У узла без подключённых детей результат `Success`, но для проверки необязательного шага ребёнок нужен. Ошибки выполнения и отмена не превращаются этим декоратором в удачный результат. Если ошибка шага должна остановить всё дерево, не скрывайте его обычный `Failure` через Force Success.
