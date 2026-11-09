---
title: 1. Что такое Blazor и как использовать его в EyeAuras
description: Краткое руководство по Blazor и его использованию в EyeAuras
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T13:31:15.490Z
---
# Своя панель в EyeAuras

Панель с кнопками, счётчиком или настройками можно написать на C# и показать поверх своего рабочего окна. Для первого знакомства достаточно добавить **C# Overlay**: он уже содержит интерактивный счётчик. Отдельный веб-сайт для него не нужен.

[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) связывает разметку интерфейса с обработчиками C#. В EyeAuras компонент отображается внутри окна приложения. [Razor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/?view=aspnetcore-8.0) позволяет писать разметку и обращения к C# рядом.

| Часть | За что отвечает |
| --- | --- |
| [HTML](https://www.w3schools.com/html/) | Текст, кнопки и расположение элементов в разметке. |
| [CSS](https://www.w3schools.com/html/html_css.asp) | Цвет, размеры, отступы и оформление. |
| Razor, файл `.razor` | Связывает разметку с данными и событиями компонента. |
| C#, файл `.cs` | Хранит состояние компонента и выполняет обработчики. Его можно оставить и в блоке `@code` внутри Razor. |
| `Script.csx` | Точка входа скрипта; это отдельный контекст, а не сам Razor-компонент. |

## Открыть готовый счётчик

1. Создайте собственную тестовую ауру через **Add new → New Aura**.

![Создание ауры](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_KBChU81nd6.png)

2. В разделе **Overlays** добавьте **C# Overlay**. На старом снимке он называется `C# Overlay (v3, alpha)`.

![Добавление C# Overlay в прежнем редакторе](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_xVFX70YeoA.png)

3. Оставьте сгенерированные файлы без изменений. Для постоянной видимости добавьте в эту ауру **Fixed Value** со значением **Is Active** и оставьте ауру загруженной.

![Редактор и стандартный счётчик](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_UVQrNGj5te.png)

4. Нажмите **Click Me** в появившемся окне. Число на панели увеличивается после каждого нажатия.

![Нажатия меняют счётчик](https://s3.eyeauras.net/media/2025/05/ltZnDlxcvJ.gif)

Это состояние экземпляра компонента. При его пересоздании счётчик начнётся с нуля; простое скрытие окна не обязательно пересоздаёт компонент.

## Куда двигаться дальше

| Задача | Следующий шаг |
| --- | --- |
| Выбрать обычное окно или оверлей, настроить видимость и ввод | [Устройство окна и WebView2](/ru/scripting/blazor-windows/2-webview). |
| Изменить текст, кнопку и обработчик | [Файлы первого компонента](/ru/scripting/blazor-windows/3-hello-world). Там есть полный пример и вариант с `@code`. |
| Переключать свою ауру кнопкой | [Один переключатель](/ru/scripting/blazor-windows/4-toggle-hotkeyisactive). |
| Создать диалог из действия C# Script и передать ему данные | [Окно из скрипта](/ru/scripting/blazor-windows/getting-started). |

Так выглядит тот же принцип у простого компонента без оформления стандартного шаблона:

![Простой счётчик на Razor](https://s3.eyeauras.net/media/2024/11/msedge_Wvy12LEOv1bGyAOA.gif)

<details>
<summary>Учебный пакет и дополнительные материалы</summary>

[Скачать примеры](https://tinyurl.com/msfhaupc) можно как отдельный учебный набор. [Tutorial — Blazor Windows, revision 3](https://eyeauras.net/share/S20250511162645vYh4n3mqSLm0/3) относится к EyeAuras **1.7.8354.0**; его файлы и снимки показывают прежний редактор. Для первого опыта в текущем редакторе удобнее начать с нового C# Overlay, как выше.

На [CodePen](https://codepen.io/) есть примеры оформления HTML/CSS. Их разметку и стили нужно адаптировать к своему компоненту; пример для браузера сам по себе не создаёт окно EyeAuras.

[Генератор RazorComponentTemplate](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.Blazor.Shared/CodeEditor/Templates/RazorComponentTemplate.cs) создаёт две части компонента с общим namespace. При редактировании имена и namespace должны оставаться согласованными.

</details>
