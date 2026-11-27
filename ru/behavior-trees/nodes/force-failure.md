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

Чтобы выполнить участок, а затем вернуть родителю `Failure` даже после успешного завершения, оберните участок в `Force Failure`. Например, так можно закончить текущую ветку [Sequence](/ru/behavior-trees/nodes/sequence). Незавершённую работу узел не обрывает: `Running` остаётся `Running`.

## Увидеть остановку после успешного ребёнка

Нужно своё дерево с ручным запуском: у входа `Activation → Is Loaded`, `Execution → When Activated → Do nothing`. Создание и соединение узлов показано в [первом примере](/ru/behavior-trees/gettings-started).

1. Добавьте `Sequence`, `Force Failure` и два `Fixed Status`. Соедините их по схеме слева направо.
2. У обоих Fixed Status выберите `General → Status → Success`. В `General → Child` узла Force Failure должно отображаться имя его ребёнка.

```text
My Tree
└─ Sequence
   ├─ Force Failure
   │  └─ Fixed Status: Success
   └─ Fixed Status: Success
```

3. Нажмите `Tick BT Once` сверху. Ребёнок Force Failure завершится с `Success`, сам декоратор и Sequence — с `Failure`. Последний Fixed Status не будет вызван в этом проходе.
4. Выберите у первого Fixed Status `Running` и выполните ещё один тик. Теперь и Force Failure, и Sequence вернут `Running`. После смены ребёнка обратно на `Success` следующий тик закончит участок с `Failure`.

| Настройка или результат | Что означает |
| --- | --- |
| Child | Один ребёнок; для составного участка используйте дочерний Sequence |
| Ребёнок вернул Success | Force Failure возвращает Failure |
| Ребёнок вернул Failure | Force Failure возвращает Failure |
| Ребёнок вернул Running | Force Failure возвращает Running, не заставляя ребёнка закончиться |

Без детей узел возвращает `Failure`. Его смысл определяет родитель: Sequence останавливается на Failure, а [Selector](/ru/behavior-trees/nodes/selector) пробует следующий вариант. Это управление маршрутом, а не отмена уже сделанных действий. Исключения и отмена остаются отдельными событиями, их не следует считать обычным результатом Force Failure.
