---
title: "Прочитать известные ячейки своего локального HTML"
description: "Создайте физический HTML-файл, прочитайте ячейки отдельным сеансом Selenium 4.24.0 и завершите его через Quit."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Прочитать известные ячейки своего локального HTML

Получите две известные строки своего локального HTML в журнале: `Ready: 3` и `Waiting: 0`. Здесь только чтение таблицы, без отправки формы, учётной записи и внешнего сайта.

Нужны настольный EyeAuras на Windows, закреплённый **Selenium.WebDriver 4.24.0**, установленный Microsoft Edge и совместимый **msedgedriver.exe** в **C:\Tools\EdgeDriver**. Версии и платформа браузера/драйвера должны соответствовать; для Edge проверьте первые три компонента версии по [подготовке Selenium](/ru/scripting/examples/basic/using-selenium). NuGet не устанавливает эти программы. Используйте новый собственный сеанс, не подключайтесь к повседневному браузеру или профилю.

1. Создайте **C:\EARecipeTable\fixtures**, сохраните полный **fixtures/status.html** ниже как **C:\EARecipeTable\fixtures\status.html**. Это физический файл вашего диска, Wiki его не поставляет.
2. Создайте `RecipeTable` через **Add new → New Aura → Actions → On Enter → C# Script**. Полностью замените верхнеуровневый **Script.csx**. Сохраните закреплённую версию пакета; физический путь образца и каталог драйвера должны соответствовать вашей установке.
3. После компиляции нажмите ручную **Run**, откройте **Event Log**. Программа создаёт новый headless-сеанс Edge, открывает file URI и читает две `td` каждой строки `#status tbody tr`. Для неизменённого образца ожидаются ровно `Ready: 3` и `Waiting: 0`.
4. В своём HTML замените `3` на `4`, сохраните и снова Run. Новый сеанс должен написать `Ready: 4`. Отсутствующий файл и ошибка запуска драйвера отличаются от таблицы без подходящих строк.
5. Для каждого успешно созданного driver блок `finally` вызывает **Quit**, включая отмену и ошибку чтения. В Selenium 4.24.0 Quit вызывает Dispose, завершающий сеанс и освобождающий command executor. Сервис отдельно принадлежит своему using-блоку.

| Путь или параметр | Смысл |
| --- | --- |
| `new Uri(file).AbsoluteUri` | Преобразует реальный абсолютный путь Windows в `file:` URI. |
| `--headless=new`, `LeaveBrowserRunning = false` | Новый сеанс не показывает окно браузера и не оставляется намеренно работающим. |
| `#status tbody tr` | Выбирает строки данных образца без заголовка. |

Вложенный [файловый сервис проекта](/ru/scripting/examples/basic/file-provider) даёт потоки или URL относительно проекта; это не обязательно физический путь для Selenium. Храните образец на диске. Отмена скрипта проверяется между синхронными командами WebDriver и не гарантирует мгновенного прерывания уже ожидающей команды. Клавиши и буфер обмена не нужны.

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
