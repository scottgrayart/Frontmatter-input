# Frontmatter Input

An [Obsidian](https://obsidian.md) plugin to manage frontmatter tags through interactive nested checkbox and radio button lists — no more typing tags manually.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.1-green.svg)](https://github.com/scottgrayart/Frontmatter-input/releases)

![Example with nested selections](assets/images/Screenshot%202025-10-21%204.06.56%20PM.png)

---

## Overview

Define your tag structure once in a `frontmatterinput` code block using simple YAML. The plugin renders a clickable UI inside your note — check a box and the tag is added to your frontmatter; uncheck it and the tag (and all its children) are removed. Works great in templates.

---

## Features

- **Checkboxes** for multi-select tagging, **radio buttons** for exclusive single-selection
- **Nested hierarchies** — child lists appear only when their parent is selected, building structured tags like `activity/run/race/10k`
- **Smart cleanup** — unchecking a parent removes all its child tags automatically
- **Flexible layout** — choose vertical or horizontal orientation per list
- **Duplicate prevention** — only unique tags are written to frontmatter
- **Template-friendly** — embed in note templates for consistent tagging across your vault

---

## Installation

### Option 1: Community Plugins (Pending Review)

The plugin has been submitted to the Obsidian community plugin list. Once approved it will be searchable directly in **Settings > Community Plugins**.

### Option 2: BRAT (Recommended while pending)

[BRAT](https://github.com/TfTHacker/obsidian42-brat) (Beta Reviewers Auto-update Tester) is the standard Obsidian way to install plugins awaiting review.

1. Install **BRAT** from Community Plugins if you haven't already
2. Open **Settings > BRAT > Add Beta Plugin**
3. Paste: `scottgrayart/Frontmatter-input`
4. Enable the plugin under **Settings > Community Plugins**

BRAT will also notify you of future updates automatically.

### Option 3: Manual Installation

1. Go to the [latest release](https://github.com/scottgrayart/Frontmatter-input/releases/latest)
2. Download `main.js`, `manifest.json`, and `styles.css`
3. Create the folder `.obsidian/plugins/frontmatter-input/` inside your vault
4. Copy the three downloaded files into that folder
5. Enable the plugin under **Settings > Community Plugins**

---

## Usage

Add a `frontmatterinput` code block to any note or template. The plugin renders it as an interactive list in Reading view and Live Preview.

### Minimal example

````markdown
```frontmatterinput
btns:
- Option A: { tag: option-a }
- Option B: { tag: option-b }
- Option C: { tag: option-c }
```
````

### Full example — workout log

````markdown
```frontmatterinput
root: activity
orientation: horizontal
btns:
- Run:
    tag: run
    type: radio
    btns:
    - Regular: { tag: regular }
    - Long: { tag: long }
    - Race:
        tag: race
        type: radio
        orientation: horizontal
        btns:
        - 5k: { tag: 5k }
        - 10k: { tag: 10k }
        - Half Marathon: { tag: half }
- Walk: { tag: walk }
- Hike: { tag: hike }
```
````

Selecting **Run > Race > 10k** adds `activity/run/race/10k` to your frontmatter tags. Deselecting **Run** removes all three tags at once.

![Single selection example](assets/images/Screenshot%202025-10-21%204.11.07%20PM.png)

---

## YAML Reference

### Top-level options

| Key | Values | Default | Description |
|-----|--------|---------|-------------|
| `root` | any string | *(none)* | Prefix added to the start of every tag path |
| `orientation` | `vertical` / `horizontal` | `vertical` | Layout direction for this list |
| `type` | `checkbox` / `radio` | `checkbox` | Selection mode for this list |
| `btns` | list | *(required)* | The items in this list |

### Button options

Each item under `btns` uses the label as its key. The value can be shorthand or expanded:

**Shorthand** (no nesting needed):
```yaml
btns:
- My Label: { tag: my-label }
```

**Expanded** (use when adding nested lists, type, or orientation):
```yaml
btns:
- My Label:
    tag: my-label
    type: radio
    orientation: horizontal
    btns:
    - Child A: { tag: child-a }
    - Child B: { tag: child-b }
```

### Tag naming rules

Tag values must follow [Obsidian's tag rules](https://help.obsidian.md/Editing+and+formatting/Tags): lowercase letters, numbers, hyphens, underscores, and forward slashes only. No spaces. Use quotes around values containing special characters: `tag: "my-tag"`.

### YAML tips

- Indentation uses **2 spaces** (not tabs)
- Comments start with `#`
- The `root` attribute only applies to the top-level list, not nested lists

---

## How tags are structured

The `root` value and each nested `tag` value are joined with `/` to form the final tag:

```
root: activity
  tag: run
    tag: race
      tag: 10k
→ activity/run/race/10k
```

If no `root` is set, the chain starts at the first selected tag.

---

## Contributing

Bug reports and feature requests are welcome. Please [open an issue](https://github.com/scottgrayart/Frontmatter-input/issues) with a description and, if relevant, the YAML block that reproduces the problem.

---

## Support

If this plugin saves you time, consider supporting its development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/scottgrayart)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/scottgrayart)

---

## License

MIT — see [LICENSE](LICENSE) for details.
