---
title: IVariablesScriptingApi
description: 
published: true
date: 2025-05-07T20:54:10.624Z
tags: 
editor: markdown
dateCreated: 2024-02-28T13:04:44.376Z
---

```csharp
/// <summary>
/// Defines an API for scripting interactions that involve accessing and manipulating variables within a scriptable environment.
/// This interface extends the basic variable access capabilities with script-focused functionalities, allowing for strongly-typed variable interactions.
/// </summary>
/// <remarks>
/// Working with <see cref="ScriptVariable{T}"/> provides a strongly-typed approach to accessing variables, ensuring type safety at compile time and reducing runtime errors.
/// It simplifies the process of manipulating variables within scripts, offering both readability and maintainability benefits.
/// </remarks>
public interface IVariablesScriptingApi : IScriptingApi, IVariablesAccessor
{
    /// <summary>
    /// Retrieves a strongly-typed <see cref="ScriptVariable{T}"/> associated with a given aura and variable name.
    /// </summary>
    /// <typeparam name="T">The type of the variable's value.</typeparam>
    /// <param name="itemPath">The path identifying the aura.</param>
    /// <param name="variableName">The name of the variable.</param>
    /// <returns>A strongly-typed <see cref="ScriptVariable{T}"/> instance.</returns>
    ScriptVariable<T> Get<T>(string itemPath, string variableName);

    /// <summary>
    /// Retrieves a strongly-typed <see cref="ScriptVariable{T}"/> from a specific source that implements <see cref="IHasVariables"/>.
    /// </summary>
    /// <typeparam name="T">The type of the variable's value.</typeparam>
    /// <param name="source">The source object containing the variable.</param>
    /// <param name="variableName">The name of the variable.</param>
    /// <returns>A strongly-typed <see cref="ScriptVariable{T}"/> instance.</returns>
    ScriptVariable<T> Get<T>(IHasVariables source, string variableName);
    
     /// <summary>
    /// Gets the total number of variables managed by the accessor.
    /// </summary>
    int Count { get; }

    /// <summary>
    /// Determines whether a variable with the specified name exists.
    /// </summary>
    /// <param name="variableName">The name of the variable to check.</param>
    /// <returns>true if the variable exists; otherwise, false.</returns>
    bool Contains(string variableName);

    /// <summary>
    /// Adds a new variable or updates an existing variable with the specified value.
    /// </summary>
    /// <typeparam name="T">The type of the variable's value.</typeparam>
    /// <param name="variableName">The name of the variable.</param>
    /// <param name="value">The value of the variable.</param>
    void AddOrUpdate<T>(string variableName, T value);

    /// <summary>
    /// Adds a new variable or updates an existing variable with a value determined by the updater function.
    /// </summary>
    /// <typeparam name="T">The type of the variable's value.</typeparam>
    /// <param name="variableName">The name of the variable.</param>
    /// <param name="value">The initial value to use if the variable does not exist.</param>
    /// <param name="updater">A function to calculate the new value based on the current value.</param>
    void AddOrUpdate<T>(string variableName, T value, Func<T,T> updater);

    /// <summary>
    /// Tries to get the value of a variable of a specified type.
    /// </summary>
    /// <typeparam name="T">The expected type of the variable's value.</typeparam>
    /// <param name="variableName">The name of the variable.</param>
    /// <param name="result">When this method returns, contains the value of the variable if found; otherwise, the default value for the type.</param>
    /// <returns>true if the variable was found; otherwise, false.</returns>
    bool TryGetValue<T>(string variableName, out T result);

    /// <summary>
    /// Gets the value of a variable of a specified type, returning a default value if the variable is not found.
    /// </summary>
    /// <typeparam name="T">The expected type of the variable's value.</typeparam>
    /// <param name="variableName">The name of the variable.</param>
    /// <param name="defaultValue">The default value to return if the variable is not found.</param>
    /// <returns>The value of the variable if found; otherwise, <paramref name="defaultValue"/>.</returns>
    T GetValue<T>(string variableName, T defaultValue);

    /// <summary>
    /// Gets the value of a variable of a specified type. Throws an exception if the variable is not found.
    /// </summary>
    /// <typeparam name="T">The expected type of the variable's value.</typeparam>
    /// <param name="variableName">The name of the variable.</param>
    /// <returns>The value of the variable.</returns>
    /// <exception cref="KeyNotFoundException">Thrown if the variable is not found.</exception>
    T GetValue<T>(string variableName);

    /// <summary>
    /// Gets a <see cref="ScriptVariable{T}"/> wrapper for a variable, facilitating advanced interactions.
    /// </summary>
    /// <typeparam name="T">The type of the variable's value.</typeparam>
    /// <param name="variableName">The name of the variable.</param>
    /// <returns>A <see cref="ScriptVariable{T}"/> instance for the specified variable.</returns>
    ScriptVariable<T> Get<T>(string variableName);
}
```