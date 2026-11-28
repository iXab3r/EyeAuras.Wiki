---
title: Автоматизация браузера Edge через Selenium
description: 
published: true
date: 2024-08-29T14:45:43.817Z
tags: 
editor: markdown
dateCreated: 2024-08-29T14:37:33.998Z
---

# Заполнить свою тестовую страницу через Selenium

Selenium работает с элементами страницы: находит поле по имени, вводит текст и читает результат из DOM. Снимок окна и поиск пикселей для этого не нужны. В примере отдельный сеанс Microsoft Edge открывает ваш локальный HTML-файл, вводит `EyeAuras` и выводит это значение в журнал EyePad.

Нужны установленный Microsoft Edge и подходящий к нему **Microsoft Edge WebDriver**. Посмотрите версию браузера в `edge://settings/help`, скачайте драйвер с [официальной страницы Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/) и распакуйте, например, в `C:\Tools\EdgeDriver`. У браузера и драйвера должны совпадать первые три части номера версии — это [требование Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/webdriver/).

## Прочитать значение собственного поля

1. Создайте **C# Script** в [EyePad](/ru/features/eyepad).
2. Вставьте программу в `Script.csx`. В `driverDirectory` укажите папку, где лежит ваш `msedgedriver.exe`.
3. Нажмите `Run`. Скрипт создаёт временную страницу и отдельный сеанс Edge без видимого окна. К вашим открытым вкладкам и профилю он не подключается.
4. В журнале появится `Значение поля: EyeAuras`. После этого сеанс браузера и драйвер закрываются, а временный файл удаляется.

```csharp
#r "nuget: Selenium.WebDriver, 4.24.0"

using OpenQA.Selenium;
using OpenQA.Selenium.Edge;
using System;
using System.IO;

{
    var driverDirectory = @"C:\Tools\EdgeDriver";
    var page = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".html");
    try
    {
        File.WriteAllText(page,
            "<!doctype html><meta charset='utf-8'><title>Local demo</title>" +
            "<label>Имя <input name='demo'></label>");
        cancellationToken.ThrowIfCancellationRequested();
        using var service = EdgeDriverService.CreateDefaultService(driverDirectory);
        var options = new EdgeOptions { LeaveBrowserRunning = false };
        options.AddArgument("--headless=new");
        using var driver = new EdgeDriver(service, options);
        driver.Navigate().GoToUrl(new Uri(page).AbsoluteUri);
        cancellationToken.ThrowIfCancellationRequested();
        var field = driver.FindElement(By.Name("demo"));
        field.SendKeys("EyeAuras");
        Log.Info($"Значение поля: {field.GetAttribute("value")}");
    }
    finally
    {
        File.Delete(page);
    }
}
```

`Log` и `cancellationToken` здесь принадлежат верхнеуровневому скрипту EyeAuras. В обычный C#-класс журнал и токен передают явно. Команды Selenium синхронные: проверка токена между ними не прерывает команду WebDriver, которая уже ждёт ответа.

| Что выбрать | Результат |
|---|---|
| `By.Name("demo")` | Ищет элемент по атрибуту `name`. Есть также `By.CssSelector` и `By.XPath`. |
| `SendKeys` / `GetAttribute("value")` | Вводит текст в найденное поле и читает его значение. |
| `--headless=new` | Edge работает без видимого окна. Уберите этот аргумент, если хотите видеть свою тестовую страницу. |
| `Click()` / `Submit()` | Нажимает элемент или отправляет форму на вашей странице. |

Если страница загружается по сети, конец навигации не гарантирует, что все динамические элементы уже появились. Ожидание нужного элемента настраивается отдельно. Управлять любым уже открытым окном браузера так нельзя.

<details>
<summary>Прежний вариант с WebDriverManager</summary>

[Исходный пример](https://eu.eyeauras.net/share/S20240829142432YXyi4jtEdmlm) использует `Selenium.WebDriver 4.24.0`, `WebDriverManager 2.17.4`, `SharpZipLib 1.4.2` и `AngleSharp 1.1.2`. Он открывает Bing и отправляет поисковую форму.

В WebDriverManager 2.17.4 вызов `new WebDriverManager.DriverManager().SetUpDriver(new WebDriverManager.DriverConfigs.Impl.EdgeConfig())` выбирает последнюю версию драйвера, а она не обязательно совпадает с версией установленного Edge. Режим `WebDriverManager.Helpers.VersionResolveStrategy.MatchingBrowser` передаётся вторым аргументом. Эта версия библиотеки использует старые адреса загрузки Microsoft. Если они недоступны, подготовьте драйвер вручную, как описано выше.

</details>
