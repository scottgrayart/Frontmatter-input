Here are the steps to create a public release of an Obsidian plugin on GitHub:

## 1. Prepare Your Plugin

- Ensure your plugin works correctly and follows Obsidian's plugin guidelines
- Update your `manifest.json` with the correct version number
- Update `versions.json` to map your new version to the minimum required Obsidian version
- Write clear release notes documenting changes, bug fixes, and new features

## 2. Update Version Files

Your plugin should have these key files:
- **manifest.json**: Contains `id`, `name`, `version`, `minAppVersion`, etc.
- **versions.json**: Maps plugin versions to minimum Obsidian versions
- **package.json**: Should match the version in manifest.json

Make sure all version numbers are consistent across these files.

## 3. Build Your Plugin

Run your build process (typically `npm run build`) to generate:
- `main.js` - your compiled plugin code
- `manifest.json` - plugin metadata
- `styles.css` (if applicable)

## 4. Create a Git Tag

```bash
git tag -a 1.0.0 -m "Release version 1.0.0"
git push origin 1.0.0
```

## 5. Create a GitHub Release

1. Go to your repository on GitHub
2. Click on "Releases" in the right sidebar
3. Click "Draft a new release"
4. Select the tag you just created (or create a new one)
5. Set the release title (e.g., "v1.0.0")
6. Write release notes describing changes
7. **Attach these files** to the release:
   - `main.js`
   - `manifest.json`
   - `styles.css` (if you have one)

## 6. Submit to Obsidian Community Plugins (First Release Only)

For your first public release, you need to submit your plugin to Obsidian's community plugin list:

1. Fork the [obsidian-releases repository](https://github.com/obsidianmd/obsidian-releases)
2. Add your plugin to `community-plugins.json`
3. Create a pull request with your plugin information

## 7. Future Updates

For subsequent releases:
- Repeat steps 1-5
- Obsidian will automatically detect your new releases from GitHub
- Users will be notified of updates through Obsidian's plugin manager

**Important**: Make sure your repository is public and the release assets (`main.js`, `manifest.json`, `styles.css`) are properly attached to each GitHub release, as Obsidian downloads these files directly from your releases.