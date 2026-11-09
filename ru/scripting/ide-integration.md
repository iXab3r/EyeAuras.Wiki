---
title: Интеграция с IDE, AI и MCP
description: Export, Live Import, AI-ассистенты и MCP
published: true
date: 2025-10-19T16:57:15.817Z
tags: 
editor: markdown
dateCreated: 2025-10-19T16:35:51.518Z
---

# Изменить проект в IDE и вернуть результат в EyeAuras

Когда скрипту нужны несколько классов, папки и навигация по коду, экспортируйте его в C#-решение. Затем измените файл в своей IDE и загрузите его обратно. EyeAuras остаётся местом запуска: проект содержит средства для компиляции, но не отдельный работающий хост EyeAuras.

Нужны собственный редактируемый `C# Script`, отдельная пустая папка для экспорта и IDE с поддержкой C# и `.sln`: [Rider](https://www.jetbrains.com/rider/), [Visual Studio](https://visualstudio.microsoft.com/) или [VS Code](https://code.visualstudio.com/). Для сборки в IDE нужен совместимый .NET SDK и доступ к источникам зависимостей. Начать можно с [Hello, world](/ru/scripting/examples/basic/hello-world).

## Проверить один полный цикл

1. В редакторе действия нажмите `Export...` и выберите отдельную папку. **Экспорт очищает её файлы и подпапки, сохраняя `.git`.** Не выбирайте папку с другими нужными данными.

