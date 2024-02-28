# Hello, world!

> You can import the ready-made example from here: [Hello, World! Example](https://eu.eyeauras.net/share/S20240223231508UC4AdkJYNJjI)
{.is-info}

## Creating an Aura
Well, no screenshot here, sorry.

## Creating a C# Script Action
![](https://i.imgur.com/mz7CUzL.png)

## Entering the Code (in some versions, the newly created script will already contain this code)
```csharp
Log.Info("Hello, world!");
```

## Pressing Run
![](https://i.imgur.com/VP8JnWk.png)

## Voila!
![](https://i.imgur.com/JeZXXU8.png)

Congratulations, this was officially the first step towards powerful scripts of the future.

# Oh, Manually Clicking Run Isn't Cool
To make it a bit more interesting, let's set up our script to run only when a specific key is pressed, for example, let it be `F1`.

## Adding the HotkeyIsActive Trigger to the Aura
![](https://i.imgur.com/j7ma0e1.png)

## Switching it to `Click/Hold` mode and setting it to `F1`
![](https://i.imgur.com/s3eKrnp.png)

`Click/Hold` is used to deactivate the trigger immediately after pressing. So, by pressing `F1` twice, we will execute our script twice. The `Toggle` mode would toggle the trigger on and off with each press. Since our action is in the OnEnter block, double pressing would execute our script only **once**.

## All Set!
Now, every time you press `F1`, your script will print to the `Event Log`. Of course, this is not the most exciting thing we can do, but we'll explore more in the following examples.