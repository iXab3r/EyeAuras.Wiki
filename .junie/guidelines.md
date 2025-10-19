# Project Guidelines

## Project Overview
EyeAuras.Wiki is the official documentation repository (wiki) for EyeAuras — pixel-hunt and neural networks-based automation software. This repository stores Markdown sources (.md) and some pre-rendered HTML pages used for the public wiki. Content is organized by topic directories and includes English and Russian (ru) localizations.

### Key contents
- features, faq, and topic guides such as bindings, securitymeasures, permission-model, default-properties, text-match-expressions, window-matching-expressions, enabling-conditions, export-import, report-a-problem, learning-curve, how-to-disable-logs, input-redirect, etc.
- scripting/ with api, examples, imgui, and blazor-windows subtopics
- behavior-trees/ with nodes/
- triggers/ with images/
- overlays/, macros/, actions/ (sendinput/), YoloEase/ (with changelogs/), and Lineage/
- changelogs/ and changelogs/draft
- assets/ and numerous images used throughout the docs
- ru/ mirrors many of these sections for the Russian localization

### What this project is not
- It is not the EyeAuras application source code.
- There is no build pipeline or unit tests here.

## How Junie should work in this repository
- Scope: Make minimal, focused changes to documentation to satisfy issues.
- Build and tests: Do not build the project; there are no tests to run for this repo.
- File formats: Prefer editing .md files. If a topic has both .md and .html, keep them in sync when the change clearly affects both.
- Localization: When modifying an English page that has a ru/ counterpart, mirror simple structural changes; if translation is required and content is not available, leave a brief TODO note in the ru/ file.
- Links: Use relative links. Verify that linked files exist. Preserve anchors where possible.
- Images: Place new images alongside similar assets and reference via relative paths.
- Style: Use clear headings (H1–H3), short paragraphs, and bullet lists where appropriate. Keep tone instructional and concise.

## Project structure (top-level highlights)
- README.md — short description of the wiki.
- .junie/guidelines.md — these guidelines.
