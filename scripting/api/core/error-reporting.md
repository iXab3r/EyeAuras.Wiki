---
title: Error Reporting Discovery Map
description: Public problem reporting contracts and editable report comments.
published: true
date: 2026-10-11T00:00:00.000Z
tags: scripting, api, reporting, ai-translated
editor: markdown
dateCreated: 2026-10-11T00:00:00.000Z
---
# Error Reporting Discovery Map

## User Intents

- Open the standard problem report dialog from a script or mini-app.
- Prefill a report comment and let the user edit it before sending.
- Include the user's final comment in a saved or uploaded report.

## Concept Model

`PoeShared.Reporting.IErrorReportingService` opens a user-reviewed report.
`PoeShared.UI.ExceptionDialogConfig` describes one invocation. It lives in
`PoeShared.dll`; its namespace is retained for compatibility. The desktop host
provides the dialog implementation from `PoeShared.Wpf.dll`.

## Host / Runtime Contexts

In a desktop host with reporting registered, top-level scripts can resolve the service with
`GetService<IErrorReportingService>()`. Ordinary helper classes receive the
service through a constructor or explicit parameter. Razor components use
`[Inject]`. Referencing the SDK alone does not create a desktop reporting host.

## API Details

- `ReportProblem(Exception error = null)` retains the existing report workflow.
- `ReportProblem(ExceptionDialogConfig config)` accepts a prefilled report.
- `ExceptionDialogConfig.Comment` is initial editable text. The final non-empty
  comment is included as `comment.txt` in both saved and sent archives.
- Omitted `AppName`, `Title`, `Timestamp`, and `ReportHandler` use host defaults.
  Caller item providers supplement the host's registered providers.
- Both overloads are synchronous and return after the dialog closes.
- A bare `ReportProblem(null)` is ambiguous. Use `ReportProblem()` for a report
  without an exception, or specify the intended argument type.

## Common Flows

```csharp
using PoeShared.Reporting;
using PoeShared.UI;

GetService<IErrorReportingService>().ReportProblem(new ExceptionDialogConfig
{
    Comment = "Describe what happened before the problem."
});
```

Run this in a desktop script to open the report dialog with the initial comment.
The user chooses save, send, or close. Return from `ReportProblem` means the
dialog closed, not that a report was sent successfully: there is no send-result
value or cancellation token. Avoid calling it from a latency-sensitive render
or hook callback. The implementation marshals to the WPF dispatcher when needed.

The user can change or clear the comment. Clearing it omits `comment.txt`; whitespace-only text still counts as non-empty and is included.
The initial value is copied when opening the dialog; it is not continuously
bound back to the immutable config.

## Assembly / Package Hints

- `EyeAuras.SDK` exposes the contracts used inside the EyeAuras runtime.
- `PoeShared.dll` contains `IErrorReportingService` and `ExceptionDialogConfig`.
- `PoeShared.Wpf.dll` forwards the moved config type for existing consumers.

## Research Anchors

`IErrorReportingService`, `ExceptionDialogConfig`, `ExceptionDialogViewModel`,
`IErrorReportHandler`, `IErrorReportItemProvider`.

## Search Synonyms

problem report, error report, report dialog, prefilled comment, comment.txt,
support archive.

## Related Maps

- [core/app-runtime-contexts.md](/en/scripting/api/core/app-runtime-contexts)
- [core/logging.md](/en/scripting/api/core/logging)
- [scripting/runtime.md](/en/scripting/api/scripting/runtime)
- [Report archive format and receiving reports](/features/problem-reports)

Contract and dispatcher behavior: [ExceptionDialogDisplayer](https://github.com/iXab3r/PoeEye/blob/0e02c98dcab4bff263684f1c0647eed120e2700f/PoeEye/PoeShared.Wpf/UI/ExceptionViewer/ExceptionDialogDisplayer.cs). Dialog availability and report delivery depend on desktop host configuration.
