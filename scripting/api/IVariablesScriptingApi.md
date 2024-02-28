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
    /// Gets the collection of variables. 
    /// This property provides access to the variables stored within the object, allowing for operations such as adding, removing, or updating variables.
    /// </summary>
    /// <value>The hierarchical source cache of variables indexed by string keys.</value>
    IHierarchicalSourceCache<AuraVariable, string> Variables { [NotNull] get; }
    
    /// <summary>
    /// Gets or sets the variable associated with the specified key.
    /// </summary>
    /// <param name="key">The key of the variable to get or set.</param>
    /// <value>The variable associated with the specified key. Can be null if no variable is associated with the key.</value>
    object this[string key] { [CanBeNull] get; [CanBeNull] set; }

    /// <summary>
    /// Retrieves a strongly-typed <see cref="ScriptVariable{T}"/> associated with a given aura and variable name.
    /// </summary>
    /// <typeparam name="T">The type of the variable's value.</typeparam>
    /// <param name="auraPath">The path identifying the aura.</param>
    /// <param name="variableName">The name of the variable.</param>
    /// <returns>A strongly-typed <see cref="ScriptVariable{T}"/> instance.</returns>
    ScriptVariable<T> Get<T>(string auraPath, string variableName);

    /// <summary>
    /// Retrieves a strongly-typed <see cref="ScriptVariable{T}"/> from a specific source that implements <see cref="IHasVariables"/>.
    /// </summary>
    /// <typeparam name="T">The type of the variable's value.</typeparam>
    /// <param name="source">The source object containing the variable.</param>
    /// <param name="variableName">The name of the variable.</param>
    /// <returns>A strongly-typed <see cref="ScriptVariable{T}"/> instance.</returns>
    ScriptVariable<T> Get<T>(IHasVariables source, string variableName);
    
    /// <summary>
