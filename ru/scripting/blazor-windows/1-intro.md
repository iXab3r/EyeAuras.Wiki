---
title: 1. Что такое Blazor и как использовать его в EyeAuras
description: Краткое руководство по Blazor и его использованию в EyeAuras
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T13:31:15.490Z
---
[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) — это мощный инструмент для создания удобных и красивых интерфейсов на C#. Изначально он предназначался для веб-разработки, но мы будем использовать его для интерфейсов в наших скриптах: панелей настроек, оверлеев и всплывающих окон. Всё это можно делать через доступный вам API.

# Примеры из этой серии

Все примеры можно скачать [здесь](https://tinyurl.com/msfhaupc). Рекомендую скачать весь набор целиком, а не пытаться импортировать его в текущую версию.

# Создаём первый оверлей

Это очень просто:

- Создайте новую ауру
![New aura](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_KBChU81nd6.png)

- Добавьте `C# Overlay v3`
![New Overlay](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_xVFX70YeoA.png)

- Готово

На этом этапе у вас уже есть полностью рабочий интерактивный UI.

![v3](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_UVQrNGj5te.png)

Если нажать кнопку `Click Me`, счётчик в программе начнёт обновляться!

![clickme](https://s3.eyeauras.net/media/2025/05/ltZnDlxcvJ.gif)

## Почему именно Blazor?

[Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor) отлично подходит для создания интерфейсов, потому что объединяет гибкость и производительность C# с огромными возможностями HTML/CSS и JavaScript. За последние два десятилетия ни в один стек не вкладывали столько ресурсов крупнейшие компании мира. В результате у нас есть инструмент, который позволяет отрисовать практически всё, что можно представить. Загляните на https://codepen.io/ — там много вдохновляющих примеров того, на что способна эта «великолепная троица».

Теперь, когда мы разобрались с сильными сторонами HTML/CSS/JS, давайте поймём, какую роль во всём этом играют C#/Blazor. Коротко: Blazor позволяет генерировать HTML и связывает мир веб-разработки с C#. Наше приложение делится на две части: [Razor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/?view=aspnetcore-8.0) и C# backend. Razor отвечает за отрисовку данных, а C# — за их подготовку.

EyeAuras — а значит, и ваши скрипты — работает на стыке этих двух технологий. Давайте разберём основные части, с которыми вам предстоит работать.

## [HTML](https://www.w3schools.com/html/)

Это язык разметки, на котором построен весь Интернет. Он определяет, где на странице будут располагаться текст, кнопки, таблицы и другие элементы. С помощью HTML вы задаёте структуру страницы, которую затем оформляете через...

## [CSS](https://www.w3schools.com/html/html_css.asp)

**C**ascading **S**tyle **S**heets отвечают за внешний вид кнопок, текста и всех остальных элементов. Через CSS настраиваются цвета, прозрачность, анимации и множество других деталей.

## [Razor](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/?view=aspnetcore-8.0)

Razor — это язык разметки от Microsoft, который позволяет смешивать HTML, CSS и C# в одном файле.

Давайте создадим первый компонент и разберём его по частям. В нём будет текст и кнопка, которая увеличивает счётчик при нажатии.

```html
<h1>Counter</h1>

<p>Current count: @currentCount</p>

<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>

@code {
    private int currentCount = 0;

    private void IncrementCount() => currentCount++;
}
```

![Counter](https://s3.eyeauras.net/media/2024/11/msedge_Wvy12LEOv1bGyAOA.gif)

В этом небольшом фрагменте кода HTML и C# работают вместе и дополняют друг друга. C# определяет, что произойдёт при нажатии на кнопку, а HTML/CSS отвечают за то, как всё выглядит.