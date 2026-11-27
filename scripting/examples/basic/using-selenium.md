---
title: Automating Edge Browser with Selenium
description: 
published: true
date: 2024-08-29T14:45:43.817Z
tags: Selenium, Browser Automation, MS Edge, Web Development, ai-translated
editor: markdown
dateCreated: 2024-08-29T14:37:33.998Z
---

# Read a field on your own page with Selenium

Selenium addresses page elements through the browser's DOM. Here a separate Edge session opens a temporary local page, enters `EyeAuras` in one field and reads it back into the EyePad log. No screenshot matching or form submission is needed.

You need Microsoft Edge and a matching **Microsoft Edge WebDriver** for your Windows environment and architecture. Check the browser version at `edge://settings/help`, download the driver from [Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/), and extract it, for example to `C:\Tools\EdgeDriver`. Microsoft requires the [first three version components to match](https://learn.microsoft.com/en-us/microsoft-edge/webdriver/). A Selenium NuGet reference installs neither Edge nor its driver.

## Run the local example

1. Create a **C# Script** in [EyePad](/en/features/eyepad). The host needs access to resolve `Selenium.WebDriver 4.24.0` and permission to create a temporary file and start the driver.
2. Set `driverDirectory` to the directory containing your `msedgedriver.exe`. Paste the whole program into `Script.csx`.
3. Click `Run`. It creates its own headless Edge session and temporary HTML page; it does not attach to your open tabs or shared browser profile.
4. Expect `Field value: EyeAuras` in the log. On exit, the owned browser session and driver are disposed and the temporary file is removed.

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
            "<label>Name <input name='demo'></label>");
        cancellationToken.ThrowIfCancellationRequested();
        using var service = EdgeDriverService.CreateDefaultService(driverDirectory);
        var options = new EdgeOptions { LeaveBrowserRunning = false };
        options.AddArgument("--headless=new");
        using var driver = new EdgeDriver(service, options);
        driver.Navigate().GoToUrl(new Uri(page).AbsoluteUri);
        cancellationToken.ThrowIfCancellationRequested();
        var field = driver.FindElement(By.Name("demo"));
        field.SendKeys("EyeAuras");
        Log.Info($"Field value: {field.GetAttribute("value")}");
    }
    finally
    {
        File.Delete(page);
    }
}
```

`Log` and `cancellationToken` are top-level EyeAuras script members. Pass them explicitly if you move the work into an ordinary class. WebDriver commands are synchronous here: a token check between commands does not interrupt a command already waiting for a response. Driver disposal sends Quit for its session; it is not a command to close unrelated Edge windows.

| Choice | What it does |
| --- | --- |
| `By.Name("demo")` | Finds the element by its `name` attribute. `By.CssSelector` and `By.XPath` are alternatives. |
| `SendKeys` and `GetAttribute("value")` | Enter text and read the field's value without submitting the page. |
| `--headless=new` | Runs without a visible browser window. Remove this option to watch your own test page. |
| `Click()` and `Submit()` | Click a found element or submit a form on your page; these methods do not select the element for you. |

For a network page, completed navigation does not guarantee that a dynamic element has appeared. Configure an appropriate element wait rather than treating a fixed `Sleep(5000)` as a DOM-readiness check. Multiple drivers can own separate sessions, but still share machine resources, files and processes.

<details>
<summary>The earlier WebDriverManager example</summary>

The [original shared example](https://eu.eyeauras.net/share/S20240829142432YXyi4jtEdmlm) opens Bing, locates the `q` field, enters `Selenium C# example` and submits it. Its page selectors and network timing depend on that external site. The local example above gives you control of the page instead.

That version references `Selenium.WebDriver 4.24.0`, `WebDriverManager 2.17.4`, `SharpZipLib 1.4.2` and `AngleSharp 1.1.2`. `SetUpDriver(new WebDriverManager.DriverConfigs.Impl.EdgeConfig())` returns the downloaded driver's binary path. Without an explicit strategy it selects Latest, which need not match your installed browser. `WebDriverManager.Helpers.VersionResolveStrategy.MatchingBrowser` can be supplied as the second argument. Version 2.17.4 uses older Microsoft download addresses; if they are unavailable, prepare the matching driver manually.

The pinned [EdgeDriver constructor](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/Edge/EdgeDriver.cs), [session disposal](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/WebDriver.cs) and [WebDriverManager download selection](https://github.com/rosolko/WebDriverManager.Net/blob/2.17.4/WebDriverManager/DriverManager.cs) are separate contracts. A constructor that resolves does not establish compatibility with every future Edge release. General [Selenium documentation](https://www.selenium.dev/) and the [Edge product page](https://www.microsoft.com/en-us/edge?ep=657&form=MA13FJ&es=40) cover the browser tooling.

</details>
