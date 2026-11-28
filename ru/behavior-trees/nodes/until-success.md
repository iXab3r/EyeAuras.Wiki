---
title: Until Success
description: 
published: true
date: 2024-03-07T23:41:51.969Z
tags: 
editor: markdown
dateCreated: 2024-03-07T23:41:51.969Z
---

# Until Success — повторять проверку до успеха

`Until Success` держит последовательность на месте, пока проверка не пройдёт. Один вызов узла — одна попытка ребёнка, следующая попытка будет на следующем тике. Внутреннего бесконечного цикла нет.

## Дождаться изменения своего условия

Возьмите отдельное дерево с `Activation → Is Loaded` и `Execution → When Activated → Do nothing`.

1. Добавьте узлы через `Add new Node` и соедините их по схеме. Дети Sequence идут слева направо.
2. У ребёнка Until Success выберите `General → Status → Failure`, у двух остальных Fixed Status — `Success`. У Until Success поле `General → Child` показывает подключённую проверку.

```text
My Tree
└─ Sequence
   ├─ Fixed Status: Success
   ├─ Until Success
   │  └─ Fixed Status: Failure
   └─ Fixed Status: Success
```

3. Нажмите верхнюю `Tick BT Once`. Первый шаг пройдёт. Проверка вернёт Failure, а Until Success и Sequence — `Running`. Последний шаг пока не выполнится.
4. Повторите тик, ничего не меняя. Ребёнок Until Success попробует ещё раз. Sequence продолжит с этого места и первый шаг не повторит.
5. Поставьте проверке Status `Success` и снова нажмите кнопку. Until Success вернёт Success, Sequence выполнит последний шаг. Следующий тик после завершения начнёт новый проход Sequence.

| Результат ребёнка | Результат Until Success |
| --- | --- |
| Success | Success — в этом проходе повтор больше не нужен |
| Failure | Running — новая попытка при следующем вызове |
| Running | Running — ребёнок продолжит работу при следующем вызове |

Числа попыток и паузы у Until Success нет. При автоматическом запуске частота зависит от [настроек дерева](/ru/behavior-trees/nodes/root) и от того, сколько длится сам обход.

<details>
<summary>Что происходит с состоянием ребёнка</summary>

Until Success не сбрасывает ребёнка ни после Failure, ни после Success. Это важно для таймеров, составных узлов и скриптов с сохранённым продолжением. Структурный сброс дерева очищает его состояние, а очистка показанного статуса — нет. Отмена или ошибка ребёнка не становятся ещё одной обычной попыткой.

</details>