![Controls](https://s3.eyeauras.net/media/2025/10/EyeAuras_gzfCRUFI9X.png)

![Export](https://s3.eyeauras.net/media/2025/10/EyeAuras_JSVt6axMGz.png)

2. Откройте полученное `.sln` в IDE. Рядом находятся проекты и настройки NuGet для SDK EyeAuras. Восстановите зависимости и проверьте диагностику.

![Export Result](https://s3.eyeauras.net/media/2025/10/explorer_BOZVwOvceo.png)

![IDE](https://s3.eyeauras.net/media/2025/10/rider64_oeP2xd0Itf.png)

3. В `Script.csx` замените сообщение на `Log.Info("Hello from IDE");` и сохраните файл.
4. В EyeAuras нажмите `Import...`, выберите экспортированное `.sln` и дождитесь загрузки. Импорт заменяет содержимое проекта скрипта данными с диска; правки, сделанные только в EyeAuras после экспорта, будут потеряны.

![Import](https://s3.eyeauras.net/media/2025/10/EyeAuras_mu4Q1nJJ7V.png)

5. Нажмите `Run` в EyeAuras и найдите `Hello from IDE` в `Event Log`. Это подтверждает, что вернулось именно ваше изменение.

![Run](https://s3.eyeauras.net/media/2025/10/EyeAuras_eO23JLfMTK.png)

Снимки показывают редактор прежней версии. В текущем EyePad файлы открытого решения помечены `Read-only`: редактируйте их снаружи, а результат проверяйте здесь. При `CompileOnce` импорт и наблюдение за файлами недоступны; для редактирования собственной копии сначала снимите этот режим.

## Выбрать способ обновления

| Команда | Что происходит |
| --- | --- |
| `Export...` | Создаёт `.sln`, `.csproj`, исходники, ресурсы и ссылки на зависимости в выбранной папке. |
| `Import...` | Однократно загружает проект с диска в скрипт EyeAuras. Это замена, а не слияние двух наборов правок. |
| `Live Import` / `Live...` | Наблюдает за выбранным решением и переносит сохранённые изменения в EyeAuras. |
| `Open in IDE...` | Экспортирует, открывает `.sln` приложением, назначенным Windows для этого расширения, и начинает `Live Import`. |

Для короткого цикла разработки включите `Live Import`, выберите своё `.sln`, измените сообщение в IDE и сохраните. Дождитесь сообщения об обновлении проекта; затем перезапустите действие и проверьте журнал. Если код не изменился, проверьте выбранный путь и диагностику синхронизации.

![Live Import](https://s3.eyeauras.net/media/2025/10/EyeAuras_JLTElJy5Ey.png)

![Open in IDE](https://s3.eyeauras.net/media/2025/10/EyeAuras_C1aJ9hBHCB.png)

Это односторонняя синхронизация с диска, а не сохранение всего состояния запущенного .NET-кода. Изменение может пересоздать контекст скрипта и сбросить его поля. Наблюдение учитывает `.gitignore`, `.eaignore` и исключения сгенерированных файлов; подробности — в [рабочем процессе проекта](/ru/scripting/api/scripting/project-workflow).

## Редактировать интерфейс оверлея

Для `C# Overlay` можно тем же способом менять Razor-компоненты окна [Blazor Windows](/ru/scripting/blazor-windows/getting-started). После импорта и успешной компиляции проверьте конкретный видимый текст или элемент окна; обновление может пересоздать его содержимое.

![C# Overlay](https://s3.eyeauras.net/media/2025/10/EyeAuras_FXgRIKk17o.png =x300)

На сохранённых демонстрациях видно изменение счётчика во встроенном редакторе и Rider. Они объясняют цикл разработки, а не обещают сохранение состояния каждого окна:

![C# Overlay Live](https://s3.eyeauras.net/media/2025/10/EyeAuras_4geb5IBg7R.gif =x300)

![C# Overlay in Rider](https://s3.eyeauras.net/media/2025/10/Discord_uec9o89iub.gif =x400)

<details>
<summary>Границы экспорта и возможности IDE</summary>

IDE даёт автодополнение, навигацию, документацию, работу с обычными классами, папками, NuGet и Razor. Можно вынести чистую логику в классы и тестировать её отдельным проектом. Не подключайте тестовый проект как исполняемую зависимость скрипта: импорт сопоставляет проект скрипта и связанные проекты, а не любое решение целиком.

Служебные заглушки окружения позволяют компилировать проект. Они не превращают `Log`, `Variables`, `Sleep` или `cancellationToken` в глобальные API обычных классов и не запускают EyeAuras внутри IDE. Передавайте зависимости явно; [карты API](/ru/scripting/api/AGENTS) помогают выбрать контекст.

Pre-/post-build действия не исполняются при импорте в EyeAuras. Если IDE генерирует JavaScript из TypeScript, импортируйте уже полученные файлы. Для библиотек смотрите [встроенные ресурсы](/ru/scripting/embedded-resources) и NuGet. Доступность отладки и расширений зависит от вашей среды.

Подход применяется в [макросах](/ru/macros/getting-started) и [деревьях поведения](/ru/behavior-trees/scripting), при [поиске изображений](/ru/scripting/examples/basic/image-search), [вводе](/ru/scripting/examples/basic/send-text), [работе с памятью](/ru/scripting/api/memory) и [ImGui](/ru/scripting/imgui/getting-started). Ранний этап экспорта описан в [истории версии](/ru/changelogs/7930). Ниже — прежний пример многокомпонентного проекта и его окна:

![Bot example](https://s3.eyeauras.net/media/2025/10/rider64_NlTMZAX9e4.png =x500)

Если экспорт собственного рабочего скрипта не собирается, подготовьте [отчёт о проблеме](/ru/features/problem-reports). Вложение `Auras.zip` передаёт конфигурацию, поэтому перед отправкой проверьте его состав.

</details>

## Подключить инструменты MCP к IDE

MCP — протокол, через который AI-клиент запрашивает инструменты программы. EyeAuras предоставляет анализ **выбранного экспортированного проекта EyePad**: диагностику компиляции, символы, документацию, ссылки и пакеты. Контекст выбирается заново при каждом вызове; сверяйте возвращённый проект. Сам код на диске редактирует IDE или её клиент.

1. Откройте [AI Assistant](/ru/features/ai-assistant), вкладку `AI`.
2. При необходимости нажмите `Show Settings`, проверьте `MCP Port` и нажмите `Start MCP`.
3. Дождитесь `MCP server is running.`. Начальное значение порта — `48080`; используйте фактически показанный адрес:

```text
http://127.0.0.1:48080/mcp
```

4. В клиенте добавьте HTTP-сервер MCP с этим адресом. В Rider путь — `Settings | Tools | AI Assistant | Model Context Protocol (MCP)`:

```text
http://127.0.0.1:48080/mcp
```

В VS Code используйте настройки MCP или `mcp.json`; в Visual Studio — настройки поддерживающего MCP AI-инструмента. Интерфейс клиента зависит от версии: см. [JetBrains](https://www.jetbrains.com/help/ai-assistant/mcp.html) и [VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers).

Подключение не запускает скрипт и не даёт доступа ко всем файлам. Проверяйте список доступных инструментов и выбранный проект. [Реализация выбора проекта](https://github.com/iXab3r/EyeAuras/blob/c8b2304ac9ada59d217984035c8302b6e375ad10/Sources/EyeAuras.UI/AI/Mcp/EyeAurasMcpOnDiskScriptingPlugin.cs) поясняет границу этого маршрута.
