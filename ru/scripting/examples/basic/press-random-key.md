---
title: Как нажать случайную клавишу
description: Как эмулировать нажатие случайной клавиши.
published: true
date: 2025-01-04T18:42:46.105Z
tags: ai-translated
editor: markdown
dateCreated: 2025-01-04T18:42:33.221Z
---
# Отправить одну случайную клавишу в свой редактор

Скрипт выбирает одну клавишу из `1`, `2`, `4`, `5`, `A`, `D` и один раз нажимает её в вашем пробном текстовом окне. Клавиши не перебираются по порядку: при каждом запуске выбор случайный, поэтому они могут повторяться.

Нужен настольный EyeAuras с **Windows Input** и выбором окна OSD. Откройте пустое текстовое поле в своём редакторе, поставьте в него каретку, включите английскую раскладку и отпустите модификаторы. Не используйте чат или форму отправки.

1. Добавьте **C# Script** в свою тестовую ауру. Для первого раза запускайте его вручную кнопкой **Run**.
2. Вставьте весь код в `Script.csx`:

```csharp
using EyeAuras.Roxy.Api;
using EyeAuras.Shared.Osd;
using System.Windows.Input;

{
    var target = await GetService<IOsdSelectionService>().PickWindow();
    if (target == null || !target.IsWindow) { Log.Warn("Окно не выбрано"); return; }
    var keys = new[] { Key.D1, Key.D2, Key.D4, Key.D5, Key.A, Key.D };
    var key = keys[System.Random.Shared.Next(keys.Length)];
    var input = GetService<ISendInputScriptingApi>();
    var previousSimulator = input.InputSimulatorId;
    var previousTarget = input.TargetWindow;
    try
    {
        input.InputSimulatorId = "Windows Input";
        input.TargetWindow = target;
        cancellationToken.ThrowIfCancellationRequested();
        Log.Info($"Окно: {target.Title}; клавиша: {key}");
        input.KeyPress(key, 20);
    }
    finally
    {
        input.TargetWindow = previousTarget;
        input.InputSimulatorId = previousSimulator;
    }
}
```

3. Нажмите **Run** и укажите подготовленное окно. Стандартный ввод активирует его, и символ появится в поле с кареткой. Выбор окна отменяется Escape или правой кнопкой.
4. Повторите Run несколько раз. В журнале видна выбранная клавиша, в редакторе — что до него дошло.

| Настройка | Значение в примере |
| --- | --- |
| `keys` | Шесть разных клавиш, вероятность каждой — 1/6. Если добавить в массив дубликат, эта клавиша будет выпадать чаще. |
| Число повторов | Одно нажатие за запуск. |
| `20` в `KeyPress` | Задержка между нажатием и отпусканием в миллисекундах, а не период повторов. Без аргумента берётся `KeyPressDelay` из API. |
| `TargetWindow` | Окно, которое вы выбрали сами. Ввод адресован ему и активирует его. |

Клавиши — это не готовый текст: результат зависит от раскладки, модификаторов и фокуса внутри окна. Токен проверяется перед вводом. Синхронный `KeyPress` токен запуска не получает, поэтому уже начатое нажатие он не прервёт. Прежние настройки заимствованного API возвращаются в `finally`.

Если нужна строка или предложение, а не отдельная клавиша, смотрите [пример печати текста](/ru/scripting/examples/basic/send-text). Там символы отправляются с явными нажатиями Enter между строками.

<details>
<summary>Запуск горячей клавишей и прежний активный адресат</summary>

Можно добавить **Hotkey Is Active → Hold** с `F3` и поставить действие в **On Enter**. Каждая новая активация выберет одну клавишу. Отпустите клавишу — и ауру можно активировать снова. Своё окно по-прежнему выбирается при каждом запуске.

В старом варианте стояло `input.TargetWindow = null`. Для Windows Input это текущее активное приложение. С явным выбором, как выше, адресат понятен ещё до нажатия. Другие способы доставки описаны в [контракте SendInput](/ru/scripting/api/ISendInputScriptingApi). В обычный C#-класс сервис передавайте явно.

</details>
