---
title: IAuraTreeScriptingApi
description: Interface definition for the Aura Tree Scripting API.
published: true
date: 2024-02-20T20:28:29.069Z
tags: scripting, API, C#
editor: markdown
dateCreated: 2024-02-20T20:28:29.069Z
---

```csharp
public interface IAuraTreeScriptingApi : IScriptingApi
{
    /// <summary>
    /// Contains reference to Aura (or null) which holds current script
    /// </summary>
    IAuraAccessor Aura { get; }
    
    /// <summary>
    /// Contains reference to a Folder which holds current script
    /// </summary>
    IFolderAccessor Folder { get; }
    
    /// <summary>
    /// All folders in Aura Tree
    /// </summary>
    IObservableList<IFolderAccessor> Folders { get; }

    /// <summary>
    /// All auras in Aura Tree
    /// </summary>
    IObservableList<IAuraAccessor> Auras { get; }
    
    /// <summary>
    /// All behavior trees in Aura Tree
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