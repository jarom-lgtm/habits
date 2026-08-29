# CHECK

A private, offline daily tracker. Install it to the phone home screen and it
opens full-screen, works with no signal, and keeps every entry on the device.
No account, no server, no analytics, nothing uploaded.

## Acronyms only, on purpose

The eight habits are referred to here and in the code **only** by their
acronyms — H2Only, RAK, JUST8, BED, WERKOUTS, STOP, FIT, NOTE — and the FIT
behaviours only by their letters. What any of them stand for is not written
down anywhere in this repository. That lives in `HEALTH.md` on the owner's
machine, which is never published.

This repo is public so GitHub Pages can serve it for free. The acronyms are
meaningless to anyone else, and no tracked data is ever stored here — so a
stranger who found this would see an empty app and learn nothing.

## How it behaves

- **A streak breaks only when a miss is explicitly recorded.** Not opening the
  app for a week does nothing. The alternative — treating an untapped day as a
  failure — would let one forgotten evening erase a streak years long, which
  makes the app actively harmful to the thing it is meant to protect.
- **Three states per day:** green (clean or done), amber (something was
  recorded that cost points, but the streak holds), red (missed).
- **The app never overrules the user.** It shows when an entry is past an
  allowance, but marking the day missed is always a deliberate tap.

## Data

Everything lives in one `localStorage` key on the phone. That is the whole
point, and it has one consequence worth stating plainly: clearing the browser's
site data erases the history. **Export for Claude** in the menu produces a
plain-text summary plus a JSON backup for exactly this reason.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app — markup, styles, and logic |
| `sw.js` | Service worker; caches the shell so it opens offline |
| `manifest.webmanifest` | Makes it installable and full-screen |
| `icon-*.png` | Home-screen icons, generated (see below) |
| `_icon-src.html` | Source art for the icons; not part of the app |

## Updating it

Edit, then **bump `CACHE` in `sw.js`** (`check-v41` → `check-v42`). Phones hold
the old version until that string changes, so an edit without a bump looks like
nothing happened. Even with a bump, an already-open app may need one extra
close-and-reopen before the new version takes.

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

The art is pinned to exact pixels rather than `vw` units because headless
Chrome does not size its viewport from `--window-size`; anything
viewport-relative renders at the wrong scale and gets cropped.

## Testing locally

Service workers need a secure context, and `http://localhost` counts as one, so
serve the folder rather than opening the file directly — `file://` will not
register the worker and the offline behaviour cannot be checked.
