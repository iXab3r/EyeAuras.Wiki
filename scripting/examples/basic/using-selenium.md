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

Selenium works with page elements: it finds a field by name, types text and reads the result from the DOM. No window screenshot or pixel search is needed. In this example a separate Microsoft Edge session opens a temporary local HTML page, types `EyeAuras` into a field and writes that value to the EyePad log.

You need Microsoft Edge and a matching **Microsoft Edge WebDriver**. Check the browser version at `edge://settings/help`, download the driver from [Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/), and extract it, for example to `C:\Tools\EdgeDriver`. The first three parts of the browser and driver version numbers must match. This is a [Microsoft requirement](https://learn.microsoft.com/en-us/microsoft-edge/webdriver/).

## Run the local example

1. Create a **C# Script** in [EyePad](/en/features/eyepad).
2. Paste the whole program into `Script.csx`. Set `driverDirectory` to the folder that holds your `msedgedriver.exe`.
3. Click `Run`. The script creates a temporary page and a separate Edge session with no visible window. It does not connect to your open tabs or your browser profile.
4. The log shows `Field value: EyeAuras`. After that the browser session and the driver are closed and the temporary file is deleted.

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

`Log` and `cancellationToken` belong to the top-level EyeAuras script here. Pass them explicitly if you move the work into an ordinary C# class. Selenium commands are synchronous: a token check between them does not interrupt a WebDriver command that is already waiting for a reply.

| Choice | What it does |
| --- | --- |
| `By.Name("demo")` | Finds the element by its `name` attribute. `By.CssSelector` and `By.XPath` also exist. |
| `SendKeys` and `GetAttribute("value")` | Type text into the found field and read its value. |
| `--headless=new` | Edge runs with no visible window. Remove this argument if you want to see your test page. |
| `Click()` and `Submit()` | Click an element or submit a form on your page. |

If a page loads over the network, the end of navigation does not mean every dynamic element is already there. Set up a wait for the element you need. A fixed `Sleep(5000)` is not such a wait.

<details>
<summary>The earlier WebDriverManager example</summary>

The [original example](https://eu.eyeauras.net/share/S20240829142432YXyi4jtEdmlm) uses `Selenium.WebDriver 4.24.0`, `WebDriverManager 2.17.4`, `SharpZipLib 1.4.2` and `AngleSharp 1.1.2`. It opens Bing, finds the `q` field, types `Selenium C# example` and submits the search form.

In WebDriverManager 2.17.4, `SetUpDriver(new WebDriverManager.DriverConfigs.Impl.EdgeConfig())` downloads a driver and returns its path. With no strategy given it picks the latest version, which may not match your installed Edge. To match the browser, pass `WebDriverManager.Helpers.VersionResolveStrategy.MatchingBrowser` as the second argument. This library version uses old Microsoft download addresses. If they are unavailable, prepare the driver by hand as described above.

Sources: [EdgeDriver constructor](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/Edge/EdgeDriver.cs), [session disposal](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/WebDriver.cs), [WebDriverManager download selection](https://github.com/rosolko/WebDriverManager.Net/blob/2.17.4/WebDriverManager/DriverManager.cs), [Selenium documentation](https://www.selenium.dev/), [Edge product page](https://www.microsoft.com/en-us/edge?ep=657&form=MA13FJ&es=40).

</details>
