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
site data erases the history.

**Export for Claude** is for reading: the streak summary, and what was written
on each day — the day's own note, the act on R, the name on N. The per-day
point workings are deliberately not in it; they live in **Point and minute
log**, which accounts for every movement. The export's last line is still a
full JSON backup.

## Two ways back

Losing this happens two ways, and they do not lose the same thing.

- **Restore from a backup** takes a pasted export and replaces everything. It
  needs an export to exist.
- **Set the balances**, on the same sheet, takes just the four numbers — 8ANK,
  TH8NK, and the STOP Bank and Tank — as they stood at the start of a named day.
  It needs nothing but the numbers, which is the case that actually happens: a
  wipe with no export, and the start dates re-entered by hand.

No balance is stored anywhere; each is walked out of the entries every time it
is asked for, which is what keeps them honest. Typed balances therefore cannot
simply be set. They are stored as the **difference** between what was typed and
what that day would otherwise have opened on, and that difference is applied on
its day like any other movement — it appears in the point and minute log as
"balance set by hand", so a balance never arrives from nowhere.

Storing a difference rather than a figure is what lets earlier days go on
counting. A figure would have to override everything before it to hold, which
makes every earlier day unreachable — so filling in Monday on Tuesday would be
recorded, reported as done, and change nothing. A difference sits on its own day
and lets the rest of the walk carry on around it.

**Confirming a balance locks it, exactly as confirming a start date does.**
Saving is free and can be redone; confirming takes two taps and is final. A
balance that stayed editable would not be a record but a dial — a bad week
could always be answered by typing a kinder number. Only wiping the app, or
pasting a backup over it, clears a confirmed balance.

## Starting over

**Start over** at the foot of the menu wipes the instance: every entry, every
note, the finalized days, the fixed start dates, and any balance set by hand.
The start dates return to their defaults to be entered again. Two taps, the
second one red.

The PIN is the one thing it keeps — it is not a record of anything, and it is
what protects the screen, so removing it stays its own deliberate act on the
PIN sheet.

Wiping used to hang off the sample-data banner, which only appears when there
*is* sample data — so a real instance, the only kind that might genuinely need
clearing, had no way to do it at all.

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
