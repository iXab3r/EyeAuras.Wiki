---
title: AI-скриптинг — автоматизация браузера
description: AI-ориентированная карта по автоматизации браузера из script mini-apps, особенно через Selenium и WebDriver.
published: true
date: 2026-04-22T00:00:00.000Z
tags: scripting, api, ai, browser, selenium, ai-translated
editor: markdown
dateCreated: 2026-04-22T00:00:00.000Z
---
# Карта по браузерной автоматизации

Краткая карта для автоматизации веб-страниц из script mini-apps через нативные браузерные API автоматизации, такие как Selenium/WebDriver.

## Что обычно нужно сделать

- Автоматизировать страницу в браузере без поиска по изображению.
- Заполнять формы, нажимать кнопки и читать состояние DOM.
- Запускать несколько независимых браузерных сессий.
- Скачивать и настраивать зависимости WebDriver.
- Понять, когда выбрать Selenium, а когда экранную автоматизацию и send-input.

## Как это устроено

- Браузерная автоматизация — это отдельный путь, не связанный с screen CV и send-input.
- Selenium/WebDriver управляет браузером через браузерные протоколы автоматизации.
- Экземпляры браузера изолированы друг от друга заметно лучше, чем при работе через глобальные ввод мыши и клавиатуры.
- Зависимости WebDriver — это внешние пакеты и инструменты, их можно скачивать или настраивать во время выполнения.
- Экранную автоматизацию и input стоит использовать только тогда, когда целевая поверхность недоступна как DOM или состояние браузера.

## Пакеты и API

- `Selenium.WebDriver` - основной пакет WebDriver.
- `WebDriverManager` - помощник для скачивания и настройки драйвера.
- `OpenQA.Selenium` - общие API Selenium.
- `OpenQA.Selenium.Edge` - API драйвера Microsoft Edge.
- `EdgeDriverService` - сервис процесса драйвера.
- `EdgeOptions` - параметры запуска браузера.
- `IWebDriver.Navigate()` - навигация.
- `FindElement(...)`, `By.Name`, `By.CssSelector`, `By.XPath` - поиск по DOM.
- `IWebElement.SendKeys(...)`, `Click()`, `Submit()` - действия, похожие на действия пользователя.

## Типовой сценарий

### Автоматизация задачи в браузере

1. Добавьте ссылки на пакеты Selenium/WebDriver.
2. Убедитесь, что доступен подходящий драйвер браузера.
3. Создайте параметры браузера и сервис драйвера.
4. Создайте WebDriver.
5. Перейдите по нужному URL.
6. Найдите DOM-элементы и выполните действия с ними.
7. Освободите driver или намеренно оставьте браузер запущенным.

## Что предпочесть

- Для сайтов и браузерных приложений предпочитайте Selenium/WebDriver.
- Если DOM доступен, предпочитайте DOM-селекторы вместо сопоставления по изображениям.
- Для реальных сценариев предпочитайте явные ожидания и условия вместо фиксированных `sleep`.
- Для каждой независимой браузерной сессии предпочитайте отдельный экземпляр WebDriver.
- Предпочитайте завершать сессии driver вместе с жизненным циклом script/app.

## Чего лучше избегать

- Не используйте глобальную симуляцию мыши и клавиатуры для страниц в браузере, если DOM доступен.
- Не рассчитывайте на то, что бинарники WebDriver уже есть на каждой машине.
- Не используйте длинные фиксированные `sleep` как способ синхронизации в production mini-apps.
- Не храните API-ключи, пароли или session cookies в исходных файлах.

## Ключевые сущности для поиска

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

## По каким запросам искать

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

## Связанные карты

- `scripting/references-and-resources.md`
- `scripting/web-server.md`
- `windows-subsystems/input-hooks-hotkeys.md`
- `computer-vision/images.md`