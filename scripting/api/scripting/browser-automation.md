---
title: AI Scripting — Browser Automation
description: AI-first map for browser automation from script mini-apps, especially Selenium/WebDriver.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, browser, selenium, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Browser Automation Discovery Map

Reference map for automating web pages from script mini-apps with browser-native
automation APIs such as Selenium/WebDriver.

## User Intents

- Automate a browser page without image search.
- Fill forms, click buttons, and read DOM state.
- Run multiple browser sessions independently.
- Download/setup WebDriver dependencies.
- Decide between Selenium and screen/input automation.

## Concept Model

- Browser automation is a separate path from screen CV and send-input.
- Selenium/WebDriver controls the browser through browser automation protocols.
- Browser instances are isolated from each other more cleanly than global mouse
  and keyboard input.
- WebDriver dependencies are external packages/tools and may be downloaded or
  managed at runtime.
- Use screen/input automation only when the target surface is not accessible as
  DOM/browser state.

## Package / API Details

- `Selenium.WebDriver` - main WebDriver package.
- `WebDriverManager` - driver download/setup helper.
- `OpenQA.Selenium` - common Selenium APIs.
- `OpenQA.Selenium.Edge` - Microsoft Edge driver APIs.
- `EdgeDriverService` - driver process service.
- `EdgeOptions` - browser startup options.
- `IWebDriver.Navigate()` - navigation.
- `FindElement(...)`, `By.Name`, `By.CssSelector`, `By.XPath` - DOM lookup.
- `IWebElement.SendKeys(...)`, `Click()`, `Submit()` - user-like actions.

## Common Flows

### Automate Browser Task

1. Add Selenium/WebDriver package references.
2. Ensure a matching browser driver is available.
3. Create browser options and driver service.
4. Create the WebDriver.
5. Navigate to a URL.
6. Find DOM elements and interact with them.
7. Dispose the driver or intentionally leave browser running.

## Open a page and read the DOM

Start with the [Selenium example](/en/scripting/examples/basic/using-selenium):
it includes package directives, EdgeDriver setup and DOM interaction.
`Selenium.WebDriver` and `WebDriverManager` are separate script dependencies;
do not resolve `IWebDriver` through EyeAuras `GetService` without registering it
yourself. In ordinary .NET classes, these are regular NuGet dependencies.

Before running, check the installed browser, matching driver version, access to
driver downloads and a writable working directory. The old example's pinned
package versions do not guarantee compatibility with today's browser. The remote
page can change its markup too.

After `Navigate().GoToUrl(url)`, locate an element using a known selector and
read its `Text` or call `SendKeys` / `Click`. The observable result belongs to the
created browser session; these calls are not global input to the user's active
window. For dynamically loaded elements, use a bounded condition wait instead
of an arbitrary delay.

## End the session with its operation

The driver owner closes the WebDriver session and releases its driver/service
using `finally` or appropriate `using` blocks. For Selenium 4.24.0, disposing
`WebDriver` sends Quit when a session exists, then disposes its command executor;
a separate successful Quit call is not required before this `using` cleanup.
[Versioned implementation](https://github.com/SeleniumHQ/selenium/blob/selenium-4.24.0/dotnet/src/webdriver/WebDriver.cs).

Top-level script completion does not automatically wait for every external
process. Capture the Run token before background work and check cancellation
between actions. EyeAuras cancellation cannot interrupt arbitrary synchronous
WebDriver calls; use the selected driver's command timeouts and shutdown policy.

The sample uses Selenium 4.24.0 and WebDriverManager 2.17.4. The declarations
and disposal/download paths are available in those projects' tagged source;
that source check does not establish compatibility with your browser or the
current Bing DOM. See the [example's contract links](/en/scripting/examples/basic/using-selenium).

## Prefer

- Prefer Selenium/WebDriver for websites and browser apps.
- Prefer DOM selectors over image matching when the DOM is available.
- Prefer explicit waits/conditions over fixed sleeps for real workflows.
- Prefer one WebDriver instance per independent browser session.
- Prefer disposing driver sessions with the script/app lifetime.

## Avoid

- Avoid using global mouse/keyboard simulation for browser pages unless the DOM
  is unavailable.
- Avoid assuming WebDriver binaries exist on every machine.
- Avoid fixed long sleeps as synchronization in production mini-apps.
- Avoid storing API keys, passwords, or session cookies in source files.

## Research Anchors

- `Selenium.WebDriver`
- `WebDriverManager`
- `OpenQA.Selenium`
- `IWebDriver`
- `IWebElement`
- `By`
- `EdgeDriver`
- `EdgeDriverService`
- `EdgeOptions`
- `ChromeDriver`
- `WebDriverWait`
- `ExpectedConditions`

## Search Synonyms

- browser automation
- Selenium
- WebDriver
- EdgeDriver
- ChromeDriver
- DOM automation
- web page automation
- browser session
- form fill
- web scraper

## Related Maps

- [scripting/references-and-resources.md](/en/scripting/api/scripting/references-and-resources)
- [scripting/web-server.md](/en/scripting/api/scripting/web-server)
- [windows-subsystems/input-hooks-hotkeys.md](/en/scripting/api/windows-subsystems/input-hooks-hotkeys)
- [computer-vision/images.md](/en/scripting/api/computer-vision/images)
