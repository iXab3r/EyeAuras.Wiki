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

Selenium работает с элементами страницы: находит поле по имени, вводит текст и читает результат из DOM. Для такой задачи не нужны снимок окна и поиск пикселей. Здесь отдельный сеанс Microsoft Edge откроет ваш локальный HTML-файл, введёт `EyeAuras` и прочитает это значение обратно в журнал EyePad.

Нужны установленный Microsoft Edge и соответствующий ему **Microsoft Edge WebDriver**. Посмотрите версию в `edge://settings/help`, скачайте драйвер с [официальной страницы Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/) и распакуйте, например, в `C:\Tools\EdgeDriver`. У браузера и драйвера должны совпадать первые три части номера версии; это [требование Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/webdriver/). Selenium и драйвер — разные зависимости.

## Прочитать значение собственного поля

1. Создайте **C# Script** в [EyePad](/ru/features/eyepad).
2. В `driverDirectory` укажите папку, содержащую ваш `msedgedriver.exe`. Вставьте программу в `Script.csx`.
3. Нажмите `Run`. Скрипт создаёт временную страницу и отдельный сеанс Edge без видимого окна; он не подключается к вашим открытым вкладкам или профилю.
4. В журнале появится `Значение поля: EyeAuras`. После завершения сеанс браузера и драйвер закрываются, временный файл удаляется.

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

`Log` и `cancellationToken` здесь принадлежат верхнеуровневому скрипту EyeAuras. В обычном C#-классе передайте журнал и токен явно. Selenium выполняет синхронные команды: проверка токена между ними не прерывает уже ожидающую ответа команду WebDriver. Выход из блока освобождает принадлежащий скрипту драйвер и его сеанс, а не чужие окна Edge.

| Что выбрать | Результат |
|---|---|
| `By.Name("demo")` | Поиск элемента по атрибуту `name`; также доступны `By.CssSelector` и `By.XPath`. |
| `SendKeys` / `GetAttribute("value")` | Ввод в найденное поле и чтение его значения, без отправки формы. |
| `--headless=new` | Edge работает без видимого окна. Для просмотра собственной тестовой страницы можно убрать этот аргумент. |
| `Click()` / `Submit()` | Нажатие элемента или отправка формы на вашей странице; сами по себе эти методы не находят нужный элемент. |

Для загружаемой по сети страницы готовность навигации не гарантирует появления всех динамических элементов: ожидание нужного элемента настраивается отдельно. Несколько созданных драйверов дают отдельные сеансы; это не управление любым существующим окном браузера.

<details>
<summary>Прежний вариант с WebDriverManager</summary>

[Исходный пример](https://eu.eyeauras.net/share/S20240829142432YXyi4jtEdmlm) использует `Selenium.WebDriver 4.24.0`, `WebDriverManager 2.17.4`, `SharpZipLib 1.4.2` и `AngleSharp 1.1.2`. Он открывает Bing и отправляет поисковую форму. Для знакомства достаточно локального примера выше.

В WebDriverManager 2.17.4 вызов `new WebDriverManager.DriverManager().SetUpDriver(new WebDriverManager.DriverConfigs.Impl.EdgeConfig())` выбирает последнюю версию драйвера, а не обязательно версию установленного Edge. Режим `WebDriverManager.Helpers.VersionResolveStrategy.MatchingBrowser` передаётся вторым аргументом. Эта версия библиотеки использует старые адреса загрузки Microsoft; при их недоступности подготовьте подходящий драйвер вручную, как описано выше. Добавление ссылки NuGet само по себе браузер не устанавливает.

</details>
