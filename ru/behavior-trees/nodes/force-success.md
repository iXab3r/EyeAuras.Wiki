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

`Force Success` превращает `Failure` дочернего узла в `Success`. Он нужен, когда проверка необязательная и последовательность должна идти дальше при любом её исходе. Пока ребёнок работает, узел возвращает `Running`.

## Пропустить неудачу в своей последовательности

Создайте отдельное дерево по [первому примеру](/ru/behavior-trees/gettings-started). У входа оставьте `Activation → Is Loaded` и `Execution → When Activated → Do nothing`, чтобы тики были только ручные.

1. Через `Add new Node` добавьте `Sequence`, `Force Success` и два `Fixed Status`. Соедините узлы по схеме. Дети Sequence идут слева направо.
2. У ребёнка Force Success выберите `General → Status → Failure`, у последнего узла — `Success`. Выделите Force Success и проверьте, что в `General → Child` стоит нужный ребёнок.

```text
My Tree
└─ Sequence
   ├─ Force Success
   │  └─ Fixed Status: Failure
   └─ Fixed Status: Success
```

3. Нажмите верхнюю `Tick BT Once`. Первый Fixed Status вернёт `Failure`, Force Success — `Success`. Sequence дойдёт до последнего ребёнка и завершится с `Success`.
4. Поставьте первому Fixed Status `Running` и сделайте ещё тик. Force Success и Sequence вернут `Running`, последний ребёнок в этом тике не выполнится. Верните первому `Failure` и нажмите ту же кнопку: последовательность дойдёт до конца.

| Настройка или результат | Что означает |
| --- | --- |
| Child | Один подключённый ребёнок. Если шагов несколько, подключите к Force Success свой Sequence |
| Ребёнок вернул Success | Force Success возвращает Success |
| Ребёнок вернул Failure | Force Success тоже возвращает Success, родитель может идти дальше |
| Ребёнок вернул Running | Force Success возвращает Running, работа ребёнка продолжается |

Если неудачный шаг нужно повторять, берите [Until Success](/ru/behavior-trees/nodes/until-success): он пробует снова на следующем тике. Если после Failure нужен другой вариант — [Selector](/ru/behavior-trees/nodes/selector).

Без детей узел возвращает `Success`, но для необязательного шага ребёнок нужен. Ошибки выполнения и отмену Force Success в успех не превращает.
