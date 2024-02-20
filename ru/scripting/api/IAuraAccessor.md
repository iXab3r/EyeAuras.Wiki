---
title: IAuraAccessor
description: 
published: true
date: 2024-02-20T20:32:18.477Z
tags: 
editor: markdown
dateCreated: 2024-02-20T20:32:05.134Z
---

```csharp
public interface IAuraAccessor : IHasId, ICanBeLoaded, ICanBeArchived, IHasTimestamp, IHasVariables, IHasPath
{
    bool? IsActive { get; }
    
    /// <summary>
    /// Indicates whether this item is disabled (available for selection/edit) or not
    /// </summary>
    bool IsEnabled { get; }

    /// <summary>
    /// Contains a list of conditions which are required for this item to start "ticking"
    /// </summary>
    IObservableList<IAuraTrigger> EnablingConditions { get; }
    
    IObservableList<IAuraOverlay> Overlays { [NotNull] get; }
        
    IObservableList<IAuraTrigger> Triggers { [NotNull] get; }

    IObservableList<IAuraAction> OnEnterActions { [NotNull] get; }
        
    IObservableList<IAuraAction> WhileActiveActions { [NotNull] get; }

    IObservableList<IAuraAction> OnExitActions { [NotNull] get; }

}
```