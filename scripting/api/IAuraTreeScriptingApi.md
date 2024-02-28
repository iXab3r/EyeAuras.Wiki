```csharp
public interface IAuraTreeScriptingApi : IScriptingApi
{
    /// <summary>
    /// Contains reference to Aura (or null) which holds the current script
    /// </summary>
    IAuraAccessor Aura { get; }
    
    /// <summary>
    /// Contains reference to a Folder which holds the current script
    /// </summary>
    IFolderAccessor Folder { get; }
    
    /// <summary>
    /// All folders in the Aura Tree
    /// </summary>
    IObservableList<IFolderAccessor> Folders { get; }

    /// <summary>
    /// All auras in the Aura Tree
    /// </summary>
    IObservableList<IAuraAccessor> Auras { get; }
    
    /// <summary>
    /// All behavior trees in the Aura Tree
    /// </summary>
    IObservableList<IBehaviorTreeAccessor> BehaviorTrees { get; }
    
    IAuraAccessor FindAuraByPath(string path);
    
    IAuraAccessor GetAuraByPath(string path);

    IFolderAccessor FindFolderByPath(string path);
    
    IFolderAccessor GetFolderByPath(string path);
    
    IBehaviorTreeAccessor FindBehaviorTreeByPath(string path);
    
    IBehaviorTreeAccessor GetBehaviorTreeByPath(string path);
}
```