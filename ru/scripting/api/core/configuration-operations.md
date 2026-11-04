---
title: Сериализация и редактирование настроек
description: Сохранение наблюдение копирование и перенос конфигурации через IConfigProvider и IConfigSerializer
published: true
date: 2026-11-03T00:00:00.000Z
tags: scripting, api, configuration, serialization
editor: markdown
dateCreated: 2026-11-03T00:00:00.000Z
---
# Сериализация и редактирование настроек

`IConfigProvider<TConfig>` отвечает за текущие настройки и их сохранение, а `IConfigSerializer` — за преобразование данных в JSON и обратно. Используйте сериализатор, чтобы подготовить редактируемую копию или переносимую строку; сохранение такой копии остаётся отдельным действием.

Оба интерфейса находятся в `PoeShared.Modularity`. В верхнеуровневом C# Action EyeAuras сериализатор можно получить через `GetService<IConfigSerializer>()`. Обычный класс получает его через конструктор. Host регистрирует сервис через общую инфраструктуру PoeShared; создание произвольного `new JsonConfigSerializer()` не является публичным способом подключения.

## Получить копию для редактирования

Следующий C# Script Action создаёт простой объект, копирует его через сериализатор и меняет только копию:

```csharp
using PoeShared.Modularity;

var serializer = GetService<IConfigSerializer>();
var original = new PanelSettings { Caption = "Inventory", Limit = 10 };

var json = serializer.Serialize(original);
var edited = serializer.Deserialize<PanelSettings>(json);
edited.Caption = "Preview";
edited.Limit = 20;

Log.Info($"Исходный объект: {original.Caption}, {original.Limit}");
Log.Info($"Копия: {edited.Caption}, {edited.Limit}");

public sealed class PanelSettings
{
    public string Caption { get; set; }
    public int Limit { get; set; }
}
```

Ожидаемый вывод: исходный объект остаётся `Inventory, 10`, копия содержит `Preview, 20`. Десериализация создаёт объект из сериализуемых данных; она не копирует живые подписки, контейнер, native handles и другую runtime-инфраструктуру.

Для редактирования уже существующего конфига передайте в `Serialize` его значение, например `provider.ActualConfig`, а `Deserialize<TConfig>` вызовите с тем же поддерживаемым типом. До подтверждения пользователем работайте с копией. После подтверждения вызовите `provider.Save(edited)`; простая сериализация файл настроек провайдера не изменяет.

## Передать настройки одной строкой

В том же контексте C# Action:

```csharp
using PoeShared.Modularity;

var serializer = GetService<IConfigSerializer>();
var source = new TransferSettings { Caption = "Panel", Limit = 5 };

string packed = serializer.Compress(source);
var restored = serializer.Decompress<TransferSettings>(packed);
Log.Info($"Восстановлено: {restored.Caption}, {restored.Limit}");

public sealed class TransferSettings
{
    public string Caption { get; set; }
    public int Limit { get; set; }
}
```

`Compress(object)` сначала сериализует данные, затем сжимает строку; `Decompress<T>(string)` выполняет обратную цепочку. Для читаемого JSON используйте `Serialize` и `Deserialize` напрямую. Сжатие не является шифрованием и не обеспечивает совместимость произвольных версий типов.

## Наблюдать одно поле и сохранять новый экземпляр

Для следующего обычного C# класса host уже предоставляет `IConfigProvider<PanelConfig>`. Он создаётся из общей регистрации `IConfigProvider<>` и регистрации основного провайдера конфигурации. Тип должен реализовывать `IPoeEyeConfig` и иметь конструктор без параметров; путь и способ записи определяет host.

```csharp
using System;
using System.Reactive.Linq;
using PoeShared.Modularity;

public sealed record PanelConfig : IPoeEyeConfig
{
    public string Caption { get; set; } = "Panel";
}

public sealed class PanelEditor : IDisposable
{
    private readonly IConfigProvider<PanelConfig> provider;
    private readonly IDisposable subscription;

    public PanelEditor(IConfigProvider<PanelConfig> provider, Action<string> changed)
    {
        this.provider = provider;
        subscription = provider.ListenTo(x => x.Caption).Subscribe(changed);
    }

    public void Rename(string caption)
    {
        provider.Save(provider.ActualConfig with { Caption = caption });
    }

    public void Dispose() => subscription.Dispose();
}
```

Вызывающая сторона создаёт `PanelEditor` с провайдером и обработчиком строк, а при закрытии редактора освобождает его. Провайдер заимствован; класс освобождает только собственную подписку.

