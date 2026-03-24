# App Icons

Tauri requires app icons at build time. Place the following files in this directory:

| File | Size | Platform |
|------|------|----------|
| `32x32.png` | 32×32 px | Windows/Linux |
| `128x128.png` | 128×128 px | Linux |
| `128x128@2x.png` | 256×256 px | macOS |
| `icon.icns` | Multi-size | macOS |
| `icon.ico` | Multi-size | Windows |

## Generating Icons with Tauri CLI

The easiest way is to provide a single high-resolution source image (at least 1024×1024 px) and let Tauri generate all required sizes:

```bash
# From apps/desktop/
npx tauri icon path/to/icon-1024.png
```

This creates all the above files automatically.

## Placeholder

The current icons directory contains only this README. The build will fail without real icon files.
For development (`tauri dev`), you can use any placeholder PNG renamed to match the above names.
