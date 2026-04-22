---
title: AI Scripting: Browser Automation
description: AI-first map for browser automation from script mini-apps, especially Selenium/WebDriver.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, browser, selenium
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

- `scripting/references-and-resources.md`
- `scripting/web-server.md`
- `windows-subsystems/input-hooks-hotkeys.md`
- `computer-vision/images.md`
