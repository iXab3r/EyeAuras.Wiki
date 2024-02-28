## Variables

### Why?
Typically, your scripts will not run indefinitely; they are not full-fledged programs with a long life cycle. Usually, a script is launched, performs a task, and then terminates.

In EyeAuras, there are various ways to store data. Let's walk through from short-lived to long-lived options.

### Local Variables
There's nothing complicated here - these variables exist only as long as the method/code block is running. No special considerations here.
```csharp
var test = 123;
```

### Sandbox Properties
Since your script is a C# class, you can declare properties and assign