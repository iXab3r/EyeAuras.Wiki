---
title: 2. BlazorWindows и WebView2
description: Чем режим Window отличается от Overlay и как настроить окно C# Overlay
published: true
date: 2025-08-17T09:21:21.000Z
tags: ai-translated
editor: markdown
dateCreated: 2025-05-11T00:47:25.172Z
---
# Выбрать окно для своей панели

Панели настроек обычно нужен заголовок, и её хочется двигать. Индикатору поверх другого окна рамка не нужна. В **C# Overlay** это два режима одного окна, содержимое компонента при этом не меняется.

[WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2) показывает HTML/CSS внутри нативного окна. Blazor связывает этот интерфейс с C#, а Blazor Windows соединяет компонент с оконным механизмом EyeAuras.

![WebView2 внутри окна EyeAuras](https://s3.eyeauras.net/media/2025/05/WebView2.drawio%20(1).png)

## Сравнить Window и Overlay

Нужен свой **C# Overlay** со стандартным счётчиком и активная аура, например с **Fixed Value → Is Active**. В списке оверлеев выбирайте текущий **C# Overlay**. На старых снимках он называется v3.

![Виды оверлеев в прежнем меню](https://s3.eyeauras.net/media/2025/05/mIYLrG2yj2.png)

1. Откройте настройки добавленного C# Overlay. В **Window Settings** выберите **Window** и задайте заголовок `Моя панель`.
2. В **Position** задайте ширину `400` и высоту `200`. Снимите **Is Locked**, чтобы окно можно было двигать и менять его размер.
3. В **Visual style** выключите **Click-Through mode**, чтобы кнопка принимала нажатия. **Opacity** оставьте `100%`.
4. Нажмите **Click Me** — счётчик вырастет. Затем переключите **Window Settings → Overlay**. Заголовок и системная рамка исчезнут, а значение счётчика сохранится.

![Режим Window с заголовком](https://s3.eyeauras.net/media/2025/05/Njy7t9XEg2.png)
![То же содержимое в режиме Overlay](https://s3.eyeauras.net/media/2025/05/R432QeysKh.png)

| Настройка | Как выбрать |
| --- | --- |
| `Window` | Панель с заголовком и системным оформлением. Кнопка закрытия в этом C# Overlay отключена: видимостью управляет аура. |
| `Overlay` | Панель без заголовка и системных кнопок. В этом режиме окно всегда показывается поверх остальных. |
| `Always On Top` | Держит окно поверх других в режиме Window. В Overlay это уже включено. |
| `Is Locked` | Запрещает менять размер и двигать окно обычным способом. Кнопки внутри компонента он не выключает. |
| `Moveable even if Locked` | Разрешает двигать закреплённое окно. |
| `Click-Through mode` | Пропускает ввод сквозь окно, когда выполнены условия этого режима. Для интерактивной панели оставьте выключенным. В C# Overlay он действует на закреплённое окно, когда главное окно EyeAuras не активно. |
| `Opacity`, фон и рамка | Меняют оформление окна. Прозрачное окно не начинает само пропускать ввод. |
| Условия активности ауры | Определяют, показан ли оверлей. Когда окно скрыто, оно и компонент могут продолжать жить. |

Положение и размер задаются здесь:

![Параметры положения](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_O2I6OKwmjq.png)

Фон, рамка, прозрачность и пропускание ввода — в соседней группе:

![Оформление окна](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_VfFC6J8Kgd.png)

Режим Window/Overlay, заголовок, закрепление поверх окон и ограничения размера — в **Window Settings**:

![Оконные настройки](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_ohz05OLVxV.png)

Окно не появилось — сначала проверьте, что аура активна и загружена, затем ошибки компиляции. Окно видно, но кнопка не нажимается — проверьте **Click-Through mode**.

## Компонент и окно — разные части

Редактор C# Overlay компилирует проект и выбирает, какой открытый тип компонента показать. `UserOverlay.razor` описывает содержимое, а настройки выше — окно. `Script.csx` выполняется как точка входа. Оверлей покажется только после того, как она завершится, поэтому бесконечное ожидание в `Script.csx` остановит показ.

Сервисы компонент получает через `[Inject]`. Переменные `Script.csx`, его `GetService` и `cancellationToken` в Razor не становятся глобальными именами. В [следующей статье](/ru/scripting/blazor-windows/3-hello-world) — согласованные файлы компонента, а в [отдельном примере](/ru/scripting/blazor-windows/getting-started) окно создаётся через действие C# Script.

<details>
<summary>Как читать старые примеры v2 и v3</summary>

![Редактор C# Overlay v3](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_TqJxUFKYNe.png)

`C# Overlay v2 (legacy)` — для старых проектов. Для нового примера берите текущий C# Overlay.

![Прежний редактор v2](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_DKdQydbTcq.png)

![Window в прежнем v2](https://s3.eyeauras.net/media/2025/05/NVIDIA_Overlay_AvrTCKw3p6.png)
![Overlay в прежнем v2](https://s3.eyeauras.net/media/2025/05/n02buCY4RI.png)

[Реализация CsharpAuraOverlay](https://github.com/iXab3r/EyeAuras/blob/20fd3d424d886f6c99b979536a148774d289d110/Sources/EyeAuras.CsScriptAuras/Overlays/CsharpOverlay/CsharpAuraOverlay.cs) задаёт оконные параметры и связывает видимость с состоянием ауры.

</details>
