---
title: Обход ограничений ввода на удалённом рабочем столе
description: Как работает обход ограничений ввода в сеансах удалённого рабочего стола.
published: true
date: 2026-04-01T01:04:16.477Z
tags: ai-translated
editor: markdown
dateCreated: 2024-03-15T03:34:12.220Z
---
# Обход ограничений Remote Desktop для Lineage 2

Ниже — пошаговая инструкция по настройке.

## 1. Скачайте EyeAuras

Сначала скачайте приложение EyeAuras с нашего сайта: [EyeAuras Download](https://eu.eyeauras.net/download)

## 2. Зарегистрируйтесь и приобретите лицензию

- Создайте аккаунт и при необходимости купите лицензию, чтобы открыть все возможности. Начать можно здесь: [EyeAuras Login](https://eu.eyeauras.net/login)

## 3. Настройте перенаправление ввода

- Скачайте этот бесплатный драйвер для совместимости: [Download Driver](https://s3.eyeauras.net/media/2024/10/HVDK%20Standard%202.1.exe)

- После установки перейдите в `C:\Program Files (x86)\ControlMyJoystick 5.5.78.50\Driver\Joystick` и запустите `.bat`-файл удаления от имени администратора.

## 4. Настройте EyeAuras

Откройте EyeAuras, перейдите в Settings и измените `Input Redirect Simulation` на `TetherScript Driver`.

![screenshot_43.png](/screenshot_43.png)

После применения изменений в нижней панели появятся кнопки переключения перенаправления — с их помощью можно включать и отключать редирект.

![screenshot_42.png](/screenshot_42.png)

## 5. Решение проблем

Если возникает баг, при котором камера постоянно крутится, откройте настройки игры (L2 settings) и отключите `Enable Controller` в разделе `Settings -> Configuration`.

## 6. Рекомендуемая программа для удалённого доступа: Parsec

- Скачать: [Download Parsec](https://parsec.app/downloads)
- Подробнее: [here](https://wiki.eyeauras.net/ru/Lineage/parsec)

## 7. Видеоинструкция

Если вам удобнее смотреть, чем читать, мы подготовили подробный видеогайд по настройке и использованию.