`ListenTo(x => x.Caption)` возвращает `IObservable<string>` и отсекает повторяющиеся значения выбранного поля. Источник связан с `WhenChanged`, который в реализации переигрывает последнее доступное изменение. Не используйте уведомления как счётчик вызовов `Save` и не предполагайте UI-поток: переход на UI зависит от потребителя.

Перед `Save` создавайте новый экземпляр. `GenericConfigProvider` сравнивает сохраняемый конфиг с `ActualConfig` и пропускает равные значения. Изменение самого `ActualConfig` до сохранения может скрыть различие.

## Контракт провайдеров

| Член | Смысл |
|---|---|
| `IConfigProvider<TConfig>.ActualConfig` | Текущий типизированный конфиг |
| `WhenChanged` | `IObservable<TConfig>` изменений конфигурации |
| `Save(TConfig config)` | Передать новый конфиг на сохранение |
| `ListenTo<T>(Expression<Func<TConfig,T>> fieldToMonitor)` | Наблюдать выбранное поле, отсекая равные значения |
| `IConfigProvider.ConfigHasChanged` | Общий сигнал изменений без конкретного конфига |
| `Configs` | `IObservableCache<IPoeEyeConfig,string>` конфигураций |
| `Save()` | Сохранить через основной провайдер |
| `Save(IPoeEyeConfig config)` | Передать конкретный конфиг основному провайдеру |
| `GetActualConfig<TConfig>()` | Получить текущий конфиг указанного типа |

У `IConfigProvider<TConfig>` нет метода `SaveBuffered`. Если изменения объединяются с задержкой, такая очередь принадлежит вызывающей стороне; перед её завершением нужно решить, сохранять или отменять ожидающие изменения.

## Контракт сериализатора

| Операция | Формы вызова и результат |
|---|---|
| `Serialize` | `string Serialize(object data)`; `void Serialize(object data, TextWriter textWriter)`; `void Serialize(object data, FileInfo file)` |
| `Deserialize<T>` | Вход `string`, `TextReader` или `FileInfo`; результат `T` |
| `Deserialize` | Те же три вида входа плюс `Type`; результат `object` |
| `DeserializeSingleOrList<T>(string)` | Принимает JSON одного объекта или массива, возвращает `T[]` |
| `DeserializeOrDefault<T>(PoeConfigMetadata<T>, Func<PoeConfigMetadata<T>,T>) where T : class` | Пытается восстановить значение metadata; при недоступном значении использует переданную фабрику |
| `Compress(object)`, `Decompress<T>(string)` | Сжатая строка и восстановленное типизированное значение |
| `RegisterConverter(JsonConverter)` | Добавляет конвертер к данному экземпляру сериализатора |
| `DisablePooling()` | Возвращает `IDisposable`, ограничивающий отключение pooling; освобождается вызывающим |
| `MaxDepth` | Константа интерфейса со значением `1024`, а не отдельная гарантия корректности произвольного входа |

Все эти операции сериализатора синхронные; `await` для них не требуется. Перегрузка с `FileInfo` читает или записывает явный файл. В реализации запись создаёт отсутствующий родительский каталог. Владение переданными reader/writer нужно оценивать по реализации: работа выполняется через внутренний `JsonReader/JsonWriter`, поэтому не распространяйте правила обычного файлового метода на произвольный поток без проверки.

Конвертеры меняют поведение конкретного сервиса. Для заимствованного host-сериализатора не регистрируйте их только ради локального примера: изменение затронет других потребителей этого экземпляра. Операции настройки сериализатора предназначены для согласованной интеграции host.

## Версии и полиморфные данные

`PoeConfigMetadata<T>` сохраняет сведения о типе вместе с данными; это важно для конфигураций аур и модулей. Успешная сериализация простого DTO не означает, что произвольный тип можно перенести между сборками или версиями приложения.

При изменении обычного свойства не повышайте автоматически `IPoeEyeConfigVersioned.Version`. Версия служит границей миграции или сброса; детали см. в [конфигурации и сохранении](configuration-persistence). Путь миграции и доступность соответствующих типов нужно проверять отдельно.

Контракты сверены с PoeEye `0e02c98dcab4bff263684f1c0647eed120e2700f`: [IConfigSerializer](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared/Modularity/IConfigSerializer.cs), [IConfigProvider](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared/Modularity/IConfigProvider.cs), [GenericConfigProvider](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared/Modularity/GenericConfigProvider.cs). Примеры собственного типа относятся к той сборке скрипта, в которой он объявлен.

- [Контексты выполнения](app-runtime-contexts)
- [Регистрация сервисов скрипта](../scripting/container-extensions)
- [Реактивность](reactivity)
