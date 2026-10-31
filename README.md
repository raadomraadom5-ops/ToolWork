# ToolWork

Legacy Roblox 2006-2007 toolbox/content server using Flask.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install flask
python app.py
```

Then open:
- http://localhost:8000/

## Settings for old Roblox

```xml
<Settings>
  <ContentFolder>content</ContentFolder>
  <BaseUrl>http://localhost:8000/</BaseUrl>
</Settings>
```

## What this does

- serves the ToolWork website UI
- allows upload of assets from the browser
- stores uploaded files in `content/`
- makes them available over HTTP for old Roblox toolbox access

## Folders

```text
content/
├── models/
├── decals/
├── sounds/
├── scripts/
├── images/
└── uploads/
```

## Notes

This is for solo / local legacy Roblox use with an actual local HTTP server. Old Roblox expects a real web server, not just a static HTML page.
