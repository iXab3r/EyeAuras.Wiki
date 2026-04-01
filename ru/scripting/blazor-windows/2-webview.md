---
title: 2. BlazorWindows и WebView2
description: Документация по BlazorWindows и WebView2
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T00:47:25.172Z
---
# Что такое Blazor Windows и как они работают?

Во [вводной части серии](/ru/scripting/blazor-windows/getting-started) я рассказывал о Blazor, HTML и CSS. Но чтобы вся эта красота появилась на экране, нужен инструмент, который превращает наши скрипты и код в кнопки, формы и другие элементы интерфейса. Здесь и вступает в дело [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2) — встраиваемый браузер от Microsoft.

![WebView2](https://s3.eyeauras.net/media/2025/05/WebView2.drawio%20(1).png)

`WebView2` можно представить как часть приложения, которая отвечает за отрисовку наших компонентов.

`BlazorWindows` — это фреймворк, который связывает всё вместе: WebView, HTML, C# и CSS, позволяя создавать интерактивные окна. Именно эта технология используется в оверлеях и во многих частях EyeAuras.

## Чем отличаются окна от оверлеев?

Оверлей — это разновидность окна: по сути это то же окно, но с другими параметрами отображения. Например, оверлей обычно рисуется поверх остальных окон.

В EyeAuras есть несколько типов оверлеев:

![Overlays](https://s3.eyeauras.net/media/2025/05/mIYLrG2yj2.png)

## C# Overlay

Это один из основных способов быстро создавать интерфейсы в EyeAuras.

Идея простая:

- есть настроенное окно оверлея с позицией, именем и условием видимости. О содержимом — ниже.
- есть скрипт, написанный в EyeAuras, который описывает интерфейс с помощью Razor/HTML/CSS
- EyeAuras компилирует этот скрипт, и в результате мы получаем **библиотеку**, которая позволяет строить UI, отрисовываемый в оверлее через **WebView2**

### Настройки оверлея

У каждого оверлея есть:

- позиция и размер, а также флаг, определяющий, может ли пользователь перемещать его (`IsLocked`)

![Overlay position](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_O2I6OKwmjq.png)

- настройки внешнего вида — прозрачность, толщина и цвет рамки и т. д.

![Overlay visual style](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_VfFC6J8Kgd.png)

- настройки окна

![Overlay window style](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_ohz05OLVxV.png)

Самый важный переключатель здесь — тип окна: Overlay или Window.

- Window — почти обычное окно, только без кнопки закрытия. У него есть иконка, заголовок, его можно перетаскивать за title bar и т. д.
- Overlay — окно без рамки, без области перетаскивания и без системных кнопок.

![Window](https://s3.eyeauras.net/media/2025/05/Njy7t9XEg2.png) ![Overlay](https://s3.eyeauras.net/media/2025/05/R432QeysKh.png)

### C# Overlay v3

Текущая версия оверлеев, использующая scripting engine V3. Вам доступно всё, что есть в скриптах: пользовательские Razor-компоненты, интеграция с NuGet, сервисы EyeAuras и т. д. Каждый C# overlay — это небольшое приложение.

![v3](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_TqJxUFKYNe.png)

### C# Overlay v2 (устарело)

Упомянем его только кратко, так как использовать его больше не рекомендуется. Он будет удалён в одной из будущих версий и сейчас существует только ради обратной совместимости, не давая никаких преимуществ по сравнению с современным V3.

![v2](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_DKdQydbTcq.png)

Выглядит это так:

![Window](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_AvrTCKw3p6.png) ![Overlay](https://s3.eyeauras.net/media/2025/05/n02buCY4RI.png)