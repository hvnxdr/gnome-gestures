# Disable Overview Swipe

A GNOME Shell 51 extension for Wayland that disables vertical touchpad
swipes controlling the overview, including closing it and transitioning
to the application grid. It blocks the native three-or-more-finger gesture.

Horizontal workspace swipes remain available on the desktop and in the
overview. Touchscreen gestures, Super, the hot corner, and two-finger
scrolling keep their normal behavior. There is no preferences window.

## Install

Run from this directory:

```sh
npm ci
npm run pack
gnome-extensions install --force dist/disable-overview-swipe@gnome-gestures.local.shell-extension.zip
```

Log out and log back in so GNOME Shell discovers the extension, then run:

```sh
gnome-extensions enable disable-overview-swipe@gnome-gestures.local
```

Disable it to restore the overview touchpad gesture:

```sh
gnome-extensions disable disable-overview-swipe@gnome-gestures.local
```

## Verify in GNOME 51

1. With the extension disabled, verify the normal vertical overview swipe.
2. Enable it. Swipe vertically with three and four fingers on the desktop.
   The overview should stay closed.
3. Open the overview with Super. Vertical touchpad swipes should neither
   close it nor move to the application grid.
4. Verify left/right workspace swipes on the desktop and in the overview.
5. Verify Super, the hot corner if enabled, and touchscreen gestures if available.
6. Disable and re-enable the extension. Verify restoration and blocking again.
7. Lock and unlock the session, then repeat the gesture checks.

## Implementation

The source is `extension.ts`. `npm run build` compiles it to JavaScript
and copies metadata into `build/`. GNOME loads the generated JavaScript.
The compiler uses GJS and GNOME Shell type declarations, plus local
interfaces for the private gesture fields.

GNOME 51 uses separate overview and workspace swipe trackers. This extension
disables only `Main.overview._swipeTracker._touchpadGesture`, and keeps it
disabled when Shell updates its property binding. On disable it restores
the previous state, or the parent tracker's state if that has changed.

These are private GNOME Shell fields. Support for later Shell versions
requires checking their gesture implementation before adding compatibility.

Sources: [overview tracker](https://github.com/GNOME/gnome-shell/blob/51.0/js/ui/overview.js)
and [touchpad handler and bindings](https://github.com/GNOME/gnome-shell/blob/51.0/js/ui/swipeTracker.js).

## Automated checks

```sh
npm run check
npm test
```

The tests simulate property notifications and restoration. Physical
gestures require the session checks above.
