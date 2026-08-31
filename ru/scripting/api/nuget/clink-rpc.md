---
title: AI NuGet для CLink RPC
description: AI-ориентированная карта для proto-first сервисов CLink RPC и переиспользуемой управляемой среды CLinkRPC.
published: true
date: 2026-05-22T00:00:00.000Z
tags: scripting, api, ai, clink, rpc, protobuf, nuget, ipc, ai-translated
editor: markdown
dateCreated: 2026-05-22T00:00:00.000Z
---
# Карта API CLink RPC

Справочная карта по дополнительным API `EyeAuras.CLink.Rpc`: повторно используемые сессии CLinkRPC, адаптация транспорта CLink-соединений и сгенерированные proto-first клиенты и серверы сервисов.

## Модель

- `EyeAuras.CLink` по-прежнему отвечает за транспорт байтов и нативный ABI-фасад.
- `EyeAuras.CLink.Rpc` — это более высокий managed RPC runtime поверх этого транспорта, а также C#-пакет сборки, который встраивает генерацию по proto в MSBuild.
- Пользователь описывает контракт сервиса в `.proto` и protobuf-сообщения request/response, добавляет их как элементы `Protobuf` с `ClinkServices="Both"`, один раз собирает проект и затем использует сгенерированные клиенты и серверы из обычного C# кода.
- Сгенерированные C#-клиенты сериализуют protobuf DTO запросов и отправляют их как payload кадров CLinkRPC.
- Сгенерированные C#-серверы разбирают protobuf DTO запросов из payload кадров CLinkRPC и записывают protobuf DTO ответов.
- Сгенерированные C#-методы для streaming повторяют форму объектов gRPC C#, но без `async/await`: сгенерированные объекты вызова предоставляют `RequestStream`, `ResponseStream`, `MoveNext(CancellationToken)`, `Current`, `Write(in T, CancellationToken)`, `Complete(CancellationToken)` и `Response` для финальных ответов в client-streaming.
- Совместимость контракта проверяется во время handshake профиля CLinkRPC по fingerprint дескриптора/сервиса.
- Это не gRPC и не HTTP/2. Транспортом остаётся CLink, а протоколом сессии — CLinkRPC.
- Взаимодействие с процессом FridaSdk CAgent использует этот proto-first слой через `Sources/EyeAuras.FridaSdk/Api/cagent.proto`; при этом семантика операций Frida/CAgent остаётся в FridaSdk, а не в `EyeAuras.CLink`.

## Детали API

- C#-пакет предоставляет `buildTransitive` targets. Сгенерированные файлы `.clink.cs` записываются рядом с каждым proto-файлом во вложенную папку `generated`, относительно `CLinkRpcGeneratedOutputDir`, который по умолчанию указывает на каталог проекта. Например, `Api\calculator.proto` создаёт `Api\generated\calculator.clink.cs`.
- Правила C# namespace повторяют protoc/gRPC C#: если указан `option csharp_namespace`, используется он; иначе `package` из proto преобразуется в C# namespace. Файлы без package попадают в global namespace.
- Пакет включает `protoc` и `protoc-gen-clink-csharp` в каталоге `tools`. Их можно переопределить через `CLinkRpcProtocPath`, `CLinkRpcCSharpPluginPath`, `CLinkRpcGeneratedOutputDir`, либо включить `CLinkRpcVerbose=true` для диагностики генератора.
- Интеграция с JavaScript на этапе phase 1 выполняется вручную через пакет инструмента `protoc-gen-clink-js`. Он создаёт файлы `.clink.js` без зависимостей по той же схеме с подпапкой `generated`, включая codec'и сообщений (`measure`, `write`, `encode`, `read`), константы operation-id и данные дескриптора/профиля CLinkRPC сервиса. Готового transport/session runtime для JavaScript он пока не даёт.
- Сгенерированные точки входа клиента, например `CalculatorClient.Connect(address)`, открывают абсолютные адреса CLink и владеют собственным `CLinkRpcSession`.
- Сгенерированные точки входа сервера, например `CalculatorDescriptor.Start(address, implementation)`, публикуют реализации сервиса поверх принятых CLink-соединений и регистрируют protobuf-обработчики методов.
- `CLinkRpcSession`, `CLinkRpcOptions`, `CLinkRpcHandler`, `CLinkRpcResponse`, `CLinkRpcResponseStream`, `CLinkRpcRequestStream`, `CLinkRpcStreamReader`, `CLinkRpcServerStreamWriter` и `CLinkConnectionRpcTransport` — это повторно используемые низкоуровневые примитивы сессии/runtime.
- Данные descriptor/profile в handshake определяют форму сгенерированного proto-сервиса, включая флаги потоков, и отклоняют несовместимые пары клиент/сервер до начала вызовов.
- Protobuf payload'ы передаются как обычные байты payload метода внутри уже существующих кадров CLinkRPC `Call`, `Response`, `Error`, `StreamItem`, `StreamComplete` и `StreamCancel`.

