---
title: Окно с виджетом входа
description: 
published: true
date: 2025-02-27T19:43:55.329Z
tags: ai-translated
editor: markdown
dateCreated: 2025-02-27T19:43:55.329Z
---
# Добавить LoginWidget в своё окно

Если вашей панели нужен штатный вход EyeAuras, разместите LoginWidget внутри её Razor-компонента. Виджет показывает Login либо имя пользователя и открывает штатную форму. Для первого опыта достаточно увидеть кнопку: выполнять вход не требуется.

Нужен проект **C# Script** в обычном хосте EyeAuras с зарегистрированными службами входа. Это не самостоятельная программа WPF и не произвольный Blazor-сайт. Обычная регистрация компонента в другом проекте не создаёт подключение к Eye Hub.

## Открыть окно с кнопкой

1. Создайте ауру с **C# Script** и два файла: **Script.csx** и **MainWindow.razor**. Пространство имён PhantomPixel должно совпадать в Razor и using скрипта.
2. Замените содержимое файлов кодом ниже. Нажмите **Run** в редакторе скрипта.
3. В отдельном окне появится заголовок Using login Widget и Login либо имя доступного пользователя. Это наблюдаемый результат примера; он не означает получение новой лицензии.
4. Закройте окно или нажмите **Stop** в редакторе. ShowDialog завершит ожидание, затем выход из явного блока using освободит окно.

**Script.csx**

```csharp
using PhantomPixel;
using PoeShared.Blazor.Wpf;

{
    using var window = GetService<IBlazorWindow>();
    window.ViewType = typeof(MainWindow);
    window.WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen;
    window.ShowDialog(cancellationToken);
}
```

**MainWindow.razor**

```razor
@namespace PhantomPixel
@using PoeShared.Blazor
@using EyeAuras.Blazor.Controls
@inherits BlazorReactiveComponent

<h3 class="text-center">Using login Widget</h3>
<LoginWidget/>

@code {
    
}
```

| Часть | Откуда берёт данные и кто ей владеет |
| --- | --- |
| GetService и cancellationToken | Верхнеуровневый контекст Script.csx; обычному классу или Razor эти имена не предоставляются глобально. |
| IBlazorWindow | Получается из контейнера скрипта; using держит его до завершения ShowDialog. Окно размещает MainWindow как компонент. |
| ILicenseAccessor | Внедряется в LoginWidget службами приложения. При отрисовке валидная лицензия с непустым Username даёт имя; иначе показывается Login. |
| ILoginPopupDisplayer | Внедряется в виджет и открывает штатную форму через OpenPopupCommand. Сам компонент не содержит токен или пароль. |
| Обновление имени | Виджет наблюдает Username через механизм ChangeTrackers базового компонента. Свои бессрочные подписки в примере не нужны. |

При желании нажать Login пользователь запускает обычный маршрут входа своей версии, который может перейти в системный браузер. Закрытие popup не следует считать отменой всей авторизации: её состоянием владеют службы приложения. Токен ShowDialog управляет ожиданием окна скрипта, а не универсальной отменой сетевого входа.

Popup создаётся через штатный механизм с переходом на UI-поток. Не переносите нативный ShowDialog в Task.Run из обработчика Razor. Если добавляете собственный файловый диалог, используйте UI-обёртки приложения. Сам виджет не выдаёт sublicense lease и не доказывает доступность платного пака.

Старый снимок показывает другое оформление формы; нынешний маршрут входа не нужно воспроизводить по расположению полей на нём.

![LoginWidget в прежней форме](https://s3.eyeauras.net/media/2025/02/NVIDIA_Overlay_jn4RZEHy34Psv9ln.png)

[Исходная публикация примера](https://eu.eyeauras.net/share/S20250227194343PPMhqedSZnTo) — дополнительный материал; для собственного окна достаточно двух файлов выше. Про контекст: [хосты скриптов](/ru/scripting/api/core/app-runtime-contexts), [Blazor-окна](/ru/scripting/api/windows-subsystems/blazor-windows) и [IBlazorWindow](/ru/scripting/api/IBlazorWindow).
