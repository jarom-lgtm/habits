# Habits — an offline habit tracker for Jarom's phone

A single-page PWA. Install it to the home screen and it opens full-screen, works
with no signal, and keeps every tap on the phone itself. No account, no server,
no analytics, nothing uploaded.

## Why it is built this way

- **No framework, no CDN, no external fonts.** Everything the app needs is in
  `index.html`. A page that reaches out to a CDN is a page that breaks the first
  time it opens on aeroplane mode, which defeats the point.
- **`localStorage`, not a database.** The whole point is that the data never
  leaves the device. The trade-off is that clearing site data wipes it, which is
  what the export is for.
- **Habits are defined in the app, not baked into the code.** They get added on
  the phone, so the tracker reflects what is actually being done rather than
  what was planned in advance.

## The relationship to `HEALTH.md`

`HEALTH.md` in the parent project is the real record. This app is the daily
capture surface feeding it. Menu → **Export for Claude** produces a plain-text
summary plus a JSON backup; pasting that into a Claude session is what moves the
history into `HEALTH.md`. The app is deliberately not the source of truth — it
lives on one device and one device can be lost.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app — markup, styles, and logic |
| `sw.js` | Service worker; caches the shell so it opens offline |
| `manifest.webmanifest` | Makes it installable and full-screen |
| `icon-*.png` | Home-screen icons, generated (see below) |
| `_icon-src.html` | Source art for the icons; not served to the phone |

## Updating it

Edit the files, then **bump `CACHE` in `sw.js`** (`habits-v1` → `habits-v2`).
Phones hold the old version until that string changes, so an edit without a bump
looks like nothing happened.

## Regenerating the icons

Edit `_icon-src.html`, then from this folder:

```sh
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
SRC="file:///C:/Users/jarom/OneDrive/Desktop/Claude/Personal%20Claude/habits-app/_icon-src.html"
D="C:\\Users\\jarom\\OneDrive\\Desktop\\Claude\\Personal Claude\\habits-app"

for s in 180 192 512; do
  "$CH" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
        --window-size=$s,$s --screenshot="$D\\icon-$s.png" "$SRC?size=$s"
done
"$CH" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --window-size=512,512 --screenshot="$D\\icon-512-maskable.png" "$SRC?size=512&maskable=1"
```

The art is pinned to exact pixels rather than `vw` units because headless Chrome
does not size its viewport from `--window-size`; anything viewport-relative
renders at the wrong scale and gets cropped.

## Testing locally

Service workers need a secure context, and `http://localhost` counts as one, so
serve the folder rather than opening the file directly — `file://` will not
register the worker and the offline behaviour cannot be checked.
