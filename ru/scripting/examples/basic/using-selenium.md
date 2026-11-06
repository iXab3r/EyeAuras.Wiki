---
title: Автоматизация браузера Edge через Selenium
description: 
published: true
date: 2024-08-29T14:45:43.817Z
tags: 
editor: markdown
dateCreated: 2024-08-29T14:37:33.998Z
---

# Использование Selenium для автоматизации браузера
> Импортировать готовый пример можно отсюда https://eu.eyeauras.net/share/S20240829142432YXyi4jtEdmlm
{.is-info}

## Зачем ?
Поиск изображений и симуляция пользовательского ввода хороши, когда мы работаем с играми или какими-то НЕструктурированными данными. Если задача автоматизировать что-то в браузере, то я крайне рекомендую посмотреть в сторону использования [Selenium](https://www.selenium.dev/) и [MS Edge](https://www.microsoft.com/en-us/edge?ep=657&form=MA13FJ&es=40). Это проверенная временем и целой индустрией связка, которая позволяет работать с веб-страницами и дает вам полную власть над тем, что там происходит. По сути, **Selenium** решает те же проблемы, которые решает глаз, но исключительно для браузеров.
Огромный плюс такого вида автоматизации в том, что вы можете управлять множеством окон одновременно и у вас не будет никаких проблем с пересечением ввода или неверными детектами - команды WebDriver адресуются конкретной браузерной сессии. Общие файлы, процессы и ресурсы машины от этого не становятся полностью изолированными.

## Открыть Bing и отправить запрос

Вставьте весь код ниже в верхнеуровневый файл действия `C# Script` в Windows. Нужны установленный Edge, доступ к NuGet и сети, возможность записать драйвер на диск и совместимый Edge WebDriver. [Официальное руководство Selenium](https://www.selenium.dev/documentation/webdriver/browsers/edge/) требует согласовать основную версию браузера и драйвера. Закреплённые версии пакетов ниже сохранены; их совместимость с вашим браузером не проверена.

Входы примера — `https://www.bing.com`, имя элемента `q` и строка `Selenium C# example`. Страница, форма и сетевые задержки могут измениться; `Sleep(5000)` — фиксированная пауза, а не проверка готовности DOM.

## Что тут вообще происходит
Код ниже выполняет несколько действий:
1. Проверяет, что у вас есть все необходимые компоненты для запуска этой автоматизации. Если нет - докачивает их и кладет в папочку рядом.
2. Запускает браузер. В качестве примера запускается полновесный браузер с интерфейсом.
3. Открывает страницу поисковика bing.com
4. Вбивает текст
5. Нажимает Submit
6. Завершает скрипт и закрывает браузер

## Как это кастомизировать
Полноценное описание работы с Selenium не уместится даже в одну книгу, не говоря уже про маленькую статью. Информации в интернете масса, ChatGPT тоже отлично ориентируется в нем, так что дерзайте :)

## Пример кода (актуальная версия по ссылке выше)
```csharp
#r "nuget: Selenium.WebDriver, 4.24.0"
#r "nuget: WebDriverManager, 2.17.4"
#r "nuget: SharpZipLib, 1.4.2"
#r "nuget: AngleSharp, 1.1.2"

using OpenQA.Selenium;
using OpenQA.Selenium.Edge;

// Initialize the Edge WebDriver
using (var driver = InitializeSeleniumDriver())
{
    // Открываем Bing
    driver.Navigate().GoToUrl("https://www.bing.com");

    Sleep(5000);
    cancellationToken.ThrowIfCancellationRequested();

    // Find the search box using its name attribute
    IWebElement searchBox = driver.FindElement(By.Name("q"));

    // Type the search query into the search box
    searchBox.SendKeys("Selenium C# example");

    // Submit the form
    searchBox.Submit();

    // Wait for a few seconds to see the results
    Sleep(5000);
    cancellationToken.ThrowIfCancellationRequested();
}

EdgeDriver InitializeSeleniumDriver(){
    Log.Info("Ensuring that we have webdriver installed");
    var driverPath = new WebDriverManager.DriverManager()
        .SetUpDriver(new WebDriverManager.DriverConfigs.Impl.EdgeConfig());

    Log.Info($"Initializing webdriver session using driver @ {driverPath}");

    // Set up the Edge WebDriver options
    var options = new EdgeOptions(){
    LeaveBrowserRunning = false
    };

    var service = EdgeDriverService.CreateDefaultService(
        driverPath: Path.GetDirectoryName(driverPath),
        driverExecutableFileName: Path.GetFileName(driverPath)
    );
    service.UseVerboseLogging = true;
    return new EdgeDriver(service, options);
}
```

На экране должны появиться Bing и результаты запроса. `SetUpDriver` может скачать драйвер и создать файлы в рабочем окружении; точный путь напечатается в журнале. `using` завершает сессию драйвера; здесь `LeaveBrowserRunning = false`, браузер не оставляется намеренно. После `Sleep` пример явно проверяет отмену. Синхронные вызовы WebDriver не получают токен скрипта и могут ждать собственного тайм-аута. Этот пример не запускался в браузере. [Карта автоматизации браузера](/ru/scripting/api/scripting/browser-automation) помогает выбрать следующий шаг.

## Контракты закреплённых версий

[EdgeDriver 4.24.0](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/Edge/EdgeDriver.cs)
имеет используемый конструктор `(EdgeDriverService, EdgeOptions)`.
[WebDriver.Dispose](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/WebDriver.cs)
отправляет команду Quit при наличии сессии и освобождает исполнитель команд.
[WebDriverManager 2.17.4](https://github.com/rosolko/WebDriverManager.Net/blob/2.17.4/WebDriverManager/DriverManager.cs)
возвращает путь бинарника из `SetUpDriver`; без явной версии он выбирает Latest,
а каталог загрузки по умолчанию основан на текущем рабочем каталоге.
Latest не означает совпадение с версией установленного браузера.
