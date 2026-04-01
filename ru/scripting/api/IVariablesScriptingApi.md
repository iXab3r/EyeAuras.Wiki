---
title: API скриптовых переменных
description: 
published: true
date: 2025-05-07T20:54:10.624Z
tags: ai-translated
editor: markdown
dateCreated: 2024-02-20T21:30:29.037Z
---
```csharp
/// <summary>
/// Определяет API для взаимодействия со скриптами, связанных с доступом к переменным и управлением ими в скриптуемой среде.
/// Этот интерфейс расширяет базовые возможности доступа к переменным, добавляя функции, ориентированные на сценарии, и позволяя работать с переменными в строгой типизации.
/// </summary>
/// <remarks>
/// Использование <see cref="ScriptVariable{T}"/> предоставляет строго типизированный способ доступа к переменным, обеспечивая проверку типов на этапе компиляции и снижая количество ошибок во время выполнения.
/// Это упрощает работу с переменными в скриптах и делает код более читаемым и удобным для поддержки.
/// </remarks>
public interface IVariablesScriptingApi : IScriptingApi, IVariablesAccessor
{
    /// <summary>
    /// Возвращает строго типизированный <see cref="ScriptVariable{T}"/>, связанный с указанной аурой и именем переменной.
    /// </summary>
    /// <typeparam name="T">Тип значения переменной.</typeparam>
    /// <param name="itemPath">Путь, идентифицирующий ауру.</param>
    /// <param name="variableName">Имя переменной.</param>
    /// <returns>Экземпляр строго типизированного <see cref="ScriptVariable{T}"/>.</returns>
    ScriptVariable<T> Get<T>(string itemPath, string variableName);

    /// <summary>
    /// Возвращает строго типизированный <see cref="ScriptVariable{T}"/> из указанного источника, реализующего <see cref="IHasVariables"/>.
    /// </summary>
    /// <typeparam name="T">Тип значения переменной.</typeparam>
    /// <param name="source">Объект-источник, содержащий переменную.</param>
    /// <param name="variableName">Имя переменной.</param>
    /// <returns>Экземпляр строго типизированного <see cref="ScriptVariable{T}"/>.</returns>
    ScriptVariable<T> Get<T>(IHasVariables source, string variableName);
    
     /// <summary>
    /// Возвращает общее количество переменных, которыми управляет этот accessor.
    /// </summary>
    int Count { get; }

    /// <summary>
    /// Проверяет, существует ли переменная с указанным именем.
    /// </summary>
    /// <param name="variableName">Имя переменной для проверки.</param>
    /// <returns>true, если переменная существует; иначе false.</returns>
    bool Contains(string variableName);

    /// <summary>
    /// Добавляет новую переменную или обновляет существующую переменную указанным значением.
    /// </summary>
    /// <typeparam name="T">Тип значения переменной.</typeparam>
    /// <param name="variableName">Имя переменной.</param>
    /// <param name="value">Значение переменной.</param>
    void AddOrUpdate<T>(string variableName, T value);

    /// <summary>
    /// Добавляет новую переменную или обновляет существующую переменную значением, определяемым функцией обновления.
    /// </summary>
    /// <typeparam name="T">Тип значения переменной.</typeparam>
    /// <param name="variableName">Имя переменной.</param>
    /// <param name="value">Начальное значение, которое будет использовано, если переменная не существует.</param>
    /// <param name="updater">Функция, вычисляющая новое значение на основе текущего значения.</param>
    void AddOrUpdate<T>(string variableName, T value, Func<T,T> updater);

    /// <summary>
    /// Пытается получить значение переменной указанного типа.
    /// </summary>
    /// <typeparam name="T">Ожидаемый тип значения переменной.</typeparam>
    /// <param name="variableName">Имя переменной.</param>
    /// <param name="result">При успешном выполнении метода содержит значение переменной; в противном случае — значение по умолчанию для данного типа.</param>
    /// <returns>true, если переменная найдена; иначе false.</returns>
    bool TryGetValue<T>(string variableName, out T result);

    /// <summary>
    /// Возвращает значение переменной указанного типа, либо значение по умолчанию, если переменная не найдена.
    /// </summary>
    /// <typeparam name="T">Ожидаемый тип значения переменной.</typeparam>
    /// <param name="variableName">Имя переменной.</param>
    /// <param name="defaultValue">Значение по умолчанию, которое будет возвращено, если переменная не найдена.</param>
    /// <returns>Значение переменной, если она найдена; иначе <paramref name="defaultValue"/>.</returns>
    T GetValue<T>(string variableName, T defaultValue);

    /// <summary>
    /// Возвращает значение переменной указанного типа. Если переменная не найдена, выбрасывается исключение.
    /// </summary>
    /// <typeparam name="T">Ожидаемый тип значения переменной.</typeparam>
    /// <param name="variableName">Имя переменной.</param>
    /// <returns>Значение переменной.</returns>
    /// <exception cref="KeyNotFoundException">Выбрасывается, если переменная не найдена.</exception>
    T GetValue<T>(string variableName);

    /// <summary>
    /// Возвращает обёртку <see cref="ScriptVariable{T}"/> для переменной, упрощающую более продвинутое взаимодействие.
    /// </summary>
    /// <typeparam name="T">Тип значения переменной.</typeparam>
    /// <param name="variableName">Имя переменной.</param>
    /// <returns>Экземпляр <see cref="ScriptVariable{T}"/> для указанной переменной.</returns>
    ScriptVariable<T> Get<T>(string variableName);
}
```