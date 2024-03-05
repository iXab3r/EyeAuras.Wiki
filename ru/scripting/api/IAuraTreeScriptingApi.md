---
title: IAuraTreeScriptingApi
description: 
published: true
date: 2024-03-05T14:37:51.466Z
tags: 
editor: markdown
dateCreated: 2024-02-20T20:28:29.069Z
---

```csharp

/// <summary>
/// Provides methods for interacting with the aura tree, including finding and retrieving auras, folders, and behavior trees. 
/// It supports operations to both safely find elements (returning null if not found) and directly retrieve elements (throwing exceptions if not found), 
/// accommodating scenarios that require precise control over error handling. The interface enables accessing collections of all managed auras, folders, 
/// and behavior trees, as well as fetching specific triggers and actions associated with auras by path. This facilitates dynamic and scriptable interactions 
/// with the application's hierarchical structure, ideal for scenarios requiring runtime navigation and manipulation of the aura tree.
/// </summary>
public interface IAuraTreeScriptingApi : IScriptingApi
{
    /// <summary>
    /// Contains reference to the Aura (or null) which holds the current script.
    /// </summary>
    IAuraAccessor Aura { get; }

    /// <summary>
    /// Contains reference to the Folder which holds the current script.
    /// </summary>
    IFolderAccessor Folder { get; }

    /// <summary>
    /// Contains all folders in the Aura Tree.
    /// </summary>
    IObservableList<IFolderAccessor> Folders { get; }

    /// <summary>
    /// Contains all auras in the Aura Tree.
    /// </summary>
    IObservableList<IAuraAccessor> Auras { get; }

    /// <summary>
    /// Contains all behavior trees in the Aura Tree.
    /// </summary>
    IObservableList<IBehaviorTreeAccessor> BehaviorTrees { get; }

    /// <summary>
    /// Finds an aura by its path. Returns null if not found.
    /// </summary>
    /// <param name="path">The path of the aura, either absolute or relative.</param>
    /// <returns>The aura at the specified path, or null if not found.</returns>
    /// <example>
    /// <code>
    /// var aura = api.FindAuraByPath("MyFolder/Aura1");
    /// if (aura != null)
    /// {
    ///     Console.WriteLine("Aura found!");
    /// }
    /// else
    /// {
    ///     Console.WriteLine("Aura not found.");
    /// }
    /// </code>
    /// </example>
    IAuraAccessor FindAuraByPath(string path);

    /// <summary>
    /// Gets an aura by its path. Throws an exception if not found.
    /// </summary>
    /// <param name="path">The path of the aura, either absolute or relative.</param>
    /// <returns>The aura at the specified path.</returns>
    /// <example>
    /// <code>
    /// try
    /// {
    ///     var aura = api.GetAuraByPath("MyFolder/Aura1");
    ///     Console.WriteLine("Aura found!");
    /// }
    /// catch (NotFoundException)
    /// {
    ///     Console.WriteLine("Aura not found.");
    /// }
    /// </code>
    /// </example>
    IAuraAccessor GetAuraByPath(string path);

    /// <summary>
    /// Finds a folder by its path. Returns null if not found.
    /// </summary>
    /// <param name="path">The path of the folder, either absolute or relative.</param>
    /// <returns>The folder at the specified path, or null if not found.</returns>
    /// <example>
    /// <code>
    /// var folder = api.FindFolderByPath("MyProject/Folders/Folder1");
    /// if (folder != null)
    /// {
    ///     Console.WriteLine("Folder found!");
    /// }
    /// else
    /// {
    ///     Console.WriteLine("Folder not found.");
    /// }
    /// </code>
    /// </example>
    IFolderAccessor FindFolderByPath(string path);

    /// <summary>
    /// Gets a folder by its path. Throws an exception if not found.
    /// </summary>
    /// <param name="path">The path of the folder, either absolute or relative.</param>
    /// <returns>The folder at the specified path.</returns>
    /// <example>
    /// <code>
    /// try
    /// {
    ///     var folder = api.GetFolderByPath("MyProject/Folders/Folder1");
    ///     Console.WriteLine("Folder found!");
    /// }
    /// catch (NotFoundException)
    /// {
    ///     Console.WriteLine("Folder not found.");
    /// }
    /// </code>
    /// </example>
    IFolderAccessor GetFolderByPath(string path);

    /// <summary>
    /// Finds a behavior tree by its path. Returns null if not found.
    /// </summary>
    /// <param name="path">The path of the behavior tree, either absolute or relative.</param>
    /// <returns>The behavior tree at the specified path, or null if not found.</returns>
    /// <example>
    /// <code>
    /// var behaviorTree = api.FindBehaviorTreeByPath("MyProject/BehaviorTrees/Tree1");
    /// if (behaviorTree != null)
    /// {
    ///     Console.WriteLine("Behavior tree found!");
    /// }
    /// else
    /// {
    ///     Console.WriteLine("Behavior tree not found.");
    /// }
    /// </code>
    /// </example>
    IBehaviorTreeAccessor FindBehaviorTreeByPath(string path);

    /// <summary>
    /// Gets a behavior tree by its path. Throws an exception if not found.
    /// </summary>
    /// <param name="path">The path of the behavior tree, either absolute or relative.</param>
    /// <returns>The behavior tree at the specified path.</returns>
    /// <example>
    /// <code>
    /// try
    /// {
    ///     var behaviorTree = api.GetBehaviorTreeByPath("MyProject/BehaviorTrees/Tree1");
    ///     Console.WriteLine("Behavior tree found!");
    /// }
    /// catch (NotFoundException)
    /// {
    ///     Console.WriteLine("Behavior tree not found.");
    /// }
    /// </code>
    /// </example>
    IBehaviorTreeAccessor GetBehaviorTreeByPath(string path);

    /// <summary>
    /// Gets a trigger of a specific type by path. Throws an exception if the trigger cannot be found or does not match the specified type.
    /// </summary>
    /// <typeparam name="TTrigger">The type of the trigger to get.</typeparam>
    /// <param name="path">The path to the aura containing the trigger.</param>
    /// <returns>A trigger of the specified type.</returns>
    /// <exception cref="ArgumentException">Thrown if the trigger of the specified type cannot be found at the given path, or if the aura does not contain any triggers at all.</exception>
    /// <example>
    /// <code>
    /// try
    /// {
    ///     var trigger = api.GetTriggerByPath<IImageSearchTrigger>("MyAuraPath");
    ///     Console.WriteLine($"Trigger found: {trigger.Name}");
    /// }
    /// catch (ArgumentException ex)
    /// {
    ///     Console.WriteLine(ex.Message);
    /// }
    /// </code>
    /// </example>
    public TTrigger GetTriggerByPath<TTrigger>(string path) where TTrigger : IAuraTrigger;

    /// <summary>
    /// Gets an action of a specific type by path. Throws an exception if the action cannot be found or does not match the specified type.
    /// </summary>
    /// <typeparam name="TAction">The type of the action to get.</typeparam>
    /// <param name="path">The path to the aura containing the action.</param>
    /// <returns>An action of the specified type.</returns>
    /// <exception cref="ArgumentException">Thrown if the action of the specified type cannot be found at the given path, or if the aura does not contain any actions at all.</exception>
    /// <example>
    /// <code>
    /// try
    /// {
    ///     var action = api.GetActionByPath<ISendSequenceAction>("MyAuraPath");
    ///     Console.WriteLine($"Action found: {action.Name}");
    /// }
    /// catch (ArgumentException ex)
    /// {
    ///     Console.WriteLine(ex.Message);
    /// }
    /// </code>
    /// </example>
    public TAction GetActionByPath<TAction>(string path) where TAction : IAuraAction;
}
```