## Правила контракта

- Предпочитайте определения сервисов в `.proto`, а не C#-интерфейсы, найденные через reflection.
- Сохраняйте стабильные operation id из сгенерированных дескрипторов; не выводите их из порядка reflection во время выполнения.
- Сохраняйте additive-совместимость protobuf: новые поля с новыми номерами полей должны безопасно игнорироваться старыми узлами.
- Отклоняйте некорректные protobuf payload'ы до вызова логики сервиса.
- В горячих путях сгенерированного кода не должно быть dispatch через reflection, упаковки аргументов в `object[]` и generic-вызовов protobuf runtime.
- CLinkRPC поддерживает конкурентные перемешанные вызовы по correlation id. Используйте несколько каналов CLink или несколько сгенерированных клиентов только тогда, когда узким местом становится физический путь отправки транспорта.

## Типовой сценарий

Установите пакет и добавьте proto-файлы как элементы MSBuild `Protobuf`:

```xml
<PackageReference Include="EyeAuras.CLink.Rpc" Version="..." />

<ItemGroup>
  <Protobuf Include="Api\calculator.proto" ClinkServices="Both" />
</ItemGroup>
```

После этого один раз соберите проект. Сгенерированные файлы `.clink.cs` по умолчанию появятся в `Api\generated`.

```proto
syntax = "proto3";
package EyeAuras.Example;

service Calculator {
  rpc Add(AddRequest) returns (AddReply);
}

message AddRequest {
  int32 left = 1;
  int32 right = 2;
}

message AddReply {
  int32 value = 1;
}
```

```csharp
using EyeAuras.Example;

using var server = CalculatorDescriptor.Start(address, new CalculatorService());
using var client = CalculatorClient.Connect(address);
using var result = client.Add(new AddRequest { Left = 2, Right = 3 });
Console.WriteLine(result.Response.Value);

sealed class CalculatorService : CalculatorServerBase
{
    public override AddReply Add(in AddRequest request)
    {
        return new AddReply { Value = request.Left + request.Right };
    }
}
```

Сгенерированные клиенты для server-streaming по форме похожи на синхронный gRPC C#:

```csharp
using var call = client.SubscribeEvents(new SubscribeEventsRequest());
while (call.ResponseStream.MoveNext(cancellationToken))
{
    var item = call.ResponseStream.Current;
    Process(item);
}
```

Используйте абсолютные адреса CLink, например `file://`, same-process `mem://`, конкретные `shared-mem://` или адреса `pipe://`. Семантика адресов по-прежнему относится к `EyeAuras.CLink`.

Интеграция с C на этапе phase 1 выполняется вручную. Скачайте и установите пакет генератора C и подключите `protoc` в нативную сборку:

```bat
protoc ^
  --plugin=protoc-gen-clink-c=path\protoc-gen-clink-c.exe ^
  --clink-c_out=. ^
  --proto_path=. ^
  Api\calculator.proto
```

Соберите сгенерированные файлы `Api\generated\*.clink_rpc.h` и `Api\generated\*.clink_rpc.c` вместе с нативным SDK CLink и остальной частью C-приложения.

