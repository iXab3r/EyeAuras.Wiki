---
title: "Read known cells from your own local HTML table"
description: "Save an HTML file on disk, read its table cells in a separate Selenium 4.24.0 session and always Quit that session."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Read known cells from your own local HTML table

The script reads two table rows from your own local HTML file and writes them to the log: `Ready: 3` and `Waiting: 0`.

You need desktop EyeAuras on Windows, **Selenium.WebDriver 4.24.0** at exactly this version, installed Microsoft Edge and a compatible **msedgedriver.exe** in **C:\Tools\EdgeDriver**. The browser and the driver must match in version and platform. For Edge, compare the first three version components as described in [Selenium setup](/en/scripting/examples/basic/using-selenium). The NuGet reference does not install either program. Work in a new separate session and do not attach to your daily browser or profile.

1. Create the folder **C:\EARecipeTable\fixtures** and save **fixtures/status.html** below as **C:\EARecipeTable\fixtures\status.html**.
2. Create `RecipeTable` through **Add new → New Aura → Actions → On Enter → C# Script**. Replace the whole top-level **Script.csx** with the code below. Do not change the package version. The fixture path and the driver folder in the code must match yours.
3. After compilation, click **Run** and open **Event Log**. The script creates a new headless Edge session, opens the file URI and reads the two `td` cells in each `#status tbody tr` row. For the unchanged fixture you should see exactly `Ready: 3` and `Waiting: 0`.
4. Change `3` to `4` in your HTML, save it and click Run again. The new session logs `Ready: 4`.
5. If the driver was created successfully, the `finally` block always calls **Quit**, including after cancellation or a read error. In Selenium 4.24.0, Quit calls Dispose, which ends the session and disposes its command executor. The service is disposed separately by its own using block.

| Path or option | Meaning |
| --- | --- |
| `new Uri(file).AbsoluteUri` | Turns the absolute Windows path into a `file:` URI. |
| `--headless=new`, `LeaveBrowserRunning = false` | The new session shows no browser window, and the browser is deliberately not left running. |
| `#status tbody tr` | The data rows of the fixture, without the header. |

An embedded [project file provider](/en/scripting/examples/basic/file-provider) gives you streams or project-relative URLs. Those are not necessarily a physical path that Selenium can open, so keep the fixture on disk. Script cancellation is checked between synchronous WebDriver commands. It does not guarantee that a command already waiting stops at once.

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
