# Frontmatter Input

An Obsidian plugin for managing tags through intuitive nested checkbox and radio button lists.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.1-green.svg)](https://github.com/scottgrayart/Frontmatter-input/releases)

## Overview

Simplify note organization by adding tags through interactive lists instead of typing them manually. Define checkbox lists for multiple selections or radio buttons for single selections, with support for nested hierarchies. Lists can be embedded in templates or added directly to notes.
## Features

- **Automatic tag management** - Selecting checkboxes or radio buttons automatically updates frontmatter tags
- **Hierarchical tags** - Nested lists create structured tags like `parent-tag/child-tag/grandchild-tag`. Nested lists are hidden until their parent is selected
- **Flexible layouts** - Choose vertical or horizontal list orientation
- **Smart cleanup** - Unchecking a parent automatically removes all child tags
- **Duplicate prevention** - Only unique tags are stored in frontmatter
## Demo
In this example an item is checked with no sub-lists setting the tag 'activity/walk'
![Example with walk selected](assets/images/Screenshot%202025-10-21%204.11.07%20PM.png)

This is the same list with the 'Run' item checked along with two radio button lists to get the tag 'activity/run/race/half'
![Example with run\/race\/half selected](assets/images/Screenshot%202025-10-21%204.06.56%20PM.png)

*Screenshot: Checkbox selections automatically populate frontmatter tags*

### Source
This example is generated using YAML in a frontmatterinput block as follows.
```frontmatterinput
root: activity
orientation:  horizontal
btns:
- Run:
    tag: run
    # orientation: vertical
    type: radio
    btns:
    - regular: { tag: regular }
    - long: { tag: long }
    - race:
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
## YAML Syntax Guide

This plugin uses YAML to define lists. Here's what you need to know:

### Basic Structure
```frontmatterinput
# Comments start with #
key: value
nested:
  child: value
  another: value
```

### Lists
```frontmatterinput
# Optional root value to include at the beginning of each tag
root: root-value
# orientation: vertical | horizontal (optional, vertical is default)
orientation: vertical
# type: checkbox | radio (optional, checkbox is default)
btns: # required, lists the labels and tags for the list
  - First item:
      tag: first-item-value # must follow Obsidian tag name rules
  - Second item:
      tag: second-item-value
  - Third item:
      tag: third-item-value
```

### Nesting
Any btns item can a sub-list under it. Simple add the same structure under the btns item. The 'root' attribute is only used in the main list however. For an example with multiple levels see [Source](#Source) above.

**Key rules:**
- Indentation matters (use 2 spaces, not tabs)
- Colons separate keys from values
- Dashes create list items
- Use quotes for values with special characters: `"value: with colon"`

For more details, see [Obsidian's Properties documentation](https://help.obsidian.md/Editing+and+formatting/Properties).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

**FIX THESE LINKS**

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/yourusername)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/yourusername)

## Contact

- Author: Scott Gray
- Email: scott@scottgray.art
- GitHub: [@scottgrayart](https://github.com/scottgrayart)
- Issues: [Report a bug or request a feature](https://github.com/scottgrayart/Frontmatter-input/issues)