---
title: AI Computer Vision: Images
description: AI-first map of image capture, image processing, OpenCV, and computer vision APIs.
published: true
date: 2026-04-21T00:00:00.000Z
tags: scripting, api, ai, computer-vision
editor: markdown
dateCreated: 2026-04-21T00:00:00.000Z
---
# Computer Vision / Images Discovery Map

Reference map for capture, image search, OCR, OpenCV, color checks, pixel
workflows, and CV debug overlays.

## User Intents

- Capture screen/window/region.
- Find image/template on screen.
- Search text with OCR.
- Search colors or pixels.
- Run CV from script.
- Display debug boxes over found regions.
- Profile CV operations and pixel-processing loops.

## Concept Model

- Capture produces frames from screen/window/region.
- `IComputerVisionExperimentalScriptingApi` is script entry point.
- `ICvAccessor` performs image/text/color/pixel operations.
- Aura workflows use trigger classes.
- Debug boxes/labels use `osd/screen-overlay.md`.
- ML-backed search belongs partly to `ml/ai.md`.
- Profiling/performance belongs to `computer-vision/profiling.md`.

## API Details

- `IComputerVisionExperimentalScriptingApi` - script CV entry point.
- `ICvAccessor` - main script CV operation surface.
- `ImageSearchTrigger` - image/template matching trigger.
- `TemplateImageMatcher` - stable template matching.
- `FeatureImageMatcher` - feature-based matching.
- `TextSearchTrigger`, `IRecognitionEngineProvider` - OCR.
- `ColorSearchTrigger`, `IColorSimilarityCalculator` - color/pixel workflows.
- `WindowCaptureService`, `WindowImageSource`,
  `WindowCaptureTriggerBase` - capture infrastructure.

## Prefer

- Prefer `IComputerVisionExperimentalScriptingApi` and `ICvAccessor` for script
  CV work.
- Prefer built-in triggers for aura workflows.
- Prefer existing capture services over custom screenshot plumbing.
- Prefer `osd/screen-overlay.md` for debug regions.
- Prefer `computer-vision/profiling.md` before guessing where a CV loop is
  slow.

## Avoid

- Avoid hardcoding OCR engines when provider lookup exists.
- Avoid custom frame capture before checking capture services.
- Avoid mixing ML model logic into deterministic matching unless needed.

## Research Anchors

- `IComputerVisionExperimentalScriptingApi`, `ICvAccessor`,
  `ImageSearchTrigger`, `TemplateImageMatcher`, `FeatureImageMatcher`,
  `TextSearchTrigger`, `IRecognitionEngineProvider`, `ColorSearchTrigger`,
  `WindowCaptureService`, `WindowCaptureTriggerBase`.

## Search Synonyms

- image search
- template match
- feature match
- OCR
- text recognition
- color search
- pixel search
- window capture
- screen capture
- OpenCV
- Emgu CV

## Related Maps

- `osd/screen-overlay.md`
- `computer-vision/profiling.md`
- `ml/ai.md`
- `osd/selection.md`
- `windows-subsystems/window-handles.md`
