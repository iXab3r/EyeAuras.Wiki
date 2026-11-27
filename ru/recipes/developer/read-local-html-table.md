---
title: "Прочитать известные ячейки своего локального HTML"
description: "Создайте HTML-файл на диске, прочитайте его ячейки отдельным сеансом Selenium 4.24.0 и завершите сеанс через Quit."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Прочитать известные ячейки своего локального HTML

Скрипт читает две строки таблицы из вашего локального HTML-файла и пишет их в журнал: `Ready: 3` и `Waiting: 0`. Это только чтение — без отправки форм, учётных записей и внешних сайтов.

Нужны настольный EyeAuras на Windows, пакет **Selenium.WebDriver 4.24.0** именно этой версии, установленный Microsoft Edge и совместимый **msedgedriver.exe** в **C:\Tools\EdgeDriver**. Версия и платформа браузера и драйвера должны соответствовать друг другу. Для Edge сверьте первые три компонента версии, как описано в [подготовке Selenium](/ru/scripting/examples/basic/using-selenium). NuGet эти программы не устанавливает. Работайте в новом отдельном сеансе и не подключайтесь к своему повседневному браузеру или профилю.

1. Создайте папку **C:\EARecipeTable\fixtures** и сохраните **fixtures/status.html** ниже как **C:\EARecipeTable\fixtures\status.html**. Это обычный файл на вашем диске, Wiki его не раздаёт.
2. Создайте `RecipeTable` через **Add new → New Aura → Actions → On Enter → C# Script**. Целиком замените верхнеуровневый **Script.csx**. Версию пакета не меняйте. Путь к образцу и папка драйвера в коде должны совпадать с вашими.
3. После компиляции нажмите **Run** и откройте **Event Log**. Скрипт создаёт новый headless-сеанс Edge, открывает file URI и читает две `td` в каждой строке `#status tbody tr`. Для неизменённого образца должны появиться ровно `Ready: 3` и `Waiting: 0`.
4. В своём HTML замените `3` на `4`, сохраните и снова нажмите Run. Новый сеанс напишет `Ready: 4`. Отсутствующий файл и ошибка запуска драйвера — не то же самое, что таблица без подходящих строк.
5. Если driver успешно создан, блок `finally` всегда вызывает **Quit** — в том числе при отмене и при ошибке чтения. В Selenium 4.24.0 Quit вызывает Dispose, который завершает сеанс и освобождает command executor. Сервис освобождается отдельно, своим using-блоком.

| Путь или параметр | Смысл |
| --- | --- |
| `new Uri(file).AbsoluteUri` | Превращает абсолютный путь Windows в `file:` URI. |
| `--headless=new`, `LeaveBrowserRunning = false` | Новый сеанс не показывает окно браузера, и браузер намеренно не оставляют работать. |
| `#status tbody tr` | Строки с данными образца, без заголовка. |

Вложенный [файловый сервис проекта](/ru/scripting/examples/basic/file-provider) отдаёт потоки или URL относительно проекта. Это не обязательно физический путь, который подойдёт Selenium, поэтому держите образец на диске. Отмена скрипта проверяется между синхронными командами WebDriver и не гарантирует, что уже ожидающая команда прервётся сразу. Клавиши и буфер обмена не нужны.

## fixtures/status.html

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Owned status table</title>
<table id="status">
  <thead><tr><th>Name</th><th>Count</th></tr></thead>
  <tbody><tr><td>Ready</td><td>3</td></tr><tr><td>Waiting</td><td>0</td></tr></tbody>
</table>
</html>
```

## Script.csx

```csharp
#r "nuget: Selenium.WebDriver, 4.24.0"
using System;
using System.IO;
using OpenQA.Selenium;
using OpenQA.Selenium.Edge;

{
    cancellationToken.ThrowIfCancellationRequested();
    var file = Path.GetFullPath(@"C:\EARecipeTable\fixtures\status.html");
    if (!File.Exists(file)) throw new FileNotFoundException("Create the owned table fixture first.", file);
    using var service = EdgeDriverService.CreateDefaultService(@"C:\Tools\EdgeDriver");
    var options = new EdgeOptions { LeaveBrowserRunning = false };
    options.AddArgument("--headless=new");
    var driver = new EdgeDriver(service, options);
    try
    {
        cancellationToken.ThrowIfCancellationRequested();
        driver.Navigate().GoToUrl(new Uri(file).AbsoluteUri);
        var rows = driver.FindElements(By.CssSelector("#status tbody tr"));
        foreach (var row in rows)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var cells = row.FindElements(By.TagName("td"));
            Log.Info($"{cells[0].Text}: {cells[1].Text}");
        }
    }
    finally { driver.Quit(); }
}
```
