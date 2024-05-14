---
title: Bindings
description: interconnect properties between triggers, actions, and overlays to allow for easier change of group properties and to open up new capabilities
published: true
date: 2024-05-14T11:16:40.873Z
tags: 
editor: markdown
dateCreated: 2023-06-18T19:03:50.558Z
---

Bindings are an advanced feature in EyeAuras, designed to establish dynamic connections between different properties of triggers, auras, and actions. This functionality allows the system to synchronize properties, so if one changes, the other updates correspondingly.

For example, Bindings allow you to link together the Target Window of two different triggers. If the value in one trigger updates, the other will adapt accordingly. A more advanced example includes the ability to bind the coordinates of the latest found image in an Image Search Trigger to a Send Input action. This means that if the Send Input action executes, it will click on the last found image.

### **How Bindings Are Represented in the UI**

Most properties that can be configured via the UI feature a small black rectangle to the right of the controls. This indicates the property is unbound. Upon clicking this rectangle, the Binding Editor opens, showing an Aura Tree displaying bindable auras, folders, and other objects. When you select a trigger or folder, the UI shows a list of triggers, actions, and their respective bindable properties.

### **Technical Details**

EyeAuras uses a custom mechanism that leverages C# expressions and the INotifyPropertyChanged mechanism to form relationships between objects. Whenever a bound property updates, the system automatically updates the property it's bound to.

### **Creative Usage and Future Development**

Bindings are especially effective when paired with EyeAuras' scripting capabilities. This combination enables the creation of dynamic and adaptable overlays that respond to real-time changes.

A powerful usage example involves binding the coordinates of an overlay to the capture region of an Image Search or Color Search action. When you move the overlay, the capture region updates automatically, offering a significant level of customizability.

Despite its robust capabilities, the Bindings feature in EyeAuras could benefit from the addition of Conditional Bindings and data transformations, which would extend its flexibility even further. EyeAuras also plans to refine the interaction between Bindings and the Custom UI feature.

For example, the "Binding to Variables" functionality lets you establish a binding to a specific variable, like binding the Target FPS to a variable called userTargetFPS. You can then use a slider in the Custom UI to change this variable. This creates a dynamic and interactive user interface where real-time changes are seamlessly integrated.

### **Bindings: Questions and Answers**

**Q: Can bindings establish connections between different profiles in EyeAuras?**

-   A: No, different profiles in EyeAuras mean different running instances. Bindings work only within the scope of a single instance.

**Q: Do bindings impact the software's performance?**

-   A: No, bindings are designed to be highly efficient and do not significantly affect EyeAuras' performance.

**Q: What happens if there's an error with a binding?**

-   A: In the case of a binding error, the black rectangle next to the property in the UI turns red. The error may be due to the binding source being removed or the data type becoming incompatible.

**Q: Can I use bindings to sync properties across multiple triggers?**

-   A: Yes, one of the primary use cases of bindings is to synchronize properties across different triggers, actions, or auras.

**Q: Can you provide some usage examples for bindings?**

-   A: Bind the Target FPS in multiple triggers together. By changing it in one place, it'll update everywhere.
    -   Bind the last found image location to Send Input coordinates. This makes Send Input click on the found image.
    -   Bind the coordinates of an overlay to the capture region in Image Search/Color Search. When you move the overlay, the capture region updates.

**Q: Are bindings shared when an aura is shared?**

-   A: Yes, when an aura is shared, its bindings are included.

**Q: How do bindings behave when an aura is imported?**

-   A: When an aura is imported, its bindings are treated the same way as links and are preserved.

**Q: Can bindings be used from Custom UI?**

-   A: Yes, bindings can be utilized within the Custom UI feature of EyeAuras.

**Q: Do bindings have any error correction or handling mechanisms?**

-   A: At this point, bindings either work or do not. There's no built-in error correction or handling mechanism, but future updates may change this.

**Q: How are bindings visualized?**

-   A: Bindings are visualized in the Dependencies Viewer overlay in the EyeAuras UI.