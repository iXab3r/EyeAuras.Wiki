---
title: Automating Edge Browser with Selenium
description: 
published: true
date: 2024-08-29T14:45:43.817Z
tags: Selenium, Browser Automation, MS Edge, Web Development, ai-translated
editor: markdown
dateCreated: 2024-08-29T14:37:33.998Z
---
# Using Selenium for Browser Automation
> You can import a ready-made example from here: [https://eu.eyeauras.net/share/S20240829142432YXyi4jtEdmlm](https://eu.eyeauras.net/share/S20240829142432YXyi4jtEdmlm)
{.is-info}

## Why?
Searching for images and simulating user input is useful when working with games or unstructured data. If the task involves automating something in a browser, I highly recommend looking into using [Selenium](https://www.selenium.dev/) and [MS Edge](https://www.microsoft.com/en-us/edge?ep=657&form=MA13FJ&es=40). This combination, proven by time and the entire industry, allows you to work with web pages and gives you full control over what happens there. Essentially, **Selenium** solves the same problems as the eye, but exclusively for browsers.  
A huge advantage of this type of automation is that you can manage multiple windows simultaneously without any issues of input overlap or incorrect detections - WebDriver commands target a specific browser session. Shared files, processes and machine resources are not fully isolated by this.

## Open Bing and submit a query

Paste the whole example into a top-level EyeAuras C# Script on Windows. It needs
installed Edge, NuGet/network access, a writable driver directory and a matching
Edge WebDriver. The pinned package versions are retained from the original
example; compatibility with your installed browser is not established here.

Inputs are `https://www.bing.com`, element name `q`, and `Selenium C# example`.
The page, form and network timing can change. `Sleep(5000)` is a fixed pause,
not a check that the DOM is ready.

## What's Happening Here
The code below performs several actions:
1. Checks that you have all the necessary components to run this automation. If not, it downloads them and places them in a nearby folder.
2. Launches the browser. As an example, a full-fledged browser with a user interface is launched.
3. Opens the Bing search engine page.
4. Enters text.
5. Presses Submit.
6. Completes the script and closes the browser.

## How to Customize This
A comprehensive description of working with Selenium cannot fit even in one book, let alone a small article. There is plenty of information on the internet, and ChatGPT is also well-versed in it, so go ahead :)

## Code Example (current version available at the link above)
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
    // Navigate to Google
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

private EdgeDriver InitializeSeleniumDriver(){
    Log.Info("Ensuring that we have webdriver installed");
    var driverPath = new WebDriverManager.DriverManager()
        .SetUpDriver(new WebDriverManager.DriverConfigs.Impl.EdgeConfig());

    Log.Info($"Initializing webdriver session using driver @ {driverPath}");

    // Set up the Edge WebDriver options
    var options = new EdgeOptions(){
    LeaveBrowserRunning = true    
    };

    var service = EdgeDriverService.CreateDefaultService(
        driverPath: Path.GetDirectoryName(driverPath),
        driverExecutableFileName: Path.GetFileName(driverPath)
    );
    service.UseVerboseLogging = true;
    return new EdgeDriver(service, options);
}
```

## Pinned version contracts

[EdgeDriver 4.24.0](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/Edge/EdgeDriver.cs)
has the `(EdgeDriverService, EdgeOptions)` constructor used here.
[WebDriver.Dispose](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/WebDriver.cs)
sends Quit when a session exists and disposes the command executor.
[WebDriverManager 2.17.4](https://github.com/rosolko/WebDriverManager.Net/blob/2.17.4/WebDriverManager/DriverManager.cs)
returns the binary path from `SetUpDriver`; without an explicit version it selects
Latest, with the current working directory as the default download base.
Latest does not mean a match for your installed browser. The example checks
cancellation explicitly after Sleep; synchronous WebDriver calls use their own
timeouts. Browser execution and current Bing DOM compatibility remain unverified.
