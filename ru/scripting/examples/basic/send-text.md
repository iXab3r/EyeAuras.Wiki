---
title: Печатаем текст
description: 
published: true
date: 2024-02-24T00:41:30.125Z
tags: 
editor: markdown
dateCreated: 2024-02-24T00:41:30.125Z
---

# Печатаем текст
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240224004118uKKy4R0wIpLd
{.is-info}

Код ниже — верхнеуровневый файл действия `C# Script` в EyeAuras. Нужен доступный симулятор ввода. Перед нажатием горячей клавиши откройте, например, Блокнот и установите фокус в поле текста: `TargetWindow = null` оставляет получателем активное окно.

1. Создаем ауру
2. Кидаем в нее `HotkeyIsActive` и биндим на удобную кнопку (это будет наш вкл/выкл, в примере `F2`), меняем тип активации на `Click/Hold`
3. Добавляем в `On Enter` действие `C# Script`
4. Копипастим сам скрипт
5. При нажатии на `F2` напечатается несколько строк текста

![](https://i.imgur.com/mwIxxsL.gif)

```csharp
using EyeAuras.Roxy.Api;
using PoeShared.Scaffolding;

var sendInputApi = GetService<ISendInputScriptingApi>();
sendInputApi.TargetWindow = null; // ввод в активное окно
cancellationToken.ThrowIfCancellationRequested();
sendInputApi.Text("Hello, world!"); // печатаем со стандартным интервалом (рандом, 1-5мс)

sendInputApi.KeyPressDelay = new RandomInteger(5, 15); //меняем интервал на 5-15мс
sendInputApi.Text("\nthis one is a bit slower");

sendInputApi.Text("\nand this one is very slow!", delayMs: 30); //печатаем с интервалом по 30мс
```

> В примере в начале строк указан спец-символ `\n`, это символ перевода строки
{.is-info}

В активном редакторе появятся три строки с разными задержками. `Text(string text, int? delayMs)` синхронно ждёт отправки; без `delayMs` использует `KeyPressDelay`, изначально диапазон 1–5 мс. Это задержки генератора ввода, не гарантия скорости появления текста в приложении. Вызов не принимает токен выполнения: проверка отмены перед ним не прерывает уже начатую отправку. Для отдельных клавиш используется `KeyPress(Key.Enter, keyPressDelay: 30)`. Подробнее — [ввод](/ru/scripting/api/ISendInputScriptingApi).
