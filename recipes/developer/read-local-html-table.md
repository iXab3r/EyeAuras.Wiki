---
title: "Read known cells from your own local HTML table"
description: "Create a physical HTML fixture, read its cells in an isolated Selenium 4.24.0 session and always Quit that session."
published: true
date: 2026-11-10T18:20:14.885Z
tags: recipes, developer
editor: markdown
dateCreated: 2026-11-10T18:20:14.885Z
---

# Read known cells from your own local HTML table

Turn two known rows of your own local HTML file into log entries: `Ready: 3` and `Waiting: 0`. This task reads a table; it has no form submission, account or external website.

Use desktop Windows EyeAuras, the pinned **Selenium.WebDriver 4.24.0**, installed Microsoft Edge and a compatible **msedgedriver.exe** in **C:\Tools\EdgeDriver**. The browser and driver must match their supported versions and platform; for Edge, check the first three version components as described in [Selenium setup](/en/scripting/examples/basic/using-selenium). The NuGet reference does not install either executable. Use a new owned session rather than attaching to your daily browser or profile.

1. Create **C:\EARecipeTable\fixtures**, then save the full **fixtures/status.html** below as **C:\EARecipeTable\fixtures\status.html**. It is a physical file on your disk, not a resource that the Wiki supplies.
2. Create `RecipeTable` through **Add new → New Aura → Actions → On Enter → C# Script**. Replace the complete top-level **Script.csx** below. Keep the pinned package version, physical fixture path and driver directory consistent with your installation.
3. After compilation, click manual **Run** and inspect **Event Log**. The program creates a new headless Edge session, opens the file URI and reads `#status tbody tr`, taking its two `td` cells. Expect exactly `Ready: 3` and `Waiting: 0` for this unchanged fixture.
4. Change `3` to `4` in your own HTML, save it and Run again. A fresh session should now log `Ready: 4`. Missing files and driver startup errors are different from a table with no matching rows.
5. The `finally` calls **Quit** for every successfully constructed driver, including after cancellation or a read error. In Selenium 4.24.0, Quit calls Dispose, which ends the session and disposes its command executor. The service is separately owned by its using block.

| Path or option | Meaning |
| --- | --- |
| `new Uri(file).AbsoluteUri` | Converts the real absolute Windows file path to a `file:` URI. |
| `--headless=new`, `LeaveBrowserRunning = false` | This recipe's new session has no visible browser window and is not deliberately left running. |
| `#status tbody tr` | Selects data rows, excluding the header, in the supplied fixture. |

An embedded [project file provider](/en/scripting/examples/basic/file-provider) can expose streams or project-relative URLs; neither is automatically a physical path Selenium can open. Keep this fixture on disk. Script cancellation is checked between synchronous WebDriver commands; it cannot guarantee immediate interruption of an already waiting command. No keystrokes or clipboard are needed.

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
