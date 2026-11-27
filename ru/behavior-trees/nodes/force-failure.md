---
title: Force Failure
description: 
published: true
date: 2024-03-07T23:30:59.987Z
tags: 
editor: markdown
dateCreated: 2024-03-07T23:30:59.987Z
---

# Force Failure — закончить шаг и остановить последовательность

`Force Failure` выполняет дочерний участок и возвращает родителю `Failure`, даже если участок завершился успешно. Так можно, например, закончить текущую ветку [Sequence](/ru/behavior-trees/nodes/sequence). Незавершённую работу узел не обрывает: `Running` остаётся `Running`.

## Увидеть остановку после успешного ребёнка

Нужно своё дерево с ручным запуском: у входа `Activation → Is Loaded`, `Execution → When Activated → Do nothing`. Как добавлять и соединять узлы — в [первом примере](/ru/behavior-trees/gettings-started).

1. Добавьте `Sequence`, `Force Failure` и два `Fixed Status`. Соедините их по схеме слева направо.
2. У обоих Fixed Status выберите `General → Status → Success`. В `General → Child` у Force Failure должно быть имя его ребёнка.

```text
My Tree
└─ Sequence
   ├─ Force Failure
   │  └─ Fixed Status: Success
   └─ Fixed Status: Success
```

3. Нажмите `Tick BT Once` сверху. Ребёнок Force Failure вернёт `Success`, а сам Force Failure и Sequence — `Failure`. Последний Fixed Status в этом проходе не вызывается.
4. Выберите у первого Fixed Status `Running` и сделайте ещё тик. Теперь Force Failure и Sequence вернут `Running`. Верните ребёнку `Success` — следующий тик закончит участок с `Failure`.

| Настройка или результат | Что означает |
| --- | --- |
| Child | Один ребёнок. Если шагов несколько, подключите дочерний Sequence |
| Ребёнок вернул Success | Force Failure возвращает Failure |
| Ребёнок вернул Failure | Force Failure возвращает Failure |
| Ребёнок вернул Running | Force Failure возвращает Running и не заставляет ребёнка закончиться |

Без детей узел возвращает `Failure`. Что будет дальше, решает родитель: Sequence на Failure останавливается, а [Selector](/ru/behavior-trees/nodes/selector) пробует следующий вариант.