Генерация codec/descriptor для JavaScript на этапе phase 1 тоже выполняется вручную:

```bat
protoc ^
  --plugin=protoc-gen-clink-js=path\protoc-gen-clink-js.exe ^
  --clink-js_out=. ^
  --proto_path=. ^
  Api\calculator.proto
```

Подключайте созданный модуль `Api\generated\*.clink.js` со стороны JavaScript-host и связывайте экспортированные дескрипторы со специфичным для хоста слоем сессии CLinkRPC, когда такой runtime появится.

## Заметки по производительности

- Измеряйте отдельно encode/decode protobuf и round-trip кадров CLinkRPC.
- Сгенерированные методы клиента и сервера должны вызывать конкретные парсеры и writers сообщений.
- Reflection, загрузка дескрипторов и работа генератора относятся к cold-start этапу.
- В горячих путях пакетов CLinkRPC не должно быть форматирования на каждый пакет, декодирования текста, логирования, обновлений UI, диагностических превью или лишних аллокаций.
- `EyeAuras.CLink.Rpc.Benchmarks` — отдельный benchmark-проект для этого пути со сгенерированным proto.
- Классы benchmark'ов в этом проекте помечены категорией слоя `generated-protocol`, а для более узких запусков используются категории `proto-first`, `grpc`, `http2-loopback`, `generated-csharp`, `raw-session-baseline`, `serializer`, `dispatch`, `round-trip`, `peer-matrix`, `c-to-c`, `csharp-to-csharp`, `csharp-to-c`, `c-to-csharp`, `c`, `csharp` и `cold`.
- Матрица generated peer измеряет пути codec и dispatch сгенерированного протокола для `C->C`, `C#->C#`, `C#->C` и `C->C#`. Эти строки отделены от benchmark'ов сырого байтового транспорта CLink и benchmark'ов рукописных сессий CLinkRPC.
- Строки `grpc` используют ту же форму calculator service/message через код, сгенерированный Grpc.Tools, и ASP.NET Core gRPC поверх loopback HTTP/2, поэтому это строки для сравнения, а не строки транспорта CLink.

## Когда это предпочтительно

- Предпочитайте proto-first сгенерированные контракты, когда узлам нужны стабильные кросс-языковые request/response DTO.
- Предпочитайте сгенерированные pull-streams для streaming payload'ов на базе span. Если используются адаптеры Observable, они должны владеть payload'ом или копировать его, потому что обычные observable не могут безопасно передавать представления span как `ref struct`. Сгенерированные server-streaming клиенты предоставляют методы `ObserveX(...)`, которые выдают DTO `{Message}Owned` и работают синхронно в потоке подписчика, если вызывающий код явно не применяет Rx scheduling.
- Предпочитайте additive-поля protobuf для совместимой эволюции request/response.
- Предпочитайте benchmark'и сырого `CLinkRpcSession` как базовую линию рядом с benchmark'ами сгенерированных клиентов и серверов.

## Чего избегать

- Не описывайте это как полноценный gRPC, HTTP/2 или ASP.NET transport.
- Не переносите семантику доменных операций Frida, CAgent или других подсистем в `EyeAuras.CLink`.
- Не возвращайтесь к обнаружению контрактов через reflection интерфейсов или `Reflection.Emit` для продуктового пути контрактов.
- Избегайте слишком широких графов DTO, пока генератор proto и тесты совместимости не покрывают их намеренно.

## Опорные термины для исследования

- `EyeAuras.CLink.Rpc`
- `CLinkRpcSession`
- `CLinkConnectionRpcTransport`
- `CLinkRpcOptions`
- generated CLink RPC client
- generated CLink RPC server
- protobuf request
- protobuf response
- descriptor fingerprint

## Синонимы для поиска

- CLink RPC
- proto-first RPC
- protobuf CLink
- generated service
- generated CLink client
- CLinkRPC session
- IPC contract
- CLink service

## Связанные карты

- `nuget/frida-sdk.md`
- `memory/processes.md`